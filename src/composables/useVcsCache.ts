// Module-level singleton, survives component mount/unmount cycles while the SPA is alive
import type { VcsRepo, VcsRepoMetadata, OAuthProvider } from '@/types/models/oauth'

interface CacheEntry<T> {
  data: T
  cachedAt: number
}

const REPO_LIST_TTL = 5 * 60 * 1000
const METADATA_TTL = 10 * 60 * 1000

const repoListCache = new Map<OAuthProvider, CacheEntry<VcsRepo[]>>()
const metadataCache = new Map<number, CacheEntry<VcsRepoMetadata>>()

function isExpired(entry: CacheEntry<unknown>, ttl: number): boolean {
  return Date.now() - entry.cachedAt > ttl
}

export function useVcsCache() {
  function getRepoList(provider: OAuthProvider): VcsRepo[] | null {
    const entry = repoListCache.get(provider)
    if (!entry || isExpired(entry, REPO_LIST_TTL)) return null
    return entry.data
  }

  function setRepoList(provider: OAuthProvider, repos: VcsRepo[]): void {
    repoListCache.set(provider, { data: repos, cachedAt: Date.now() })
  }

  function getMetadata(repoId: number): VcsRepoMetadata | null {
    const entry = metadataCache.get(repoId)
    if (!entry || isExpired(entry, METADATA_TTL)) return null
    return entry.data
  }

  function setMetadata(repoId: number, metadata: VcsRepoMetadata): void {
    metadataCache.set(repoId, { data: metadata, cachedAt: Date.now() })
  }

  function invalidateProvider(provider: OAuthProvider): void {
    repoListCache.delete(provider)
  }

  function invalidateAll(): void {
    repoListCache.clear()
    metadataCache.clear()
  }

  return { getRepoList, setRepoList, getMetadata, setMetadata, invalidateProvider, invalidateAll }
}
