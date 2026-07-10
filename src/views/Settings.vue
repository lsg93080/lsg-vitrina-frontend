<template>
  <section class="flex w-full flex-col p-8" style="min-height: calc(100dvh - 56px)">
    <restricted v-if="!isUserLogged || !isEmailVerified" />
    <div v-else class="flex flex-1 flex-col gap-6 md:flex-row">
      <aside
        class="lsg-card flex shrink-0 flex-col gap-3 p-3 md:w-[220px] md:items-start md:justify-start md:self-stretch md:p-4"
      >
        <header class="flex w-full gap-2 overflow-hidden">
          <img
            class="h-10 shrink-0 cursor-pointer rounded-full"
            :src="avatar"
            referrerpolicy="no-referrer"
            alt=""
            @error="onAvatarErr"
          />
          <div class="flex min-w-0 flex-col justify-center gap-1">
            <span class="truncate text-left leading-tight font-medium text-[var(--text-color)]">{{
              userName
            }}</span>
            <div v-if="roles.length" class="flex flex-wrap gap-1">
              <Tag
                v-for="role in roles"
                :key="role"
                :value="t(`settings.roles.${role}`)"
                :severity="roleSeverity(role)"
                class="!px-1.5 !py-0 !text-[10px]"
              />
            </div>
          </div>
        </header>
        <div class="flex-1 md:hidden">
          <Select
            v-model="activeTab"
            :options="tabOptions"
            option-label="label"
            option-value="value"
            class="settings-select"
          >
            <template #value>
              <div class="flex items-center gap-2">
                <font-awesome-icon
                  v-if="activeTabOption"
                  :icon="activeTabOption.icon as any"
                  class="nav-icon"
                />
                <span>{{ activeTabOption?.label }}</span>
              </div>
            </template>
            <template #option="{ option }">
              <div class="flex items-center gap-2">
                <font-awesome-icon :icon="option.icon" class="nav-icon" />
                <span>{{ option.label }}</span>
              </div>
            </template>
          </Select>
        </div>
        <nav class="hidden md:mt-4 md:flex md:w-full md:flex-col md:gap-1">
          <button
            class="nav-item"
            :class="{ active: activeTab === 'profile' }"
            @click="activeTab = 'profile'"
          >
            <font-awesome-icon :icon="['fas', 'user-pen']" class="nav-icon" />
            <span class="nav-label">{{ t('settings.profile.title') }}</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: activeTab === 'linked-accounts' }"
            @click="activeTab = 'linked-accounts'"
          >
            <font-awesome-icon icon="share-nodes" class="nav-icon" />
            <span class="nav-label">{{ t('settings.linked-accounts') }}</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: activeTab === 'platforms' }"
            @click="activeTab = 'platforms'"
          >
            <font-awesome-icon icon="laptop" class="nav-icon" />
            <span class="nav-label">{{ t('settings.platforms.title') }}</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: activeTab === 'language' }"
            @click="activeTab = 'language'"
          >
            <font-awesome-icon icon="language" class="nav-icon" />
            <span class="nav-label">{{ t('settings.language.title') }}</span>
          </button>
          <button
            class="nav-item"
            :class="{ active: activeTab === 'reviewer' }"
            @click="activeTab = 'reviewer'"
          >
            <font-awesome-icon :icon="['fas', 'clipboard-check']" class="nav-icon" />
            <span class="nav-label">{{ t('settings.reviewer.title') }}</span>
          </button>
        </nav>
      </aside>

      <div class="lsg-card flex-1 p-4 md:p-6">
        <ProfileEdit v-if="activeTab === 'profile'" />
        <PlatformsSelection v-if="activeTab === 'platforms'" />
        <LinkProvider v-if="activeTab === 'linked-accounts'" />
        <LanguageSelection v-if="activeTab === 'language'" />
        <ReviewerSettings v-if="activeTab === 'reviewer'" />
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useI18n } from 'vue-i18n'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import Tag from 'primevue/tag'
import Select from 'primevue/select'
import Restricted from '@/components/common/Restricted.vue'
import ProfileEdit from '@/components/settings/ProfileEdit.vue'
import PlatformsSelection from '@/components/settings/PlatformsSelection.vue'
import LinkProvider from '@/components/settings/LinkProvider.vue'
import LanguageSelection from '@/components/settings/LanguageSelection.vue'
import ReviewerSettings from '@/components/settings/ReviewerSettings.vue'
import { useAvatar } from '@/composables/useAvatar'
import { useAppStore } from '@/composables/useAppStore'

const { t } = useI18n()
const store = useAppStore()
const auth = getAuth()
const currentUser = ref<User | null>(auth.currentUser)

onMounted(() => {
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
})

const { avatarSrc: avatar, onAvatarError: onAvatarErr } = useAvatar(
  () => currentUser.value?.photoURL
)
const userName = computed(() => currentUser.value?.displayName ?? 'User')
const roles = computed(() => store.state.roles)
const isUserLogged = computed(() => store.state.isLogged)
const isEmailVerified = computed(() => store.state.appUserCredentials?.emailVerified ?? false)

const activeTab = ref('profile')

const tabOptions = computed(() => [
  { value: 'profile', label: t('settings.profile.title'), icon: ['fas', 'user-pen'] },
  { value: 'linked-accounts', label: t('settings.linked-accounts'), icon: 'share-nodes' },
  { value: 'platforms', label: t('settings.platforms.title'), icon: 'laptop' },
  { value: 'language', label: t('settings.language.title'), icon: 'language' },
  { value: 'reviewer', label: t('settings.reviewer.title'), icon: ['fas', 'clipboard-check'] }
])

const activeTabOption = computed(() => tabOptions.value.find((o) => o.value === activeTab.value))

function roleSeverity(role: string): 'danger' | 'warn' | 'info' {
  if (role === 'admin') return 'danger'
  if (role === 'developer') return 'warn'
  return 'info'
}
</script>

<style scoped>
.nav-item {
  display: flex;
  align-items: center;
  gap: 0.625rem;
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: none;
  border-radius: 0.375rem;
  background: none;
  color: var(--text-color);
  font-size: 0.875rem;
  text-align: left;
  cursor: pointer;
  transition: background 0.15s ease;
}

.nav-item:hover {
  background: var(--background-secondary-color);
}

.nav-item.active {
  background: var(--surface-raised);
}

.nav-icon {
  width: 1rem;
  height: 1rem;
  flex-shrink: 0;
}

.nav-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.settings-select {
  width: 100%;
}
</style>
