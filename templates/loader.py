import json
from pathlib import Path
from typing import Dict, List, Optional, Any


class TemplateLoader:
    def __init__(self, templates_dir: Optional[str] = None):
        if templates_dir is None:
            templates_dir = Path(__file__).parent
        self.templates_dir = Path(templates_dir)
        self.index_path = self.templates_dir / "index.json"
        self._load_index()

    def _load_index(self) -> None:
        with open(self.index_path, "r") as f:
            self.index = json.load(f)

    def get_template(self, template_id: str) -> Optional[Dict[str, Any]]:
        template_info = next(
            (t for t in self.index["templates"] if t["id"] == template_id), None
        )
        if not template_info:
            return None

        template_path = self.templates_dir / template_info["file"]
        with open(template_path, "r") as f:
            return json.load(f)

    def list_templates(self) -> List[Dict[str, Any]]:
        return self.index["templates"]

    def list_templates_by_category(self, category: str) -> List[Dict[str, Any]]:
        return [t for t in self.index["templates"] if t["category"] == category]

    def get_categories(self) -> List[Dict[str, Any]]:
        return self.index["categories"]

    def customize_template(
        self, template_id: str, customizations: Dict[str, str]
    ) -> Optional[Dict[str, Any]]:
        template = self.get_template(template_id)
        if not template:
            return None

        customized = json.loads(json.dumps(template))

        for section in customized.get("sections", []):
            for field_name, field_value in customizations.items():
                if f"[{field_name}]" in section.get("content", ""):
                    section["content"] = section["content"].replace(
                        f"[{field_name}]", field_value
                    )

        for field in customized.get("customizableFields", []):
            field_name = field.get("name")
            if field_name in customizations:
                field["value"] = customizations[field_name]

        return customized

    def modify_section(
        self,
        template_id: str,
        section_id: str,
        new_content: str,
    ) -> Optional[Dict[str, Any]]:
        template = self.get_template(template_id)
        if not template:
            return None

        for section in template.get("sections", []):
            if section["id"] == section_id:
                if section.get("modifiable", False):
                    section["content"] = new_content
                    return template
                return None

        return None

    def export_template(
        self, template_id: str, format: str = "json"
    ) -> Optional[str]:
        template = self.get_template(template_id)
        if not template:
            return None

        if format == "json":
            return json.dumps(template, indent=2)
        elif format == "text":
            output = f"# {template['name']}\n\n"
            output += f"{template['description']}\n\n"
            for section in template.get("sections", []):
                output += f"## {section['title']}\n\n"
                output += f"{section['content']}\n\n"
            return output

        return None
