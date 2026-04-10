import { useState } from 'react'
import { MODULES } from '../data/modules'

export default function TaskPanel({ activeModule, activeSubModule }) {
  const [activeTask, setActiveTask] = useState(null)
  const mod = MODULES.find(m => m.id === activeModule)

  const handleTask = task => {
    setActiveTask(task)
    setTimeout(() => setActiveTask(null), 1000)
  }

  return (
    <aside className="cms-task-panel">
      <div className="cms-task-header d-flex align-items-center gap-2">
        <i className="bi bi-lightning-charge-fill" style={{ color: mod?.color }} />
        Tareas
      </div>

      <div className="cms-task-list">
        {mod?.tasks.map((task, i) => (
          <button
            key={i}
            className={`cms-task-item ${activeTask === task ? 'task-active' : ''}`}
            onClick={() => handleTask(task)}
            style={{ '--mod-color': mod?.color }}
          >
            <i className="bi bi-chevron-right text-muted" style={{ fontSize: 11 }} />
            {task}
          </button>
        ))}
      </div>

      <div className="cms-task-footer">
        <div className="text-uppercase fw-bold mb-2" style={{ fontSize: 10, color: '#adb5bd', letterSpacing: '0.07em' }}>
          Vista rápida
        </div>
        <div className="cms-quickstat-row">
          <span>Módulo</span>
          <span style={{ color: mod?.color }}>{mod?.label}</span>
        </div>
        {activeSubModule && (
          <div className="cms-quickstat-row">
            <span>Sub-módulo</span>
            <span>{mod?.submodules.find(s => s.id === activeSubModule)?.label}</span>
          </div>
        )}
        <div className="cms-quickstat-row">
          <span>Usuario</span>
          <span>jcermenob</span>
        </div>
        <div className="cms-quickstat-row">
          <span>Fecha</span>
          <span>{new Date().toLocaleDateString('es-GT')}</span>
        </div>
      </div>
    </aside>
  )
}
