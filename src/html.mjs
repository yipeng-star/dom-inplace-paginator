import { createPaginator } from "./core.mjs"
export { createPaginator }
export async function paginateAll(options = {}, scope = document) {
  const results = []
  for (const element of scope.querySelectorAll("[data-page-break]")) {
    if (!element.dataset.paginationState)
      results.push(await createPaginator(options).paginate(element))
  }
  return results
}
