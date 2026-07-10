<template>
  <section class="main-contributions">
    <restricted v-if="!store.state.isLogged" />
    <template v-else>
      <header class="pb-4 text-start">
        <h2>{{ t('admin.reports-queue') }}</h2>
        <p class="mt-1 text-sm text-[var(--text-color-light)]">
          {{ t('admin.queue-subtitle') }}
        </p>
      </header>
      <ReportsQueue />
    </template>
  </section>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import Restricted from '@/components/common/Restricted.vue'
import ReportsQueue from '@/components/admin/ReportsQueue.vue'

const { t } = useI18n()
const store = useAppStore()
</script>
<style scoped></style>
