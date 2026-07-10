<template>
  <Dialog
    v-model:visible="showReportPopup"
    modal
    :draggable="false"
    :header="t('report.title')"
    :dismissableMask="true"
    contentClass="h-auto w-[90vw] max-w-[500px]"
  >
    <div class="modal-div flex h-full w-full flex-col gap-4">
      <div class="flex flex-col gap-1">
        <label for="report-reason" class="text-sm font-medium">
          {{ t('report.reason_label') }}
        </label>
        <Select
          id="report-reason"
          v-model="selectedReason"
          :options="reasonOptions"
          optionLabel="label"
          optionValue="value"
          :placeholder="t('report.reason_placeholder')"
          class="w-full"
        />
      </div>
      <div class="flex flex-col gap-1">
        <label for="report-body" class="text-sm font-medium">
          {{ t('report.description_label') }}
        </label>
        <Textarea
          id="report-body"
          v-model="description"
          rows="4"
          :placeholder="t('report.description_placeholder')"
          minlength="10"
          maxlength="500"
          class="w-full"
        />
      </div>
      <footer class="flex w-full items-center justify-end gap-2 py-2">
        <Button :label="t('report.cancel')" @click="toggleReport()" variant="outlined" />
        <Button
          :label="t('report.submit')"
          @click="onSubmit()"
          :disabled="!isFormValid || isSubmitting"
          :loading="isSubmitting"
        />
      </footer>
    </div>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import { createReport, type ReportReason } from '@/api/reports'
import { AxiosError } from 'axios'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import Textarea from 'primevue/textarea'
import Select from 'primevue/select'
const { t } = useI18n()
const toast = useToast()

const showReportPopup = defineModel({ type: Boolean, required: true })
const props = defineProps<{ repoDetails: { repoId: string | number } }>()

const selectedReason = ref<ReportReason | null>(null)
const description = ref('')
const isSubmitting = ref(false)

type ReasonOption = { label: string; value: ReportReason }

const reasonOptions = computed<ReasonOption[]>(() => [
  { label: t('report.reason.nsfw'), value: 'nsfw' },
  { label: t('report.reason.inappropriate'), value: 'inappropriate' },
  { label: t('report.reason.malware'), value: 'malware' },
  { label: t('report.reason.copyright'), value: 'copyright' },
  { label: t('report.reason.other'), value: 'other' }
])

const isFormValid = computed(
  () =>
    selectedReason.value !== null &&
    description.value.length >= 10 &&
    description.value.length <= 500
)

const toggleReport = () => {
  showReportPopup.value = false
}

const onSubmit = async () => {
  if (!isFormValid.value || !selectedReason.value) return

  isSubmitting.value = true
  try {
    await createReport(String(props.repoDetails.repoId), selectedReason.value, description.value)
    toast.add({ severity: 'success', summary: t('report.success'), life: 3000 })
    showReportPopup.value = false
  } catch (err) {
    const status = err instanceof AxiosError ? err.response?.status : null
    const key =
      status === 403
        ? 'report.own_publication'
        : status === 409
          ? 'report.duplicate'
          : 'report.error'
    toast.add({ severity: 'error', summary: t(key), life: 4000 })
  } finally {
    isSubmitting.value = false
  }
}
</script>

<style scoped></style>
