<template>
  <section class="flex w-full flex-col gap-6 text-[var(--text-color)]">
    <h1 class="text-xl font-bold capitalize">{{ t('settings.profile.title') }}</h1>

    <!-- Avatar + username row -->
    <div class="flex flex-col gap-4">
      <h2 class="text-sm font-semibold tracking-wider text-[var(--text-color-light)] uppercase">
        {{ t('settings.profile.identity') }}
      </h2>

      <!-- Avatar preview + URL input -->
      <div class="flex items-center gap-4">
        <div class="shrink-0">
          <img
            :src="previewSrc"
            class="h-14 w-14 rounded-full object-cover ring-2 ring-[var(--primary-color)]/50"
            alt=""
            @error="onPreviewError"
          />
        </div>
        <div class="flex-1">
          <label class="mb-1 block text-left text-xs text-[var(--text-color-light)]">
            {{ t('settings.profile.avatar-url') }}
          </label>
          <InputText
            v-model="form.imgUrl"
            :placeholder="t('settings.profile.avatar-placeholder')"
            class="w-full text-sm"
          />
        </div>
      </div>

      <div>
        <label class="mb-1 block text-left text-xs text-[var(--text-color-light)]">
          {{ t('settings.profile.username') }}
        </label>
        <InputText
          v-model="form.username"
          :placeholder="t('settings.profile.username-placeholder')"
          class="w-full text-sm"
        />
      </div>

      <div>
        <label class="mb-1 block text-left text-xs text-[var(--text-color-light)]">
          {{ t('settings.profile.bio') }}
        </label>
        <Textarea
          v-model="form.bio"
          :placeholder="t('settings.profile.bio-placeholder')"
          :maxlength="60"
          rows="2"
          class="w-full resize-none text-sm"
          auto-resize
        />
        <CharCount :current="form.bio.length" :max="60" />
      </div>
    </div>

    <div class="flex flex-col gap-3">
      <h2 class="text-sm font-semibold tracking-wider text-[var(--text-color-light)] uppercase">
        {{ t('settings.profile.socials') }}
      </h2>

      <!-- Group: Gaming -->
      <p class="text-xs text-[var(--text-color-light)]/70">
        {{ t('settings.profile.group-gaming') }}
      </p>
      <div class="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        <SocialField
          v-for="s in GAMING_SOCIALS"
          :key="s.key"
          :social="s"
          :model-value="form.socials[s.key]"
          @update:model-value="form.socials[s.key] = $event"
        />
      </div>

      <!-- Group: Dev / Open Source -->
      <p class="mt-2 text-xs text-[var(--text-color-light)]/70">
        {{ t('settings.profile.group-dev') }}
      </p>
      <div class="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        <SocialField
          v-for="s in DEV_SOCIALS"
          :key="s.key"
          :social="s"
          :model-value="form.socials[s.key]"
          @update:model-value="form.socials[s.key] = $event"
        />
      </div>

      <!-- Group: General -->
      <p class="mt-2 text-xs text-[var(--text-color-light)]/70">
        {{ t('settings.profile.group-general') }}
      </p>
      <div class="grid grid-cols-1 gap-x-8 gap-y-2 sm:grid-cols-2">
        <SocialField
          v-for="s in GENERAL_SOCIALS"
          :key="s.key"
          :social="s"
          :model-value="form.socials[s.key]"
          @update:model-value="form.socials[s.key] = $event"
        />
      </div>
    </div>

    <div class="flex items-center gap-3 pt-2">
      <Button
        :label="t('settings.profile.save')"
        :loading="saving"
        class="w-full sm:w-auto"
        @click="handleSave"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, reactive, toRef } from 'vue'
import { useAvatar } from '@/composables/useAvatar'
import { useI18n } from 'vue-i18n'
import InputText from 'primevue/inputtext'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import { useAppStore } from '@/composables/useAppStore'
import { getContributorByUserId, updateContributorContrInfo } from '@/api/contributors'
import { useToast } from 'primevue/usetoast'
import type { SocialPlatform } from '@/types/models/contributor'
import SocialField from '@/components/settings/SocialField.vue'
import CharCount from '@/components/common/CharCount.vue'

interface SocialDef {
  key: SocialPlatform
  label: string
  icon: [string, string]
  placeholder: string
}

const GAMING_SOCIALS: SocialDef[] = [
  { key: 'discord', label: 'Discord', icon: ['fab', 'discord'], placeholder: 'Username' },
  {
    key: 'steam',
    label: 'Steam',
    icon: ['fab', 'steam'],
    placeholder: 'https://steamcommunity.com/id/username'
  }
]

const DEV_SOCIALS: SocialDef[] = [
  { key: 'github', label: 'GitHub', icon: ['fab', 'github'], placeholder: 'username' },
  { key: 'gitlab', label: 'GitLab', icon: ['fab', 'gitlab'], placeholder: 'username' }
]

const GENERAL_SOCIALS: SocialDef[] = [
  {
    key: 'twitter',
    label: 'X / Twitter',
    icon: ['fab', 'x-twitter'],
    placeholder: 'username (without @)'
  },
  {
    key: 'linkedin',
    label: 'LinkedIn',
    icon: ['fab', 'linkedin'],
    placeholder: 'https://linkedin.com/in/username'
  },
  {
    key: 'youtube',
    label: 'YouTube',
    icon: ['fab', 'youtube'],
    placeholder: 'https://youtube.com/@channel'
  },
  { key: 'reddit', label: 'Reddit', icon: ['fab', 'reddit'], placeholder: 'username (without u/)' },
  { key: 'website', label: 'Website', icon: ['fas', 'globe'], placeholder: 'https://yoursite.com' }
]

const { t } = useI18n()
const store = useAppStore()
const toast = useToast()

const saving = ref(false)

const form = reactive<{
  username: string
  imgUrl: string
  bio: string
  socials: Partial<Record<SocialPlatform, string>>
}>({
  username: '',
  imgUrl: '',
  bio: '',
  socials: {}
})

// useAvatar watches form.imgUrl reactively and resets error state when URL changes
const { avatarSrc: previewSrc, onAvatarError: onPreviewError } = useAvatar(() => form.imgUrl)

const initials = computed(() => {
  const name = form.username || store.state.appUserCredentials.displayName || ''
  return name.slice(0, 2).toUpperCase()
})

onMounted(async () => {
  // platformUserId is the Auth Service user ID stored in contributors.userId
  const userId = store.state.platformUserId
  if (!userId) return
  try {
    const res = await getContributorByUserId(userId)
    // Response shape: { contrInfo: { username, imgUrl, bio, socials, ... }, ... }
    const c = res.data.contrInfo
    form.username = c.username ?? ''
    form.imgUrl = c.imgUrl ?? ''
    form.bio = c.bio ?? ''
    // Only copy non-empty social values
    const loaded: Partial<Record<SocialPlatform, string>> = {}
    for (const [k, v] of Object.entries(c.socials ?? {})) {
      if (v) loaded[k as SocialPlatform] = v
    }
    form.socials = loaded
    // previewSrc updates reactively via useAvatar, no manual assignment needed
  } catch {
    // Form stays empty, user can still fill it in manually
  }
})

async function handleSave() {
  saving.value = true
  // platformUserId is the correct userId for the contributors collection
  const userId = store.state.platformUserId
  if (!userId) {
    toast.add({ severity: 'warn', summary: t('settings.profile.save-error'), life: 3000 })
    saving.value = false
    return
  }
  try {
    // Strip empty strings from socials before sending
    const cleanSocials: Partial<Record<SocialPlatform, string>> = {}
    for (const [k, v] of Object.entries(form.socials)) {
      if (v?.trim()) cleanSocials[k as SocialPlatform] = v.trim()
    }
    await updateContributorContrInfo(userId, {
      username: form.username.trim() || undefined,
      imgUrl: form.imgUrl.trim() || undefined,
      bio: form.bio.trim() || undefined,
      socials: cleanSocials
    })
    toast.add({ severity: 'success', summary: t('settings.profile.save-success'), life: 3000 })
  } catch {
    toast.add({ severity: 'error', summary: t('settings.profile.save-error'), life: 4000 })
  } finally {
    saving.value = false
  }
}
</script>
