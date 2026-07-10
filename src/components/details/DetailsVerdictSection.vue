<template>
  <DetailsSectionCard :title="t('verdict.section-title')">
    <Message class="mb-5" severity="info">
      <template #icon>
        <font-awesome-icon :icon="['fas', 'info-circle']" />
      </template>
      <span class="text-md">{{ t('verdict.instructions') }}</span>
    </Message>

    <div v-if="repoUrl" class="mb-5">
      <a :href="repoUrl" target="_blank" rel="noopener noreferrer">
        <Button :label="t('verdict.inspect-code')">
          <template #icon>
            <font-awesome-icon :icon="['fas', 'code']" class="mr-2" />
          </template>
        </Button>
      </a>
    </div>

    <div class="lsg-card p-5">
      <div class="mb-5">
        <label class="mb-2 block text-left text-sm font-medium text-[var(--text-color-light)]">
          {{ t('verdict.does-it-compile') }}
        </label>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <RadioButton v-model="form.compiles" :value="true" input-id="compiles-yes" />
            <label for="compiles-yes" class="cursor-pointer text-sm text-[var(--text-color)]">
              {{ t('verdict.yes') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <RadioButton v-model="form.compiles" :value="false" input-id="compiles-no" />
            <label for="compiles-no" class="cursor-pointer text-sm text-[var(--text-color)]">
              {{ t('verdict.no') }}
            </label>
          </div>
        </div>
      </div>

      <div class="mb-5">
        <label class="mb-2 block text-left text-sm font-medium text-[var(--text-color-light)]">
          {{ t('verdict.malicious-code') }}
        </label>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <RadioButton v-model="form.malicious" :value="false" input-id="malicious-no" />
            <label for="malicious-no" class="cursor-pointer text-sm text-[var(--text-color)]">
              {{ t('verdict.no') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <RadioButton v-model="form.malicious" :value="true" input-id="malicious-yes" />
            <label for="malicious-yes" class="cursor-pointer text-sm text-[var(--text-color)]">
              {{ t('verdict.yes') }}
            </label>
          </div>
        </div>
      </div>

      <div class="mb-5">
        <label class="mb-2 block text-left text-sm font-medium text-[var(--text-color-light)]">
          {{ t('verdict.correct-licensing') }}
        </label>
        <div class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <RadioButton v-model="form.licensing" :value="true" input-id="licensing-yes" />
            <label for="licensing-yes" class="cursor-pointer text-sm text-[var(--text-color)]">
              {{ t('verdict.yes-unknown') }}
            </label>
          </div>
          <div class="flex items-center gap-2">
            <RadioButton v-model="form.licensing" :value="false" input-id="licensing-no" />
            <label for="licensing-no" class="cursor-pointer text-sm text-[var(--text-color)]">
              {{ t('verdict.no') }}
            </label>
          </div>
        </div>
      </div>

      <div class="mb-5">
        <label class="mb-2 block text-left text-sm font-medium text-[var(--text-color-light)]">
          {{ t('verdict.additional-comments') }}
        </label>
        <Textarea
          v-model="form.comment"
          :placeholder="t('verdict.additional-comments')"
          rows="3"
          class="w-full"
          :maxlength="500"
          autoResize
        />
        <CharCount :current="form.comment.length" :max="500" />
      </div>

      <label class="mb-3 block text-center text-sm font-medium text-[var(--text-color-light)]">
        {{ t('verdict.verdict-label') }}
      </label>
      <div class="flex items-center justify-center gap-3">
        <Button
          :label="t('verdict.deny')"
          :severity="canDeny ? 'danger' : 'secondary'"
          outlined
          :disabled="!canDeny || submitting"
          :loading="submitting && !verdictIsSafe"
          @click="handleSubmit(false)"
        >
          <template #icon>
            <font-awesome-icon :icon="['fas', 'thumbs-down']" class="mr-2" />
          </template>
        </Button>
        <Button
          :label="t('verdict.approve')"
          severity="secondary"
          outlined
          :disabled="!canApprove || submitting"
          :loading="submitting && verdictIsSafe"
          :class="{
            '!border-[var(--success-color)] !bg-[var(--success-color)] !text-white hover:!brightness-90':
              canApprove
          }"
          @click="handleSubmit(true)"
        >
          <template #icon>
            <font-awesome-icon :icon="['fas', 'thumbs-up']" class="mr-2" />
          </template>
        </Button>
      </div>
    </div>
  </DetailsSectionCard>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import RadioButton from 'primevue/radiobutton'
import Textarea from 'primevue/textarea'
import Button from 'primevue/button'
import DetailsSectionCard from '@/components/details/DetailsSectionCard.vue'
import { submitVerdict } from '@/api/moderation'
import { useToast } from 'primevue/usetoast'
import CharCount from '@/components/common/CharCount.vue'
import Message from 'primevue/message'

interface Props {
  assignmentId: string
  repoUrl?: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  verdictSubmitted: []
}>()

const { t } = useI18n()
const toast = useToast()

const form = ref({
  compiles: null as boolean | null,
  malicious: null as boolean | null,
  licensing: null as boolean | null,
  comment: ''
})

const submitting = ref(false)
const verdictIsSafe = ref(true)

const allAnswered = computed(
  () =>
    form.value.compiles !== null && form.value.malicious !== null && form.value.licensing !== null
)

const isSafe = computed(
  () =>
    form.value.compiles === true && form.value.malicious === false && form.value.licensing === true
)

const canApprove = computed(() => allAnswered.value && isSafe.value)

const canDeny = computed(() => allAnswered.value && !isSafe.value)

async function handleSubmit(safe: boolean) {
  verdictIsSafe.value = safe
  submitting.value = true
  try {
    const body: { isSafe: boolean; comment?: string } = { isSafe: safe }
    if (form.value.comment.trim()) {
      body.comment = form.value.comment.trim()
    }
    await submitVerdict(props.assignmentId, body)
    toast.add({
      severity: 'success',
      summary: t('verdict.submit-success'),
      life: 4000
    })
    emit('verdictSubmitted')
  } catch (error) {
    const msg =
      (error as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Error'
    toast.add({ severity: 'error', summary: msg, life: 4000 })
  } finally {
    submitting.value = false
  }
}
</script>
