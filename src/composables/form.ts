import { reactive, computed } from 'vue'
import useVuelidate from '@vuelidate/core'
import { required, minLength, maxLength, url, requiredIf } from '@vuelidate/validators'
import type { DetailsSection } from '@/types/publish/detailsSection'
import type { RepositorySection } from '@/types/publish/repositorySection'
import type { TagsSection } from '@/types/publish/tagsSection'

export function useForm() {
  interface Form {
    step1: DetailsSection
    step2: RepositorySection
    step3: TagsSection
  }

  const form = reactive<Form>({
    step1: {
      pubName: '',
      pubType: '',
      pubDesc: ''
    },
    step2: {
      provider: '',
      repoURL: '',
      selectedRepo: null,
      pubDoc: '',
      releases: []
    },
    step3: {
      selectedESRB: {} as {
        id?: number
        name?: string
        label?: string
        imageURL?: string
      },
      selectedPlatforms: [] as Array<{ id: number; name: string; icon: string[] }>,
      tags: [] as Array<{ id: number; name: string }>
    }
  })

  const rules = computed(() => {
    // Validation rules
    const localRules = {
      step1: {
        pubName: {
          required,
          minLength: minLength(5),
          maxLength: maxLength(60),
          $lazy: true
        },
        pubType: {
          required,
          $lazy: true
        },
        pubDesc: {
          required,
          minLength: minLength(10),
          maxLength: maxLength(250),
          $lazy: true
        },
        imgUrl: { url, $lazy: true }
      },
      step2: {
        provider: { required },
        repoURL: {
          url,
          $lazy: true
        },
        pubDoc: {
          required,
          minLength: minLength(10),
          $lazy: true
        },
        selectedRepo: {
          id: {
            required: requiredIf(() => form.step2.provider !== '')
          },
          name: {
            required: requiredIf(() => form.step2.provider !== '')
          },
          html_url: {
            required: requiredIf(() => form.step2.provider !== '')
          },
          // releases_url is GitHub-only; GitLab repos set it to '' intentionally
          releases_url: {},
          url: {
            required: requiredIf(() => form.step2.provider !== '')
          },
          license: {
            required: false,
            name: String
          }
        }
      },
      step3: {
        selectedESRB: {
          required
        },
        selectedPlatforms: {
          required
        }
      }
    }

    return localRules
  })

  const v$ = useVuelidate(rules, form)

  return {
    form,
    v$
  }
}
