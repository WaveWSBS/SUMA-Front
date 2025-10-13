import React from "react"
import ReactDOM from "react-dom/client"
import App from "./App"
import "./styles.css"

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <div className="min-h-screen bg-background text-foreground">
      <App />
    </div>
  </React.StrictMode>,
)
