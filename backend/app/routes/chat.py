import json
import os
from pathlib import Path
from fastapi import APIRouter, Depends, HTTPException, status
from litellm import completion

from app.auth import get_current_user
from app.schemas import DocumentChatRequest, DocumentChatResponse, ChatMessage
from app.config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])

# Template-aware chat endpoint
def build_system_prompt(template: dict, current_fields: dict) -> str:
    """Build system prompt dynamically from template fields and current state."""
    fields_list = template.get("customizableFields", [])
    required_fields = [f["name"] for f in fields_list if f.get("required", False)]

    filled_fields = {k: v for k, v in current_fields.items() if v}
    missing_required = [f for f in required_fields if not current_fields.get(f)]

    field_descriptions = "\n".join([
        f"- {f['name']}: {f.get('placeholder', f['name'])}"
        for f in fields_list
    ])

    prompt = f"""You are a legal document assistant helping users fill in a {template.get('name', 'document')} form.
Ask clarifying questions conversationally to understand what information they need.
When you learn information that maps to a form field, extract it precisely.

Available Fields:
{field_descriptions}

Rules:
- Always respond in valid JSON with this exact structure:
  {{"reply": "<your conversational response>", "extracted_fields": {{<fields you can confidently fill>}}}}
- Only include fields in extracted_fields that you are confident about
- Use exact field names from the list above
- Never make up information - ask follow-up questions if unclear
- Be conversational and helpful, not robotic
- Ask follow-up questions when information is ambiguous or incomplete"""

    if filled_fields:
        prompt += "\n\nCURRENT KNOWN FIELDS (do NOT ask about these again):"
        for k, v in filled_fields.items():
            prompt += f"\n  {k}: {v}"

    if missing_required:
        prompt += "\n\nMISSING REQUIRED FIELDS (prioritize asking about these):"
        for f in missing_required:
            prompt += f"\n  - {f}"

    return prompt


def get_generic_json_schema() -> dict:
    """Generic JSON schema that accepts any field names from the template."""
    return {
        "type": "json_schema",
        "json_schema": {
            "name": "document_chat_response",
            "schema": {
                "type": "object",
                "properties": {
                    "reply": {"type": "string"},
                    "extracted_fields": {
                        "type": "object",
                        "additionalProperties": {"type": "string"},
                    },
                },
                "required": ["reply", "extracted_fields"],
            },
        },
    }


def load_template(template_id: str) -> dict:
    """Load template JSON by ID."""
    templates_dir = Path(os.environ.get("TEMPLATES_DIR", "/app/templates"))
    index_path = templates_dir / "index.json"

    try:
        with open(index_path, "r") as f:
            index = json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load template index: {str(e)}")

    template_entry = next((t for t in index.get("templates", []) if t["id"] == template_id), None)
    if not template_entry:
        raise HTTPException(status_code=404, detail=f"Template '{template_id}' not found")

    template_file = templates_dir / template_entry["file"]
    try:
        with open(template_file, "r") as f:
            return json.load(f)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to load template: {str(e)}")


def filter_extracted_fields(extracted: dict, template: dict) -> dict:
    """Filter extracted fields to only those defined in the template."""
    valid_field_names = {f["name"] for f in template.get("customizableFields", [])}
    return {k: v for k, v in extracted.items() if k in valid_field_names and v}


@router.post("/document/{template_id}", response_model=DocumentChatResponse)
async def document_chat(
    template_id: str,
    request: DocumentChatRequest,
    current_user_id: int = Depends(get_current_user),
):
    """Generic chat endpoint for any template with AI assistance."""
    try:
        # Load template
        template = load_template(template_id)

        # Build dynamic system prompt
        system_prompt = build_system_prompt(template, request.current_fields)

        # Build messages array: system prompt + conversation history
        messages = [{"role": "system", "content": system_prompt}]
        for msg in request.messages:
            messages.append({"role": msg.role, "content": msg.content})

        # Call LiteLLM with structured output (single call, no streaming)
        response = completion(
            model="openrouter/openai/gpt-oss-120b",
            messages=messages,
            api_key=settings.openrouter_api_key,
            api_base="https://openrouter.ai/api/v1",
            response_format=get_generic_json_schema(),
            stream=False,
        )

        # Parse the response
        response_text = response.choices[0].message.content
        parsed = json.loads(response_text)

        # Filter extracted fields to valid template fields
        extracted = filter_extracted_fields(parsed.get("extracted_fields", {}), template)

        return DocumentChatResponse(
            reply=parsed.get("reply", ""),
            extracted_fields=extracted,
        )

    except HTTPException:
        raise
    except json.JSONDecodeError as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse AI response: {str(e)}",
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat request failed: {str(e)}",
        )


@router.post("/nda", response_model=DocumentChatResponse)
async def nda_chat(
    request: DocumentChatRequest,
    current_user_id: int = Depends(get_current_user),
):
    """Backward-compatible NDA chat endpoint. Delegates to generic document chat."""
    return await document_chat("mnda-001", request, current_user_id)
