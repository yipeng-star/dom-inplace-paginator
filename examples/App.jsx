import { useState } from "react"
import { PageBreak } from "dom-inplace-paginator/react"
const options = {
  page: { height: 700 },
  header: { height: 40, render: () => "React 组件示例" },
  footer: {
    height: 30,
    render: ({ pageNumber, totalPages }) => `${pageNumber} / ${totalPages}`,
  },
}
export default function App() {
  const [revision, setRevision] = useState(0),
    [status, setStatus] = useState("")
  return (
    <>
      <button onClick={() => setRevision((v) => v + 1)}>重新挂载并分页</button>
      <span>{status}</span>
      <PageBreak
        key={revision}
        options={options}
        ready
        onComplete={(r) => setStatus(`共 ${r.pageCount} 页`)}
        onError={(e) => setStatus(e.message)}
      >
        <h1>React 示例</h1>
        {Array.from({ length: 20 }, (_, i) => (
          <p key={i}>
            {i + 1}. {"React 组件接收内部内容。".repeat(20)}
          </p>
        ))}
      </PageBreak>
    </>
  )
}
