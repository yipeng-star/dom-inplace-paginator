# 三种接入方式

原生 HTML：双击 demo.html。script 引入 src/index.js 后调用 DomPaginator.createPaginator(options).paginate(dom)。
HTTP 服务中的 ES module 也可从 src/html.mjs 引入 paginateAll(options)，自动扫描 data-page-break 容器。

Vue 3 / React 项目中先安装本地包：

```sh
npm install dom-inplace-paginator
```

Vue：将 examples/App.vue 复制到现有 Vue 项目。script setup 导入 vPageBreak 即可使用 v-page-break。也可 import plugin from 'dom-inplace-paginator/vue' 然后 app.use(plugin) 全局注册。

React：将 examples/App.jsx 复制到现有 React 项目。使用 import { PageBreak } from 'dom-inplace-paginator/react'。

Vue 和 React 示例需要各自的开发环境，不能直接双击。等待接口内容渲染完成后再把 ready 设置为 true。options 为内核配置，onComplete 接收分页结果，onError 接收异常。分页后不要更新内部内容：修改外层 key，完整卸载并重建区域。仅改变 options 不会重新分页。

所有版本共用内核，仍有 README 列出的原型限制。适配层尚未完成浏览器端框架集成验证。没有发布 npm，不含 TypeScript 声明。
