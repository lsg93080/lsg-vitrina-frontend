<template>
  <Stepper :value="currentStep.toString()" :linear="true">
    <StepList class="!px-14">
      <Step value="1">{{ t('publish.form-step-details') }}</Step>
      <Step value="2">{{ t('publish.form-step-repository') }}</Step>
      <Step value="3">{{ t('publish.form-step-tags') }}</Step>
      <Step value="4">{{ t('publish.form-step-send') }}</Step>
    </StepList>
    <StepPanels>
      <form v-cloak @submit.prevent class="form__container" id="pub-form">
        <StepPanel value="1">
          <PublishDetails
            v-model:details="form.step1"
            v-model:images="imagesSelected"
            v-model:v$="v$"
            v-model:validationTry="validationTry"
          />
        </StepPanel>
        <StepPanel value="2">
          <PublishRepository
            v-model:validationTry="validationTry"
            v-model:v$="v$"
            v-model="form.step2"
          />
        </StepPanel>
        <StepPanel value="3">
          <PublishTags
            v-model:tagsSection="form.step3"
            v-model:v$="v$"
            v-model:validationTry="validationTry"
          />
        </StepPanel>
        <StepPanel value="4">
          <PublishSend
            v-model:images="imagesSelected"
            v-model:detailsSection="form.step1"
            v-model:tagsSection="form.step3"
            v-model:repositorySection="form.step2"
          />
        </StepPanel>
      </form>
    </StepPanels>
    <UploadingPopup
      v-model:isUploading="isUploading"
      v-model:isUploaded="isUploaded"
      v-model:errorFounded="errorFounded"
    />
    <nav class="form__navigation" :class="{ '!w-[50%]': currentStep === 4 }">
      <Button
        class="form__button--back"
        @click.prevent="handlePageChange(-1)"
        :label="t('publish.form-button-back')"
        v-if="currentStep > 1"
        type="button"
        variant="link"
      >
        <template #icon>
          <font-awesome-icon icon="chevron-left" />
        </template>
      </Button>
      <Button
        @click.prevent="handlePageChange(1)"
        :label="t('publish.form-button-next')"
        v-if="currentStep < 4"
        type="button"
      />
      <Button
        class="translate-x-1/2"
        :label="t('publish.form-button-submit')"
        v-if="currentStep === 4"
        @click="postPublication"
        type="button"
        form="pub-form"
      />
    </nav>
  </Stepper>
</template>
<script setup lang="ts">
import Stepper from 'primevue/stepper'
import StepList from 'primevue/steplist'
import StepPanels from 'primevue/steppanels'
import Step from 'primevue/step'
import StepPanel from 'primevue/steppanel'
import UploadingPopup from '@/components/publish/UploadingPopup.vue'

import { useAppStore } from '@/composables/useAppStore'
import Button from 'primevue/button'
import PublishDetails from '@/components/publish/PublishDetails.vue'
import PublishTags from '@/components/publish/PublishTags.vue'
import { useI18n } from 'vue-i18n'
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import PublishSend from '@/components/publish/PublishSend.vue'
import PublishRepository from '@/components/publish/PublishRepository.vue'
import { useForm } from '@/composables/form'
import { createPublication } from '@/api/publications'
import { createPublicationDetails } from '@/api/publicationDetails'
import { useToast } from 'primevue/usetoast'

const store = useAppStore()
const router = useRouter()
const toast = useToast()
const currentStep = ref(1)

const { t } = useI18n()

const { form, v$ } = useForm()

const validationTry = ref(false)

const validateCurrentStep = async () => {
  validationTry.value = true
  const stepKey = `step${currentStep.value}` as keyof typeof v$.value
  const isValid = await v$.value[stepKey].$validate()
  return isValid
}

const handlePageChange = async (number: number) => {
  if (number === -1 || (await validateCurrentStep())) {
    validationTry.value = false
    currentStep.value += number
    mutateFormStep(number)
    window.scrollTo(0, 0)
  }
}

const imagesSelected = ref<string[]>([])

const isUploading = ref(false)
const isUploaded = ref(false)
const errorFounded = reactive({ value: false, message: '' })

const mutateFormStep = (payload?: number) => {
  store.commit('mutateFormStep', payload)
}

onMounted(() => {
  mutateFormStep()
})

// Maps frontend catalog labels to backend enum values
const ESRB_MAP: Record<string, string> = {
  everyone: 'everyone',
  everyone10: 'everyone10plus',
  teen: 'teen',
  mature17: 'mature17plus',
  adults18: 'adultsOnly18plus',
  'rating-pending': 'ratingPending'
}

const PLATFORM_MAP: Record<string, string> = {
  'Mac OS': 'macos',
  Windows: 'windows',
  Linux: 'linux',
  Android: 'android'
}

const postPublication = async () => {
  if (form.step2.selectedRepo === null) {
    toast.add({ severity: 'warn', summary: t('publish.alert-no-repo-selected'), life: 4000 })
    return
  }

  isUploading.value = true
  errorFounded.value = false
  errorFounded.message = ''

  const repo = form.step2.selectedRepo
  // repoId must be a string for the NestJS backend
  const repoId = String(repo.id)

  const publicationBody = {
    repoId,
    title: form.step1.pubName,
    shortDescription: form.step1.pubDesc,
    type: form.step1.pubType.toLowerCase(),
    esrbRating: ESRB_MAP[form.step3.selectedESRB?.label ?? ''] ?? 'ratingPending',
    platforms: (form.step3.selectedPlatforms ?? []).map(
      (p: { name: string }) => PLATFORM_MAP[p.name] ?? p.name.toLowerCase()
    ),
    tags: (form.step3.tags ?? []).map((tag: { name: string }) => tag.name).filter(Boolean),
    releaseYear: new Date().getFullYear(),
    ...(form.step2.provider && { vcsProvider: form.step2.provider }),
    ...(imagesSelected.value.length > 0 && { thumbnailUrl: imagesSelected.value[0] })
  }

  const detailsBody = {
    repoId,
    longDescription: form.step2.pubDoc || form.step1.pubDesc,
    repoUrl: repo.html_url,
    license: repo.license?.name ?? '',
    defaultBranch: repo.default_branch ?? 'main',
    repoDoc: form.step2.pubDoc,
    images: imagesSelected.value
  }

  let createdRepoId = repoId

  try {
    const { data } = await createPublication(publicationBody)
    if (data?.repoId) createdRepoId = data.repoId
  } catch (error: unknown) {
    isUploading.value = false
    errorFounded.value = true
    const msg =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Error creating publication'
    errorFounded.message = msg
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
    return
  }

  try {
    await createPublicationDetails(detailsBody)
  } catch (error: unknown) {
    isUploading.value = false
    errorFounded.value = true
    const msg =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ??
      'Error creating publication details'
    errorFounded.message = msg
    toast.add({ severity: 'error', summary: 'Error', detail: msg, life: 5000 })
    return
  }

  // Backend grants developer role on first publication (fire-and-forget)
  if (!store.state.roles.includes('developer')) {
    store.commit('setRoles', [...store.state.roles, 'developer'])
  }

  isUploaded.value = true
  toast.add({ severity: 'success', summary: t('publish.uploading.toast-success'), life: 4000 })
  router.push({ name: 'Details', query: { repoId: createdRepoId } })
}
</script>
<style>
.form__container {
  display: flex;
  height: 100%;
  width: 100%;
  flex-direction: column;
  fieldset {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    row-gap: 2em;
    padding: 20px;
    width: 100%;
    section {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: start;
      gap: 2px;
      label {
        color: var(--text-color);
        font-size: large;
        font-weight: 500;
      }
    }
  }
}

.form__navigation {
  padding: 1.5rem 0;
  display: flex;
  width: 100%;
  flex-direction: row;
  justify-content: end;
  align-items: center;
}

.form__navigation:has(.form__button--back) {
  justify-content: space-between;
}

.uploading__status {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  row-gap: 2rem;
}
</style>
