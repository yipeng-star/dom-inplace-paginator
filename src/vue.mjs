import { nextTick } from "vue"
import { createPaginator } from "./core.mjs"
const states = new WeakMap()
async function run(el, binding) {
  const state = states.get(el),
    config = binding.value ?? {}
  if (!state || state.started || config.ready === false) return
  await nextTick()
  if (states.get(el) !== state || state.started || !el.isConnected) return
  state.started = true
  try {
    const result = await createPaginator(config.options ?? {}).paginate(el)
    if (states.get(el) === state) config.onComplete?.(result)
  } catch (error) {
    if (states.get(el) === state) {
      if (config.onError) config.onError(error)
      else console.error("[v-page-break]", error)
    }
  }
}
export const vPageBreak = {
  mounted(el, binding) {
    states.set(el, { started: false })
    void run(el, binding)
  },
  updated(el, binding) {
    void run(el, binding)
  },
  beforeUnmount(el) {
    states.delete(el)
  },
}
export default {
  install(app) {
    app.directive("page-break", vPageBreak)
  },
}
