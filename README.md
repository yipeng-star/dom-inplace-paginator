# dom-inplace-paginator

一个零运行时依赖的原地 DOM 分页器，用于分页预览、打印分页，以及 HTML、Vue 3 和 React 项目集成。

> 当前版本为 `0.2.0`，仍处于实验阶段。分页器会直接修改目标 DOM；用于生产环境前，请根据实际文档内容完成浏览器兼容性测试。

## 特性

- 根据页面尺寸、页眉、页脚和版心计算分页位置
- 支持纯文本拆分、普通表格按行拆分和重复表头
- 图片、视频、公式和自定义原子区域整体换页
- 支持强制分页、忽略区域和自定义候选元素
- 支持页眉、页脚、页码和可配置版心线
- 自动注入打印分页规则和自定义分页类名
- 提供原生 HTML、Vue 3 和 React 入口
- 无运行时依赖

## 安装

```sh
npm install dom-inplace-paginator
```

## 快速开始

```js
import { createPaginator } from "dom-inplace-paginator"

const paginator = createPaginator({
  page: {
    width: 800,
    height: 1080,
    gap: 16,
    padding: { top: 30, right: 48, bottom: 30, left: 48 },
  },
  header: {
    height: 40,
    render: () => "示例文档",
  },
  footer: {
    height: 30,
    render: ({ pageNumber, totalPages }) =>
      `第 ${pageNumber} / ${totalPages} 页`,
  },
  contentFrame: {
    visible: true,
    color: "#0089ff",
    width: 1,
    style: "solid",
    left: 48,
    right: 48,
  },
  print: {
    breakClass: "page_print",
    injectStyles: true,
  },
})

const result = await paginator.paginate(document.querySelector("#content"))
console.log(`共 ${result.pageCount} 页`)
```

`contentFrame.left` 和 `contentFrame.right` 同时控制版心线与正文左右边界，内容会始终位于版心线内部。未设置时，它们跟随 `page.padding.left/right`。

## HTML

通过普通 `<script>` 引入 `src/index.js` 后，使用全局对象调用：

```js
const paginator = DomPaginator.createPaginator(options)
await paginator.paginate(document.querySelector("#content"))
```

`dom-inplace-paginator/html` 还导出 `paginateAll(options, scope)`，可自动处理带有 `data-page-break` 的容器。

## Vue 3

```vue
<script setup>
import { vPageBreak } from "dom-inplace-paginator/vue"

const options = {
  page: { height: 700 },
  footer: {
    height: 30,
    render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`,
  },
}
</script>

<template>
  <main v-page-break="{ ready: true, options }">
    <h1>需要分页的内容</h1>
  </main>
</template>
```

也可以从 `dom-inplace-paginator/vue` 导入默认插件，并通过 `app.use(plugin)` 全局注册。

## React

```jsx
import { PageBreak } from "dom-inplace-paginator/react"

export default function Document() {
  return (
    <PageBreak options={{ page: { height: 700 } }}>
      <h1>需要分页的内容</h1>
    </PageBreak>
  )
}
```

分页后如需更新内容，请修改外层 `key`，完整卸载并重新创建分页区域。

## DOM 标记

| 标记 | 作用 |
| --- | --- |
| `data-page-atomic` | 元素整体换页，不从内部拆分 |
| `data-page-break-inside="avoid"` | 避免元素内部换页 |
| `data-page-break-before` | 元素前强制换页 |
| `data-page-break-after` | 元素后强制换页 |
| `data-page-ignore` | 排除当前区域及其后代 |
| `data-page-candidate` | 将元素加入分页候选 |

## 主要配置

- `page`: `width`、`height`、`gap`、`padding`
- `header` / `footer`: `height`、`render({ pageNumber, totalPages })`
- `contentFrame`: `visible`、`color`、`width`、`style`、`left`、`right`
- `print`: `breakClass`、`injectStyles`
- `candidates`: `minWidthRatio`、`minHeight`
- `maxPages`: 最大页数，默认 `300`
- `assetTimeout`: 字体和图片等待超时
- `onError(error)`: 分页错误回调

## 本地 Demo

克隆仓库后直接打开 `demo.html`，无需安装依赖。右侧工具栏可调整页面、页眉、页脚、打印类名和版心线。

## 已知限制

- 复杂合并单元格表格需要标记为 `data-page-atomic`
- flex、grid、绝对定位和横向并列候选暂不保证自动拆分正确
- 超过一页可用高度的单个元素会中止分页
- 分页会直接修改 DOM，Vue/React 内容变化后需要完整重新挂载
- 当前尚未提供 TypeScript 声明和自动化真实浏览器测试

## 开发

```sh
npm test
npm run check
npm pack --dry-run
```

## License

[MIT](LICENSE)
