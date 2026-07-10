<template>
  <fieldset class="lsg-card">
    <section id="name">
      <header class="flex items-center justify-center gap-1">
        <label for="pub-name">{{ t('publish.form-name') }}*</label>
        <AppValidationIcon
          v-if="validationTry"
          :success="v$.step1.pubName?.$errors?.length === 0"
        />
        <AppErrorList :errors="v$.step1.pubName?.$errors" />
      </header>
      <InputText
        type="text"
        id="pub-name"
        name="pub-name"
        minlength="5"
        maxlength="60"
        fluid
        :class="validationTry && !v$.step1.pubName?.$error ? '!border-[var(--success-color)]' : ''"
        v-model.trim="details.pubName"
        :placeholder="t('publish.form-name-ph')"
        :invalid="v$.step1.pubName?.$errors?.length > 0"
      />
      <CharCount :current="details.pubName.length" :max="60" :min="5" />
    </section>
    <section id="pub-type">
      <header class="flex flex-row items-center justify-center gap-1">
        <label for="type">{{ t('publish.form-type') }}*</label>
        <AppValidationIcon
          v-if="validationTry"
          :success="v$.step1.pubType?.$errors?.length === 0"
        />
        <AppErrorList :errors="v$.step1.pubType?.$errors" />
      </header>
      <div
        v-for="appType in APP_TYPES"
        :key="appType.name"
        class="inline-flex items-center gap-2 pt-1 pl-4"
      >
        <input
          type="radio"
          :id="appType.label"
          :value="appType.name"
          v-model.lazy.trim="details.pubType"
        />
        <label class="cursor-pointer text-[var(--text-color)]" :for="appType.label">{{
          t(`publish.form-type-${appType.label}`)
        }}</label>
      </div>
    </section>
    <section id="description">
      <header class="flex flex-row items-center justify-center gap-1">
        <label for="pub-desc">{{ t('publish.form-desc') }}*</label>
        <AppValidationIcon
          v-if="validationTry"
          :success="v$.step1.pubDesc?.$errors?.length === 0"
        />
        <AppErrorList :errors="v$.step1.pubDesc?.$errors" />
      </header>
      <Textarea
        id="pub-desc"
        name="pub-desc"
        type="text"
        rows="4"
        minlength="10"
        maxlength="250"
        :class="validationTry && !v$.step1.pubDesc?.$error ? '!border-[var(--success-color)]' : ''"
        v-model.trim="details.pubDesc"
        :placeholder="t('publish.form-desc-ph')"
        :invalid="v$.step1.pubDesc?.$errors.length > 0"
      />
      <CharCount :current="details.pubDesc.length" :max="250" :min="10" />
    </section>
    <section id="image" class="form__group">
      <header class="flex flex-row items-center justify-center gap-1">
        <label for="img-url">{{ t('publish.form-image') }}</label>
        <AppValidationIcon v-if="validationTry" :success="v$.step1.imgUrl?.$errors?.length === 0" />
        <AppErrorList :errors="v$.step1.imgUrl?.$errors" />
      </header>
      <section
        class="w-full !items-center !gap-6 overflow-auto rounded-md bg-[var(--background-secondary-color)] p-6"
      >
        <div
          class="flex min-h-[160px] w-fit min-w-[min(400px,100%)] flex-col items-center justify-center gap-2 rounded-md border-[3px] border-dotted border-[var(--publish-image-color)] px-2 py-4"
        >
          <template v-if="images.length === 0">
            <font-awesome-icon
              :icon="['far', 'image']"
              style="font-size: 70px; color: var(--publish-image-color)"
            />
          </template>
          <Button
            v-if="images.length < maxImages"
            @click="showImagesPopup = true"
            :label="t('publish.form-add-image')"
            size="small"
            variant="outlined"
          />
          <ImagesCarousel v-if="images.length > 0" v-model="images" class="bg-[rgba(0, 0, 0)]" />
        </div>
        <div v-if="images.length === 0" class="inline-flex items-center gap-2">
          <font-awesome-icon :icon="['fas', 'info-circle']" />
          <span class="text-[var(--text-color)]">
            {{ t('publish.form-image-text') }}
          </span>
        </div>
      </section>

      <ImagesPopUp
        v-if="showImagesPopup"
        v-model="showImagesPopup"
        :images="images"
        width="800px"
        height="400px"
        @add-image="(url) => images.push(url)"
      />
    </section>
  </fieldset>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import ImagesPopUp from '@/components/publish/ImagesPopUp.vue'
import { useI18n } from 'vue-i18n'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import AppErrorList from '@/components/common/AppErrorList.vue'
import AppValidationIcon from '@/components/common/AppValidationIcon.vue'
import CharCount from '@/components/common/CharCount.vue'
import Textarea from 'primevue/textarea'
import ImagesCarousel from './ImagesCarousel.vue'
import { APP_TYPES } from '@/catalogs/appTypes'
import type { DetailsSection } from '@/types/publish/detailsSection'

const { t } = useI18n()

const showImagesPopup = ref(false)
const maxImages = 15

const details = defineModel<DetailsSection>('details', { required: true })
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const v$ = defineModel<any>('v$', { required: true })
const validationTry = defineModel<boolean>('validationTry', { required: true })
const images = defineModel<string[]>('images', { required: true })
</script>
<style scoped></style>
