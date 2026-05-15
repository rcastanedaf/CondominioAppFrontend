import { useState, useEffect } from 'react'
import { createPais, updatePais } from './paisService'

export default function PaisModal({ show, onClose, onSaved, pais }) {
  const [codigo,  setCodigo]  = useState('')
  const [nombre,  setNombre]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  useEffect(() => {
    if (pais) { setCodigo(pais.codigo); setNombre(pais.nombre) }
    else      { setCodigo(''); setNombre('') }
    setError(null)
  }, [pais, show])

  const handleSubmit = async () => {
    if (!codigo.trim()) return setError('El código es requerido')
    if (!/^[A-Z]{2,3}$/.test(codigo.trim()))
      return setError('El código debe ser 2 o 3 letras mayúsculas (ej: GT, USA)')
    if (!nombre.trim()) return setError('El nombre es requerido')
    setLoading(true); setError(null)
    try {
      const payload = { id: pais ? pais.id : 0, codigo, nombre }
      pais ? await updatePais(pais.id, payload) : await createPais(payload)
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
              <h5 className="modal-title">{pais ? '✏️ Editar País' : '🗺️ Nuevo País'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="mb-3">
                <label className="form-label fw-semibold">Código</label>
                <input type="text" className="form-control" placeholder="Ej. GT" value={codigo} onChange={e => setCodigo(e.target.value)} autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre</label>
                <input type="text" className="form-control" placeholder="Ej. Guatemala" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : pais ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}