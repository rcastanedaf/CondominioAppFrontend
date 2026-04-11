import { useState, useEffect } from 'react'
import { createSeguimiento, updateSeguimiento } from './seguimientoService'
import FkSelector from '../../components/FkSelector'
import { getPersonas } from '../residentes/personaService'

const ESTADOS = ['ABIERTA', 'EN_PROCESO', 'EN_ESPERA', 'RESUELTA', 'CERRADA', 'CANCELADA']

export default function SeguimientoModal({ show, onClose, onSaved, incidenciaId, seguimiento, modColor = '#dc3545' }) {
  const [idUsuario,    setIdUsuario]    = useState('')
  const [labelUsuario, setLabelUsuario] = useState('')
  const [comentario,   setComentario]   = useState('')
  const [estadoNuevo,  setEstado]       = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  useEffect(() => {
    if (seguimiento) {
      setIdUsuario(seguimiento.idUsuario ?? '')
      setComentario(seguimiento.comentario ?? '')
      setEstado(seguimiento.estadoNuevo ?? '')
    } else {
      setIdUsuario(''); setLabelUsuario('')
      setComentario(''); setEstado('')
    }
    setError(null)
  }, [seguimiento, show])

  const handleSubmit = async () => {
    if (!comentario.trim()) return setError('El comentario es requerido')
    if (!idUsuario)         return setError('El usuario es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        idSeguimiento: seguimiento ? seguimiento.idSeguimiento : 0,
        idIncidencia:  incidenciaId,
        idUsuario:     Number(idUsuario) || null,
        comentario,
        estadoNuevo:   estadoNuevo || null,
      }
      seguimiento
        ? await updateSeguimiento(seguimiento.idSeguimiento, payload)
        : await createSeguimiento(payload)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">

            <div className="modal-header" style={{ borderBottom: `3px solid ${modColor}` }}>
              <h5 className="modal-title">
                {seguimiento ? '✏️ Editar Seguimiento' : '📝 Agregar Seguimiento'}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />{error}
                </div>
              )}
              <div className="row g-3">

                {/* Usuario — usa getPersonas porque no hay usuarioService */}
                <div className="col-md-6">
                  <FkSelector
                    label="Usuario"
                    fetchFn={getPersonas}
                    getId={p => p.id_Persona ?? p.Id_Persona ?? p.idPersona ?? p.id}
                    getLabel={p => p.nombres
                      ? `${p.nombres} ${p.apellidos ?? ''}`.trim()
                      : `#${p.idPersona ?? p.id}`}
                    value={idUsuario}
                    displayValue={labelUsuario}
                    onChange={(id, lbl) => { setIdUsuario(id); setLabelUsuario(lbl) }}
                    placeholder="Selecciona usuario..."
                  />
                </div>

                {/* Cambio de Estado */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Cambio de Estado</label>
                  <select className="form-select" value={estadoNuevo}
                    onChange={e => setEstado(e.target.value)}>
                    <option value="">— Sin cambio de estado —</option>
                    {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                  </select>
                </div>

                {/* Comentario */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Comentario <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    rows={4}
                    placeholder="Describe la acción tomada, avance o resolución..."
                    value={comentario}
                    onChange={e => setComentario(e.target.value)}
                    autoFocus
                  />
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button
                className="btn text-white"
                style={{ background: modColor }}
                onClick={handleSubmit}
                disabled={loading}
              >
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : seguimiento ? 'Guardar cambios' : 'Agregar'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}