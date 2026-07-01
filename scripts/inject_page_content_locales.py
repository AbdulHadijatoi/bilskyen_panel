#!/usr/bin/env python3
"""Inject page content and permissions locale keys into en.json and da.json."""
from __future__ import annotations

import json
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
LOCALES = ROOT / "src" / "locales"
PLACEHOLDERS = ROOT / "scripts" / "page_content_placeholders.json"

# Keys missing from regex extraction (apostrophes in strings)
EXTRA_EN_PLACEHOLDERS = {
    "homePageContent": {
        "stats_description": "We're committed to providing exceptional service and quality vehicles to our customers.",
    },
    "aboutPageContent": {
        "about_value_1_description": "We constantly push the boundaries of what's possible, integrating the latest technology to solve real-world dealership challenges.",
        "about_value_2_description": "We believe in honest, clear communication and pricing. What you see is what you get, from our software to our support.",
    },
    "contactPageContent": {
        "contact_header_description": "We're here to help with your questions about vehicles, financing, and our services. Reach out to us anytime.",
        "contact_form_description": "Fill out the form below, and we'll get back to you as soon as possible.",
    },
}

PAGE_CONTENT_COMMON_EN = {
    "collapseAll": "Collapse All",
    "saveAllChanges": "Save All Changes",
    "errorLoading": "Error Loading Content",
    "sections": {
        "header": "Header Section",
        "cta": "CTA Section",
    },
    "fields": {
        "title": "Title",
        "description": "Description",
        "sectionTitle": "Section Title",
        "sectionDescription": "Section Description",
        "value": "Value",
        "name": "Name",
        "location": "Location",
        "rating": "Rating",
        "quote": "Quote",
        "ctaTitle": "CTA Title",
        "ctaDescription": "CTA Description",
        "aboutDescription": "About Description",
        "contactEmail": "Contact email",
        "contactPhone": "Contact phone",
        "addressFooter": "Address (footer)",
        "label": "Label",
        "description1": "Description 1",
        "description2": "Description 2",
        "missionImage": "Mission Image",
        "role": "Role",
        "teamMemberImage": "Team Member Image",
        "formTitle": "Form Title",
        "formDescription": "Form Description",
        "address": "Address",
        "phone": "Phone",
        "email": "Email",
        "businessHoursWeekdays": "Business Hours (Weekdays)",
        "businessHoursWeekend": "Business Hours (Weekend)",
        "mapTitle": "Map Title",
        "mapAddress": "Map Address",
        "mapImage": "Map Image",
    },
}

PAGE_CONTENT_COMMON_DA = {
    "collapseAll": "Fold alle sammen",
    "saveAllChanges": "Gem alle ændringer",
    "errorLoading": "Fejl ved indlæsning af indhold",
    "sections": {
        "header": "Header-sektion",
        "cta": "CTA-sektion",
    },
    "fields": PAGE_CONTENT_COMMON_EN["fields"] | {
        "title": "Titel",
        "description": "Beskrivelse",
        "sectionTitle": "Sektionstitel",
        "sectionDescription": "Sektionsbeskrivelse",
        "value": "Værdi",
        "name": "Navn",
        "location": "Placering",
        "rating": "Bedømmelse",
        "quote": "Citat",
        "ctaTitle": "CTA-titel",
        "ctaDescription": "CTA-beskrivelse",
        "aboutDescription": "Om-beskrivelse",
        "contactEmail": "Kontakt-e-mail",
        "contactPhone": "Kontakttelefon",
        "addressFooter": "Adresse (footer)",
        "label": "Etiket",
        "description1": "Beskrivelse 1",
        "description2": "Beskrivelse 2",
        "missionImage": "Mission-billede",
        "role": "Rolle",
        "teamMemberImage": "Teammedlemsbillede",
        "formTitle": "Formulartitel",
        "formDescription": "Formularbeskrivelse",
        "address": "Adresse",
        "phone": "Telefon",
        "email": "E-mail",
        "businessHoursWeekdays": "Åbningstider (hverdage)",
        "businessHoursWeekend": "Åbningstider (weekend)",
        "mapTitle": "Korttitel",
        "mapAddress": "Kortadresse",
        "mapImage": "Kortbillede",
    },
}

HOME_META_EN = {
    "title": "Home Page Content Management",
    "description": "Manage all text content on the home page. Changes are saved to the database and cache is automatically cleared.",
    "loading": "Loading home page content...",
    "successMessage": "Home page content updated successfully!",
    "sections": {
        "search": "Search Section",
        "hero": "Hero Section",
        "featuredVehicles": "Featured Vehicles Section",
        "stats": "Stats Section",
        "features": "Features Section",
        "testimonials": "Testimonials Section",
        "footer": "Footer Section",
    },
    "subsections": {
        "stat1": "Stat 1",
        "stat2": "Stat 2",
        "stat3": "Stat 3",
        "stat4": "Stat 4",
        "feature1": "Feature 1",
        "feature2": "Feature 2",
        "feature3": "Feature 3",
        "testimonial1": "Testimonial 1",
        "testimonial2": "Testimonial 2",
        "testimonial3": "Testimonial 3",
    },
}

HOME_META_DA = {
    **HOME_META_EN,
    "title": "Administration af forsideindhold",
    "description": "Administrer al tekst på forsiden. Ændringer gemmes i databasen, og cachen ryddes automatisk.",
    "loading": "Indlæser forsideindhold...",
    "successMessage": "Forsideindhold opdateret!",
    "sections": {
        "search": "Søgesektion",
        "hero": "Hero-sektion",
        "featuredVehicles": "Sektion for udvalgte køretøjer",
        "stats": "Statistiksektion",
        "features": "Funktionssektion",
        "testimonials": "Anbefalingssektion",
        "footer": "Footer-sektion",
    },
    "subsections": {
        "stat1": "Statistik 1",
        "stat2": "Statistik 2",
        "stat3": "Statistik 3",
        "stat4": "Statistik 4",
        "feature1": "Funktion 1",
        "feature2": "Funktion 2",
        "feature3": "Funktion 3",
        "testimonial1": "Anbefaling 1",
        "testimonial2": "Anbefaling 2",
        "testimonial3": "Anbefaling 3",
    },
}

ABOUT_META_EN = {
    "title": "About Page Content Management",
    "description": "Manage all text content and images on the about page. Changes are saved to the database and cache is automatically cleared.",
    "loading": "Loading about page content...",
    "successMessage": "About page content updated successfully!",
    "sections": {
        "mission": "Mission Section",
        "values": "Values Section",
        "team": "Team Section",
    },
    "subsections": {
        "value1": "Value 1",
        "value2": "Value 2",
        "value3": "Value 3",
        "value4": "Value 4",
        "teamMember1": "Team Member 1",
        "teamMember2": "Team Member 2",
        "teamMember3": "Team Member 3",
    },
}

ABOUT_META_DA = {
    **ABOUT_META_EN,
    "title": "Administration af om-os-indhold",
    "description": "Administrer al tekst og billeder på om-os-siden. Ændringer gemmes i databasen, og cachen ryddes automatisk.",
    "loading": "Indlæser om-os-indhold...",
    "successMessage": "Om-os-indhold opdateret!",
    "sections": {
        "mission": "Missionssektion",
        "values": "Værdisektion",
        "team": "Teamsektion",
    },
    "subsections": {
        "value1": "Værdi 1",
        "value2": "Værdi 2",
        "value3": "Værdi 3",
        "value4": "Værdi 4",
        "teamMember1": "Teammedlem 1",
        "teamMember2": "Teammedlem 2",
        "teamMember3": "Teammedlem 3",
    },
}

CONTACT_META_EN = {
    "title": "Contact Page Content Management",
    "description": "Manage all text content and images on the contact page. Changes are saved to the database and cache is automatically cleared.",
    "loading": "Loading contact page content...",
    "successMessage": "Contact page content updated successfully!",
    "sections": {
        "contactForm": "Contact Form Section",
        "contactInfo": "Contact Information Section",
        "map": "Map Section",
    },
}

CONTACT_META_DA = {
    **CONTACT_META_EN,
    "title": "Administration af kontakt-sideindhold",
    "description": "Administrer al tekst og billeder på kontaktsiden. Ændringer gemmes i databasen, og cachen ryddes automatisk.",
    "loading": "Indlæser kontakt-sideindhold...",
    "successMessage": "Kontakt-sideindhold opdateret!",
    "sections": {
        "contactForm": "Kontaktformularsektion",
        "contactInfo": "Kontaktinformationssektion",
        "map": "Kortsektion",
    },
}

PERMISSIONS_SNACKBAR_EN = {
    "loadFailed": "Failed to load permissions",
    "searchFailed": "Failed to search users/roles",
    "loadAssignedFailed": "Failed to load assigned permissions",
    "assignSuccess": "Permission assigned successfully",
    "assignFailed": "Failed to assign permission",
    "revokeSuccess": "Permission revoked successfully",
    "revokeFailed": "Failed to revoke permission",
    "cacheCleared": "Cache cleared successfully",
    "cacheClearFailed": "Failed to clear cache",
    "all": "All",
    "noPermissionsFound": "No permissions found",,
    "noPermissionsFound": "No permissions found",
    "noAssignedPermissions": "No assigned permissions",
    "allPermissionsAssigned": "All permissions are assigned",
    "noPermissionsAvailable": "No permissions available",
    "selectRoleHint": "Choose a role from the left sidebar to view and manage their permissions.",
}

PERMISSIONS_SNACKBAR_DA = {
    "loadFailed": "Kunne ikke indlæse tilladelser",
    "searchFailed": "Kunne ikke søge efter brugere/roller",
    "loadAssignedFailed": "Kunne ikke indlæse tildelte tilladelser",
    "assignSuccess": "Tilladelse tildelt",
    "assignFailed": "Kunne ikke tildele tilladelse",
    "revokeSuccess": "Tilladelse fjernet",
    "revokeFailed": "Kunne ikke fjerne tilladelse",
    "cacheCleared": "Cache ryddet",
    "cacheClearFailed": "Kunne ikke rydde cache",
    "all": "Alle",
    "noPermissionsFound": "Ingen tilladelser fundet",
    "noAssignedPermissions": "Ingen tildelte tilladelser",
    "allPermissionsAssigned": "Alle tilladelser er tildelt",
    "noPermissionsAvailable": "Ingen tilladelser tilgængelige",
    "selectRoleHint": "Vælg en rolle i venstre sidepanel for at se og administrere tilladelser.",
}


def merge_placeholders(raw: dict) -> dict[str, dict]:
    merged = {k: dict(v) for k, v in raw.items()}
    for page, extras in EXTRA_EN_PLACEHOLDERS.items():
        merged.setdefault(page, {}).update(extras)
    return merged


def build_page_locale(meta_en: dict, meta_da: dict, placeholders_en: dict) -> tuple[dict, dict]:
    en_block = {**meta_en, "placeholders": placeholders_en}
    da_block = {**meta_da, "placeholders": placeholders_en}
    return en_block, da_block


def main() -> None:
    raw = json.loads(PLACEHOLDERS.read_text(encoding="utf-8"))
    ph = merge_placeholders(raw)

    for locale_file, common, home_meta, about_meta, contact_meta, perm_snack in [
        (LOCALES / "en.json", PAGE_CONTENT_COMMON_EN, HOME_META_EN, ABOUT_META_EN, CONTACT_META_EN, PERMISSIONS_SNACKBAR_EN),
        (LOCALES / "da.json", PAGE_CONTENT_COMMON_DA, HOME_META_DA, ABOUT_META_DA, CONTACT_META_DA, PERMISSIONS_SNACKBAR_DA),
    ]:
        data = json.loads(locale_file.read_text(encoding="utf-8"))
        views = data.setdefault("admin", {}).setdefault("views", {})
        views["pageContentCommon"] = common
        views["homePageContent"] = {**home_meta, "placeholders": ph["homePageContent"]}
        views["aboutPageContent"] = {**about_meta, "placeholders": ph["aboutPageContent"]}
        views["contactPageContent"] = {**contact_meta, "placeholders": ph["contactPageContent"]}

        perm = views.setdefault("permissions", {})
        perm.update(perm_snack)

        dealer_perm = data.setdefault("dealer", {}).setdefault("views", {}).setdefault("permissions", {})
        dealer_perm.update({
            "loadFailed": perm_snack["loadFailed"],
            "searchFailed": perm_snack["searchFailed"],
            "loadAssignedFailed": perm_snack["loadAssignedFailed"],
            "assignSuccess": perm_snack["assignSuccess"],
            "assignFailed": perm_snack["assignFailed"],
            "revokeSuccess": perm_snack["revokeSuccess"],
            "revokeFailed": perm_snack["revokeFailed"],
        })
        staff_perm = data.setdefault("staff", {}).setdefault("views", {}).setdefault("permissions", {})
        staff_perm.update(dealer_perm)

        locale_file.write_text(json.dumps(data, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
        print(f"Updated {locale_file.name}")


if __name__ == "__main__":
    main()
