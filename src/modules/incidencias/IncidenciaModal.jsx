import { useState, useEffect } from 'react'
import { createIncidencia, updateIncidencia } from './incidenciaService'
import FkSelector from '../../components/FkSelector'
import { getPropiedades } from '../catalogos/propiedadService'
import { getCategorias } from '../catalogos/categoriaIncidenciaService'
import { getPersonas } from '../residentes/personaService'

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']
const ESTADOS     = ['ABIERTA', 'EN_PROCESO', 'EN_ESPERA', 'RESUELTA', 'CERRADA', 'CANCELADA']

export default function IncidenciaModal({ show, onClose, onSaved, incidencia }) {
  const [idPropiedad,    setIdProp]      = useState('')
  const [labelProp,      setLabelProp]   = useState('')
  const [idCategoria,    setIdCat]       = useState('')
  const [labelCat,       setLabelCat]    = useState('')
  const [idReportadoPor, setIdReport]    = useState('')
  const [labelReport,    setLabelReport] = useState('')
  const [idAsignadoA,    setIdAsig]      = useState('')
  const [labelAsig,      setLabelAsig]   = useState('')
  const [titulo,         setTitulo]      = useState('')
  const [descripcion,    setDesc]        = useState('')
  const [prioridad,      setPrioridad]   = useState('MEDIA')
  const [estado,         setEstado]      = useState('ABIERTA')
  const [costoEstimado,  setCostoEst]    = useState('')
  const [costoReal,      setCostoReal]   = useState('')
  const [observaciones,  setObs]         = useState('')
  const [loading,        setLoading]     = useState(false)
  const [error,          setError]       = useState(null)

  useEffect(() => {
    if (incidencia) {
      setIdProp(incidencia.idPropiedad ?? '')
      setIdCat(incidencia.idCategoria ?? '')
      setIdReport(incidencia.idReportadoPor ?? '')
      setIdAsig(incidencia.idAsignadoA ?? '')
      setTitulo(incidencia.titulo ?? '')
      setDesc(incidencia.descripcion ?? '')
      setPrioridad(incidencia.prioridad ?? 'MEDIA')
      setEstado(incidencia.estado ?? 'ABIERTA')
      setCostoEst(incidencia.costoEstimado ?? '')
      setCostoReal(incidencia.costoReal ?? '')
      setObs(incidencia.observaciones ?? '')
    } else {
      setIdProp('');   setLabelProp('')
      setIdCat('');    setLabelCat('')
      setIdReport(''); setLabelReport('')
      setIdAsig('');   setLabelAsig('')
      setTitulo('');   setDesc('')
      setPrioridad('MEDIA'); setEstado('ABIERTA')
      setCostoEst(''); setCostoReal(''); setObs('')
    }
    setError(null)
  }, [incidencia, show])

  const handleSubmit = async () => {
    if (!titulo.trim()) return setError('El título es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id:             incidencia ? incidencia.id : 0,
        idPropiedad:    Number(idPropiedad)    || null,
        idCategoria:    Number(idCategoria)    || null,
        idReportadoPor: Number(idReportadoPor) || null,
        idAsignadoA:    Number(idAsignadoA)    || null,
        titulo, descripcion, prioridad, estado,
        costoEstimado:  Number(costoEstimado)  || null,
        costoReal:      Number(costoReal)      || null,
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
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Prioridad</label>
                  <select className="form-select" value={prioridad}
                    onChange={e => setPrioridad(e.target.value)}>
                    {PRIORIDADES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado}
                    onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(est => <option key={est} value={est}>{est}</option>)}
                  </select>
                </div>

                {/* Categoría */}
                <div className="col-md-6">
                  <FkSelector
                    label="Categoría"
                    fetchFn={getCategorias}
                    getId={c => c.idCategoriaIncidencia ?? c.id}
                    getLabel={c => c.nombre ?? c.descripcion ?? `#${c.idCategoriaIncidencia ?? c.id}`}
                    value={idCategoria}
                    displayValue={labelCat}
                    onChange={(id, lbl) => { setIdCat(id); setLabelCat(lbl) }}
                    placeholder="Selecciona categoría..."
                  />
                </div>

                {/* Propiedad */}
                <div className="col-md-6">
                  <FkSelector
                    label="Propiedad"
                    fetchFn={getPropiedades}
                    getId={p => p.idPropiedad ?? p.id}
                    getLabel={p => p.codigo ?? p.nombre ?? `#${p.idPropiedad ?? p.id}`}
                    value={idPropiedad}
                    displayValue={labelProp}
                    onChange={(id, lbl) => { setIdProp(id); setLabelProp(lbl) }}
                    placeholder="Selecciona propiedad..."
                  />
                </div>

                {/* Reportado Por */}
                <div className="col-md-6">
                  <FkSelector
                    label="Reportado Por"
                    fetchFn={getPersonas}
                    getId={p => p.idPersona ?? p.id}
                    getLabel={p => p.nombres
                      ? `${p.nombres} ${p.apellidos ?? ''}`.trim()
                      : `#${p.idPersona ?? p.id}`}
                    value={idReportadoPor}
                    displayValue={labelReport}
                    onChange={(id, lbl) => { setIdReport(id); setLabelReport(lbl) }}
                    placeholder="Selecciona persona..."
                  />
                </div>

                {/* Asignado A */}
                <div className="col-md-6">
                  <FkSelector
                    label="Asignado A"
                    fetchFn={getPersonas}
                    getId={p => p.idPersona ?? p.id}
                    getLabel={p => p.nombres
                      ? `${p.nombres} ${p.apellidos ?? ''}`.trim()
                      : `#${p.idPersona ?? p.id}`}
                    value={idAsignadoA}
                    displayValue={labelAsig}
                    onChange={(id, lbl) => { setIdAsig(id); setLabelAsig(lbl) }}
                    placeholder="Selecciona persona..."
                  />
                </div>

                {/* Costos */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Costo Estimado</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={costoEstimado} onChange={e => setCostoEst(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Costo Real</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={costoReal} onChange={e => setCostoReal(e.target.value)} />
                  </div>
                </div>

                {/* Descripción */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" rows={3}
                    value={descripcion} onChange={e => setDesc(e.target.value)}
                    placeholder="Describe el problema con detalle..." />
                </div>

                {/* Observaciones */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2}
                    value={observaciones} onChange={e => setObs(e.target.value)} />
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