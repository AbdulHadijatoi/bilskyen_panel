#!/usr/bin/env python3
"""Bulk-replace hardcoded UI strings with vue-i18n t() calls."""
from __future__ import annotations

import re
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1] / "src"

# Exact fallback string -> i18n key
FALLBACK_MAP = {
    "Failed to load vehicle": "dealer.views.vehicleDetail.failedLoadVehicle",
    "Failed to update vehicle": "dealer.views.vehicleDetail.failedUpdateVehicle",
    "Failed to upload images": "common.errors.failedUploadImages",
    "Failed to delete image": "common.errors.failedDeleteImage",
    "Failed to update equipment": "common.errors.failedUpdateEquipment",
    "Failed to delete vehicle": "dealer.views.vehicles.failedDeleteVehicle",
    "Failed to update vehicle status": "common.errors.failedUpdateVehicleStatus",
    "Failed to mark vehicle as sold": "common.errors.failedMarkVehicleSold",
    "Failed to load vehicles": "dealer.views.vehicles.failedLoadVehicles",
    "Failed to load dashboard data": "dealer.views.dashboard.failedLoadData",
    "Failed to load plans": "admin.views.plans.failedLoadPlans",
    "Failed to create plan": "common.errors.failedCreatePlan",
    "Failed to delete plan": "common.errors.failedDeletePlan",
    "Failed to load invoices": "common.errors.failedLoadInvoices",
    "Failed to load payments": "common.errors.failedLoadPayments",
    "Checkout failed": "dealer.views.billing.checkoutFailed",
    "Failed to cancel request": "common.errors.failedCancelRequest",
    "Failed to create subscription": "admin.views.plans.failedCreateSubscription",
    "Failed to approve listing": "admin.views.vehicles.approveListing",
    "Failed to load audit logs": "dealer.views.auditLogs.failedLoadLogs",
    "Failed to load audit log details": "dealer.views.auditLogs.failedLoadDetails",
    "Failed to update stage": "dealer.views.leads.failedUpdateStage",
    "Failed to update intent": "dealer.views.leads.failedUpdateIntent",
    "Failed to update category": "dealer.views.leads.failedUpdateCategory",
    "Failed to send message": "dealer.views.leads.failedSendMessage",
    "Failed to assign lead": "dealer.views.leads.failedAssignLead",
    "Failed to load lead": "dealer.views.leads.failedLoadLead",
    "Failed to update status": "dealer.views.enquiries.failedUpdateStatus",
    "Failed to update type": "dealer.views.enquiries.failedUpdateType",
    "Failed to load enquiry": "dealer.views.enquiries.failedLoadEnquiry",
    "Failed to load enquiries": "dealer.views.enquiries.failedLoadEnquiries",
    "Failed to load staff members": "dealer.views.staff.failedLoadStaff",
    "Failed to load profile information. Please try again.": "dealer.views.profile.failedLoadProfile",
    "Failed to update profile. Please try again.": "dealer.views.profile.failedUpdateProfile",
    "Failed to load permissions": "common.errors.failedLoadPermissions",
    "Failed to load favorites": "dealer.views.favorites.failedLoadFavorites",
    "Failed to remove favorite": "dealer.views.favorites.failedRemoveFavorite",
    "Failed to load saved searches": "common.errors.failedLoadSavedSearches",
    "Failed to save saved search": "common.errors.failedSaveSavedSearch",
    "Failed to delete saved search": "common.errors.failedDeleteSavedSearch",
    "Failed to get user information": "common.errors.failedGetUser",
    "Failed to send reset email.": "auth.forgotPassword.failedSend",
    "Failed to register.": "auth.register.failed",
    "Failed to load home page content": "common.errors.failedLoadHomePageContent",
    "Failed to save home page content": "common.errors.failedSaveHomePageContent",
    "Failed to load features": "common.errors.failedLoadFeatures",
    "Failed to create feature": "common.errors.failedCreateFeature",
    "Failed to delete feature": "common.errors.failedDeleteFeature",
    "Failed to update feature": "common.errors.failedUpdateFeature",
    "Failed to load users": "admin.views.users.failedLoadUsers",
    "Failed to create user": "admin.views.users.failedCreateUser",
    "Failed to delete user": "admin.views.users.failedDeleteUser",
    "Failed to change password. Please try again.": "dealerComponents.changePasswordDialog.failedChangePassword",
    "Failed to create staff member. Please try again.": "dealerComponents.staff.failedCreateStaff",
    "Failed to update staff member. Please try again.": "dealerComponents.staff.failedUpdateStaff",
    "Failed to remove staff member. Please try again.": "dealerComponents.staff.failedRemoveStaff",
    "N/A": "common.na",
    "Unknown": "common.unknown",
    "No description provided": "common.noDescription",
    "No contact": "common.noContact",
    "No registration": "common.noRegistration",
    "No email": "common.noEmail",
    "User": "common.userFallback",
    "Failed to load saved search": "common.errors.failedLoadSavedSearches",
    "Failed to save saved search": "common.errors.failedSaveSavedSearch",
    "Failed to delete saved search": "common.errors.failedDeleteSavedSearch",
    "Failed to load page": "admin.views.seo.failedLoadPage",
    "Failed to load pages": "admin.views.seo.failedLoadPages",
    "Failed to save page": "admin.views.seo.failedSave",
    "Failed to delete page": "admin.views.seo.failedDelete",
    "Failed to load subscription": "admin.views.subscriptions.failedLoadSubscriptions",
    "Failed to update subscription": "admin.views.subscriptions.failedUpdateSubscription",
    "Failed to cancel subscription": "admin.views.subscriptions.failedCancelSubscription",
    "Failed to load invoice": "common.errors.failedLoadInvoices",
    "Failed to load about page content": "common.errors.failedLoadAboutPageContent",
    "Failed to save about page content": "common.errors.failedSaveAboutPageContent",
    "Failed to load contact page content": "common.errors.failedLoadContactPageContent",
    "Failed to save contact page content": "common.errors.failedSaveContactPageContent",
    "Failed to load location": "common.errors.failedLoadLocation",
    "Failed to save location": "common.errors.failedSaveLocation",
    "Failed to delete location": "common.errors.failedDeleteLocation",
    "Failed to load constants": "common.errors.failedLoadConstants",
    "Failed to save constant": "common.errors.failedSave",
    "Failed to delete constant": "common.errors.failedDelete",
    "Failed to load brands": "common.errors.failedLoadBrands",
    "Failed to save brand": "common.errors.failedSave",
    "Failed to delete brand": "common.errors.failedDelete",
    "Failed to load ownership tax rules": "common.errors.failedLoadOwnershipTaxRules",
    "Failed to save ownership tax rule": "common.errors.failedSave",
    "Failed to delete ownership tax rule": "common.errors.failedDelete",
    "Failed to load vehicle spec definitions": "common.errors.failedLoadVehicleSpecDefinitions",
    "Failed to save vehicle spec definition": "common.errors.failedSave",
    "Failed to delete vehicle spec definition": "common.errors.failedDelete",
    "Failed to load featured vehicles": "common.errors.failedLoadFeaturedVehicles",
    "Failed to add featured vehicle": "common.errors.failedAddFeaturedVehicle",
    "Failed to remove featured vehicle": "common.errors.failedRemoveFeaturedVehicle",
    "Failed to update featured vehicle order": "common.errors.failedUpdate",
    "Failed to update user": "common.errors.failedUpdateUser",
    "Failed to ban user": "common.errors.failedBanUser",
    "Failed to unban user": "common.errors.failedUnbanUser",
    "Failed to change password": "dealerComponents.changePasswordDialog.failedChangePassword",
    "Not set": "common.notSet",
    "No description": "common.noDescription",
    "Plan Details": "admin.views.plans.planDetails",
    "View and manage plan information": "admin.views.plans.planDetailsSubtitle",
    "Required": "common.required",
    "This field is required": "common.required",
}

# Vehicle detail field labels (staff/admin views reuse dealer keys)
VD = "dealer.views.vehicleDetail"
VEHICLE_FIELD_MAP = {
    "Basic Information": f"{VD}.basicInformation",
    "Pricing Information": f"{VD}.pricingInformation",
    "Specifications": f"{VD}.specifications",
    "Vehicle Details": f"{VD}.detailsSection",
    "Equipment": f"{VD}.equipment",
    "Information": f"{VD}.information",
    "Vehicle Images": f"{VD}.vehicleImages",
    "Title": f"{VD}.titleLabel",
    "Registration": f"{VD}.registration",
    "VIN": f"{VD}.vin",
    "Price": f"{VD}.price",
    "Published At": f"{VD}.publishedAt",
    "Brand": f"{VD}.brand",
    "Model": f"{VD}.model",
    "Variant": f"{VD}.variant",
    "Model Year": f"{VD}.modelYear",
    "KM Driven": f"{VD}.kmDriven",
    "Fuel Type": f"{VD}.fuelType",
    "Status": f"{VD}.status",
    "Transmission": f"{VD}.transmission",
    "Listing Type": f"{VD}.salesType",
    "Engine Power": f"{VD}.enginePower",
    "Engine Power (HP)": f"{VD}.enginePowerHp",
    "Engine Power (kW)": f"{VD}.enginePowerHp",
    "Towing Weight": f"{VD}.towingWeight",
    "Towing Weight (kg)": f"{VD}.towingWeightKg",
    "Battery Capacity": f"{VD}.batteryCapacity",
    "Battery Capacity (kWh)": f"{VD}.batteryCapacityKwh",
    "Range (km)": f"{VD}.rangeKm",
    "Charging Type": f"{VD}.chargingType",
    "Ownership Tax": f"{VD}.ownershipTax",
    "First Registration": f"{VD}.firstRegistrationDate",
    "First Registration Date": f"{VD}.firstRegistrationDate",
    "Fuel Efficiency": f"{VD}.fuelEfficiency",
    "Fuel Efficiency (L/100km)": f"{VD}.fuelEfficiency",
    "Fuel Consumption WLTP/NEDC": f"{VD}.fuelConsumptionWltpNedc",
    "Fuel Consumption WLTP (L/100km)": f"{VD}.fuelConsumptionWltp",
    "Fuel Consumption NEDC (L/100km)": f"{VD}.fuelConsumptionNedc",
    "CO2 Emissions (g/km)": f"{VD}.co2Emissions",
    "Gear Type": f"{VD}.gearType",
    "Engine Type": f"{VD}.engineType",
    "Euro Emission Class": f"{VD}.euroEmissionClass",
    "Previous Usage": f"{VD}.previousUsage",
    "Last Inspection Date": f"{VD}.lastInspectionDate",
    "Last Inspection Result": f"{VD}.lastInspectionResult",
    "Last Inspection Odometer": f"{VD}.lastInspectionOdometer",
    "Is Import": f"{VD}.isImport",
    "Is Factory New": f"{VD}.isFactoryNew",
    "Body Type": f"{VD}.bodyType",
    "Color": f"{VD}.color",
    "Description": f"{VD}.description",
    "Drivetrain": f"{VD}.drivetrain",
    "Condition": f"{VD}.condition",
    "Servicebog": f"{VD}.servicebog",
    "Annual Tax": f"{VD}.annualTax",
    "Price Type": f"{VD}.priceType",
    "Sales Type": f"{VD}.salesType",
    "Wholesale Price": f"{VD}.wholesalePrice",
    "Internal Cost Price": f"{VD}.internalCostPrice",
    "Price Without Tax": f"{VD}.priceWithoutTax",
    "Created At": f"{VD}.createdAt",
    "Updated At": f"{VD}.updatedAt",
    "Current status:": f"{VD}.currentStatus",
    "New Status": f"{VD}.newStatus",
    "No equipment assigned": f"{VD}.noEquipment",
    "No images available": f"{VD}.noImages",
    "Loading vehicle information...": f"{VD}.loadingVehicle",
    "Error": f"{VD}.error",
    "Cancel": "common.cancel",
    "Save": "common.save",
    "Delete": "common.delete",
    "Upload": "common.upload",
    "Edit": "common.edit",
    "View": "common.view",
    "Mark as Sold": f"{VD}.markAsSold",
}

VEHICLE_DETAIL_FILES = [
    ROOT / "views/staff/vehicles/VehicleDetail.vue",
    ROOT / "views/admin/vehicles/VehicleDetail.vue",
]


def ensure_use_i18n(content: str) -> str:
    if "useI18n" in content and "const { t }" in content:
        return content
    if "<script setup" not in content:
        return content
    if "from 'vue-i18n'" not in content:
        content = content.replace(
            "import { useRoute }",
            "import { useI18n } from 'vue-i18n'\nimport { useRoute }",
            1,
        )
        if "from 'vue-i18n'" not in content:
            content = re.sub(
                r"(<script setup[^>]*>\n)(import )",
                r"\1import { useI18n } from 'vue-i18n'\n\2",
                content,
                count=1,
            )
    if "const { t } = useI18n()" not in content:
        content = re.sub(
            r"(const props = defineProps|const route = useRoute|const router = useRouter)",
            r"const { t } = useI18n()\n\1",
            content,
            count=1,
        )
    return content


def replace_fallbacks(content: str) -> str:
    for text, key in FALLBACK_MAP.items():
        content = content.replace(f"|| '{text}'", f"|| t('{key}')")
        content = content.replace(f'|| "{text}"', f"|| t('{key}')")
        content = content.replace(f"|| '{text}'", f"|| t('{key}')")
    return content


def replace_vehicle_fields(content: str) -> str:
    for text, key in VEHICLE_FIELD_MAP.items():
        content = content.replace(
            f'<div class="field-label">{text}</div>',
            f"<div class=\"field-label\">{{{{ t('{key}') }}}}</div>",
        )
        content = content.replace(
            f'label="{text}"',
            f":label=\"t('{key}')\"",
        )
        content = content.replace(
            f">{{ text }}<",
            f">{{{{ t('{key}') }}}}<",
        )
        # Section headers in span
        content = content.replace(
            f'<span class="text-subtitle-1">{text}</span>',
            f"<span class=\"text-subtitle-1\">{{{{ t('{key}') }}}}</span>",
        )
    return content


def process_file(path: Path, vehicle_detail: bool = False) -> bool:
    original = path.read_text(encoding="utf-8")
    content = original
    content = replace_fallbacks(content)
    if vehicle_detail:
        content = replace_vehicle_fields(content)
    if content != original:
        if "t('" in content and "useI18n" not in content:
            content = ensure_use_i18n(content)
        elif "t('" in content and "const { t }" not in content:
            content = ensure_use_i18n(content)
        path.write_text(content, encoding="utf-8")
        return True
    return False


def main() -> None:
    changed = []
    for path in ROOT.rglob("*.vue"):
        if path.suffix != ".vue":
            continue
        is_vd = path in VEHICLE_DETAIL_FILES
        if process_file(path, vehicle_detail=is_vd):
            changed.append(str(path.relative_to(ROOT)))

    for path in [ROOT / "models/lead.model.ts", ROOT / "services/auth.ts", ROOT / "api/response.ts"]:
        if path.exists() and process_file(path):
            changed.append(str(path.relative_to(ROOT)))

    print(f"Updated {len(changed)} files")
    for f in sorted(changed)[:60]:
        print(f"  - {f}")
    if len(changed) > 60:
        print(f"  ... and {len(changed) - 60} more")


if __name__ == "__main__":
    main()
