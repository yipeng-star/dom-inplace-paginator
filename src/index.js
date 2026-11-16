;(function (global) {
  "use strict"
  function createPaginator(options = {}) {
    const p = { width: 800, height: 1080, gap: 16, ...options.page }
    const pagePad = {
      top: 30,
      right: 48,
      bottom: 30,
      left: 48,
      ...p.padding,
    }
    const hh = options.header?.height ?? 0,
      fh = options.footer?.height ?? 0
    const frameLeft = options.contentFrame?.left ?? pagePad.left,
      frameRight = options.contentFrame?.right ?? pagePad.right
    const pad = { ...pagePad, left: frameLeft, right: frameRight }
    const start = pad.top + hh,
      end = p.height - pad.bottom - fh,
      capacity = end - start
    function fail(code, message, element) {
      const e = Object.assign(new Error(message), { code, element })
      throw e
    }
    if (
      ![frameLeft, frameRight].every(
        (distance) => Number.isFinite(distance) && distance >= 0,
      ) ||
      frameLeft + frameRight >= p.width
    )
      fail(
        "INVALID_OPTIONS",
        "版心线左右距离非法：必须为有限非负数，且两者之和必须小于页面宽度",
      )
    if (
      ![p.width, p.height, p.gap, ...Object.values(pad), hh, fh].every(
        (x) => Number.isFinite(x) && x >= 0,
      ) ||
      capacity <= 0 ||
      p.width <= pad.left + pad.right
    )
      fail(
        "INVALID_OPTIONS",
        "非法值，无法分页：页面尺寸必须为有限非负数，且正文可用高度必须大于 0",
      )
    const breakClass = options.print?.breakClass ?? "page_print"
    if (
      typeof breakClass !== "string" ||
      !/^[A-Za-z_][A-Za-z0-9_-]*$/.test(breakClass)
    )
      fail(
        "INVALID_OPTIONS",
        "分页类名非法：请输入单个类名，如 page_print，不要带点号或空格",
      )
    return {
      async paginate(root) {
        if (!root || !root.isConnected)
          fail("INVALID_OPTIONS", "请提供已挂载的根元素")
        if (root.dataset.paginationState)
          fail("ALREADY_PAGINATED", "此区域已分页，请刷新后重试", root)
        root.dataset.paginationState = "processing"
        try {
          await Promise.race([
            document.fonts?.ready || Promise.resolve(),
            new Promise((r) => setTimeout(r, options.assetTimeout || 3000)),
          ])
          await Promise.race([
            Promise.all(
              [...root.querySelectorAll("img")].map((i) =>
                i.decode?.().catch(() => {}),
              ),
            ),
            new Promise((r) => setTimeout(r, options.assetTimeout || 3000)),
          ])
          Object.assign(root.style, {
            position: "relative",
            boxSizing: "border-box",
            width: p.width + "px",
            padding: `${start}px ${pad.right}px 0 ${pad.left}px`,
            display: "flow-root",
          })
          const rect = (e) => {
            const a = e.getBoundingClientRect(),
              b = root.getBoundingClientRect()
            return {
              top: a.top - b.top,
              bottom: a.bottom - b.top,
              height: a.height,
              width: a.width,
            }
          }
          const atomic = (e) =>
            e.matches(
              'img,video,canvas,svg,iframe,[data-page-atomic],[data-page-break-inside="avoid"]',
            )
          const all = [...root.querySelectorAll("*")]
          let candidates = all.filter((e) => {
            if (
              e.closest("[data-page-ignore]") ||
              e.parentElement.closest(
                '[data-page-atomic],[data-page-break-inside="avoid"],svg,video,canvas,iframe',
              )
            )
              return false
            const r = rect(e),
              s = getComputedStyle(e)
            if (
              !r.height ||
              s.visibility === "hidden" ||
              s.display === "none" ||
              e.matches("script,style,thead,tbody,col,colgroup,td,th")
            )
              return false
            if (e.closest("td,th,thead")) return false
            return (
              atomic(e) ||
              e.matches(
                "tr,[data-page-candidate],[data-page-break-before],[data-page-break-after]",
              ) ||
              (r.width >=
                (p.width - pad.left - pad.right) *
                  (options.candidates?.minWidthRatio ?? 0.5) &&
                r.height > (options.candidates?.minHeight ?? 5) &&
                s.display !== "inline")
            )
          })
          candidates = candidates.filter(
            (e) =>
              atomic(e) ||
              e.matches("tr") ||
              !candidates.some((c) => c !== e && e.contains(c)),
          )
          let page = 0,
            breakCount = 0
          const stride = p.height + p.gap
          function gapBefore(e) {
            if (page + 1 >= (options.maxPages || 300))
              fail("MAX_PAGES_EXCEEDED", "超出最大页数", e)
            const gap = document.createElement("div")
            gap.className = `dip-break ${breakClass}`
            gap.setAttribute("aria-hidden", "true")
            const target = (page + 1) * stride + start
            gap.style.cssText = `display:block;clear:both;box-sizing:border-box;height:${Math.max(0, target - rect(e).top)}px;width:100%;margin:0;padding:0;`
            e.before(gap)
            // Correct margin-collapse differences using the actual post-insertion position.
            gap.style.height =
              Math.max(0, parseFloat(gap.style.height) + target - rect(e).top) +
              "px"
            page++
            breakCount++
          }
          function splitText(e, bottom) {
            if (
              !e.childNodes.length ||
              ![...e.childNodes].every((n) => n.nodeType === 3)
            )
              return null
            const text = e.textContent
            const node = e.firstChild
            if (e.childNodes.length !== 1 || text.length < 2) return null
            let lo = 0,
              hi = text.length
            const range = document.createRange()
            while (lo < hi) {
              const m = Math.ceil((lo + hi) / 2)
              range.setStart(node, 0)
              range.setEnd(node, m)
              if (
                range.getBoundingClientRect().bottom -
                  root.getBoundingClientRect().top <=
                bottom + 0.5
              )
                lo = m
              else hi = m - 1
            }
            if (!lo || lo === text.length) return null
            if (lo > 0 && /[\uD800-\uDBFF]/.test(text[lo - 1])) lo--
            const next = e.cloneNode(false)
            next.removeAttribute("id")
            next.removeAttribute("data-page-break-before")
            e.textContent = text.slice(0, lo)
            next.textContent = text.slice(lo)
            e.after(next)
            return next
          }
          for (let i = 0; i < candidates.length; i++) {
            let e = candidates[i]
            if (!e.isConnected) continue
            if (
              e.hasAttribute("data-page-break-before") &&
              rect(e).top > page * stride + start + 1
            )
              gapBefore(e)
            let r = rect(e),
              bottom = page * stride + end
            if (r.bottom > bottom + 0.5) {
              if (!atomic(e) && !e.matches("tr")) {
                const next = splitText(e, bottom)
                if (next) {
                  candidates.splice(i + 1, 0, next)
                  gapBefore(next)
                  continue
                }
              }
              if (r.height > capacity + 0.5)
                fail("ELEMENT_TOO_TALL", "元素高度超过一页，无法分页", e)
              if (e.matches("tr")) {
                const table = e.closest("table")
                if (
                  table.querySelector(
                    '[rowspan]:not([rowspan="1"]),[colspan]:not([colspan="1"])',
                  )
                )
                  fail(
                    "UNSUPPORTED_TABLE",
                    "合并单元格表格无法自动拆分，请标记 data-page-atomic",
                    table,
                  )
                const rows = [...table.querySelectorAll("tbody > tr")],
                  at = rows.indexOf(e)
                if (at < 0)
                  fail(
                    "UNSUPPORTED_TABLE",
                    "仅支持 tbody 中的普通表格行",
                    table,
                  )
                if (at === 0) {
                  e = table
                } else {
                  const widths = [...rows[0].cells].map(
                    (c) => c.getBoundingClientRect().width,
                  )
                  const next = table.cloneNode(false)
                  next.removeAttribute("id")
                  for (const t of [table, next]) {
                    t.style.tableLayout = "fixed"
                    t.style.width = table.getBoundingClientRect().width + "px"
                    if (!t.querySelector("colgroup")) {
                      const cg = document.createElement("colgroup")
                      widths.forEach((w) => {
                        const c = document.createElement("col")
                        c.style.width = w + "px"
                        cg.append(c)
                      })
                      t.prepend(cg)
                    }
                  }
                  const head = table.querySelector("thead")
                  if (head) next.append(head.cloneNode(true))
                  const body = document.createElement("tbody")
                  rows.slice(at).forEach((row) => body.append(row))
                  next.append(body)
                  table.after(next)
                  e = next
                }
              }
              gapBefore(e)
              if (rect(candidates[i]).bottom > page * stride + end + 1)
                fail(
                  "ELEMENT_TOO_TALL",
                  "元素及表头超过一页，无法分页",
                  candidates[i],
                )
            }
            if (e.hasAttribute("data-page-break-after") && candidates[i + 1])
              gapBefore(candidates[i + 1])
          }
          const count = page + 1
          root.style.minHeight = count * p.height + (count - 1) * p.gap + "px"
          function chrome(
            cls,
            top,
            height,
            render,
            n,
            left = pad.left,
            right = pad.right,
          ) {
            const el = document.createElement("div")
            el.className = cls
            el.style.cssText = `position:absolute;box-sizing:border-box;left:${left}px;right:${right}px;top:${top}px;height:${height}px;overflow:hidden;`
            const value =
              typeof render === "function"
                ? render({ pageNumber: n, totalPages: count })
                : render
            if (value instanceof Node) el.append(value.cloneNode(true))
            else el.textContent = value ?? ""
            root.append(el)
          }
          for (let n = 0; n < count; n++) {
            chrome(
              "dip-header",
              n * stride + pad.top,
              hh,
              options.header?.render,
              n + 1,
            )
            chrome(
              "dip-footer",
              n * stride + end,
              fh,
              options.footer?.render,
              n + 1,
            )
            if (options.contentFrame?.visible !== false) {
              chrome(
                "dip-frame",
                n * stride + start,
                capacity,
                "",
                n + 1,
                frameLeft,
                frameRight,
              )
              root.lastChild.style.border = `${options.contentFrame?.width ?? 1}px ${options.contentFrame?.style || "solid"} ${options.contentFrame?.color || "#0089ff"}`
              root.lastChild.style.pointerEvents = "none"
            }
            if (n < count - 1) {
              chrome("dip-gap", n * stride + p.height, p.gap, "", n + 1)
              Object.assign(root.lastChild.style, {
                left: "0",
                right: "0",
                background: "#e5e7eb",
              })
            }
          }
          if (options.print?.injectStyles !== false) {
            // Keep the rule inside this root so replacing the preview removes it too.
            const scope = `dip-${Date.now()}-${Math.random().toString(36).slice(2)}`
            root.setAttribute("data-dip-print", scope)
            const selector = `[data-dip-print="${scope}"]`
            const style = document.createElement("style")
            style.dataset.dipGenerated = "print"
            style.textContent = `@media print {
              ${selector} { min-height:0 !important; height:auto !important; margin:0 !important; padding-top:0 !important; padding-bottom:0 !important; }
              ${selector} .${breakClass} { break-before:page !important; page-break-before:always !important; height:0 !important; min-height:0 !important; margin:0 !important; padding:0 !important; border:0 !important; }
              ${selector} .dip-header, ${selector} .dip-footer, ${selector} .dip-frame, ${selector} .dip-gap { display:none !important; }
            }`
            root.append(style)
          }
          root.dataset.paginationState = "done"
          return { pageCount: count, breakCount, warnings: [] }
        } catch (e) {
          root.dataset.paginationState = "error"
          options.onError?.(e)
          throw e
        }
      },
    }
  }
  const api = { createPaginator }
  if (typeof module !== "undefined" && module.exports) module.exports = api
  else global.DomPaginator = api
})(typeof window !== "undefined" ? window : globalThis)
