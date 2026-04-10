import { useState, useEffect } from 'react'
import { createIncidencia, updateIncidencia } from './incidenciaService'

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']
const ESTADOS     = ['ABIERTA', 'EN_PROCESO', 'EN_ESPERA', 'RESUELTA', 'CERRADA', 'CANCELADA']

export default function IncidenciaModal({ show, onClose, onSaved, incidencia }) {
  const [idPropiedad,   setIdProp]     = useState('')
  const [idEspacio,     setIdEsp]      = useState('')
  const [idCategoria,   setIdCat]      = useState('')
  const [idReportadoPor,setIdReport]   = useState('')
  const [titulo,        setTitulo]     = useState('')
  const [descripcion,   setDesc]       = useState('')
  const [prioridad,     setPrioridad]  = useState('MEDIA')
  const [estado,        setEstado]     = useState('ABIERTA')
  const [idAsignadoA,   setIdAsig]     = useState('')
  const [idProveedor,   setIdProv]     = useState('')
  const [costoEstimado, setCostoEst]   = useState('')
  const [costoReal,     setCostoReal]  = useState('')
  const [idFacturaCargo,setIdFact]     = useState('')
  const [observaciones, setObs]        = useState('')
  const [loading,       setLoading]    = useState(false)
  const [error,         setError]      = useState(null)

  useEffect(() => {
    if (incidencia) {
      setIdProp(incidencia.idPropiedad ?? '')
      setIdEsp(incidencia.idEspacio ?? '')
      setIdCat(incidencia.idCategoria ?? '')
      setIdReport(incidencia.idReportadoPor ?? '')
      setTitulo(incidencia.titulo ?? '')
      setDesc(incidencia.descripcion ?? '')
      setPrioridad(incidencia.prioridad ?? 'MEDIA')
      setEstado(incidencia.estado ?? 'ABIERTA')
      setIdAsig(incidencia.idAsignadoA ?? '')
      setIdProv(incidencia.idProveedor ?? '')
      setCostoEst(incidencia.costoEstimado ?? '')
      setCostoReal(incidencia.costoReal ?? '')
      setIdFact(incidencia.idFacturaCargo ?? '')
      setObs(incidencia.observaciones ?? '')
    } else {
      setIdProp(''); setIdEsp(''); setIdCat(''); setIdReport('')
      setTitulo(''); setDesc(''); setPrioridad('MEDIA'); setEstado('ABIERTA')
      setIdAsig(''); setIdProv(''); setCostoEst(''); setCostoReal('')
      setIdFact(''); setObs('')
    }
    setError(null)
  }, [incidencia, show])

  const handleSubmit = async () => {
    if (!titulo.trim()) return setError('El título es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: incidencia ? incidencia.id : 0,
        idPropiedad:    Number(idPropiedad)    || null,
        idEspacio:      Number(idEspacio)      || null,
        idCategoria:    Number(idCategoria)    || null,
        idReportadoPor: Number(idReportadoPor) || null,
        titulo, descripcion, prioridad, estado,
        idAsignadoA:    Number(idAsignadoA)    || null,
        idProveedor:    Number(idProveedor)    || null,
        costoEstimado:  Number(costoEstimado)  || null,
        costoReal:      Number(costoReal)      || null,
        idFacturaCargo: Number(idFacturaCargo) || null,
        observaciones,
      }
      incidencia
        ? await updateIncidencia(incidencia.id, payload)
        : await createIncidencia(payload)
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
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">

            <div className="modal-header">
              <h5 className="modal-title">
                {incidencia ? '✏️ Editar Incidencia' : '🚨 Nueva Incidencia'}
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

                {/* Título */}
                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Título <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    placeholder="Ej. Fuga de agua en pasillo nivel 2"
                    value={titulo}
                    onChange={e => setTitulo(e.target.value)}
                    autoFocus
                  />
                </div>

                {/* Prioridad + Estado */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Prioridad</label>
                  <select className="form-select" value={prioridad} onChange={e => setPrioridad(e.target.value)}>
                    {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Categoría (FK)</label>
                  <input type="number" className="form-control" value={idCategoria}
                    onChange={e => setIdCat(e.target.value)} placeholder="ID categoría" />
                </div>

                {/* FKs */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Propiedad (FK)</label>
                  <input type="number" className="form-control" value={idPropiedad}
                    onChange={e => setIdProp(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Espacio (FK)</label>
                  <input type="number" className="form-control" value={idEspacio}
                    onChange={e => setIdEsp(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Reportado Por (FK)</label>
                  <input type="number" className="form-control" value={idReportadoPor}
                    onChange={e => setIdReport(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Asignado A (FK)</label>
                  <input type="number" className="form-control" value={idAsignadoA}
                    onChange={e => setIdAsig(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">ID Proveedor (FK)</label>
                  <input type="number" className="form-control" value={idProveedor}
                    onChange={e => setIdProv(e.target.value)} />
                </div>

                {/* Costos */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Costo Estimado</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={costoEstimado}
                      onChange={e => setCostoEst(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Costo Real</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={costoReal}
                      onChange={e => setCostoReal(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">ID Factura Cargo (FK)</label>
                  <input type="number" className="form-control" value={idFacturaCargo}
                    onChange={e => setIdFact(e.target.value)} />
                </div>

                {/* Descripción */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" rows={3} value={descripcion}
                    onChange={e => setDesc(e.target.value)}
                    placeholder="Describe el problema con detalle..." />
                </div>

                {/* Observaciones */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2} value={observaciones}
                    onChange={e => setObs(e.target.value)} />
                </div>

              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : incidencia ? 'Guardar cambios' : 'Crear Incidencia'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}