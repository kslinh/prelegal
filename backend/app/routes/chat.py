import json
from fastapi import APIRouter, Depends, HTTPException, status
from litellm import completion

from app.auth import get_current_user
from app.schemas import NDACharRequest, NDACharResponse, ExtractedNDAFields
from app.config import settings

router = APIRouter(prefix="/api/chat", tags=["chat"])

SYSTEM_PROMPT = """You are a legal document assistant helping users fill in an NDA form.
Ask clarifying questions conversationally to understand what information they need in their NDA.
When you learn information that maps to a form field, extract it precisely.

NDA Form Fields:
- templateType: 'nda-001' (one-way), 'mnda-001' (mutual), or 'nda-comprehensive' (advanced)
- disclosingPartyName: The name of the company/person disclosing information
- disclosingPartyType: 'corporation', 'llc', 'individual', or 'partnership'
- disclosingPartyAddress: Full street address of disclosing party
- receivingPartyName: The name of the company/person receiving information
- receivingPartyType: 'corporation', 'llc', 'individual', or 'partnership'
- receivingPartyAddress: Full street address of receiving party
- effectiveDate: ISO 8601 date (YYYY-MM-DD). Infer from phrases like "today", "next Monday", "Jan 15, 2024"
- purpose: The purpose of disclosure (e.g., "evaluation of vendor for product integration")
- jurisdiction: A US state name or country (e.g., "California", "New York", "Delaware", "United Kingdom")
- termDuration: How long the NDA lasts (e.g., "2 years", "3 years")
- terminationNotice: Notice period required to terminate (e.g., "30 days", "60 days")
- survivalPeriod: How long obligations survive termination (e.g., "3 years", "5 years")
- returnPeriod: When materials must be returned (e.g., "30 days", "upon request")

Rules:
- Always respond in valid JSON with this exact structure:
  {
    "reply": "<your conversational response>",
    "extracted_fields": { <only fields you can confidently fill, all optional> }
  }
- Only include fields in extracted_fields that you are confident about
- Use exact field names from the list above
- For dates: always use ISO 8601 format (YYYY-MM-DD)
- For jurisdiction: use state names or country names, no abbreviations
- Never make up information - ask follow-up questions if unclear
- Be conversational and helpful, not robotic"""

JSON_SCHEMA = {
    "type": "json_schema",
    "json_schema": {
        "name": "nda_chat_response",
        "schema": {
            "type": "object",
            "properties": {
                "reply": {"type": "string"},
                "extracted_fields": {
                    "type": "object",
                    "properties": {
                        "templateType": {"type": "string"},
                        "disclosingPartyName": {"type": "string"},
                        "disclosingPartyType": {"type": "string"},
                        "disclosingPartyAddress": {"type": "string"},
                        "receivingPartyName": {"type": "string"},
                        "receivingPartyType": {"type": "string"},
                        "receivingPartyAddress": {"type": "string"},
                        "effectiveDate": {"type": "string"},
                        "purpose": {"type": "string"},
                        "jurisdiction": {"type": "string"},
                        "termDuration": {"type": "string"},
                        "terminationNotice": {"type": "string"},
                        "survivalPeriod": {"type": "string"},
                        "returnPeriod": {"type": "string"},
                        "technicalSurvivalPeriod": {"type": "string"},
                    },
                    "additionalProperties": False,
                },
            },
            "required": ["reply", "extracted_fields"],
        },
    },
}


@router.post("/nda", response_model=NDACharResponse)
async def nda_chat(
    request: NDACharRequest,
    current_user_id: int = Depends(get_current_user),
):
    """Chat endpoint for NDA form filling with AI assistance."""
    try:
        # Build messages array: system prompt + conversation history
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in request.messages:
            messages.append({"role": msg.role, "content": msg.content})

        # Call LiteLLM with structured output
        response = completion(
            model="openrouter/openai/gpt-oss-120b",
            messages=messages,
            api_key=settings.openrouter_api_key,
            api_base="https://openrouter.ai/api/v1",
            response_format=JSON_SCHEMA,
            stream=False,
        )

        # Parse the response
        response_text = response.choices[0].message.content
        parsed = json.loads(response_text)

        # Validate and construct response
        extracted = ExtractedNDAFields(**parsed.get("extracted_fields", {}))

        return NDACharResponse(
            reply=parsed.get("reply", ""),
            extracted_fields=extracted,
        )

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
