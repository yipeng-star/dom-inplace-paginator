<script setup>
import { ref } from "vue"
import { vPageBreak } from "dom-inplace-paginator/vue"
const revision = ref(0),
  status = ref("")
const options = {
  page: { height: 700 },
  header: { height: 40, render: () => "Vue 指令示例" },
  footer: {
    height: 30,
    render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`,
  },
}
const done = (result) => (status.value = `共 ${result.pageCount} 页`)
const failed = (error) => (status.value = error.message)
</script>
<template>
  <button @click="revision++">重新挂载并分页</button><span>{{ status }}</span>
  <div
    :key="revision"
    v-page-break="{ ready: true, options, onComplete: done, onError: failed }"
  >
    <h1>Vue 3 示例</h1>
    <p v-for="n in 20" :key="n">
      {{ n }}. {{ "Vue 指令自动接收当前根元素。".repeat(20) }}
    </p>
  </div>
</template>
