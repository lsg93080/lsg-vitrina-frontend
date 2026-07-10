import http from '@/api/http'
import type {
  CanDisconnectResult,
  GitLabRepo,
  GitLabRepoMetadata,
  GitHubRepo,
  GitHubRepoMetadata,
  OAuthProvider
} from '@/types/models/oauth'

// Lists the user's GitLab repos (requires a connected GitLab OAuth account).
export async function getGitLabRepos(): Promise<GitLabRepo[]> {
  const response = await http.get<GitLabRepo[]>('/vcs/gitlab/repos')
  return response.data
}

// Fetches metadata for a GitLab repo, including its README Markdown content.
export async function getRepoMetadata(repoId: number): Promise<GitLabRepoMetadata> {
  const response = await http.get<GitLabRepoMetadata>(`/vcs/gitlab/repos/${repoId}/metadata`)
  return response.data
}

// Lists the user's GitHub repos (requires a connected GitHub OAuth account).
export async function getGitHubRepos(): Promise<GitHubRepo[]> {
  const response = await http.get<GitHubRepo[]>('/vcs/github/repos')
  return response.data
}

// Fetches metadata for a GitHub repo, including its README Markdown content.
export async function getGitHubRepoMetadata(repoId: number): Promise<GitHubRepoMetadata> {
  const response = await http.get<GitHubRepoMetadata>(`/vcs/github/repos/${repoId}/metadata`)
  return response.data
}

// Checks if an OAuth provider can be disconnected; blocked while publications are linked to it.
export async function canDisconnect(provider: OAuthProvider): Promise<CanDisconnectResult> {
  const response = await http.get<CanDisconnectResult>(`/vcs/can-disconnect/${provider}`)
  return response.data
}
