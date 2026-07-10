<template>
  <div class="flex h-full flex-col items-center justify-center gap-4">
    <h1 class="text-xl font-bold capitalize">{{ t('settings.language.select') }}</h1>
    <Select
      class="!w-[300px]"
      v-model="selectedLanguage"
      :placeholder="t('settings.language.select')"
      :options="languages"
      optionLabel="name"
      optionValue="value"
      checkmark
    />
  </div>
</template>

<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { ref, watch } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import Select from 'primevue/select'

const store = useAppStore()
const { t, locale } = useI18n()

const selectedLanguage = ref(locale.value)

const languages = ref([
  { id: 1, value: 'en', name: t('settings.language.english') },
  { id: 2, value: 'es', name: t('settings.language.spanish') }
])

watch(selectedLanguage, (newSelectedLanguage) => {
  locale.value = newSelectedLanguage
  store.commit('mutateLang', newSelectedLanguage)
  localStorage.setItem('lang', newSelectedLanguage)
})
</script>
<style scoped>
select {
  padding: 5px;
  font-size: 16px;
}
</style>
