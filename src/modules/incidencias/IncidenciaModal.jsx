import { useState, useEffect } from 'react'
import { createIncidencia, updateIncidencia } from './incidenciaService'
import FkSelector from '../../components/FkSelector'
import { getPropiedades } from '../catalogos/propiedadService'
import { getCategorias } from '../catalogos/categoriaIncidenciaService'
import { getPersonas } from '../residentes/personaService'
// import { getEspacios } from '../catalogos/espacioService' // Si tienes este servicio

const PRIORIDADES = ['BAJA', 'MEDIA', 'ALTA', 'CRITICA']
const ESTADOS     = ['ABIERTA', 'EN_PROCESO', 'EN_ESPERA', 'RESUELTA', 'CERRADA', 'CANCELADA']

export default function IncidenciaModal({ show, onClose, onSaved, incidencia }) {
  const [idPropiedad,    setIdProp]      = useState('')
  const [labelProp,      setLabelProp]   = useState('')
  const [idEspacio,      setIdEspacio]   = useState('')     // ← NUEVO
  const [labelEspacio,   setLabelEspacio] = useState('')    // ← NUEVO
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
      setIdEspacio(incidencia.idEspacio ?? '')      // ← NUEVO
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
      setIdEspacio(''); setLabelEspacio('')         // ← NUEVO
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
    
    console.log('Modo:', incidencia ? 'UPDATE' : 'CREATE')
    console.log('Incidencia a editar:', incidencia)
    
    try {
      const payload = {
        idIncidencia: incidencia ? incidencia.idIncidencia : 0,
        idPropiedad: Number(idPropiedad) || null,
        idEspacio: Number(idEspacio) || null,
        idCategoria: Number(idCategoria) || null,
        idReportadoPor: Number(idReportadoPor) || null,
        idAsignadoA: Number(idAsignadoA) || null,
        titulo, 
        descripcion, 
        prioridad, 
        estado,
        costoEstimado: Number(costoEstimado) || null,
        costoReal: Number(costoReal) || null,
        observaciones,
      }
      
      console.log('Payload completo:', JSON.stringify(payload, null, 2))
      
      let response
      if (incidencia) {
        console.log('Llamando a updateIncidencia con ID:', payload.idIncidencia)
        response = await updateIncidencia(payload.idIncidencia, payload)
        console.log('Respuesta update:', response)
      } else {
        console.log('Llamando a createIncidencia')
        response = await createIncidencia(payload)
        console.log('Respuesta create:', response)
      }
      
      console.log('Operación exitosa')
      onSaved()
    } catch (err) {
      console.error('Error capturado:', err)
      console.error('Response data:', err.response?.data)
      console.error('Response status:', err.response?.status)
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
            {/* Resto del JSX igual, pero puedes agregar el campo Espacio si lo necesitas */}
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
                {/* Título - igual */}
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

                {/* Prioridad + Estado - igual */}
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

                {/* Categoría - igual */}
                <div className="col-md-6">
                  <FkSelector
                    label="Categoría"
                    fetchFn={getCategorias}
                    getId={c => c.idCategoria ?? c.id}
                    getLabel={c => c.nombre ?? c.descripcion ?? `#${c.idCategoria ?? c.id}`}
                    value={idCategoria}
                    displayValue={labelCat}
                    onChange={(id, lbl) => { setIdCat(id); setLabelCat(lbl) }}
                    placeholder="Selecciona categoría..."
                  />
                </div>

                {/* Propiedad - igual */}
                <div className="col-md-6">
                  <FkSelector
                    label="Propiedad"
                    fetchFn={getPropiedades}
                    getId={p => p.id_propiedad ?? p.id}
                    getLabel={p => p.codigo ?? p.nombre ?? `#${p.id_propiedad ?? p.id}`}
                    value={idPropiedad}
                    displayValue={labelProp}
                    onChange={(id, lbl) => { setIdProp(id); setLabelProp(lbl) }}
                    placeholder="Selecciona propiedad..."
                  />
                </div>

                {/* Opcional: Campo Espacio - si lo necesitas */}
                {/* <div className="col-md-6">
                  <FkSelector
                    label="Espacio"
                    fetchFn={getEspacios}
                    getId={e => e.idEspacio ?? e.id}
                    getLabel={e => e.nombre ?? e.codigo ?? `#${e.idEspacio ?? e.id}`}
                    value={idEspacio}
                    displayValue={labelEspacio}
                    onChange={(id, lbl) => { setIdEspacio(id); setLabelEspacio(lbl) }}
                    placeholder="Selecciona espacio..."
                  />
                </div> */}

                {/* Reportado Por - igual */}
                <div className="col-md-6">
                  <FkSelector
                    label="Reportado Por"
                    fetchFn={getPersonas}
                    getId={p => p.id_Persona ?? p.id_Persona}
                    getLabel={p => p.nombres
                      ? `${p.nombres} ${p.apellidos ?? ''}`.trim()
                      : `#${p.id_Persona ?? p.id_Persona}`}
                    value={idReportadoPor}
                    displayValue={labelReport}
                    onChange={(id, lbl) => { setIdReport(id); setLabelReport(lbl) }}
                    placeholder="Selecciona persona..."
                  />
                </div>

                {/* Asignado A - igual */}
                <div className="col-md-6">
                  <FkSelector
                    label="Asignado A"
                    fetchFn={getPersonas}
                    getId={p => p.id_Persona ?? p.id}
                    getLabel={p => p.nombres
                      ? `${p.nombres} ${p.apellidos ?? ''}`.trim()
                      : `#${p.id_Persona ?? p.id}`}
                    value={idAsignadoA}
                    displayValue={labelAsig}
                    onChange={(id, lbl) => { setIdAsig(id); setLabelAsig(lbl) }}
                    placeholder="Selecciona persona..."
                  />
                </div>

                {/* Costos - igual */}
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

                {/* Descripción - igual */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" rows={3}
                    value={descripcion} onChange={e => setDesc(e.target.value)}
                    placeholder="Describe el problema con detalle..." />
                </div>

                {/* Observaciones - igual */}
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