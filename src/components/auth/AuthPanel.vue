<template>
  <div class="flex size-full flex-col items-center justify-center">
    <ForgotPassword
      v-if="showForgottenPassPopup"
      :showForgottenPassPopup="showForgottenPassPopup"
      :toggleShowForgottenPassPopup="toggleShowForgottenPassPopup"
    />

    <SignInForm
      v-if="!showForgottenPassPopup && showLoginPopup"
      :toggleShowForgottenPassPopup="toggleShowForgottenPassPopup"
      :toggleShowLoginPopup="toggleShowLoginPopup"
      :onAuthComplete="onAuthComplete"
    />

    <SignUpForm
      v-if="!showForgottenPassPopup && !showLoginPopup"
      :toggleShowLoginPopup="toggleShowLoginPopup"
      :onAuthComplete="onAuthComplete"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useAppStore } from '@/composables/useAppStore'
import ForgotPassword from '@/components/auth/ForgotPassword.vue'
import SignInForm from '@/components/auth/SignInForm.vue'
import SignUpForm from '@/components/auth/SignUpForm.vue'
import { createContributor } from '@/api/contributors'

type AuthMode = 'sign-in' | 'sign-up' | 'forgot'

const props = withDefaults(
  defineProps<{
    initialMode?: AuthMode
  }>(),
  { initialMode: 'sign-in' }
)

const emit = defineEmits<{
  'auth-complete': [payload: { isNewUser: boolean }]
  // Lets a wrapper mirror header/height without owning the state machine.
  'update:mode': [mode: AuthMode]
}>()

const store = useAppStore()

const showForgottenPassPopup = ref(props.initialMode === 'forgot')
const showLoginPopup = ref(props.initialMode !== 'sign-up')

const toggleShowForgottenPassPopup = () => {
  showForgottenPassPopup.value = !showForgottenPassPopup.value
}

const toggleShowLoginPopup = () => {
  showLoginPopup.value = !showLoginPopup.value
}

const currentMode = (): AuthMode =>
  showForgottenPassPopup.value ? 'forgot' : showLoginPopup.value ? 'sign-in' : 'sign-up'

watch([showForgottenPassPopup, showLoginPopup], () => emit('update:mode', currentMode()), {
  immediate: true
})

// Creates the contributor profile for first-time users; navigation is the parent's job.
const onAuthComplete = async () => {
  const isNewUser = store.state.isNewUser
  if (isNewUser) {
    const { email, displayName, photoUrl } = store.state.appUserCredentials
    // Auth Service platform UUID, not Firebase UID.
    const platformUserId = store.state.platformUserId
    try {
      await createContributor({
        userId: platformUserId,
        email,
        username: displayName,
        imgUrl: photoUrl ?? null
      })
    } catch {
      // Non-fatal: login still succeeds.
    }
  }
  emit('auth-complete', { isNewUser })
}
</script>
<style scoped></style>
