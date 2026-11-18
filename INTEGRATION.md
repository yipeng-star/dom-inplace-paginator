# 接入指南

[项目官网](https://yipeng-star.github.io/dom-inplace-paginator/) 提供可复制的 HTML、JavaScript、Vue 3 和 React 示例、常用配置表格；[在线实验台](https://yipeng-star.github.io/dom-inplace-paginator/demo.html) 可直接测试长表格、页眉页脚和版心线。

## 安装

```sh
npm install dom-inplace-paginator
```

## 入口

| 环境 | 导入方式 | 调用方式 |
| --- | --- | --- |
| JavaScript | `dom-inplace-paginator` | `createPaginator(options).paginate(element)` |
| Vue 3 | `dom-inplace-paginator/vue` | `v-page-break="{ ready, options }"` |
| React | `dom-inplace-paginator/react` | `<PageBreak options={options}>…</PageBreak>` |
| 普通 HTML | `src/index.js`（可通过 CDN 引入） | `window.DomPaginator.createPaginator(options)` |

Vue 和 React 示例分别位于 [examples/App.vue](examples/App.vue) 与 [examples/App.jsx](examples/App.jsx)。普通 HTML 可直接参考 [demo.html](demo.html)。

等待异步内容渲染完成后再分页。Vue 中可使用 `ready` 控制首次执行；分页后内容变化需要完整卸载并重新创建分页区域，仅修改 `options` 不会自动重新分页。React 中可修改外层 `key` 来重建。完整参数、DOM 标记及已知限制见 [README](README.md)。
