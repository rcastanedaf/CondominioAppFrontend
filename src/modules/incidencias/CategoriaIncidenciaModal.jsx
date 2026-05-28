import { useState, useEffect } from 'react'
import { createCategoria, updateCategoria } from './categoriaIncidenciaService'

export default function CategoriaIncidenciaModal({ show, categoria, onClose, onSaved }) {
  const [form, setForm] = useState({ nombre: '', prioridadDefault: 'MEDIA' })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (categoria) {
      setForm({
        idCategoria: categoria.idCategoria,
        nombre: categoria.nombre ?? '',
        prioridadDefault: categoria.prioridadDefault ?? 'MEDIA',
      })
    } else {
      setForm({ nombre: '', prioridadDefault: 'MEDIA' })
    }
    setError(null)
  }, [categoria, show])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { 
      setError('El nombre es requerido')
      return
    }
    if (!form.prioridadDefault.trim()) {
      setError('La prioridad es requerida')
      return
    }

    setSaving(true)
    setError(null)
    try {
      if (categoria) {
        await updateCategoria(form)  // form incluye idCategoria
      } else {
        await createCategoria(form)
      }
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally {
      setSaving(false)
    }
  }

  if (!show) return null

  return (
    <div className="modal show d-block" style={{ background: 'rgba(0,0,0,.4)' }}>
      <div className="modal-dialog modal-dialog-centered">
        <div className="modal-content border-0 shadow">
          <div className="modal-header">
            <h5 className="modal-title">
              {categoria ? 'Editar' : 'Nueva'} Categoría de Incidencia
            </h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Nombre <span className="text-danger">*</span>
              </label>
              <input 
                className="form-control" 
                name="nombre" 
                value={form.nombre} 
                onChange={handleChange} 
                placeholder="Ej: Plomería, Electricidad, etc."
              />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">
                Prioridad por Defecto <span className="text-danger">*</span>
              </label>
              <select 
                className="form-select" 
                name="prioridadDefault" 
                value={form.prioridadDefault} 
                onChange={handleChange}
              >
                <option value="BAJA">Baja</option>
                <option value="MEDIA">Media</option>
                <option value="ALTA">Alta</option>
                <option value="URGENTE">Urgente</option>
              </select>
              <div className="form-text">
                Prioridad que se asignará automáticamente a las incidencias de esta categoría.
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? (
                <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
              ) : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}