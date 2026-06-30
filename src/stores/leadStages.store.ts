import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { getLookupConstants } from '@/api/dealer.api'
import { LeadStage } from '@/models/lead.model'

const LEAD_STAGE_COLORS: Record<number, string> = {
  [LeadStage.NEW]: 'blue',
  [LeadStage.CONTACTED]: 'cyan',
  [LeadStage.QUALIFIED]: 'green',
  [LeadStage.QUOTED]: 'orange',
  [LeadStage.NEGOTIATING]: 'purple',
  [LeadStage.WON]: 'success',
  [LeadStage.LOST]: 'error',
}

export interface LeadStageOption {
  id: number
  name: string
  color: string
}

export const useLeadStagesStore = defineStore('leadStages', () => {
  const stages = ref<Array<{ id: number; name: string }>>([])
  const loaded = ref(false)
  const loading = ref(false)

  const stageNameById = computed(() => {
    const map = new Map<number, string>()
    for (const stage of stages.value) {
      map.set(stage.id, stage.name)
    }
    return map
  })

  const stageOptions = computed((): LeadStageOption[] => {
    return stages.value.map((stage) => ({
      id: stage.id,
      name: stage.name,
      color: LEAD_STAGE_COLORS[stage.id] || 'grey',
    }))
  })

  async function fetchStages(force = false) {
    if (loaded.value && !force) return
    if (loading.value) return

    try {
      loading.value = true
      const constants = await getLookupConstants()
      stages.value = constants.lead_stages ?? []
      loaded.value = true
    } catch (err) {
      console.error('Failed to load lead stages:', err)
    } finally {
      loading.value = false
    }
  }

  function getStageName(stageId: number): string | null {
    return stageNameById.value.get(stageId) ?? null
  }

  return {
    stages,
    loaded,
    loading,
    stageOptions,
    fetchStages,
    getStageName,
  }
})
