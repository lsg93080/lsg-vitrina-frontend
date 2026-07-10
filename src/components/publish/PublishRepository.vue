<template>
  <fieldset class="lsg-card">
    <section class="flex-col [&>div]:flex [&>div]:items-center [&>div]:gap-2">
      <header class="flex items-center justify-center gap-1">
        <label for="repo-site">{{ t('publish.form-repo-provider') + '*' }}</label>
        <AppValidationIcon
          v-if="validationTry"
          :success="v$.step2.provider?.$errors?.length === 0"
        />
        <AppErrorList :errors="v$.step2.provider?.$errors" />
      </header>

      <div class="text-[var(--text-color)]">
        <RadioButton
          inputId="provider-github"
          value="github"
          v-model="repositorySection.provider"
        />
        <label for="provider-github" class="flex cursor-pointer items-center gap-1">
          <font-awesome-icon :icon="['fab', 'github']" />
          GitHub
        </label>
      </div>

      <div class="text-[var(--text-color)]">
        <RadioButton
          inputId="provider-gitlab"
          value="gitlab"
          v-model="repositorySection.provider"
        />
        <label for="provider-gitlab" class="flex cursor-pointer items-center gap-1">
          <font-awesome-icon :icon="['fab', 'gitlab']" />
          GitLab
        </label>
      </div>
    </section>

    <template v-if="repositorySection.provider">
      <section
        v-if="!isConnected(repositorySection.provider as OAuthProvider)"
        class="flex w-full flex-col items-center! gap-3 rounded-lg bg-[var(--background-secondary-color)] p-6"
      >
        <p class="text-center text-sm text-[var(--text-muted-color)]">
          {{
            t('vcs.connect-to-continue', {
              provider: providerLabel(repositorySection.provider as OAuthProvider)
            })
          }}
        </p>
        <Button
          :label="
            t('vcs.connect-account', {
              provider: providerLabel(repositorySection.provider as OAuthProvider)
            })
          "
          :loading="isConnecting"
          :disabled="isConnecting"
          @click="connectProvider(repositorySection.provider as OAuthProvider)"
        >
          <template #icon>
            <font-awesome-icon
              :icon="['fab', repositorySection.provider === 'gitlab' ? 'gitlab' : 'github']"
            />
          </template>
        </Button>
      </section>

      <template v-else>
        <section id="repository" class="!flex-row items-center justify-between">
          <div id="github-repositories" class="flex w-full flex-col items-start">
            <header class="flex items-center gap-1">
              <label for="repo-select">{{ t('publish.form-select-url') }}*</label>
              <AppValidationIcon
                v-if="validationTry"
                :success="v$.step2.selectedRepo?.$errors?.length === 0"
              />
              <AppErrorList :errors="v$.step2.selectedRepo?.name.$errors" />
            </header>

            <div v-if="loadingRepos" class="flex items-center gap-2 py-2">
              <ProgressSpinner style="width: 20px; height: 20px" strokeWidth="4" />
              <span class="text-sm text-[var(--text-muted-color)]">{{
                t('vcs.loading-repos')
              }}</span>
            </div>

            <Select
              v-else
              id="repo-select"
              name="repo-select"
              v-model="selectedRepo"
              :options="repos"
              option-label="nameWithNamespace"
              :placeholder="t('publish.form-select-url-ph')"
              filter
              auto-filter-focus
              reset-filter-on-hide
              :empty-filter-message="t('publish.form-no-repos-found')"
              showClear
              class="w-full"
              @change="onRepoSelected"
            />
          </div>
        </section>

        <section
          v-if="
            selectedRepo &&
            selectedRepoMetadata &&
            (loadingMetadata ||
              selectedRepoMetadata.description ||
              selectedRepoMetadata.topics.length)
          "
          class="flex flex-col gap-2 rounded-lg bg-[var(--background-secondary-color)] p-4"
        >
          <div v-if="loadingMetadata" class="flex items-center gap-2">
            <ProgressSpinner style="width: 16px; height: 16px" strokeWidth="4" />
            <span class="text-sm text-[var(--text-muted-color)]">{{ t('vcs.loading-repos') }}</span>
          </div>
          <template v-else>
            <p
              v-if="selectedRepoMetadata.description"
              class="text-sm text-[var(--text-muted-color)]"
            >
              {{ selectedRepoMetadata.description }}
            </p>
            <div v-if="selectedRepoMetadata.topics.length" class="flex flex-wrap gap-1">
              <Tag
                v-for="topic in selectedRepoMetadata.topics"
                :key="topic"
                :value="topic"
                severity="secondary"
              />
            </div>
          </template>
        </section>

        <section id="documentation" class="flex-col">
          <header class="flex items-center justify-center gap-1">
            <font-awesome-icon
              :icon="['fas', 'exclamation-circle']"
              class="fa-1x"
              :class="{ errorcolor: repositorySection.pubDoc }"
              :style="{
                color: !isREADMEChecked
                  ? 'var(--text-color)'
                  : repositorySection.pubDoc
                    ? 'var(--success-color)'
                    : 'var(--primary-color)'
              }"
            />
            <label for="repo-details">{{ t('publish.form-doc') + '*' }}</label>
            <AppValidationIcon
              v-if="validationTry"
              :success="v$.step2.pubDoc?.$errors?.length === 0"
            />
          </header>
          <AppErrorList :errors="v$.step2.pubDoc?.$errors" />
          <div class="flex w-full flex-wrap items-center justify-between gap-2 pb-2">
            <p class="text-[var(--text-color)]">
              {{ t('publish.form-doc-text') }}
            </p>
            <Button
              type="button"
              size="small"
              :label="showDocPreview ? t('publish.form-doc-edit') : t('publish.form-doc-preview')"
              @click="showDocPreview = !showDocPreview"
            >
              <template #icon>
                <font-awesome-icon :icon="showDocPreview ? 'pen-to-square' : 'eye'" />
              </template>
            </Button>
          </div>
          <Textarea
            v-if="!showDocPreview"
            class="form__textarea"
            style="resize: none"
            name="repo-details"
            id="repo-details"
            rows="10"
            v-model="repositorySection.pubDoc"
            :class="
              validationTry && !v$.step2.pubDoc?.$error ? '!border-[var(--success-color)]' : ''
            "
            :placeholder="t('publish.form-doc-ph')"
          />
          <MarkdownPreview
            v-else
            :source="repositorySection.pubDoc"
            container-class="min-h-[250px] max-h-[800px] w-full overflow-y-auto rounded-lg border border-[var(--border-color-subtle)] bg-[var(--background-color)] p-4"
          />
        </section>
      </template>
    </template>
  </fieldset>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import RadioButton from 'primevue/radiobutton'
import Select from 'primevue/select'
import Button from 'primevue/button'
import Tag from 'primevue/tag'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'
import AppErrorList from '@/components/common/AppErrorList.vue'
import MarkdownPreview from '@/components/common/MarkdownPreview.vue'
import AppValidationIcon from '@/components/common/AppValidationIcon.vue'
import { useAppStore } from '@/composables/useAppStore'
import {
  getGitLabRepos,
  getRepoMetadata,
  getGitHubRepos,
  getGitHubRepoMetadata
} from '@/api/vcsService'
import { useToast } from 'primevue/usetoast'
import { useOAuthPopup } from '@/composables/useOAuthPopup'
import { useVcsCache } from '@/composables/useVcsCache'
import type { OAuthConnection, OAuthProvider, VcsRepo, VcsRepoMetadata } from '@/types/models/oauth'
import type { RepositorySection } from '@/types/publish/repositorySection'

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()

const repositorySection = defineModel({
  type: Object as () => RepositorySection,
  required: true
})

const v$ = defineModel('v$', {
  type: Object,
  required: true
})

const validationTry = defineModel('validationTry', {
  type: Boolean,
  required: true
})

const { isConnecting, error: oauthError, connect } = useOAuthPopup()
const cache = useVcsCache()

const connections = computed<OAuthConnection[]>(() => store.state.oauthConnections)
const loadingRepos = ref(false)
const loadingMetadata = ref(false)

const repos = ref<VcsRepo[]>([])
const selectedRepo = ref<VcsRepo | null>(null)
const selectedRepoMetadata = ref<VcsRepoMetadata | null>(null)

const isREADMEChecked = ref(false)
const showDocPreview = ref(false)

// Surfaced connect errors (e.g. popup blocked).
const connectError = ref<string | null>(null)

function providerLabel(provider: OAuthProvider): string {
  return provider === 'gitlab' ? 'GitLab' : 'GitHub'
}

function isConnected(provider: OAuthProvider): boolean {
  return connections.value.some((c) => c.provider === provider)
}

async function loadRepos(provider: OAuthProvider): Promise<void> {
  const cached = cache.getRepoList(provider)
  if (cached) {
    repos.value = cached
    return
  }

  loadingRepos.value = true
  try {
    const fetched = provider === 'github' ? await getGitHubRepos() : await getGitLabRepos()
    cache.setRepoList(provider, fetched)
    repos.value = fetched
  } catch (err: unknown) {
    repos.value = []
    const status = (err as { response?: { status?: number } })?.response?.status
    // 409 means the stored OAuth token is dead and was removed upstream: the
    // user must reconnect. Refresh connections (which now drops this provider,
    // surfacing the connect button) and tell them why.
    if (status === 409) {
      cache.invalidateProvider(provider)
      await store.dispatch('loadOAuthConnections')
      toast.add({
        severity: 'warn',
        summary: t('vcs.reconnect-required-title'),
        detail: t('vcs.reconnect-required-detail', { provider: providerLabel(provider) }),
        life: 6000
      })
    } else if (status === 404) {
      // 404 means the OAuth token doesn't exist. Refresh connections to reflect disconnected state
      await store.dispatch('loadOAuthConnections')
    }
  } finally {
    loadingRepos.value = false
  }
}

async function loadMetadata(
  repoId: number,
  provider: OAuthProvider
): Promise<VcsRepoMetadata | null> {
  const cached = cache.getMetadata(repoId)
  if (cached) return cached

  loadingMetadata.value = true
  try {
    const meta =
      provider === 'github' ? await getGitHubRepoMetadata(repoId) : await getRepoMetadata(repoId)
    cache.setMetadata(repoId, meta)
    return meta
  } catch (err: unknown) {
    // 409 here too means the token died mid-flow: prompt a reconnect.
    if ((err as { response?: { status?: number } })?.response?.status === 409) {
      cache.invalidateProvider(provider)
      await store.dispatch('loadOAuthConnections')
      toast.add({
        severity: 'warn',
        summary: t('vcs.reconnect-required-title'),
        detail: t('vcs.reconnect-required-detail', { provider: providerLabel(provider) }),
        life: 6000
      })
    }
    return null
  } finally {
    loadingMetadata.value = false
  }
}

async function connectProvider(provider: OAuthProvider): Promise<void> {
  connectError.value = null
  try {
    await connect(provider)
    cache.invalidateProvider(provider)
    await store.dispatch('loadOAuthConnections')
    if (isConnected(provider)) {
      await loadRepos(provider)
      toast.add({
        severity: 'success',
        summary: t('settings.connections.connect-success', { provider: providerLabel(provider) }),
        life: 3000
      })
    }
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err)
    if (msg === 'cancelled') return // silent: user closed popup voluntarily
    connectError.value = oauthError.value ?? msg
    toast.add({
      severity: 'error',
      summary: t('settings.connections.connect-error', {
        provider: providerLabel(provider),
        error: connectError.value
      }),
      life: 4000
    })
  }
}

async function onRepoSelected(): Promise<void> {
  if (!selectedRepo.value) {
    // Cleared selection
    selectedRepoMetadata.value = null
    isREADMEChecked.value = false
    repositorySection.value.selectedRepo = null
    repositorySection.value.repoURL = ''
    repositorySection.value.pubDoc = ''
    return
  }

  const repo = selectedRepo.value
  const provider = repositorySection.value.provider as OAuthProvider

  // Update repositorySection immediately so parent validation works
  repositorySection.value.selectedRepo = {
    id: repo.id,
    name: repo.name,
    html_url: repo.webUrl,
    url: repo.webUrl,
    releases_url: '',
    default_branch: repo.defaultBranch
  }
  repositorySection.value.repoURL = repo.webUrl
  repositorySection.value.releases = []

  // Load metadata (cache-aware)
  const meta = await loadMetadata(repo.id, provider)
  if (!meta) return

  selectedRepoMetadata.value = meta
  isREADMEChecked.value = true

  // Auto-fill documentation from README
  repositorySection.value.pubDoc = meta.readme ?? ''
}

// When a new connection appears in the store, auto-load repos if that provider is selected.
watch(connections, async (newConns) => {
  const p = repositorySection.value.provider as OAuthProvider | undefined
  if (!p) return
  const justConnected = newConns.some((c) => c.provider === p)
  if (justConnected && repos.value.length === 0 && !loadingRepos.value) {
    await loadRepos(p)
  }
})

// When provider radio changes, reload repo list (from cache or API).
watch(
  () => repositorySection.value.provider,
  async (newProvider) => {
    if (!newProvider) return
    // Reset repo/metadata selection when switching providers
    selectedRepo.value = null
    selectedRepoMetadata.value = null
    repos.value = []
    isREADMEChecked.value = false

    if (isConnected(newProvider as OAuthProvider)) {
      await loadRepos(newProvider as OAuthProvider)
    }
  }
)

onMounted(async () => {
  // Refresh connections from the server in case they changed since the store was last populated
  await store.dispatch('loadOAuthConnections')

  // If a provider was already selected (e.g. navigating back in the stepper)
  // and the user is connected, preload the repo list
  if (repositorySection.value.provider) {
    const p = repositorySection.value.provider as OAuthProvider
    if (isConnected(p)) {
      await loadRepos(p)
    }
  }
})
</script>

<style scoped></style>
