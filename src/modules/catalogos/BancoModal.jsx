import { useState, useEffect } from 'react'
import { createBanco, updateBanco } from './bancoService'

/**
 * Props:
 *  - show      {boolean}      Mostrar u ocultar el modal
 *  - onClose   {Function}     Cerrar sin guardar
 *  - onSaved   {Function}     Cerrar y refrescar tabla
 *  - banco     {Object|null}  null = Nuevo, objeto = Editar
 */
export default function BancoModal({ show, onClose, onSaved, banco }) {
  const [nombre,  setNombre]  = useState('')
  const [activo,  setActivo]  = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // Cuando abre en modo Editar, llena el formulario
  useEffect(() => {
    if (banco) {
      setNombre(banco.nombre)
      setActivo(banco.activo)
    } else {
      setNombre('')
    }
    setError(null)
  }, [banco, show])

  const handleSubmit = async () => {
    if (!nombre.trim()) {
      setError('El nombre es requerido')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
      id: banco ? banco.id : 0,   // 0 para crear, el id real para editar
      nombre,
      activo: Number(activo)
      }
      if (banco) {
        await updateBanco(banco.id, payload )
      } else {
        await createBanco( payload )
      }
      onSaved() // cierra el modal y refresca la tabla
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null

  return (
    <>
      {/* Overlay */}
      <div className="modal-backdrop fade show" onClick={onClose} />

      {/* Modal */}
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                {banco ? '✏️ Editar Banco' : '🏦 Nuevo Banco'}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />
                  {error}
                </div>
              )}
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre del Banco</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Ej. Banco Industrial"
                  value={nombre}
                  onChange={e => setNombre(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  autoFocus
                />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Estado del Banco</label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="0"
                  value={activo}
                  onChange={e => setActivo(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleSubmit()}
                  
                />
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : banco ? 'Guardar cambios' : 'Crear Banco'
                }
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}

