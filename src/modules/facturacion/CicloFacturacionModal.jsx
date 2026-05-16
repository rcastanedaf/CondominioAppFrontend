import { useState, useEffect } from 'react'
import { createCiclo, updateCiclo } from './cicloFacturacionService'
import FkSelector from '../../components/FkSelector'
import { getPropiedades } from '../catalogos/propiedadService'
import { getTipoServicios } from './tipoServicioService'

export default function CicloFacturacionModal({ show, onClose, onSaved, ciclo }) {
  const [idPropiedad,   setIdProp]   = useState('')
  const [idTipoServicio,setIdServ]   = useState('')
  const [diaCorte,      setDiaCor]   = useState('')
  const [diaVencimiento,setDiaVenc]  = useState('')
  const [montoOverride, setMonto]    = useState('')
  const [activo,        setActivo]   = useState(1)
  const [fechaInicio,   setFechaIn]  = useState('')
  const [fechaFin,      setFechaFin] = useState('')
  const [loading,       setLoading]  = useState(false)
  const [error,         setError]    = useState(null)
  const [labelProp,  setLabelProp]  = useState('')
  const [labelServ,  setLabelServ]  = useState('')

  useEffect(() => {
    if (ciclo) {
      setIdProp(ciclo.idPropiedad ?? ''); setIdServ(ciclo.idTipoServicio ?? '')
      setDiaCor(ciclo.diaCorte ?? ''); setDiaVenc(ciclo.diaVencimiento ?? '')
      setMonto(ciclo.montoOverride ?? ''); setActivo(ciclo.activo ?? 1)
      setFechaIn(ciclo.fechaInicio?.substring(0, 10) ?? '')
      setFechaFin(ciclo.fechaFin?.substring(0, 10) ?? '')
    } else {
      setIdProp(''); setIdServ(''); setDiaCor(''); setDiaVenc('')
      setMonto(''); setActivo(1); setFechaIn(''); setFechaFin('')
    }
    setError(null)
  }, [ciclo, show])

  const handleSubmit = async () => {
    if (!idPropiedad)    return setError('ID Propiedad es requerido')
    if (!idTipoServicio) return setError('ID Tipo Servicio es requerido')
    if (!diaCorte)       return setError('Día de corte es requerido')
    if (!diaVencimiento) return setError('Día de vencimiento es requerido')
    if (!fechaInicio)    return setError('Fecha inicio es requerida')
    setLoading(true); setError(null)
    try {
      const payload = {
        idCiclo: ciclo ? ciclo.idCiclo : 0,
        idPropiedad: Number(idPropiedad),
        idTipoServicio: Number(idTipoServicio),
        diaCorte: Number(diaCorte),
        diaVencimiento: Number(diaVencimiento),
        montoOverride: Number(montoOverride) || null,
        activo: Number(activo),
        fechaInicio: fechaInicio ? `${fechaInicio}T00:00:00` : null,
        fechaFin: fechaFin ? `${fechaFin}T00:00:00` : null,
      }
      console.log(payload);
      ciclo ? await updateCiclo(payload) : await createCiclo(payload)
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
              <h5 className="modal-title">{ciclo ? '✏️ Editar Ciclo' : '🔄 Nuevo Ciclo de Facturación'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Propiedad" required
                    fetchFn={getPropiedades}
                    getId={p => p.id_propiedad ?? p.id}
                    getLabel={p => p.codigo ?? p.nombre ?? `#${p.id_propiedad ?? p.id}`}
                    value={idPropiedad}
                    displayValue={labelProp}
                    onChange={(id, lbl) => { setIdProp(id); setLabelProp(lbl) }}
                    placeholder="Selecciona propiedad..."
                  />
                </div>
                <div className="col-md-6">
                  <FkSelector
                    label="Tipo Servicio" required
                    fetchFn={getTipoServicios}
                    getId={s => s.idTipoServicio ?? s.id}
                    getLabel={s => s.nombre ?? s.descripcion ?? `#${s.idTipoServicio ?? s.id}`}
                    value={idTipoServicio}
                    displayValue={labelServ}
                    onChange={(id, lbl) => { setIdServ(id); setLabelServ(lbl) }}
                    placeholder="Selecciona servicio..."
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Día Corte <span className="text-danger">*</span></label>
                  <input type="number" min="1" max="31" className="form-control" value={diaCorte} onChange={e => setDiaCor(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Día Vencimiento <span className="text-danger">*</span></label>
                  <input type="number" min="1" max="31" className="form-control" value={diaVencimiento} onChange={e => setDiaVenc(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Monto Override</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={montoOverride} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={activo} onChange={e => setActivo(e.target.value)}>
                    <option value={1}>Activo</option><option value={0}>Inactivo</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Fecha Inicio <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaIn(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Fecha Fin</label>
                  <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : ciclo ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}