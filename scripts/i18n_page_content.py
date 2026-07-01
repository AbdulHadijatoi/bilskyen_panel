#!/usr/bin/env python3
"""Migrate home/about/contact page content management views to vue-i18n."""
from __future__ import annotations

import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
VIEWS = ROOT / "src" / "views" / "admin"
LOCALES = ROOT / "src" / "locales"

PAGES = {
    "home-page-content/HomePageContentManagement.vue": {
        "locale_key": "homePageContent",
        "title": "Home Page Content Management",
        "description": "Manage all text content on the home page. Changes are saved to the database and cache is automatically cleared.",
        "loading": "Loading home page content...",
        "success": "Home page content updated successfully!",
        "failed_load": "common.errors.failedLoadHomePageContent",
        "failed_save": "common.errors.failedSaveHomePageContent",
    },
    "about-page-content/AboutPageContentManagement.vue": {
        "locale_key": "aboutPageContent",
        "title": "About Page Content Management",
        "description": "Manage all text content and images on the about page. Changes are saved to the database and cache is automatically cleared.",
        "loading": "Loading about page content...",
        "success": "About page content updated successfully!",
        "failed_load": "common.errors.failedLoadAboutPageContent",
        "failed_save": "common.errors.failedSaveAboutPageContent",
    },
    "contact-page-content/ContactPageContentManagement.vue": {
        "locale_key": "contactPageContent",
        "title": "Contact Page Content Management",
        "description": "Manage all text content and images on the contact page. Changes are saved to the database and cache is automatically cleared.",
        "loading": "Loading contact page content...",
        "success": "Contact page content updated successfully!",
        "failed_load": "common.errors.failedLoadContactPageContent",
        "failed_save": "common.errors.failedSaveContactPageContent",
    },
}

COMMON_REPLACEMENTS = [
    (">Collapse All<", ">{{ t('admin.views.pageContentCommon.collapseAll') }}<"),
    (">Save All Changes<", ">{{ t('admin.views.pageContentCommon.saveAllChanges') }}<"),
    (">Error Loading Content<", ">{{ t('admin.views.pageContentCommon.errorLoading') }}<"),
    (">Close<", ">{{ t('common.close') }}<"),
    ('<div class="field-label">Title</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.title\') }}</div>'),
    ('<div class="field-label">Description</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.description\') }}</div>'),
    ('<div class="field-label">Section Title</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.sectionTitle\') }}</div>'),
    ('<div class="field-label">Section Description</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.sectionDescription\') }}</div>'),
    ('<div class="field-label">Value</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.value\') }}</div>'),
    ('<div class="field-label">Name</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.name\') }}</div>'),
    ('<div class="field-label">Location</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.location\') }}</div>'),
    ('<div class="field-label">Rating</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.rating\') }}</div>'),
    ('<div class="field-label">Quote</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.quote\') }}</div>'),
    ('<div class="field-label">CTA Title</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.ctaTitle\') }}</div>'),
    ('<div class="field-label">CTA Description</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.ctaDescription\') }}</div>'),
    ('<div class="field-label">About Description</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.aboutDescription\') }}</div>'),
    ('<div class="field-label">Contact email</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.contactEmail\') }}</div>'),
    ('<div class="field-label">Contact phone</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.contactPhone\') }}</div>'),
    ('<div class="field-label">Address (footer)</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.addressFooter\') }}</div>'),
    ('<div class="field-label">Label</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.label\') }}</div>'),
    ('<div class="field-label">Description 1</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.description1\') }}</div>'),
    ('<div class="field-label">Description 2</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.description2\') }}</div>'),
    ('<div class="field-label">Mission Image</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.missionImage\') }}</div>'),
    ('<div class="field-label">Role</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.role\') }}</div>'),
    ('<div class="field-label">Team Member Image</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.teamMemberImage\') }}</div>'),
    ('<div class="field-label">Form Title</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.formTitle\') }}</div>'),
    ('<div class="field-label">Form Description</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.formDescription\') }}</div>'),
    ('<div class="field-label">Address</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.address\') }}</div>'),
    ('<div class="field-label">Phone</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.phone\') }}</div>'),
    ('<div class="field-label">Email</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.email\') }}</div>'),
    ('<div class="field-label">Business Hours (Weekdays)</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.businessHoursWeekdays\') }}</div>'),
    ('<div class="field-label">Business Hours (Weekend)</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.businessHoursWeekend\') }}</div>'),
    ('<div class="field-label">Map Title</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.mapTitle\') }}</div>'),
    ('<div class="field-label">Map Address</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.mapAddress\') }}</div>'),
    ('<div class="field-label">Map Image</div>', '<div class="field-label">{{ t(\'admin.views.pageContentCommon.fields.mapImage\') }}</div>'),
]

PANEL_TITLE_MAP = {
    "Search Section": "admin.views.homePageContent.sections.search",
    "Hero Section": "admin.views.homePageContent.sections.hero",
    "Featured Vehicles Section": "admin.views.homePageContent.sections.featuredVehicles",
    "Stats Section": "admin.views.homePageContent.sections.stats",
    "Features Section": "admin.views.homePageContent.sections.features",
    "Testimonials Section": "admin.views.homePageContent.sections.testimonials",
    "Footer Section": "admin.views.homePageContent.sections.footer",
    "Stat 1": "admin.views.homePageContent.subsections.stat1",
    "Stat 2": "admin.views.homePageContent.subsections.stat2",
    "Stat 3": "admin.views.homePageContent.subsections.stat3",
    "Stat 4": "admin.views.homePageContent.subsections.stat4",
    "Feature 1": "admin.views.homePageContent.subsections.feature1",
    "Feature 2": "admin.views.homePageContent.subsections.feature2",
    "Feature 3": "admin.views.homePageContent.subsections.feature3",
    "Testimonial 1": "admin.views.homePageContent.subsections.testimonial1",
    "Testimonial 2": "admin.views.homePageContent.subsections.testimonial2",
    "Testimonial 3": "admin.views.homePageContent.subsections.testimonial3",
    "Header Section": "admin.views.pageContentCommon.sections.header",
    "Mission Section": "admin.views.aboutPageContent.sections.mission",
    "Values Section": "admin.views.aboutPageContent.sections.values",
    "Team Section": "admin.views.aboutPageContent.sections.team",
    "CTA Section": "admin.views.pageContentCommon.sections.cta",
    "Value 1": "admin.views.aboutPageContent.subsections.value1",
    "Value 2": "admin.views.aboutPageContent.subsections.value2",
    "Value 3": "admin.views.aboutPageContent.subsections.value3",
    "Value 4": "admin.views.aboutPageContent.subsections.value4",
    "Team Member 1": "admin.views.aboutPageContent.subsections.teamMember1",
    "Team Member 2": "admin.views.aboutPageContent.subsections.teamMember2",
    "Team Member 3": "admin.views.aboutPageContent.subsections.teamMember3",
    "Contact Form Section": "admin.views.contactPageContent.sections.contactForm",
    "Contact Information Section": "admin.views.contactPageContent.sections.contactInfo",
    "Map Section": "admin.views.contactPageContent.sections.map",
}


def extract_placeholders(content: str) -> dict[str, str]:
    block = re.search(
        r"const sectionDefinitions: Record<string, \{ placeholder: string \}> = \{([\s\S]*?)\n\}",
        content,
    )
    if not block:
        return {}
    placeholders: dict[str, str] = {}
    for match in re.finditer(r"(\w+): \{ placeholder: '((?:\\'|[^'])*)' \}", block.group(1)):
        key, value = match.group(1), match.group(2).replace("\\'", "'")
        placeholders[key] = value
    return placeholders


def migrate_vue(rel_path: str, meta: dict) -> dict[str, str]:
    path = VIEWS / rel_path
    content = path.read_text(encoding="utf-8")
    locale_key = meta["locale_key"]
    placeholders = extract_placeholders(content)

    content = content.replace(
        f'<h2 class="page-title">{meta["title"]}</h2>',
        f'<h2 class="page-title">{{{{ t(\'admin.views.{locale_key}.title\') }}}}</h2>',
    )
    content = re.sub(
        r'<p class="page-description">\s*\n\s*' + re.escape(meta["description"]) + r'\s*\n\s*</p>',
        f'<p class="page-description">\n          {{{{ t(\'admin.views.{locale_key}.description\') }}}}\n        </p>',
        content,
    )
    content = content.replace(
        f'<p class="text-body-2 text-medium-emphasis mt-4">{meta["loading"]}</p>',
        f'<p class="text-body-2 text-medium-emphasis mt-4">{{{{ t(\'admin.views.{locale_key}.loading\') }}}}</p>',
    )
    content = content.replace(
        meta["success"],
        f"{{{{ t('admin.views.{locale_key}.successMessage') }}}}",
    )

    for old, new in COMMON_REPLACEMENTS:
        content = content.replace(old, new)

    for title, key in PANEL_TITLE_MAP.items():
        content = content.replace(
            f'<span class="panel-title-text">{title}</span>',
            f'<span class="panel-title-text">{{{{ t(\'{key}\') }}}}</span>',
        )
        content = content.replace(
            f'<div class="sub-section-title">{title}</div>',
            f'<div class="sub-section-title">{{{{ t(\'{key}\') }}}}</div>',
        )

    if "const { t } = useI18n()" not in content:
        content = content.replace(
            "import { useI18n } from 'vue-i18n'\n",
            "import { useI18n } from 'vue-i18n'\n",
        )
        if "const { t } = useI18n()" not in content:
            content = re.sub(
                r"(<script setup lang=\"ts\">\n)",
                r"\1import { useI18n } from 'vue-i18n'\n\nconst { t } = useI18n()\n",
                content,
                count=1,
            )
            content = content.replace("import { useI18n } from 'vue-i18n'\nimport { ref", "import { ref")
            content = content.replace(
                "import { useI18n } from 'vue-i18n'\nimport { ref, onMounted",
                "import { useI18n } from 'vue-i18n'\nimport { ref, onMounted",
            )

    # Normalize duplicate useI18n import from home file
    if content.count("import { useI18n }") > 1:
        content = re.sub(r"import \{ useI18n \} from 'vue-i18n'\n", "", content, count=content.count("import { useI18n }") - 1)
    if "const { t } = useI18n()" not in content:
        content = content.replace(
            "<script setup lang=\"ts\">\n",
            "<script setup lang=\"ts\">\nimport { useI18n } from 'vue-i18n'\n\nconst { t } = useI18n()\n",
            1,
        )

    content = re.sub(
        r"function getPlaceholder\(key: string\): string \{\n\s*return sectionDefinitions\[key\]\?\.placeholder \|\| ''\n\}",
        f"function getPlaceholder(key: string): string {{\n  return t(`admin.views.{locale_key}.placeholders.${{key}}`)\n}}",
        content,
    )

    content = re.sub(
        r"const sectionDefinitions: Record<string, \{ placeholder: string \}> = \{[\s\S]*?\n\}",
        "const sectionDefinitions: Record<string, Record<string, never>> = {\n" +
        "\n".join(f"  {k}: {{}}," for k in placeholders) +
        "\n}",
        content,
        count=1,
    )

    path.write_text(content, encoding="utf-8")
    return placeholders


def main() -> None:
    all_placeholders: dict[str, dict[str, str]] = {}
    for rel, meta in PAGES.items():
        all_placeholders[meta["locale_key"]] = migrate_vue(rel, meta)
        print(f"Migrated {rel}")

    out = ROOT / "scripts" / "page_content_placeholders.json"
    out.write_text(json.dumps(all_placeholders, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Wrote {out}")


if __name__ == "__main__":
    main()
