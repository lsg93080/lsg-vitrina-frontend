import type { RepoInfo } from '@/types/publish/repoInfo'
export interface RepositorySection {
  provider: string
  repoURL: string
  selectedRepo: RepoInfo | null
  releases: Array<any>
  pubDoc: string
}
