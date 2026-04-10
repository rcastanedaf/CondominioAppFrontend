import { useState, useEffect } from 'react'
import { createCategoria, updateCategoria } from './categoriaIncidenciaService'

export default function CategoriaIncidenciaModal({ show, categoria, onClose, onSaved }) {
  const [form, setForm] = useState({ nombre: '', descripcion: '', activo: 1 })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState(null)

  useEffect(() => {
    if (categoria) {
      setForm({
        id: categoria.id,
        nombre: categoria.nombre ?? '',
        descripcion: categoria.descripcion ?? '',
        activo: categoria.activo ?? 1,
      })
    } else {
      setForm({ nombre: '', descripcion: '', activo: 1 })
    }
    setError(null)
  }, [categoria, show])

  const handleChange = e => {
    const { name, value } = e.target
    setForm(prev => ({ ...prev, [name]: name === 'activo' ? Number(value) : value }))
  }

  const handleSubmit = async () => {
    if (!form.nombre.trim()) { setError('El nombre es requerido'); return }
    setSaving(true)
    setError(null)
    try {
      // ⚠️ update recibe el objeto completo (id incluido en body)
      if (categoria) await updateCategoria(form)
      else           await createCategoria(form)
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
            <h5 className="modal-title">{categoria ? 'Editar' : 'Nueva'} Categoría de Incidencia</h5>
            <button className="btn-close" onClick={onClose} />
          </div>
          <div className="modal-body">
            {error && <div className="alert alert-danger py-2">{error}</div>}

            <div className="mb-3">
              <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
              <input className="form-control" name="nombre" value={form.nombre} onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Descripción</label>
              <textarea className="form-control" name="descripcion" rows={3}
                value={form.descripcion} onChange={handleChange} />
            </div>

            <div className="mb-3">
              <label className="form-label fw-semibold">Estado</label>
              <select className="form-select" name="activo" value={form.activo} onChange={handleChange}>
                <option value={1}>Activo</option>
                <option value={0}>Inactivo</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn btn-outline-secondary" onClick={onClose}>Cancelar</button>
            <button className="btn btn-primary" onClick={handleSubmit} disabled={saving}>
              {saving ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : 'Guardar'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
