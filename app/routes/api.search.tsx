import type { Route } from './+types/_index'
import { TEXT_QUERY_KEY, USER_NAME } from '~/lib/constants'
import { searchOwnedRepos } from '~/services/search-owned-repos.server'

export async function loader({ request }: Route.LoaderArgs) {
  const textQuery = new URL(request.url).searchParams.get(TEXT_QUERY_KEY) ?? ''
  const data = await searchOwnedRepos({ login: USER_NAME, textQuery })
  return data
}
