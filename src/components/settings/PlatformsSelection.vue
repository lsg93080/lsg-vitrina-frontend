<template>
  <section
    class="flex h-full w-full flex-col items-center justify-center gap-5 text-[var(--text-color)]"
  >
    <h1 class="pb-4 text-xl font-bold capitalize">{{ t(`settings.platforms.title`) }}:</h1>
    <div class="flex w-full flex-col items-center justify-center gap-4">
      <div
        class="grid w-fit grid-cols-4 items-center gap-5"
        v-for="platform in platforms"
        :key="platform.value"
      >
        <font-awesome-icon class="fa-2x col-span-1" :icon="platform.icon" />
        <label class="col-span-2 text-start" :for="platform.name">
          {{ platform.name }}
        </label>
        <ToggleSwitch :inputId="platform.name" v-model="platform.selected" class="col-span-1" />
      </div>
    </div>

    <Button
      :label="t('contributions.update')"
      class="w-[60%]"
      :loading="loading"
      @click="handleUpdateUser"
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
import { PlatformValue } from '@/types/models/platform'

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()

const platforms = ref([
  { value: PlatformValue.MACOS, name: 'Mac OS', icon: ['fab', 'apple'], selected: false },
  { value: PlatformValue.WINDOWS, name: 'Windows', icon: ['fab', 'windows'], selected: false },
  { value: PlatformValue.LINUX, name: 'Linux', icon: ['fab', 'linux'], selected: false },
  { value: PlatformValue.ANDROID, name: 'Android', icon: ['fab', 'android'], selected: false }
])

const loading = ref(false)

onMounted(async () => {
  const userId = store.state.platformUserId
  if (!userId) return
  try {
    const userResponse = await getContributorByUserId(userId)
    const saved: string[] = userResponse.data.platforms ?? []
    platforms.value.forEach((p) => {
      p.selected = saved.includes(p.value)
    })
  } catch {
    // Contributor not found or fetch failed, keep defaults
  }
})

const handleUpdateUser = async () => {
  const userId = store.state.platformUserId
  if (!userId) return
  loading.value = true
  try {
    const selectedValues = platforms.value.filter((p) => p.selected).map((p) => p.value)
    await updateContributorByUserId(userId, { platforms: selectedValues })
    toast.add({ severity: 'success', summary: t('settings.platforms.success'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('settings.platforms.error'), life: 4000 })
  } finally {
    loading.value = false
  }
}
</script>
<style scoped></style>
