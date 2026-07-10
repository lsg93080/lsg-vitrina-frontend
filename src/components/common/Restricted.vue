<template>
  <div class="flex flex-col items-center justify-center gap-4 py-12 text-[var(--text-color)]">
    <font-awesome-icon class="text-4xl opacity-40" :icon="['fas', 'sad-tear']" />
    <p
      v-if="store.state.isLogged && !store.state.appUserCredentials.emailVerified"
      data-test="restricted-text"
      class="max-w-[30ch] text-center text-sm"
    >
      {{ t('restricted.verify') }}
    </p>
    <template v-else-if="!store.state.isLogged">
      <p data-test="restricted-text" class="max-w-[30ch] text-center text-sm">
        {{ t('restricted.text') }}
      </p>
      <Button :label="t('restricted.sign-in')" size="small" outlined @click="goToLogin" />
    </template>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'
import { useAppStore } from '@/composables/useAppStore'
import Button from 'primevue/button'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const store = useAppStore()

const goToLogin = () => {
  router.push({
    path: '/login',
    query: { redirect_uri: `${window.location.pathname}#${route.fullPath}` }
  })
}
</script>
