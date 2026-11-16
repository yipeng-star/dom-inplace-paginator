const test = require("node:test")
const assert = require("node:assert/strict")

const { createPaginator } = require("../src/index.js")

class FakeNode {
  constructor(tagName = "div") {
    this.tagName = tagName.toUpperCase()
    this.className = ""
    this.dataset = {}
    this.style = {}
    this.children = []
    this.lastChild = null
    this.isConnected = true
    this.textContent = ""
  }

  append(...nodes) {
    this.children.push(...nodes)
    this.lastChild = this.children.at(-1) ?? null
  }

  setAttribute(name, value) {
    this[name] = String(value)
  }

  querySelectorAll() {
    return []
  }

  getBoundingClientRect() {
    return { top: 0, bottom: 0, height: 0, width: 800 }
  }

  cloneNode() {
    return new FakeNode(this.tagName)
  }
}

function installFakeDom(t) {
  const previousDocument = global.document
  const previousNode = global.Node
  global.Node = FakeNode
  global.document = {
    fonts: { ready: Promise.resolve() },
    createElement: (tagName) => new FakeNode(tagName),
  }
  t.after(() => {
    global.document = previousDocument
    global.Node = previousNode
  })
}

test("contentFrame left/right keep page content inside the frame", async (t) => {
  installFakeDom(t)
  const root = new FakeNode("main")

  await createPaginator({
    page: {
      width: 800,
      height: 700,
      padding: { left: 48, right: 48 },
    },
    contentFrame: { left: 72, right: 36 },
    print: { injectStyles: false },
  }).paginate(root)

  const frame = root.children.find((element) => element.className === "dip-frame")
  const header = root.children.find((element) => element.className === "dip-header")
  assert.ok(frame, "expected a frame element")
  assert.ok(header, "expected a header element")
  assert.match(frame.style.cssText, /left:72px;/)
  assert.match(frame.style.cssText, /right:36px;/)
  assert.match(header.style.cssText, /left:72px;/)
  assert.match(header.style.cssText, /right:36px;/)
  assert.equal(root.style.padding, "30px 36px 0 72px")
})

test("contentFrame rejects invalid left/right distances", () => {
  for (const contentFrame of [
    { left: -1, right: 48 },
    { left: 48, right: Number.NaN },
    { left: 500, right: 300 },
  ]) {
    assert.throws(
      () =>
        createPaginator({
          page: { width: 800, height: 700 },
          contentFrame,
        }),
      (error) => error.code === "INVALID_OPTIONS" && /版心线/.test(error.message),
    )
  }
})
