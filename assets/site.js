const tabs = [...document.querySelectorAll('[role="tab"]')]

function activateTab(tab, focus = false) {
  for (const item of tabs) {
    const selected = item === tab
    item.setAttribute("aria-selected", String(selected))
    item.tabIndex = selected ? 0 : -1
    document.getElementById(item.getAttribute("aria-controls")).hidden = !selected
  }
  if (focus) tab.focus()
}

tabs.forEach((tab, index) => {
  tab.addEventListener("click", () => activateTab(tab))
  tab.addEventListener("keydown", (event) => {
    if (!["ArrowLeft", "ArrowRight", "Home", "End"].includes(event.key)) return
    event.preventDefault()
    const next = event.key === "Home" ? 0
      : event.key === "End" ? tabs.length - 1
      : (index + (event.key === "ArrowRight" ? 1 : -1) + tabs.length) % tabs.length
    activateTab(tabs[next], true)
  })
})

for (const button of document.querySelectorAll("[data-copy-target]")) {
  button.addEventListener("click", async () => {
    const source = document.getElementById(button.dataset.copyTarget)
    const original = button.textContent
    try {
      await navigator.clipboard.writeText(source.textContent.trim())
      button.textContent = "已复制"
    } catch {
      button.textContent = "请手动复制"
    }
    window.setTimeout(() => { button.textContent = original }, 2000)
  })
}
