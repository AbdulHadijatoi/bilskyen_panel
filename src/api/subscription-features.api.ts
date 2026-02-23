import httpClient from './http'
import { handleSuccess, handleError } from './response'
import { DEALER_SUBSCRIPTION_ENDPOINTS } from './endpoints'
import { useAuthStore } from '@/stores/auth.store'

/**
 * Load subscription features as key-value pairs and persist in auth store.
 */
export async function loadSubscriptionFeatures(): Promise<Record<string, string>> {
  try {
    const response = await httpClient.get<{ data: Record<string, string> }>(
      DEALER_SUBSCRIPTION_ENDPOINTS.FEATURES
    )
    const features = handleSuccess<Record<string, string>>(response)
    const authStore = useAuthStore()
    authStore.setSubscriptionFeatures(features)
    return features
  } catch (error) {
    throw handleError(error)
  }
}
