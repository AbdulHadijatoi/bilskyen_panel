import { useRouter } from 'vue-router'
import { impersonateDealer } from '@/api/admin.api'
import { stopImpersonation as stopImpersonationApi } from '@/api/auth.api'
import { useAuthStore } from '@/stores/auth.store'
import { normalizeUser } from '@/utils/user'

function featuresFrom(data: unknown): Record<string, string> {
  if (data && typeof data === 'object' && !Array.isArray(data)) {
    return data as Record<string, string>
  }
  return {}
}

export function useDealerImpersonation() {
  const authStore = useAuthStore()
  const router = useRouter()

  async function loginAsDealer(dealerId: number, dealerName?: string): Promise<void> {
    if (!authStore.user || !authStore.accessToken) {
      throw new Error('Not authenticated')
    }

    const snapshot = {
      dealerId,
      dealerName: dealerName || '',
      adminUser: authStore.user,
      adminToken: authStore.accessToken,
      adminFeatures: { ...authStore.subscriptionFeatures },
    }

    const data = await impersonateDealer(dealerId)
    const user = normalizeUser(data.user)
    const name = data.impersonation?.dealer_name || dealerName || user.name

    authStore.startImpersonation({
      ...snapshot,
      dealerId: data.impersonation?.dealer_id || dealerId,
      dealerName: name,
    })
    authStore.setAuth(user, data.access_token, featuresFrom(data.subscription_features))
    await router.push({ name: 'dealer.dashboard' })
  }

  function restoreAdminFromSnapshot(): boolean {
    const snap = authStore.impersonation
    authStore.clearImpersonation()
    if (!snap?.adminToken || !snap.adminUser) {
      return false
    }
    authStore.setAuth(snap.adminUser, snap.adminToken, snap.adminFeatures || {})
    return true
  }

  async function returnToAdmin(): Promise<void> {
    try {
      const data = await stopImpersonationApi()
      authStore.clearImpersonation()
      const user = normalizeUser(data.user)
      authStore.setAuth(user, data.access_token, featuresFrom(data.subscription_features))
    } catch {
      if (!restoreAdminFromSnapshot()) {
        authStore.logout()
        await router.push('/auth/login')
        return
      }
    }
    await router.push({ name: 'admin.dealers' })
  }

  return {
    loginAsDealer,
    returnToAdmin,
    restoreAdminFromSnapshot,
  }
}
