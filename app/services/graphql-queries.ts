/**
 * GraphQL query to search repositories.
 *
 * @remarks
 * `search.nodes` is a union so we use `... on Repository`.
 */
export const SEARCH_REPOS = /* GraphQL */ `
  query SearchRepos($searchQuery: String!, $first: Int!, $after: String) {
    search(type: REPOSITORY, query: $searchQuery, first: $first, after: $after) {
      repositoryCount
      pageInfo {
        hasNextPage
        endCursor
      }
      nodes {
        ... on Repository {
          id
          name
          nameWithOwner
          url
          description

          owner {
            login
            avatarUrl
            url
          }

          isPrivate
          isFork
          isArchived

          updatedAt
          pushedAt

          stargazerCount
          forkCount

          primaryLanguage {
            name
            color
          }

          licenseInfo {
            spdxId
          }
        }
      }
    }
  }
`
