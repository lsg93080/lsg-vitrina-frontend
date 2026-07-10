<template>
  <section class="flex w-full flex-col gap-6 pb-4">
    <div class="flex flex-col gap-1">
      <h2 class="text-lg font-semibold">{{ t('settings.connections.title') }}</h2>
    </div>

    <LoadingState v-if="loading" size="lg" />

    <template v-else>
      <!-- Sign-in methods -->
      <div class="flex flex-col gap-2">
        <div>
          <p class="text-sm font-semibold">{{ t('settings.connections.login-section') }}</p>
          <p class="text-xs text-[var(--text-muted-color)]">
            {{ t('settings.connections.login-section-description') }}
          </p>
        </div>
        <div
          v-for="provider in loginProviders"
          :key="provider.id"
          class="flex items-center gap-3 rounded-lg bg-[var(--background-color)] p-4"
        >
          <div class="flex h-9 w-9 shrink-0 items-center justify-center">
            <font-awesome-icon :icon="[provider.iconFamily, provider.icon]" class="text-xl" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
            <span class="leading-tight font-medium">{{ provider.label }}</span>
            <span
              v-if="provider.isConnected && provider.connectedAs"
              class="truncate text-xs text-[var(--text-muted-color)]"
            >
              {{ t('settings.connections.connected-as', { username: provider.connectedAs }) }}
            </span>
          </div>
          <Tag
            :value="
              provider.isConnected
                ? t('settings.connections.connected')
                : t('settings.connections.not-connected')
            "
            :severity="provider.isConnected ? 'success' : 'secondary'"
            class="w-28 shrink-0 justify-center"
          />
          <div class="w-28 shrink-0" />
        </div>
      </div>

      <div class="flex flex-col gap-2">
        <div>
          <p class="text-sm font-semibold">{{ t('settings.connections.repo-section') }}</p>
          <p class="text-xs text-[var(--text-muted-color)]">
            {{ t('settings.connections.repo-section-description') }}
          </p>
        </div>
        <div
          v-for="provider in repoProviders"
          :key="provider.id"
          class="flex items-center gap-3 rounded-lg bg-[var(--background-color)] p-4"
        >
          <div class="flex h-9 w-9 shrink-0 items-center justify-center">
            <font-awesome-icon :icon="[provider.iconFamily, provider.icon]" class="text-xl" />
          </div>
          <div class="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
            <span class="leading-tight font-medium">{{ provider.label }}</span>
            <span
              v-if="provider.isConnected && provider.connectedAs"
              class="truncate text-xs text-[var(--text-muted-color)]"
            >
              {{ t('settings.connections.connected-as', { username: provider.connectedAs }) }}
            </span>
          </div>
          <Tag
            :value="
              provider.isConnected
                ? t('settings.connections.connected')
                : t('settings.connections.not-connected')
            "
            :severity="provider.isConnected ? 'success' : 'secondary'"
            class="w-28 shrink-0 justify-center"
          />
          <Button
            :label="
              provider.actionable ? getActionLabel(provider) : t('settings.connections.coming-soon')
            "
            :loading="actionInProgress === provider.id"
            :disabled="!provider.actionable || actionInProgress !== null"
            :variant="provider.isConnected ? 'outlined' : undefined"
            size="small"
            class="w-28 shrink-0 justify-center"
            @click="onAction(provider)"
          />
        </div>
      </div>
    </template>
  </section>

  <!-- Dialog: confirm disconnect -->
  <ConfirmWithCode
    v-model:visible="confirmDisconnectVisible"
    :header="t('settings.connections.confirm-disconnect-title', { provider: pendingProviderLabel })"
    :description="t('settings.connections.confirm-disconnect-message')"
    :confirm-label="t('settings.connections.disconnect')"
    :loading="actionInProgress !== null"
    @confirm="executeDisconnect"
  />

  <!-- Dialog: cannot disconnect (has linked publications) -->
  <Dialog
    v-model:visible="cannotDisconnectVisible"
    modal
    :draggable="false"
    :dismissableMask="true"
    :header="t('settings.connections.cannot-disconnect-title', { provider: pendingProviderLabel })"
    :style="{ width: '420px' }"
  >
    <p class="text-sm">
      {{
        t('settings.connections.cannot-disconnect-message', {
          count: blockedPublicationCount
        })
      }}
    </p>
    <template #footer>
      <Button :label="t('actions.close')" @click="cannotDisconnectVisible = false" />
    </template>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import { useToast } from 'primevue/usetoast'
import Button from 'primevue/button'
import Dialog from 'primevue/dialog'
import LoadingState from '@/components/common/LoadingState.vue'
import Tag from 'primevue/tag'
import ConfirmWithCode from '@/components/common/ConfirmWithCode.vue'
import { disconnectProvider } from '@/api/oauthService'
import { canDisconnect } from '@/api/vcsService'
import { useOAuthPopup } from '@/composables/useOAuthPopup'
import type { OAuthConnection, OAuthProvider } from '@/types/models/oauth'

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()
const { connect } = useOAuthPopup()

interface ProviderDef {
  id: string
  labelKey: string
  icon: string
  iconFamily: 'fab' | 'fas'
  actionable: boolean
  group: 'login' | 'repo'
}

const PROVIDER_DEFS: ProviderDef[] = [
  {
    id: 'google',
    labelKey: 'google',
    icon: 'google',
    iconFamily: 'fab',
    actionable: false,
    group: 'login'
  },
  {
    id: 'github-login',
    labelKey: 'github',
    icon: 'github',
    iconFamily: 'fab',
    actionable: false,
    group: 'login'
  },
  {
    id: 'email',
    labelKey: 'email',
    icon: 'envelope',
    iconFamily: 'fas',
    actionable: false,
    group: 'login'
  },
  {
    id: 'gitlab',
    labelKey: 'gitlab',
    icon: 'gitlab',
    iconFamily: 'fab',
    actionable: true,
    group: 'repo'
  },
  {
    id: 'github',
    labelKey: 'github',
    icon: 'github',
    iconFamily: 'fab',
    actionable: true,
    group: 'repo'
  }
]

const loading = ref(true)
const actionInProgress = ref<string | null>(null)

const connections = computed<OAuthConnection[]>(() => store.state.oauthConnections)

const confirmDisconnectVisible = ref(false)
const cannotDisconnectVisible = ref(false)
const pendingConnection = ref<OAuthConnection | null>(null)
const blockedPublicationCount = ref(0)

const pendingProviderLabel = computed(() =>
  pendingConnection.value
    ? t(`settings.connections.providers.${pendingConnection.value.provider}`)
    : ''
)

// Firebase providerId is 'google.com', 'github.com' or 'password'
const firebaseProviderId = computed<string | null>(
  () => store.state.appUserCredentials?.providerId ?? null
)
const firebaseDisplayName = computed<string | null>(
  () => store.state.appUserCredentials?.displayName ?? null
)
const firebaseEmail = computed<string | null>(() => store.state.appUserCredentials?.email ?? null)

const providers = computed(() =>
  PROVIDER_DEFS.map((def) => {
    const label = t(`settings.connections.providers.${def.labelKey}`)

    if (def.actionable) {
      const conn = connections.value.find((c) => c.provider === def.id)
      return {
        ...def,
        label,
        isConnected: !!conn,
        connectedAs: conn?.providerUserId ?? null,
        connection: conn ?? null
      }
    }

    if (def.id === 'google') {
      const isGoogle =
        firebaseProviderId.value === 'google.com' || firebaseProviderId.value === 'google'
      return {
        ...def,
        label,
        isConnected: isGoogle,
        connectedAs: isGoogle ? (firebaseDisplayName.value ?? firebaseEmail.value) : null,
        connection: null
      }
    }

    if (def.id === 'github-login') {
      const isGithub =
        firebaseProviderId.value === 'github.com' || firebaseProviderId.value === 'github'
      return {
        ...def,
        label,
        isConnected: isGithub,
        connectedAs: isGithub ? (firebaseDisplayName.value ?? null) : null,
        connection: null
      }
    }

    if (def.id === 'email') {
      const isEmail = firebaseProviderId.value === 'password'
      return {
        ...def,
        label,
        isConnected: isEmail,
        connectedAs: isEmail ? (firebaseEmail.value ?? null) : null,
        connection: null
      }
    }

    return { ...def, label, isConnected: false, connectedAs: null, connection: null }
  })
)

type ProviderRow = (typeof providers.value)[number]

const loginProviders = computed(() => providers.value.filter((p) => p.group === 'login'))
const repoProviders = computed(() => providers.value.filter((p) => p.group === 'repo'))

function getActionLabel(provider: ProviderRow): string {
  if (actionInProgress.value === provider.id) {
    return provider.isConnected
      ? t('settings.connections.disconnecting')
      : t('settings.connections.connecting')
  }
  return provider.isConnected
    ? t('settings.connections.disconnect')
    : t('settings.connections.connect')
}

async function loadConnections(): Promise<void> {
  try {
    await store.dispatch('loadOAuthConnections')
  } catch {
    // Non-fatal, rows show "not connected"
  } finally {
    loading.value = false
  }
}

async function onAction(provider: ProviderRow): Promise<void> {
  if (!provider.actionable) return

  if (provider.isConnected) {
    await initiateDisconnect(provider)
  } else {
    await initiateConnect(provider)
  }
}

async function initiateConnect(provider: ProviderRow): Promise<void> {
  actionInProgress.value = provider.id
  try {
    await connect(provider.id as OAuthProvider)
    await loadConnections()
    toast.add({
      severity: 'success',
      summary: t('settings.connections.connect-success', { provider: provider.label }),
      life: 3500
    })
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    if (message === 'cancelled') return

    if (message.toLowerCase().includes('popup') || message.toLowerCase().includes('blocked')) {
      toast.add({
        severity: 'error',
        summary: t('settings.connections.popup-blocked'),
        life: 5000
      })
      return
    }

    toast.add({
      severity: 'error',
      summary: t('settings.connections.connect-error', {
        provider: provider.label,
        error: message
      }),
      life: 5000
    })
  } finally {
    actionInProgress.value = null
  }
}

async function initiateDisconnect(provider: ProviderRow): Promise<void> {
  if (!provider.connection) return

  actionInProgress.value = provider.id
  try {
    const result = await canDisconnect(provider.id as OAuthProvider)

    if (!result.canDisconnect) {
      blockedPublicationCount.value = result.publicationCount
      pendingConnection.value = provider.connection
      cannotDisconnectVisible.value = true
      return
    }

    pendingConnection.value = provider.connection
    confirmDisconnectVisible.value = true
  } catch {
    toast.add({
      severity: 'error',
      summary: t('settings.connections.disconnect-error', { provider: provider.label }),
      life: 4000
    })
  } finally {
    actionInProgress.value = null
  }
}

async function executeDisconnect(): Promise<void> {
  if (!pendingConnection.value) return

  const conn = pendingConnection.value
  const providerLabel = t(`settings.connections.providers.${conn.provider}`)
  actionInProgress.value = conn.provider
  confirmDisconnectVisible.value = false

  try {
    await disconnectProvider(conn.id)
    await loadConnections()
    toast.add({
      severity: 'success',
      summary: t('settings.connections.disconnect-success', { provider: providerLabel }),
      life: 3500
    })
  } catch {
    toast.add({
      severity: 'error',
      summary: t('settings.connections.disconnect-error', { provider: providerLabel }),
      life: 4000
    })
  } finally {
    actionInProgress.value = null
    pendingConnection.value = null
  }
}

onMounted(() => {
  loadConnections()
})
</script>

<style scoped></style>
