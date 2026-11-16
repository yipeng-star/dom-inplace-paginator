import { createElement, useEffect, useRef } from "react"
import { createPaginator } from "./core.mjs"
// Children must remain immutable after pagination; change key to rebuild.
export function PageBreak({
  children,
  options = {},
  ready = true,
  onComplete,
  onError,
  ...attributes
}) {
  const root = useRef(null),
    started = useRef(false)
  const latest = useRef({ options, onComplete, onError })
  latest.current = { options, onComplete, onError }
  useEffect(() => {
    let cancelled = false
    if (!ready || started.current) return
    // Allow StrictMode's initial cleanup to finish before mutating DOM.
    Promise.resolve().then(async () => {
      if (cancelled || started.current || !root.current?.isConnected) return
      started.current = true
      try {
        const result = await createPaginator(latest.current.options).paginate(
          root.current,
        )
        if (!cancelled) latest.current.onComplete?.(result)
      } catch (error) {
        if (!cancelled) {
          if (latest.current.onError) latest.current.onError(error)
          else console.error("[PageBreak]", error)
        }
      }
    })
    return () => {
      cancelled = true
    }
  }, [ready])
  return createElement("div", { ...attributes, ref: root }, children)
}
