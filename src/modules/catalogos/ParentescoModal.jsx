import { useState, useEffect } from 'react'
import { createParentesco, updateParentesco } from './parentescoService'

export default function ParentescoModal({ show, onClose, onSaved, parentesco }) {
  const [nombre,  setNombre]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (parentesco) { setNombre(parentesco.nombre) }
    else            { setNombre('') }
    setError(null)
  }, [parentesco, show])

  const handleSubmit = async () => {
    if (!nombre.trim()) return setError('El nombre es requerido')
    if (nombre.trim().length < 2) return setError('El nombre debe tener al menos 2 caracteres')
    if (!/^[a-záéíóúñA-ZÁÉÍÓÚÑ\s\-]+$/.test(nombre.trim()))
      return setError('El nombre solo debe contener letras')
    setLoading(true); setError(null)
    try {
      const payload = { id: parentesco ? parentesco.id : 0, nombre }
      parentesco ? await updateParentesco(parentesco.id, payload) : await createParentesco(payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{parentesco ? '✏️ Editar Parentesco' : '👨‍👩‍👦 Nuevo Parentesco'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre</label>
                <input type="text" className="form-control" placeholder="Ej. Hijo" value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : parentesco ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}