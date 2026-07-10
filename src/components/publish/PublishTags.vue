<template>
  <fieldset class="lsg-card">
    <section>
      <div class="flex flex-row items-center justify-center gap-1">
        <label for="ESRB">{{ t('publish.form-esrb') }}* </label>
        <AppValidationIcon
          v-if="validationTry"
          :success="v$.step3.selectedESRB?.$errors?.length === 0"
        />
        <AppErrorList :errors="v$.step3.selectedESRB?.$errors" />
      </div>
      <Select
        class="w-full max-w-[600px] min-w-[250px] text-start"
        v-model="tagsSection.selectedESRB"
        :options="ESRB_RATINGS"
        :option-label="'name'"
        :placeholder="t('publish.form-esrb-ph')"
        :invalid="v$.step3.selectedESRB.$error"
      >
        <template #option="slotProps">
          <div class="flex items-center gap-2">
            <img
              v-if="slotProps.option.imageURL"
              :src="slotProps.option.imageURL"
              alt=""
              class="h-6 w-6"
            />
            <span>{{ slotProps.option.name }}</span>
          </div>
        </template>
        <template #value="slotProps">
          <div v-if="slotProps.value" class="flex items-center gap-2">
            <img
              v-if="slotProps.value.imageURL"
              :src="slotProps.value.imageURL"
              alt=""
              class="h-6 w-6"
            />
            <span>{{ slotProps.value.name }}</span>
          </div>
        </template>
      </Select>
      <div
        v-if="tagsSection.selectedESRB.imageURL"
        class="mt-3 grid grid-cols-[auto_1fr] grid-rows-[auto_auto] items-center justify-items-stretch gap-x-2 text-start text-[var(--text-color)]"
      >
        <img
          class="col-span-1 col-start-1 row-span-2 row-start-1 max-h-[100px]"
          :src="tagsSection.selectedESRB.imageURL || ''"
          alt=""
        />
        <h2>{{ tagsSection.selectedESRB.name }}</h2>
        <span class="row-span-1">{{
          t('esrb.' + tagsSection.selectedESRB.label + '-description')
        }}</span>
      </div>
    </section>
    <section>
      <div class="flex flex-row items-center justify-center gap-1">
        <label for="platforms">{{ t('publish.form-platforms') }}*</label>
        <AppValidationIcon
          v-if="validationTry"
          :success="v$.step3.selectedPlatforms?.$errors?.length === 0"
        />
        <AppErrorList :errors="v$.step3.selectedPlatforms.$errors" />
      </div>
      <div
        class="inline-flex gap-2 px-4 pt-1 accent-[var(--primary-color)]"
        v-for="platform in PLATFORMS"
        :key="platform.id"
      >
        <Checkbox
          v-model="tagsSection.selectedPlatforms"
          :inputId="platform.name"
          :value="platform"
        />
        <font-awesome-icon class="w-5 self-center" :icon="platform.icon" />
        <label :for="platform.name">{{ platform.name }}</label>
      </div>
    </section>
    <section id="tags-section">
      <label for="tags">{{ t('publish.form-tags') }}</label>
      <InputText
        id="tags"
        name="tags"
        v-model="tagText"
        @change.prevent="addTag"
        minlength="3"
        maxlength="15"
        :placeholder="t('publish.form-tags-ph')"
      />
      <CharCount :current="tagText.length" :max="15" :min="3" />
      <div v-if="tagsSection.tags" id="badges" class="inline-flex flex-wrap gap-2 pt-2">
        <Chip
          v-for="tag in tagsSection.tags"
          class="leading-4"
          :key="tag.id"
          :label="tag.name"
          @remove="deleteTag(tag.id)"
          removable
        />
      </div>
    </section>
  </fieldset>
</template>
<script setup lang="ts">
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import Select from 'primevue/select'
import InputText from 'primevue/inputtext'
import Chip from 'primevue/chip'
import AppErrorList from '@/components/common/AppErrorList.vue'
import AppValidationIcon from '@/components/common/AppValidationIcon.vue'
import CharCount from '@/components/common/CharCount.vue'
import Checkbox from 'primevue/checkbox'
import type { TagsSection } from '@/types/publish/tagsSection'
import { ESRB_RATINGS } from '@/catalogs/esrbRatings'
import { PLATFORMS } from '@/catalogs/platforms'

const { t } = useI18n()

const tagsSection = defineModel('tagsSection', {
  type: Object as () => TagsSection,
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
const tagText = ref('')

const addTag = () => {
  if (tagText.value.length < 3 || tagText.value.length > 15) {
    return
  }
  tagsSection.value.tags.push({
    id: tagsSection.value.tags.length,
    name: tagText.value
  })
  tagText.value = ''
}

const deleteTag = (id: number) => {
  tagsSection.value.tags = tagsSection.value.tags.filter((tag) => tag.id !== id)
}
</script>
<style scoped></style>
