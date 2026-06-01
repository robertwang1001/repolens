/**
 * Sorting options supported by GitHub repo search.
 *
 * - "best" means "let GitHub decide relevance" (no explicit sort qualifier added).
 * - Other keys translate to: sort:<key>-<dir>
 */
export type RepoSearchSortKey = 'best' | 'updated' | 'stars' | 'forks'

/**
 * Sort direction for GitHub's search sort qualifier.
 */
export type SortDirection = 'asc' | 'desc'

/**
 * Minimal language info useful for a repo card/list UI.
 */
export interface PrimaryLanguage {
  /** Language name, e.g. "TypeScript" */
  name: string

  /** GitHub language color (hex), can be null */
  color?: string | null
}

/**
 * Minimal owner info useful for UI display.
 */
export interface RepoOwner {
  /** Username or org name, e.g. "vercel" */
  login: string

  /** Avatar image URL */
  avatarUrl: string

  /** Profile URL */
  url: string
}

/**
 * Minimal license info.
 */
export interface LicenseInfo {
  /** SPDX identifier, e.g. "MIT" */
  spdxId?: string | null
}

/**
 * A compact repo item that is enough for most UIs
 * (list rows, cards, etc.)
 */
export interface RepoListItem {
  id: string

  name: string
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

  /**
   * GitHub "Topics" for the repository — great as keyword chips.
   * Example: ["deno", "typescript", "runtime"]
   */
  repositoryTopics?: {
    nodes?: {
      topic?: {
        name: string
      }
    }[]
  }
}

/**
 * Cursor-based pagination info.
 */
export interface PageInfo {
  hasNextPage: boolean
  endCursor?: string | null
}

/**
 * One page of repo search results.
 */
export interface RepoSearchPageResult {
  /**
   * The final query string sent to GitHub search.
   * This is extremely useful for debugging and "power user" UI.
   */
  queryString: string

  /** Total count for the search across all pages */
  repositoryCount: number

  /** Cursor pagination data */
  pageInfo: PageInfo

  /** Repo nodes for this page */
  repos: RepoListItem[]

  /** If this search is the first time fetch or not */
  isFirstFetch?: boolean
}

/**
 * Search options your UI passes into the client.
 */
export interface RepoSearchOptions {
  /**
   * Optional user/org scope:
   * - If set, we add `user:<login>` to the query.
   * - If empty/undefined, we search globally.
   *
   * Note: GitHub uses `user:` for both users and orgs in search qualifiers.
   */
  login?: string

  /**
   * Free text the user types, e.g. "react table".
   * This is appended as-is (after trimming).
   */
  textQuery?: string

  /**
   * Extra qualifiers as key/value pairs.
   * Examples:
   * - { language: "TypeScript", stars: ">500", fork: false }
   *
   * This gives you a structured UI while still leveraging GitHub qualifiers.
   */
  qualifiers?: Record<string, string | number | boolean>

  /**
   * Sort behavior:
   * - "best": don't add explicit sort qualifier (GitHub decides relevance).
   * - otherwise: add sort:<key>-<dir>
   */
  sortKey?: RepoSearchSortKey
  sortDir?: SortDirection

  /** Page size (GitHub caps apply). */
  first?: number

  /** Cursor for next page. */
  after?: string | null
}
