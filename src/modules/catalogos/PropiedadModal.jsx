import { useState, useEffect } from 'react'
import { createPropiedad, updatePropiedad } from './propiedadService'
import FkSelector from '../../components/FkSelector'
import { getTipoPropiedades } from '../catalogos/tipoPropiedadService'

const ESTADOS = ['DISPONIBLE', 'OCUPADA', 'EN_MANTENIMIENTO', 'INACTIVA']

export default function PropiedadModal({ show, onClose, onSaved, propiedad }) {
  const [idTipoPropiedad,  setIdTipo]      = useState('')
  const [codigo,           setCodigo]      = useState('')
  const [nivel,            setNivel]       = useState('')
  const [areaM2,           setAreaM2]      = useState('')
  const [numHabitaciones,  setNumHab]      = useState('')
  const [numParqueos,      setNumParq]     = useState('')
  const [estado,           setEstado]      = useState('DISPONIBLE')
  const [descripcion,      setDescripcion] = useState('')
  const [loading,          setLoading]     = useState(false)
  const [error,            setError]       = useState(null)
  const [labelTipo, setLabelTipo] = useState('')


  useEffect(() => {
    if (propiedad) {
      setIdTipo(propiedad.idTipoPropiedad ?? '')
      setCodigo(propiedad.codigo ?? '')
      setNivel(propiedad.nivel ?? '')
      setAreaM2(propiedad.areaM2 ?? '')
      setNumHab(propiedad.numHabitaciones ?? '')
      setNumParq(propiedad.numParqueos ?? '')
      setEstado(propiedad.estado ?? 'DISPONIBLE')
      setDescripcion(propiedad.descripcion ?? '')
      setLabelTipo('')
    } else {
      setIdTipo(''); setCodigo(''); setNivel(''); setAreaM2('')
      setNumHab(''); setNumParq(''); setEstado('DISPONIBLE'); setDescripcion('')
      setLabelTipo('')
    }
    setError(null)
  }, [propiedad, show])

  const handleSubmit = async () => {
    if (!codigo.trim()) return setError('El código es requerido')
    if (!estado)        return setError('El estado es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: propiedad ? propiedad.id : 0,
        idTipoPropiedad: Number(idTipoPropiedad) || null,
        codigo, nivel: Number(nivel) || null,
        areaM2: Number(areaM2) || null,
        numHabitaciones: Number(numHabitaciones) || null,
        numParqueos: Number(numParqueos) || null,
        estado, descripcion,
      }
      propiedad ? await updatePropiedad(propiedad.id, payload) : await createPropiedad(payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{propiedad ? '✏️ Editar Propiedad' : '🏡 Nueva Propiedad'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Tipo Propiedad"
                    fetchFn={getTipoPropiedades}
                    getId={t => t.idTipoPropiedad ?? t.id}
                    getLabel={t => t.nombre ?? t.descripcion ?? `#${t.idTipoPropiedad ?? t.id}`}
                    value={idTipoPropiedad}
                    displayValue={labelTipo}
                    onChange={(id, lbl) => { setIdTipo(id); setLabelTipo(lbl) }}
                    placeholder="Selecciona tipo..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Código <span className="text-danger">*</span></label>
                  <input className="form-control" placeholder="Ej. APT-101" value={codigo} onChange={e => setCodigo(e.target.value)} autoFocus />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Nivel</label>
                  <input type="number" className="form-control" placeholder="1" value={nivel} onChange={e => setNivel(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Área (m²)</label>
                  <input type="number" step="0.01" className="form-control" placeholder="0.00" value={areaM2} onChange={e => setAreaM2(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado <span className="text-danger">*</span></label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Núm. Habitaciones</label>
                  <input type="number" className="form-control" placeholder="0" value={numHabitaciones} onChange={e => setNumHab(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Núm. Parqueos</label>
                  <input type="number" className="form-control" placeholder="0" value={numParqueos} onChange={e => setNumParq(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" rows={2} value={descripcion} onChange={e => setDescripcion(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : propiedad ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}