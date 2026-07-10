export interface RepoInfo {
  id: number
  name: string
  html_url: string
  releases_url: string
  url: string
  default_branch: string
  owner?: {
    id: number
    login: string
    html_url: string
  }
  license?: {
    name: string
  }
}
