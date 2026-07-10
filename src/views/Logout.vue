<template>
  <div class="flex min-h-[60vh] items-center justify-center">
    <p class="text-sm opacity-60" style="color: var(--text-color)">{{ t('login.logout') }}</p>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import { safeRedirect } from '@/utils/safeRedirect'

const { t } = useI18n()
const route = useRoute()
const store = useAppStore()

const redirectUri = route.query.redirect_uri as string | undefined

onMounted(async () => {
  await store.dispatch('logout')
  window.location.href = safeRedirect(redirectUri, '/')
})
</script>
