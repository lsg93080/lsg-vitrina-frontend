// OAuth & VCS types for the Vitrina frontend, mirroring Auth Service and Vitrina API DTOs.

export type OAuthProvider = 'gitlab' | 'github'

// A connected OAuth account from Auth Service. Tokens are never exposed, so this is safe in frontend state.
export interface OAuthConnection {
  readonly id: string
  readonly userId: string
  readonly provider: OAuthProvider
  // Provider-side account ID (e.g. GitLab numeric user ID as a string).
  readonly providerUserId: string
  readonly scopes: readonly string[]
  // ISO 8601, or null if the token does not expire.
  readonly tokenExpiresAt: string | null
  readonly createdAt: string
  readonly updatedAt: string
}

// GitLab project proxied by the Vitrina API (safe subset, no tokens).
export interface GitLabRepo {
  readonly id: number
  readonly name: string
  readonly nameWithNamespace: string
  readonly path: string
  readonly pathWithNamespace: string
  readonly description: string | null
  readonly webUrl: string
  readonly visibility: 'public' | 'private' | 'internal'
  readonly defaultBranch: string
  readonly topics: readonly string[]
  readonly lastActivityAt: string
  readonly namespace: {
    readonly id: number
    readonly name: string
    readonly path: string
    readonly kind: 'user' | 'group'
    readonly webUrl: string
  }
}

// GitLab repo metadata; `readme` is the raw README.md Markdown, or null if absent.
export interface GitLabRepoMetadata {
  readonly id: number
  readonly name: string
  readonly description: string | null
  readonly readme: string | null
  readonly topics: readonly string[]
  readonly webUrl: string
  readonly defaultBranch: string
  readonly visibility: 'public' | 'private' | 'internal'
}

// GitHub repo proxied by the Vitrina API (safe subset, no tokens).
export interface GitHubRepo {
  readonly id: number
  readonly name: string
  readonly nameWithNamespace: string
  readonly path: string
  readonly pathWithNamespace: string
  readonly description: string | null
  readonly webUrl: string
  readonly visibility: 'public' | 'private'
  readonly defaultBranch: string
  readonly topics: readonly string[]
  readonly lastActivityAt: string
  readonly namespace: {
    readonly id: number
    readonly name: string
    readonly path: string
    readonly kind: 'user' | 'organization'
    readonly webUrl: string
  }
}

// GitHub repo metadata; `readme` is the raw README.md Markdown, or null if absent.
export interface GitHubRepoMetadata {
  readonly id: number
  readonly name: string
  readonly description: string | null
  readonly readme: string | null
  readonly topics: readonly string[]
  readonly webUrl: string
  readonly defaultBranch: string
  readonly visibility: 'public' | 'private'
}

export type VcsRepo = GitLabRepo | GitHubRepo

export type VcsRepoMetadata = GitLabRepoMetadata | GitHubRepoMetadata

// Result of the can-disconnect check; disconnection is blocked while publications depend on the provider.
export interface CanDisconnectResult {
  readonly canDisconnect: boolean
  readonly publicationCount: number
}

// Authorization URL for an OAuth flow; the frontend opens it in a popup to start the consent handshake.
export interface OAuthAuthorizationUrl {
  readonly authorizationUrl: string
}

// Message posted by the OAuth callback popup (oauth-callback.html) to the opener via postMessage.
export interface OAuthPopupMessage {
  readonly type: 'oauth_success' | 'oauth_error'
  readonly provider: OAuthProvider
  // Present only when type is 'oauth_error'.
  readonly error?: string
}
