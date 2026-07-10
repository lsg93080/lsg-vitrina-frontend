<template>
  <section class="w-full overflow-y-auto p-8">
    <header class="pb-4 text-start">
      <h2>{{ t('nav.publish') }}</h2>
      <p class="mt-1 text-sm text-[var(--text-color-light)]">{{ t('publish.subtitle') }}</p>
    </header>
    <PubForm v-if="store.state.isLogged && store.state.appUserCredentials.emailVerified" />
    <Restricted v-else class="set-center" />
  </section>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import PubForm from '@/components/publish/PubForm.vue'
import Restricted from '@/components/common/Restricted.vue'
import { useAppStore } from '@/composables/useAppStore'

const { t } = useI18n()
const store = useAppStore()
</script>
