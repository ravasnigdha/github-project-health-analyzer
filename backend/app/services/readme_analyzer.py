import re
from typing import List
from ..schemas import DocumentationMetrics, ReadmeSection

def analyze_readme(readme_text: str) -> DocumentationMetrics:
    """
    Analyzes markdown text of a repository README for standard documentation sections.
    """
    if not readme_text or not readme_text.strip():
        return DocumentationMetrics(
            has_readme=False,
            word_count=0,
            has_installation=False,
            has_usage=False,
            has_contributing=False,
            has_license_section=False,
            has_code_examples=False,
            detected_sections=[]
        )

    text = readme_text.strip()
    words = text.split()
    word_count = len(words)

    # Patterns for key sections
    patterns = {
        "Installation": r"(?i)#+\s*(?:installation|getting\s+started|setup|quick\s*start|prerequisites|install|how\s+to\s+install)",
        "Usage": r"(?i)#+\s*(?:usage|how\s+to\s+use|quick\s*tutorial|basic\s+usage|examples?|api\s+reference|run|running)",
        "Contributing": r"(?i)#+\s*(?:contributing|how\s+to\s+contribute|development|contributor\s+guide|contribute)",
        "License": r"(?i)#+\s*(?:license|licence|terms\s+of\s+use)",
    }

    detected_sections: List[ReadmeSection] = []

    has_installation = False
    has_usage = False
    has_contributing = False
    has_license_section = False

    for name, pattern in patterns.items():
        match = re.search(pattern, text)
        is_detected = bool(match)
        evidence = match.group(0).strip() if match else None
        
        if name == "Installation":
            has_installation = is_detected
        elif name == "Usage":
            has_usage = is_detected
        elif name == "Contributing":
            has_contributing = is_detected
        elif name == "License":
            has_license_section = is_detected

        detected_sections.append(ReadmeSection(
            name=name,
            detected=is_detected,
            evidence=evidence
        ))

    # Detect code blocks
    code_block_match = re.search(r"```[\s\S]*?```", text)
    has_code_examples = bool(code_block_match)

    return DocumentationMetrics(
        has_readme=True,
        word_count=word_count,
        has_installation=has_installation,
        has_usage=has_usage,
        has_contributing=has_contributing,
        has_license_section=has_license_section,
        has_code_examples=has_code_examples,
        detected_sections=detected_sections
    )
