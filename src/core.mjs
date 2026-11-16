import * as legacy from "./index.js"
export const createPaginator =
  legacy.default?.createPaginator ?? globalThis.DomPaginator?.createPaginator
