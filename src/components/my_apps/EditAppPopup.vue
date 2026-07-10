<template>
  <Dialog
    v-model:visible="showEditAppPopup"
    modal
    :draggable="false"
    :header="t('contributions.action.edit-app')"
    :dismissableMask="true"
    :style="{ width: 'min(750px, 95vw)' }"
  >
    <div class="flex h-full w-full flex-col gap-4 text-[var(--text-color)]">
      <Tabs :value="props.initialTab">
        <TabList>
          <Tab value="app">{{ t('contributions.action.edit-app') }}</Tab>
          <Tab value="releases">{{ t('releases.title') }}</Tab>
        </TabList>

        <TabPanels>
          <TabPanel value="app">
            <div v-if="!showMessage" class="flex flex-col items-center gap-4 pt-4">
              <section class="flex h-auto w-full flex-col items-start">
                <label for="app-name">{{ t(`contributions.action.change-name`) }}</label>
                <InputText
                  id="app-name"
                  name="app-name"
                  class="w-full"
                  type="text"
                  v-model="appName"
                  :placeholder="t('contributions.action.change-name-placeholder')"
                />
                <div class="mt-3 flex w-full items-center justify-between">
                  <label>{{ t('contributions.action.change-thumbnail') }}</label>
                  <span v-if="images.length > 0" class="text-sm text-[var(--text-color-light)]">
                    {{ t('publish.images-total') }} {{ images.length }}
                  </span>
                </div>
                <span class="text-sm text-[var(--text-color-light)]">
                  {{ t('contributions.action.images-help') }}
                </span>

                <section class="mt-2 w-full rounded-md bg-[var(--background-secondary-color)] p-4">
                  <div
                    v-if="images.length === 0"
                    class="flex items-center gap-2 text-sm text-[var(--text-color-light)]"
                  >
                    <font-awesome-icon :icon="['fas', 'info-circle']" />
                    <span>{{ t('publish.form-image-text') }}</span>
                  </div>

                  <div v-else class="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    <div
                      v-for="(url, i) in images"
                      :key="url + i"
                      class="group relative overflow-hidden rounded-lg border-2 transition-colors duration-200"
                      :class="
                        appImage === url
                          ? 'border-[var(--primary-color)] shadow-[0_0_10px_rgba(250,94,21,0.4)]'
                          : 'border-white/10 hover:border-white/30'
                      "
                    >
                      <button
                        type="button"
                        class="block w-full focus:outline-none"
                        @click="appImage = url"
                      >
                        <img
                          :src="url"
                          :alt="`Image ${i + 1}`"
                          class="aspect-video h-[100px] w-full object-cover"
                        />
                        <div
                          v-if="appImage === url"
                          class="absolute inset-0 flex items-center justify-center bg-black/20"
                        >
                          <font-awesome-icon
                            :icon="['fas', 'circle-check']"
                            class="text-lg text-[var(--primary-color)]"
                          />
                        </div>
                      </button>
                      <button
                        type="button"
                        class="absolute top-1 right-1 flex h-7 w-7 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity duration-150 group-hover:opacity-100 hover:bg-red-600/80 focus:opacity-100"
                        v-tooltip.top="t('actions.delete')"
                        @click="removeImage(i)"
                      >
                        <font-awesome-icon :icon="['fas', 'trash']" />
                      </button>
                    </div>

                    <button
                      v-if="images.length < maxImages"
                      type="button"
                      class="flex aspect-video h-[100px] w-full flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-white/20 text-sm text-[var(--text-color-light)] transition-colors duration-200 hover:border-white/40 hover:text-[var(--text-color)]"
                      @click="showImagesPopup = true"
                    >
                      <font-awesome-icon :icon="['fas', 'plus']" />
                      <span>{{ t('publish.form-add-image') }}</span>
                    </button>
                  </div>

                  <div v-if="images.length === 0" class="mt-3 flex justify-center">
                    <Button
                      @click="showImagesPopup = true"
                      :label="t('publish.form-add-image')"
                      size="small"
                      variant="outlined"
                    />
                  </div>
                </section>

                <ImagesPopUp
                  v-if="showImagesPopup"
                  v-model="showImagesPopup"
                  :images="images"
                  width="800px"
                  @add-image="(url: string) => images.push(url)"
                />
              </section>
              <footer>
                <Button
                  :disabled="appName.trim() === ''"
                  data-test="update-app-button"
                  :label="t('contributions.update')"
                  @click="onUpdateApp"
                />
              </footer>
            </div>
            <Message v-if="showMessage" :severity="message?.severity">{{ message?.text }}</Message>
          </TabPanel>

          <TabPanel value="releases">
            <div class="flex flex-col gap-4 pt-4">
              <div class="flex items-center justify-between">
                <span class="text-lg font-semibold">{{ t('releases.title') }}</span>
                <Button
                  :label="t('releases.add')"
                  size="small"
                  @click="resetForm(), (showReleaseForm = true)"
                  :outlined="showReleaseForm && !editingRelease"
                  :disabled="showReleaseForm && !editingRelease"
                />
              </div>

              <div
                v-if="showReleaseForm"
                class="flex flex-col gap-3 rounded-lg border border-[var(--surface-border)] p-4"
              >
                <div class="flex gap-3">
                  <div class="flex flex-1 flex-col gap-1">
                    <label class="text-sm">{{ t('releases.name') }} *</label>
                    <InputText
                      v-model="form.title"
                      :placeholder="t('releases.name')"
                      class="w-full"
                    />
                  </div>
                  <div class="flex flex-1 flex-col gap-1">
                    <label class="text-sm">{{ t('releases.version') }} *</label>
                    <InputText v-model="form.version" placeholder="v1.0.0" class="w-full" />
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm">{{ t('releases.short-description') }} *</label>
                  <InputText
                    v-model="form.shortDescription"
                    :placeholder="t('releases.short-description')"
                    class="w-full"
                  />
                </div>
                <div class="flex gap-3">
                  <div class="flex flex-1 flex-col gap-1">
                    <label class="text-sm">{{ t('releases.date') }} *</label>
                    <DatePicker v-model="form.releaseDate" dateFormat="yy-mm-dd" class="w-full" />
                  </div>
                  <div class="flex flex-1 flex-col gap-1">
                    <label class="text-sm">{{ t('releases.download-url') }} *</label>
                    <InputText
                      v-model="form.downloadUrl"
                      placeholder="https://..."
                      class="w-full"
                      :invalid="submitted && !form.downloadUrl.trim()"
                    />
                  </div>
                </div>
                <div class="flex flex-col gap-1">
                  <label class="text-sm">{{ t('releases.release-notes') }}</label>
                  <Textarea v-model="form.releaseNotes" rows="3" class="w-full" autoResize />
                </div>
                <div class="flex justify-end gap-2">
                  <Button
                    :label="t('releases.cancel')"
                    variant="outlined"
                    size="small"
                    @click="resetForm"
                  />
                  <Button
                    :label="t('releases.save')"
                    size="small"
                    :loading="submitting"
                    :disabled="!isFormValid"
                    @click="onSubmitRelease"
                  />
                </div>
              </div>

              <div v-if="loadingReleases" class="flex justify-center py-6">
                <ProgressSpinner style="width: 40px; height: 40px" />
              </div>

              <DataTable
                v-else
                :value="releases"
                :rows="10"
                paginator
                :rowsPerPageOptions="[5, 10, 20]"
                size="small"
              >
                <template #empty>
                  <EmptyState :icon="['fas', 'code-branch']" :title="t('releases.empty')" />
                </template>
                <Column field="title" :header="t('releases.name')" />
                <Column field="version" :header="t('releases.version')" />
                <Column field="status" :header="t('releases.status')">
                  <template #body="{ data }">
                    <Tag
                      :value="statusLabel(data.status)"
                      :severity="statusSeverity(data.status)"
                    />
                  </template>
                </Column>
                <Column field="releaseDate" :header="t('releases.date')">
                  <template #body="{ data }">
                    {{ formatDate(data.releaseDate) }}
                  </template>
                </Column>
                <Column
                  field="actions"
                  :header="t('contributions.app-table.actions')"
                  headerClass="flex justify-center"
                >
                  <template #body="{ data }">
                    <div class="flex justify-center gap-1">
                      <Button
                        variant="text"
                        size="small"
                        v-tooltip.top="t('actions.edit')"
                        @click="onEditRelease(data)"
                      >
                        <font-awesome-icon :icon="['fas', 'pen']" />
                      </Button>
                      <Button
                        variant="text"
                        size="small"
                        v-tooltip.top="t('actions.delete')"
                        @click="onDeleteRelease(data)"
                        :loading="deletingReleaseId === data.id"
                      >
                        <font-awesome-icon :icon="['fas', 'trash']" />
                      </Button>
                    </div>
                  </template>
                </Column>
              </DataTable>
            </div>
          </TabPanel>
        </TabPanels>
      </Tabs>
    </div>

    <Dialog
      v-model:visible="showDeleteConfirm"
      modal
      :draggable="false"
      :header="t('actions.delete')"
      :dismissableMask="true"
      :style="{ width: 'min(400px, 90vw)' }"
    >
      <div class="flex flex-col items-center gap-4 py-2 text-[var(--text-color)]">
        <p class="text-center">{{ t('releases.confirm-delete') }}</p>
        <p v-if="releaseToDelete" class="text-center text-sm font-semibold">
          "{{ releaseToDelete.title }}" ({{ releaseToDelete.version }})
        </p>
        <div class="flex gap-2">
          <Button
            :label="t('releases.cancel')"
            variant="outlined"
            size="small"
            @click="showDeleteConfirm = false"
          />
          <Button
            :label="t('actions.delete')"
            severity="danger"
            size="small"
            :loading="deletingReleaseId === releaseToDelete?.id"
            @click="confirmDeleteRelease"
          />
        </div>
      </div>
    </Dialog>
  </Dialog>
</template>

<script setup lang="ts">
import { ref, watch, computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useToast } from 'primevue/usetoast'
import Dialog from 'primevue/dialog'
import Button from 'primevue/button'
import InputText from 'primevue/inputtext'
import Message from 'primevue/message'
import ImagesPopUp from '@/components/publish/ImagesPopUp.vue'
import Tabs from 'primevue/tabs'
import TabList from 'primevue/tablist'
import Tab from 'primevue/tab'
import TabPanels from 'primevue/tabpanels'
import TabPanel from 'primevue/tabpanel'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Tag from 'primevue/tag'
import DatePicker from 'primevue/datepicker'
import Textarea from 'primevue/textarea'
import ProgressSpinner from 'primevue/progressspinner'
import EmptyState from '@/components/common/EmptyState.vue'
import { useApp } from '@/composables/app'
import type { Repository } from '@/types/models/repository'
import type { Release, ReleaseStatus } from '@/types/models/release'
import {
  getReleases,
  createRelease,
  updateRelease,
  deleteRelease,
  getPublicationDetailsByRepoId,
  updatePublicationDetails
} from '@/api/publicationDetails'

const { t } = useI18n()
const toast = useToast()

const props = withDefaults(
  defineProps<{
    app: Repository
    initialTab?: string
  }>(),
  {
    initialTab: 'app'
  }
)

const app = ref(props.app)
const appName = ref(app.value.title ?? '')
const appImage = ref(app.value.thumbnailUrl ?? '')
const showMessage = ref<boolean>(false)
const images = ref<string[]>([])
const showImagesPopup = ref(false)
const maxImages = 15
const loadingImages = ref(false)

const showEditAppPopup = defineModel('showEditAppPopup', {
  type: Boolean,
  required: true
})

const apps = defineModel('apps', {
  type: Array as () => Repository[],
  required: true
})

const emit = defineEmits<{ updated: [] }>()

const { message, updateAppEverywhere } = useApp(apps)

const fetchImages = async () => {
  loadingImages.value = true
  try {
    const res = await getPublicationDetailsByRepoId(String(app.value.repoId))
    images.value = res.data?.images ?? []
  } catch {
    // Non-fatal: image list stays empty
  } finally {
    loadingImages.value = false
  }
}

const removeImage = (index: number) => {
  const removed = images.value[index]
  images.value.splice(index, 1)
  if (appImage.value === removed) {
    appImage.value = images.value[0] ?? ''
  }
}

const onUpdateApp = async () => {
  const success = await updateAppEverywhere(app.value.repoId, {
    title: appName.value,
    thumbnailUrl: appImage.value
  })
  if (success) {
    try {
      await updatePublicationDetails(String(app.value.repoId), { images: images.value })
    } catch {
      // Non-fatal: publication updated but images failed
    }
    emit('updated')
  }
  showMessage.value = true
}

// Releases state
const releases = ref<Release[]>([])
const loadingReleases = ref(false)
const showReleaseForm = ref(false)
const submitting = ref(false)

const editingRelease = ref<Release | null>(null)
const deletingReleaseId = ref<string | null>(null)
const showDeleteConfirm = ref(false)
const releaseToDelete = ref<Release | null>(null)
const submitted = ref(false)

const form = ref({
  title: '',
  version: '',
  shortDescription: '',
  releaseNotes: '',
  releaseDate: null as Date | null,
  downloadUrl: ''
})

const isFormValid = computed(
  () =>
    form.value.title.trim() !== '' &&
    form.value.version.trim() !== '' &&
    form.value.shortDescription.trim() !== '' &&
    form.value.releaseDate !== null &&
    form.value.downloadUrl.trim() !== ''
)

const resetForm = () => {
  form.value = {
    title: '',
    version: '',
    shortDescription: '',
    releaseNotes: '',
    releaseDate: null,
    downloadUrl: ''
  }
  submitted.value = false
  showReleaseForm.value = false
  editingRelease.value = null
}

const onEditRelease = (release: Release) => {
  editingRelease.value = release
  form.value = {
    title: release.title,
    version: release.version,
    shortDescription: release.shortDescription,
    releaseNotes: release.releaseNotes ?? '',
    releaseDate: new Date(release.releaseDate),
    downloadUrl: release.downloadUrl ?? ''
  }
  showReleaseForm.value = true
}

const fetchReleases = async () => {
  loadingReleases.value = true
  try {
    const result = await getReleases(String(app.value.repoId))
    releases.value = result.data
  } catch {
    // Non-fatal: releases list stays empty, user can still add new ones
  } finally {
    loadingReleases.value = false
  }
}

const onSubmitRelease = async () => {
  submitted.value = true
  if (!isFormValid.value || !form.value.releaseDate) return
  submitting.value = true
  try {
    if (editingRelease.value) {
      await updateRelease(editingRelease.value.id, {
        title: form.value.title,
        version: form.value.version,
        shortDescription: form.value.shortDescription,
        releaseNotes: form.value.releaseNotes,
        releaseDate: form.value.releaseDate.toISOString(),
        downloadUrl: form.value.downloadUrl.trim()
      })
      toast.add({ severity: 'success', summary: t('releases.updated'), life: 3000 })
    } else {
      await createRelease(String(app.value.repoId), {
        title: form.value.title,
        version: form.value.version,
        shortDescription: form.value.shortDescription,
        ...(form.value.releaseNotes ? { releaseNotes: form.value.releaseNotes } : {}),
        releaseDate: form.value.releaseDate.toISOString(),
        downloadUrl: form.value.downloadUrl.trim()
      })
      toast.add({ severity: 'success', summary: t('releases.added'), life: 3000 })
    }
    resetForm()
    await fetchReleases()
  } catch {
    toast.add({
      severity: 'error',
      summary: editingRelease.value ? t('releases.update-error') : t('releases.error'),
      life: 4000
    })
  } finally {
    submitting.value = false
  }
}

const onDeleteRelease = (release: Release) => {
  releaseToDelete.value = release
  showDeleteConfirm.value = true
}

const confirmDeleteRelease = async () => {
  if (!releaseToDelete.value) return
  deletingReleaseId.value = releaseToDelete.value.id
  try {
    await deleteRelease(releaseToDelete.value.id)
    toast.add({ severity: 'success', summary: t('releases.deleted'), life: 3000 })
    showDeleteConfirm.value = false
    releaseToDelete.value = null
    await fetchReleases()
  } catch {
    toast.add({ severity: 'error', summary: t('releases.delete-error'), life: 4000 })
  } finally {
    deletingReleaseId.value = null
  }
}

const statusLabel = (status: ReleaseStatus): string => {
  const map: Record<ReleaseStatus, string> = {
    pending: t('releases.status-pending'),
    approved: t('releases.status-approved'),
    suspended: t('releases.status-suspended')
  }
  return map[status] ?? status
}

const statusSeverity = (status: ReleaseStatus): string => {
  const map: Record<ReleaseStatus, string> = {
    pending: 'warn',
    approved: 'success',
    suspended: 'danger'
  }
  return map[status] ?? 'secondary'
}

const formatDate = (dateStr: string): string => {
  if (!dateStr) return '-'
  return new Date(dateStr).toLocaleDateString()
}

// Load releases and images when the popup opens (immediate for v-if mount case)
watch(
  showEditAppPopup,
  (visible) => {
    if (visible) {
      showMessage.value = false
      appName.value = app.value.title ?? ''
      appImage.value = app.value.thumbnailUrl ?? ''
      fetchReleases()
      fetchImages()
    }
  },
  { immediate: true }
)
</script>

<style scoped></style>
