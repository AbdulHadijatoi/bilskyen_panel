/**
 * Editable `vehicles` columns for dealer/admin panel create & update.
 *
 * Subset of `Vehicle::$fillable` — excludes ownership keys (`dealer_id`, `user_id`)
 * and server-managed counters (`views_count`, `calculated_ownership_tax`).
 *
 * Keep in sync with `backend/app/Models/Vehicle.php`.
 */
export const VEHICLE_PERSIST_FIELDS = [
  'dmr_fact_vehicle_id',
  'title',
  'registration',
  'slug',
  'vin',
  'price',
  'list_status_id',
  'published_at',
  'description',
  'address',
  'postcode',
  'seller_phone',
  'gear_type_id',
  'body_type_id',
  'km_driven',
  'battery_capacity',
  'range_km',
  'charging_type',
  'condition_id',
  'annual_tax',
  'brand_id',
  'model_id',
  'variant_id',
  'fuel_type_id',
  'model_year',
  'km_per_liter',
  'fuel_consumption_wltp',
  'fuel_consumption_nedc',
  'maximum_weight_kg',
  'colour_id',
  'emission_norm_id',
  'last_inspection_date',
  'first_registration_date',
  'first_registration_year',
  'production_date',
  'co2_emission',
  'engine_power_kw',
  'engine_power_hp',
  'engine_displacement_litres',
  'engine_type',
  'door_count',
  'seats_min',
  'seats_max',
  'max_speed',
  'axle_count',
  'towing_weight',
  'is_import',
  'is_factory_new',
  'sales_type_id',
  'price_type_id',
  'vehicle_use_id',
  'listing_type_id',
  'category_id',
  'internal_cost_price',
  'cover_image_index',
  'leasing_enabled',
  'leasing_type',
  'leasing_customer_type',
  'leasing_first_payment',
  'leasing_residual_value',
  'leasing_duration',
  'leasing_annual_mileage',
  'leasing_total_cost',
  'registration_status',
  'servicebog',
] as const

export type VehiclePersistField = (typeof VEHICLE_PERSIST_FIELDS)[number]

/**
 * Whitelist + legacy UI key mapping for vehicle create/update payloads.
 */
export function pickVehiclePersistFields(
  input: Record<string, unknown>,
  options?: { omitListStatusId?: boolean }
): Partial<Record<VehiclePersistField, unknown>> {
  const out: Record<string, unknown> = {}

  for (const field of VEHICLE_PERSIST_FIELDS) {
    if (options?.omitListStatusId && field === 'list_status_id') continue
    if (input[field] !== undefined && input[field] !== null) out[field] = input[field]
  }

  if (out.address === undefined && input.seller_address !== undefined && input.seller_address !== null) {
    out.address = input.seller_address
  }
  if (out.postcode === undefined && input.seller_postcode !== undefined && input.seller_postcode !== null) {
    out.postcode = input.seller_postcode
  }
  if (out.list_status_id === undefined && input.vehicle_list_status_id !== undefined && input.vehicle_list_status_id !== null) {
    out.list_status_id = input.vehicle_list_status_id
  }
  if (out.km_per_liter === undefined && input.fuel_efficiency !== undefined && input.fuel_efficiency !== null) {
    out.km_per_liter = input.fuel_efficiency
  }
  if (out.colour_id === undefined && input.color_id !== undefined && input.color_id !== null) {
    out.colour_id = input.color_id
  }
  if (out.emission_norm_id === undefined && input.euronom_id !== undefined && input.euronom_id !== null) {
    out.emission_norm_id = input.euronom_id
  }
  if (out.model_year === undefined && input.model_year_id !== undefined && input.model_year_id !== null) {
    out.model_year = input.model_year_id
  }

  return out
}
