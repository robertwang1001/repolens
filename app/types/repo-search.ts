/**
 * Common sort keys for GitHub repository search.
 */
export type RepoSearchSortKey = 'best' | 'updated' | 'stars' | 'forks'

/**
 * Search scope for the free-text portion of a search query.
 */
export type RepoSearchScope = 'narrow' | 'broad'

/**
 * Sort direction for GitHub search `sort:<key>-<dir>`.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Minimal language info useful for UI display.
 */
export interface PrimaryLanguage {
  name: string
  color?: string | null
}

/**
 * Repo owner info useful for UI display.
 */
export interface RepoOwner {
  login: string
  avatarUrl: string
  url: string
}

/**
 * License info useful for UI display.
 */
export interface LicenseInfo {
  spdxId?: string | null
}

/**
 * Fields chosen to be "useful & necessary" for a repo list UI.
 */
export interface RepoListItem {
  id: string
  name: string
  nameWithOwner: string
  url: string
  description?: string | null

  owner: RepoOwner

  isPrivate: boolean
  isFork: boolean
  isArchived: boolean

  updatedAt: string
  pushedAt?: string | null

  stargazerCount: number
  forkCount: number

  primaryLanguage?: PrimaryLanguage | null
  licenseInfo?: LicenseInfo | null
}

/**
 * Cursor-based pagination info.
 */
export interface PageInfo {
  hasNextPage: boolean
  endCursor?: string | null
}

/**
 * Result returned from a single page search request.
 */
export interface RepoSearchPageResult {
  /** Final GitHub search string sent to GraphQL (useful for debugging/power users). */
  queryString: string

  repositoryCount: number
  pageInfo: PageInfo
  repos: RepoListItem[]
}

/**
 * Options to request a page of results.
 */
export interface RepoSearchOptions {
  login: string
  textQuery?: string

  scope?: RepoSearchScope

  sortKey?: RepoSearchSortKey
  sortDir?: SortDirection

  /** Page size; defaults handled by caller/client. */
  first?: number

  /** Cursor for next page */
  after?: string | null
}
