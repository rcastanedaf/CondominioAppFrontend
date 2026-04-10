import { useState } from 'react'
import Sidebar      from './components/Sidebar'
import TaskPanel    from './components/TaskPanel'
import ModuleRouter from './components/ModuleRouter'
import Topbar       from './components/Topbar'
import './App.css'

export default function App() {
  const [activeModule,    setActiveModule]    = useState('catalogos')
  const [activeSubModule, setActiveSubModule] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  return (
    <div className="app-shell">
      <Topbar
        activeModule={activeModule}
        activeSubModule={activeSubModule}
        onToggleSidebar={() => setSidebarCollapsed(v => !v)}
      />
      <div className="app-body">
        <Sidebar
          activeModule={activeModule}
          setActiveModule={mod => { setActiveModule(mod); setActiveSubModule(null) }}
          collapsed={sidebarCollapsed}
        />
        <ModuleRouter
          activeModule={activeModule}
          activeSubModule={activeSubModule}
          setActiveSubModule={setActiveSubModule}
        />
        <TaskPanel
          activeModule={activeModule}
          activeSubModule={activeSubModule}
        />
      </div>
    </div>
  )
}
