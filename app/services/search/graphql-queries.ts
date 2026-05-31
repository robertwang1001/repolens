/**
 * GraphQL query to search repositories.
 *
 * IMPORTANT:
 * - With @octokit/graphql, DON'T name your variable "query".
 * - Use "searchQuery" (or anything else).
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

          repositoryTopics(first: 5) {
            nodes {
              topic {
                name
              }
            }
          }
        }
      }
    }
  }
`
