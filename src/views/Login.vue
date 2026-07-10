<template>
  <div v-if="!store.state.isLogged" class="flex min-h-[60vh] items-center justify-center px-4 py-8">
    <div class="w-full max-w-md">
      <AuthPanel :initialMode="initialMode" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { watch } from 'vue'
import { useRoute } from 'vue-router'
import { useAppStore } from '@/composables/useAppStore'
import AuthPanel from '@/components/auth/AuthPanel.vue'
import { safeRedirect } from '@/utils/safeRedirect'

type AuthMode = 'sign-in' | 'sign-up' | 'forgot'

const route = useRoute()
const store = useAppStore()

const redirectUri = route.query.redirect_uri as string | undefined
const initialMode: AuthMode = route.query.mode === 'signup' ? 'sign-up' : 'sign-in'

// Full navigation (not router.push): redirect_uri may target another microfrontend on the gateway.
const goToTarget = () => {
  window.location.href = safeRedirect(redirectUri, '/vitrina/')
}

// Gate on jwt, not isLogged: session-restore sets isLogged before the async JWT
// exchange writes vitrina_jwt, so redirecting on isLogged would leave without it.
// setJwt persists vitrina_jwt and state.jwt together, so jwt is the real handoff signal.
// immediate:true also covers the case where the user arrives already authenticated.
watch(
  () => store.state.jwt,
  (jwt) => {
    if (jwt) goToTarget()
  },
  {
    immediate: true,
    flush: 'sync'
  }
)
</script>
