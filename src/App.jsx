import { useState } from 'react'
import Sidebar      from './components/Sidebar'
import TaskPanel    from './components/TaskPanel'
import ModuleRouter from './components/ModuleRouter'
import Topbar       from './components/Topbar'
import LoginPage    from './auth/LoginPage'
import { getUser, logout } from './auth/authService'
import './App.css'

export default function App() {
  const [user,            setUser]            = useState(getUser)
  const [activeModule,    setActiveModule]    = useState('catalogos')
  const [activeSubModule, setActiveSubModule] = useState(null)
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  if (!user) return <LoginPage onLogin={setUser} />

  const handleLogout = () => {
    logout()
    setUser(null)
  }

  return (
    <div className="app-shell">
      <Topbar
        activeModule={activeModule}
        activeSubModule={activeSubModule}
        onToggleSidebar={() => setSidebarCollapsed(v => !v)}
        user={user}
        onLogout={handleLogout}
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
      </div>
    </div>
  )
}