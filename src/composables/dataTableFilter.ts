import { ref } from 'vue'
import { FilterMatchMode } from '@primevue/core/api'

export function useDataTableFilter() {
  const filters = ref({
    global: { value: null as string | null, matchMode: FilterMatchMode.CONTAINS }
  })

  const expandedRows = ref<Record<string, boolean>>({})

  const clearFilter = () => {
    filters.value.global.value = null
  }

  const toggleRow = (id: string) => {
    if (expandedRows.value[id]) {
      delete expandedRows.value[id]
    } else {
      expandedRows.value = { ...expandedRows.value, [id]: true }
    }
  }

  return { filters, expandedRows, clearFilter, toggleRow }
}
