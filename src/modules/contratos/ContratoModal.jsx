import { useState, useEffect } from 'react'
import { createContrato, updateContrato } from './contratoService'
import FkSelector from '../../components/FkSelector'
import { getPropiedades } from '../catalogos/propiedadService'
import { getResidentes } from '../residentes/residenteService'
import { getTipoMonedas } from '../catalogos/tipoMonedaService'
import { getTiposContrato } from '../catalogos/tipoContratoService'

const TIPOS   = ['ARRENDAMIENTO', 'COMPRAVENTA', 'USUFRUCTO', 'OTRO']
const ESTADOS = ['ACTIVO','FINALIZADO','CANCELADO','EN_MORA']

export default function ContratoModal({ show, onClose, onSaved, contrato }) {
  const [idPropiedad,      setIdProp]       = useState('')
  const [labelPropiedad,   setLabelProp]    = useState('')
  const [idResidente,      setIdRes]        = useState('')
  const [labelResidente,   setLabelRes]     = useState('')
  const [idTipoContrato,   setIdTipo]       = useState('')
  const [labelTipo,        setLabelTipo]    = useState('')
  const [tipoContrato,     setTipoCont]     = useState('ARRENDAMIENTO')
  const [fechaInicio,      setFechaIn]      = useState('')
  const [fechaFin,         setFechaFin]     = useState('')
  const [monto,            setMonto]        = useState('')
  const [idMoneda,         setIdMoneda]     = useState('')
  const [labelMoneda,      setLabelMoneda]  = useState('')
  const [depositoGarantia, setDeposito]     = useState('')
  const [estado,           setEstado]       = useState('ACTIVO')
  const [documentoUrl,     setDocUrl]       = useState('')
  const [observaciones,    setObs]          = useState('')
  const [loading,          setLoading]      = useState(false)
  const [error,            setError]        = useState(null)

  useEffect(() => {
    if (!show) return
    if (contrato) {
      setIdProp(contrato.id_propiedad      ?? ''); setLabelProp('')
      setIdRes(contrato.id_Residente       ?? ''); setLabelRes('')
      setIdTipo(contrato.idTipoContrato   ?? ''); setLabelTipo('')
      setTipoCont(contrato.tipoContrato   ?? 'ARRENDAMIENTO')
      setFechaIn(contrato.fechaInicio?.substring(0, 10)  ?? '')
      setFechaFin(contrato.fechaFin?.substring(0, 10)    ?? '')
      setMonto(contrato.monto             ?? '')
      setIdMoneda(contrato.idMoneda       ?? ''); setLabelMoneda('')
      setDeposito(contrato.depositoGarantia ?? '')
      setEstado(contrato.estado           ?? 'ACTIVO')
      setDocUrl(contrato.documentoUrl     ?? '')
      setObs(contrato.observaciones       ?? '')
    } else {
      setIdProp(''); setLabelProp(''); setIdRes(''); setLabelRes('')
      setIdTipo(''); setLabelTipo(''); setTipoCont('ARRENDAMIENTO')
      setFechaIn(''); setFechaFin(''); setMonto('')
      setIdMoneda(''); setLabelMoneda(''); setDeposito('')
      setEstado('ACTIVO'); setDocUrl(''); setObs('')
    }
    setError(null)
  }, [show]) // eslint-disable-line

  const handleSubmit = async () => {
    if (!idPropiedad) return setError('Propiedad es requerida')
    if (!idResidente) return setError('Residente es requerido')
    if (!fechaInicio) return setError('Fecha de inicio es requerida')
    if (!monto)       return setError('El monto es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id_contrato:               contrato ? contrato.id_contrato : 0,
        id_propiedad:      Number(idPropiedad),
        id_residente:      Number(idResidente),
        id_tipo_contrato:   Number(idTipoContrato) || null,
        tipo_contrato:       tipoContrato,     
        fecha_inicio:        fechaInicio,
        fecha_fin:         fechaFin || null,
        monto:            Number(monto),
        id_moneda:         Number(idMoneda)         || null,
        deposito_garantia: Number(depositoGarantia) || null,
        estado: estado, 
        documentoUrl, observaciones,
      }
      console.log(payload);
      contrato
        ? await updateContrato(contrato.id_contrato, payload)
        : await createContrato(payload)
      onSaved()
    } catch (err) { setError(err.response?.data?.message ?? err.message) }
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
              <h5 className="modal-title">{contrato ? '✏️ Editar Contrato' : '🧾 Nuevo Contrato'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />{error}
                </div>
              )}
              <div className="row g-3">

                {/* ✅ FK Propiedad */}
                <div className="col-md-6">
                  <FkSelector
                    label="Propiedad" required
                    fetchFn={getPropiedades}
                    getId={p => p.id_propiedad ?? p.id}
                    getLabel={p => p.nombre ?? p.codigo ?? p.descripcion ?? `#${p.id_propiedad ?? p.id}`}
                    value={idPropiedad}
                    displayValue={labelPropiedad}
                    onChange={(id, lbl) => { setIdProp(id); setLabelProp(lbl) }}
                    placeholder="Selecciona propiedad..."
                  />
                </div>

                {/* ✅ FK Residente */}
                <div className="col-md-6">
                  <FkSelector
                    label="Residente" required
                    fetchFn={getResidentes}
                    getId={r => r.id_Residente ?? r.id}
                    getLabel={r => r.nombres
                      ? `${r.nombres} ${r.apellidos ?? ''}`.trim()
                      : `#${r.id_Residente ?? r.id}`}
                    value={idResidente}
                    displayValue={labelResidente}
                    onChange={(id, lbl) => { setIdRes(id); setLabelRes(lbl) }}
                    placeholder="Selecciona residente..."
                  />
                </div>

                <div className="col-md-6">
                  <FkSelector
                    label="Tipo Contrato"
                    fetchFn={getTiposContrato}
                    getId={t => t.idTipoContrato ?? t.id}
                    getLabel={t => t.nombre ?? t.descripcion ?? `#${t.idTipoContrato ?? t.id}`}
                    value={idTipoContrato}
                    displayValue={labelTipo}
                    onChange={(id, lbl) => { setIdTipo(id); setLabelTipo(lbl) }}
                    placeholder="Selecciona tipo contrato..."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Estado</label>
                  <select className="form-select form-select-sm" value={estado}
                    onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Fecha Inicio <span className="text-danger">*</span>
                  </label>
                  <input type="date" className="form-control form-control-sm"
                    value={fechaInicio} onChange={e => setFechaIn(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Fecha Fin</label>
                  <input type="date" className="form-control form-control-sm"
                    value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>

                {/* ✅ FK Moneda */}
                <div className="col-md-4">
                  <FkSelector
                    label="Moneda"
                    fetchFn={getTipoMonedas}
                    getId={m => m.idTipoMoneda ?? m.id}
                    getLabel={m => m.nombre ?? m.codigo ?? `#${m.idTipoMoneda ?? m.id}`}
                    value={idMoneda}
                    displayValue={labelMoneda}
                    onChange={(id, lbl) => { setIdMoneda(id); setLabelMoneda(lbl) }}
                    placeholder="Selecciona moneda..."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Monto <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={monto} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Depósito Garantía</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={depositoGarantia} onChange={e => setDeposito(e.target.value)} />
                  </div>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>URL Documento</label>
                  <input className="form-control form-control-sm" placeholder="https://..."
                    value={documentoUrl} onChange={e => setDocUrl(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Observaciones</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : contrato ? 'Guardar cambios' : 'Crear Contrato'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}