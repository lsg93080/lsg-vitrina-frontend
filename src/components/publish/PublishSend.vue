<template>
  <fieldset class="lsg-card flex flex-col items-center gap-2 text-[var(--text-color)]">
    <header class="w-full">
      <h2 class="text-start">{{ t('publish.form-preview') }}</h2>
      <Divider />
    </header>
    <section class="w-full">
      <h2 class="text-center">{{ t('publish.form-images') }}</h2>
      <ImagesCarousel class="lsg-card w-full p-4 pb-5" v-model="images" />
    </section>
    <section class="w-full">
      <h2>{{ t('publish.form-details-app-info') }}</h2>
      <table class="lsg-card m-auto w-full border-separate border-spacing-x-4 p-4 text-start">
        <colgroup>
          <col class="whitespace-nowrap" />
          <col class="w-full" />
        </colgroup>
        <tbody
          class="w-full [&>tr>td]:leading-10 [&>tr>td]:nth-[1]:font-bold [&>tr>td]:nth-[1]:whitespace-nowrap [&>tr>td]:nth-[2]:flex [&>tr>td]:nth-[2]:items-center [&>tr>td]:nth-[2]:gap-1"
        >
          <tr>
            <td>
              {{ t('publish.form-details-name') }}
            </td>
            <td>
              {{ detailsSection.pubName || '--' }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-type') }}
            </td>
            <td>
              {{ detailsSection.pubType || '--' }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-desc') }}
            </td>
            <td>
              {{ detailsSection.pubDesc || '--' }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-author') }}
            </td>
            <td>
              {{ store.state.appUserCredentials.displayName || '--' }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-repository-provider') }}
            </td>
            <td class="capitalize">
              {{ repositorySection?.provider || '--' }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-repository') }}
            </td>
            <td>
              {{ repositorySection?.selectedRepo?.name || '--' }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-license') }}
            </td>
            <td>
              {{ repositorySection.selectedRepo?.license?.name || '--' }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-repository-branch') }}
            </td>
            <td>
              {{ repositorySection.selectedRepo?.default_branch || '--' }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-repository-url') }}
            </td>
            <td class="text-ellipsis">
              <a
                v-if="repositorySection.selectedRepo?.html_url"
                target="_blank"
                rel="noopener noreferrer"
                :href="repositorySection.selectedRepo?.html_url"
              >
                {{ repositorySection.selectedRepo?.html_url }}
              </a>
              <span v-else>--</span>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-esrb') }}
            </td>
            <td>
              <img
                v-if="tagsSection.selectedESRB?.imageURL"
                class="max-h-[20px] max-w-[20px]"
                :src="tagsSection.selectedESRB.imageURL"
                alt=""
              />
              {{
                tagsSection.selectedESRB?.label
                  ? t(`publish.form-esrb-${tagsSection.selectedESRB.label.toLowerCase()}`)
                  : '--'
              }}
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-platforms') }}
            </td>
            <td>
              <Chip
                class="!bg-gray-700 leading-[16px]"
                v-for="platform in tagsSection.selectedPlatforms"
                :key="platform.id"
                :label="platform.name"
                ><template #icon><font-awesome-icon :icon="platform.icon" /></template
              ></Chip>
              <span v-if="tagsSection.selectedPlatforms.length === 0">--</span>
            </td>
          </tr>
          <tr>
            <td>
              {{ t('publish.form-details-tags') }}
            </td>
            <td class="flex-wrap">
              <Chip
                class="!bg-gray-700 leading-[16px]"
                v-for="tag in tagsSection.tags"
                :key="tag.id"
                :label="tag.name"
              />
              <span v-if="tagsSection.tags.length === 0">--</span>
            </td>
          </tr>
          <tr>
            <td>{{ t('publish.form-details-releases') }}</td>
            <td class="has-[ul]:!leading-5">
              <ul v-if="repositorySection.releases?.length > 0">
                <li
                  v-for="release in repositorySection.releases.slice(-5).reverse()"
                  :key="release.id"
                >
                  {{ release.name }}
                </li>
                <li v-if="repositorySection.releases.length > 5">
                  +{{ repositorySection.releases.length - 5 }}
                  {{ repositorySection.releases.length > 6 ? 'releases' : 'release' }}
                </li>
              </ul>
              <span v-else>--</span>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
    <section class="w-full">
      <h2>
        {{ t('publish.form-details-doc') }}
      </h2>
      <MarkdownPreview
        v-if="repositorySection.pubDoc"
        :source="repositorySection.pubDoc"
        container-class="max-h-[800px] w-full overflow-y-auto"
      />
      <p v-else>--</p>
    </section>
  </fieldset>
</template>
<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useAppStore } from '@/composables/useAppStore'
import Chip from 'primevue/chip'
import Divider from 'primevue/divider'
import ImagesCarousel from '@/components/publish/ImagesCarousel.vue'
import MarkdownPreview from '@/components/common/MarkdownPreview.vue'
import type { DetailsSection } from '@/types/publish/detailsSection'
import type { RepositorySection } from '@/types/publish/repositorySection'
import type { TagsSection } from '@/types/publish/tagsSection'

const { t } = useI18n()
const store = useAppStore()

const images = defineModel<string[]>('images', { required: true })
const detailsSection = defineModel<DetailsSection>('detailsSection', { required: true })
const repositorySection = defineModel<RepositorySection>('repositorySection', { required: true })
const tagsSection = defineModel<TagsSection>('tagsSection', { required: true })
</script>
<style scoped></style>
