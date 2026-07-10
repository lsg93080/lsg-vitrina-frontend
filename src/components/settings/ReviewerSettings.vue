<template>
  <section
    class="flex h-full w-full flex-col items-center justify-center gap-6 text-[var(--text-color)]"
  >
    <h1 class="text-xl font-bold capitalize">{{ t('settings.reviewer.title') }}</h1>
    <p class="text-sm text-[var(--text-color-light)]">
      {{ t('settings.reviewer.description') }}
    </p>
    <div class="grid w-fit grid-cols-4 items-center gap-5">
      <font-awesome-icon class="fa-2x col-span-1" :icon="['fas', 'clipboard-check']" />
      <label class="col-span-2 text-start" for="reviewer-toggle">
        {{ t('settings.reviewer.label') }}
      </label>
      <ToggleSwitch inputId="reviewer-toggle" v-model="isReviewer" class="col-span-1" />
    </div>
    <Button
      :label="t('contributions.update')"
      class="w-[60%]"
      :loading="loading"
      @click="handleUpdate"
    />
  </section>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import ToggleSwitch from 'primevue/toggleswitch'
import { useToast } from 'primevue/usetoast'
import { useAppStore } from '@/composables/useAppStore'
import { getContributorByUserId, updateContributorByUserId } from '@/api/contributors'

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()

const isReviewer = ref(true)
const loading = ref(false)

onMounted(async () => {
  const userId = store.state.platformUserId
  if (!userId) return
  try {
    const res = await getContributorByUserId(userId)
    isReviewer.value = res.data.isReviewer ?? true
  } catch {
    // keep default
  }
})

const handleUpdate = async () => {
  const userId = store.state.platformUserId
  if (!userId) return
  loading.value = true
  try {
    await updateContributorByUserId(userId, { isReviewer: isReviewer.value })
    toast.add({ severity: 'success', summary: t('settings.reviewer.success'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('settings.reviewer.error'), life: 4000 })
  } finally {
    loading.value = false
  }
}
</script>
