import Sortable, { type SortableEvent } from 'sortablejs'
import { nextTick, onUnmounted, ref, type Ref } from 'vue'

export interface KanbanStageDropPayload {
  leadId: number
  oldStageId: number
  newStageId: number
  newIndex: number | undefined
  oldIndex: number | undefined
}

interface UseKanbanSortableOptions {
  viewMode: Ref<string>
  stages: Ref<Array<{ id: number }>>
  isDragging: Ref<boolean>
  onStageDrop: (payload: KanbanStageDropPayload) => Promise<void>
}

function resolveLeadId(item: HTMLElement): number | null {
  const directId = item.getAttribute('data-lead-id')
  if (directId) {
    const parsed = parseInt(directId, 10)
    return Number.isNaN(parsed) ? null : parsed
  }

  const nested = item.querySelector<HTMLElement>('.draggable-item[data-lead-id]')
    ?? item.closest<HTMLElement>('[data-lead-id]')
    ?? item.querySelector<HTMLElement>('[data-lead-id]')

  if (nested) {
    const foundId = nested.getAttribute('data-lead-id')
    if (foundId) {
      const parsed = parseInt(foundId, 10)
      return Number.isNaN(parsed) ? null : parsed
    }
  }

  const parentId = item.parentElement?.getAttribute('data-lead-id')
  if (parentId) {
    const parsed = parseInt(parentId, 10)
    return Number.isNaN(parsed) ? null : parsed
  }

  return null
}

function ensurePlaceholder(listEl: HTMLElement): void {
  if (!listEl.querySelector('.sortable-placeholder')) {
    const placeholder = document.createElement('div')
    placeholder.className = 'sortable-placeholder'
    placeholder.setAttribute('aria-hidden', 'true')
    placeholder.style.height = '1px'
    placeholder.style.minHeight = '1px'
    placeholder.style.pointerEvents = 'none'
    placeholder.style.opacity = '0'
    listEl.appendChild(placeholder)
  }
}

export function useKanbanSortable(options: UseKanbanSortableOptions) {
  const sortableInstances = ref<Record<number, Sortable | null>>({})
  const stageListRefs = ref<Record<number, HTMLElement | null>>({})

  const setStageListRef = (el: unknown, stageId: number) => {
    if (!el) {
      return
    }
    stageListRefs.value[stageId] = el as HTMLElement
    nextTick(() => ensurePlaceholder(el as HTMLElement))
  }

  const destroySortable = () => {
    Object.values(sortableInstances.value).forEach((instance) => {
      if (instance) {
        instance.destroy()
      }
    })
    sortableInstances.value = {}
  }

  const initializeSortable = async () => {
    if (options.viewMode.value !== 'kanban') {
      return
    }

    destroySortable()
    await nextTick()
    await new Promise((resolve) => setTimeout(resolve, 50))

    options.stages.value.forEach((stage) => {
      const listEl = stageListRefs.value[stage.id]
      if (!listEl || sortableInstances.value[stage.id]) {
        return
      }

      ensurePlaceholder(listEl)

      sortableInstances.value[stage.id] = Sortable.create(listEl, {
        group: {
          name: 'leads',
          pull: true,
          put: true,
        },
        animation: 200,
        ghostClass: 'ghost-card',
        chosenClass: 'chosen-card',
        dragClass: 'drag-card',
        emptyInsertThreshold: 5,
        draggable: '.draggable-item',
        filter: '.empty-state-placeholder, .sortable-placeholder',
        onStart: () => {
          options.isDragging.value = true
        },
        onEnd: async (evt: SortableEvent) => {
          try {
            const { from, to, item, oldIndex, newIndex } = evt
          if (!from || !to || !item) {
            return
          }

          const leadId = resolveLeadId(item as HTMLElement)
          if (!leadId) {
            return
          }

          const fromStageId = from.getAttribute('data-stage-id')
          const toStageId = to.getAttribute('data-stage-id')
          if (!fromStageId || !toStageId) {
            return
          }

          const oldStageId = parseInt(fromStageId, 10)
          const newStageId = parseInt(toStageId, 10)
          if (
            Number.isNaN(oldStageId)
            || Number.isNaN(newStageId)
            || oldStageId === newStageId
          ) {
            return
          }

          await options.onStageDrop({
            leadId,
            oldStageId,
            newStageId,
            newIndex: newIndex ?? undefined,
            oldIndex: oldIndex ?? undefined,
          })
          } finally {
            options.isDragging.value = false
          }
        },
      })
    })
  }

  onUnmounted(() => {
    destroySortable()
  })

  return {
    setStageListRef,
    initializeSortable,
    destroySortable,
  }
}
