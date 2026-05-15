import { useState, useEffect } from 'react'
import { createResidente, updateResidente } from './residenteService'
import FkSelector from '../../components/FkSelector'
import { getPersonas } from './personaService'
import { getPropiedades } from '../catalogos/propiedadService'

const TIPOS_RESIDENTE = ['PROPIETARIO', 'INQUILINO']

export default function ResidenteModal({ show, onClose, onSaved, residente }) {
  const [idPersona,    setIdPersona]    = useState('')
  const [idPropiedad,  setIdPropiedad]  = useState('')
  const [tipoResidente,setTipoRes]      = useState('PROPIETARIO')
  const [fechaIngreso, setFechaIngreso] = useState('')
  const [fechaSalida,  setFechaSalida]  = useState('')
  const [activo,       setActivo]       = useState(1)
  const [observaciones,setObs]          = useState('')
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)
  const [labelPersona,   setLabelPersona]   = useState('')
  const [labelPropiedad, setLabelPropiedad] = useState('')

  useEffect(() => {
    if (residente) {
      setIdPersona(residente.idPersona ?? '')
      setIdPropiedad(residente.idPropiedad ?? '')
      setTipoRes(residente.tipoResidente ?? 'PROPIETARIO')
      setFechaIngreso(residente.fechaIngreso ? residente.fechaIngreso.substring(0, 10) : '')
      setFechaSalida(residente.fechaSalida ? residente.fechaSalida.substring(0, 10) : '')
      setActivo(residente.activo ?? 1)
      setObs(residente.observaciones ?? '')
    } else {
      setIdPersona(''); setIdPropiedad(''); setTipoRes('PROPIETARIO')
      setFechaIngreso(''); setFechaSalida(''); setActivo(1); setObs('')
    }
    setError(null)
  }, [residente, show])

  const handleSubmit = async () => {
    if (!idPersona)    return setError('El ID de persona es requerido')
    if (!idPropiedad)  return setError('El ID de propiedad es requerido')
    if (!fechaIngreso) return setError('La fecha de ingreso es requerida')
    if (fechaSalida && new Date(fechaSalida) < new Date(fechaIngreso))
      return setError('La fecha de salida no puede ser anterior a la fecha de ingreso')
    setLoading(true); setError(null)
    try {
      const payload = {
        Id_Residente:   residente ? residente.id : 0,
        Id_Persona:     Number(idPersona),
        Id_Propiedad:   Number(idPropiedad),
        Tipo_Residente: tipoResidente,
        Fecha_Ingreso:  fechaIngreso,
        Fecha_Salida:   fechaSalida || null,
        Activo:         Number(activo),
        Observaciones:  observaciones || '',
      }
      residente
        ? await updateResidente(residente.id, payload)
        : await createResidente(payload)
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
              <h5 className="modal-title">{residente ? '✏️ Editar Residente' : '🏠 Nuevo Residente'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Persona" required
                    fetchFn={getPersonas}
                    getId={p => p.id_Persona ?? p.idPersona ?? p.Id_Persona ?? p.id}
                    getLabel={p => p.nombres
                            ? `${p.nombres} ${p.apellidos ?? ''}`.trim()
                            : `#${p.id_Persona ?? p.id}`}
                    value={idPersona}
                    displayValue={labelPersona}
                    onChange={(id, lbl) => { setIdPersona(id); setLabelPersona(lbl) }}
                    placeholder="Selecciona persona..."
                  />
                </div>

                <div className="col-md-6">
                  <FkSelector
                    label="Propiedad" required
                    fetchFn={getPropiedades}
                    getId={p => p.id_propiedad ?? p.idPropiedad ?? p.Id_Propiedad ?? p.id}
                    getLabel={p => p.codigo ?? p.nombre ?? `#${p.id_propiedad ?? p.id}`}
                    value={idPropiedad}
                    displayValue={labelPropiedad}
                    onChange={(id, lbl) => { setIdPropiedad(id); setLabelPropiedad(lbl) }}
                    placeholder="Selecciona propiedad..."
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tipo Residente <span className="text-danger">*</span></label>
                  <select className="form-select" value={tipoResidente} onChange={e => setTipoRes(e.target.value)}>
                    {TIPOS_RESIDENTE.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Ingreso <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaIngreso} onChange={e => setFechaIngreso(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Salida</label>
                  <input type="date" className="form-control" value={fechaSalida} onChange={e => setFechaSalida(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={activo} onChange={e => setActivo(e.target.value)}>
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : residente ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}