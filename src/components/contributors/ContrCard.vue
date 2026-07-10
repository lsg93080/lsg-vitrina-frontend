<template>
  <article class="lsg-card contr-card">
    <!-- Avatar + username header -->
    <div class="flex flex-col items-center gap-3 px-5 pt-5 pb-4">
      <div class="avatar-ring relative">
        <img
          :src="avatarSrc"
          :alt="contrDetails.username"
          class="h-16 w-16 rounded-full object-cover"
          referrerpolicy="no-referrer"
          @error="onAvatarError"
        />
      </div>

      <div class="flex flex-col items-center gap-1">
        <p
          class="username-text text-center font-['Audiowide'] text-base font-bold text-[var(--primary-color)]"
        >
          {{ formatUsername(contrDetails.username) }}
        </p>
        <div class="username-underline h-[2px] w-8 rounded-full bg-[var(--primary-color)]" />
      </div>

      <!-- Bio: only if set -->
      <p
        v-if="contrDetails.bio"
        class="text-center text-xs leading-relaxed text-[var(--text-color-light)]"
      >
        {{ contrDetails.bio }}
      </p>
    </div>

    <div class="mx-5 h-px bg-white/10" />

    <div class="flex flex-col divide-y divide-white/10 px-5 py-3">
      <div class="grid grid-cols-[1fr_5rem] items-center gap-x-2 py-2 first:pt-0">
        <span class="text-xs text-[var(--text-color-light)]">{{
          t('contr-card.contributions')
        }}</span>
        <span class="text-center text-sm font-semibold text-[var(--text-color)]">{{
          contrDetails.postsQty
        }}</span>
      </div>

      <div class="grid grid-cols-[1fr_5rem] items-center gap-x-2 py-2">
        <span class="text-xs text-[var(--text-color-light)]">{{ t('contr-card.games') }}</span>
        <span class="text-center text-sm font-semibold text-[var(--text-color)]">{{
          contrDetails.videogamesQty
        }}</span>
      </div>

      <div class="grid grid-cols-[1fr_5rem] items-center gap-x-2 py-2">
        <span class="text-xs text-[var(--text-color-light)]">{{ t('contr-card.extensions') }}</span>
        <span class="text-center text-sm font-semibold text-[var(--text-color)]">{{
          contrDetails.extensionsQty
        }}</span>
      </div>

      <div class="grid grid-cols-[1fr_5rem] items-center gap-x-2 py-2">
        <span class="text-xs text-[var(--text-color-light)]">
          <font-awesome-icon :icon="['fas', 'download']" class="mr-1 text-[0.65rem]" />
          Downloads
        </span>
        <span class="text-center text-sm font-semibold text-[var(--text-color)]">{{
          formattedDownloads
        }}</span>
      </div>

      <div class="grid grid-cols-[1fr_5rem] items-center gap-x-2 py-2">
        <span class="text-xs text-[var(--text-color-light)]">{{ t('contr-card.last-post') }}</span>
        <span class="text-center text-sm font-semibold text-[var(--text-color)]">{{
          formattedLastPost
        }}</span>
      </div>

      <div class="grid grid-cols-[1fr_5rem] items-center gap-x-2 py-2 last:pb-0">
        <span class="text-xs text-[var(--text-color-light)]">{{ t('contr-card.rating') }}</span>
        <div class="flex items-center gap-1.5">
          <template v-if="contrDetails.totalComments > 0">
            <span
              class="text-sm font-bold text-[var(--text-color)]"
              style="text-shadow: 0 0 8px var(--primary-color-40)"
            >
              {{ averageRating }}
            </span>
            <font-awesome-icon
              :icon="['fas', 'star']"
              class="text-xs text-[var(--primary-color)]"
              style="filter: drop-shadow(0 0 4px var(--primary-color-60))"
            />
          </template>
          <span v-else class="text-sm text-[var(--text-color-light)]">
            {{ t('contr-card.not-rated') }}
          </span>
        </div>
      </div>
    </div>

    <!-- Socials: only rendered if at least one social is set -->
    <template v-if="activeSocials.length > 0">
      <div class="mx-5 h-px bg-white/10" />
      <div class="flex flex-wrap items-center justify-center gap-3 px-5 py-3">
        <a
          v-for="s in activeSocials"
          :key="s.key"
          v-tooltip.top="s.label"
          v-bind="s.linkable ? { href: s.href, target: '_blank', rel: 'noopener' } : {}"
          :class="[
            'transition-colors duration-200',
            s.linkable
              ? 'cursor-pointer text-[var(--text-color-light)] hover:text-[var(--text-color)]'
              : 'cursor-default text-[var(--text-color-light)]/40 select-none'
          ]"
          :aria-label="s.label"
        >
          <font-awesome-icon :icon="s.icon" class="text-base" />
        </a>
      </div>
    </template>
  </article>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { formatUsername } from '@/utils/formatUsername'
import { useAvatar } from '@/composables/useAvatar'
import type { ContributorCardDto, SocialPlatform } from '@/types/models/contributor'

const props = defineProps<{
  contrDetails: ContributorCardDto
}>()

const { t } = useI18n()

const { avatarSrc, onAvatarError } = useAvatar(() => props.contrDetails.imgUrl)

interface SocialMeta {
  label: string
  icon: [string, string]
  // How to build an absolute URL from the stored value:
  // 'url' = already a full URL; 'handle' = bare username prefixed with `prefix` (strip leading @); 'discord' = not linkable, opens discord.com.
  resolve: 'url' | 'handle' | 'discord'
  prefix?: string
}

// Map every SocialPlatform to its label, icon, and URL resolution strategy.
// To add a new social: extend SocialPlatform in the type file and add an entry here.
const SOCIAL_META: Record<SocialPlatform, SocialMeta> = {
  // Gaming
  discord: { label: 'Discord', icon: ['fab', 'discord'], resolve: 'discord' },
  steam: { label: 'Steam', icon: ['fab', 'steam'], resolve: 'url' },
  // Dev / Open Source
  github: {
    label: 'GitHub',
    icon: ['fab', 'github'],
    resolve: 'handle',
    prefix: 'https://github.com/'
  },
  gitlab: {
    label: 'GitLab',
    icon: ['fab', 'gitlab'],
    resolve: 'handle',
    prefix: 'https://gitlab.com/'
  },
  // General
  twitter: {
    label: 'X / Twitter',
    icon: ['fab', 'x-twitter'],
    resolve: 'handle',
    prefix: 'https://x.com/'
  },
  linkedin: { label: 'LinkedIn', icon: ['fab', 'linkedin'], resolve: 'url' },
  youtube: { label: 'YouTube', icon: ['fab', 'youtube'], resolve: 'url' },
  reddit: {
    label: 'Reddit',
    icon: ['fab', 'reddit'],
    resolve: 'handle',
    prefix: 'https://www.reddit.com/u/'
  },
  website: { label: 'Website', icon: ['fas', 'globe'], resolve: 'url' }
}

// Build a safe absolute URL from a stored value and its resolution strategy.
// Returns null for non-linkable entries (discord tags).
function resolveUrl(meta: SocialMeta, value: string): string | null {
  const v = value.trim()
  if (!v) return null

  if (meta.resolve === 'discord') return null

  if (meta.resolve === 'handle') {
    const handle = v.startsWith('@') ? v.slice(1) : v
    return (meta.prefix ?? '') + handle
  }

  // 'url' mode ensure protocol prefix
  if (/^https?:\/\//i.test(v)) return v
  return 'https://' + v
}

const activeSocials = computed(() => {
  const socials = props.contrDetails.socials ?? {}
  return (Object.entries(socials) as [SocialPlatform, string][])
    .filter(([, v]) => !!v?.trim())
    .flatMap(([key, value]) => {
      const meta = SOCIAL_META[key]
      if (!meta) return []
      const href = resolveUrl(meta, value)
      // Non linkable socials (discord tag, battlenet) are shown as tooltip icons
      return [{ key, href, label: meta.label, icon: meta.icon, linkable: href !== null }]
    })
})

const averageRating = computed(() => {
  if (props.contrDetails.totalComments === 0) return '--'
  return (props.contrDetails.totalRating / props.contrDetails.totalComments).toFixed(1)
})

const formattedDownloads = computed(() => (props.contrDetails.downloads ?? 0).toLocaleString())

const formattedLastPost = computed(() => {
  if (!props.contrDetails.lastPost) return '--'
  // ISO date: show only YYYY-MM-DD
  return props.contrDetails.lastPost.slice(0, 10)
})
</script>

<style scoped>
.avatar-ring > img,
.avatar-ring > div {
  box-shadow: 0 0 0 2px var(--primary-color-30);
  transition: box-shadow 0.3s ease;
}

.contr-card:hover .avatar-ring > img,
.contr-card:hover .avatar-ring > div {
  box-shadow: 0 0 0 2px var(--primary-color-70);
}

.username-text {
  text-shadow: 0 0 8px var(--primary-color-25);
}

.username-underline {
  box-shadow: 0 0 6px var(--primary-color-40);
}
</style>
