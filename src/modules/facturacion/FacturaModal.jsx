import { useState, useEffect } from 'react'
import { createFactura, updateFactura } from './facturacionService'

const ESTADOS = ['PENDIENTE', 'PAGADA', 'VENCIDA', 'ANULADA', 'EN_PROCESO']

export default function FacturaModal({ show, onClose, onSaved, factura }) {

  // ── Campos ───────────────────────────────────────────────
  const [idTipoDocFiscal,      setIdTipoDoc]    = useState('')
  const [idCorrelativo,        setIdCorrel]     = useState('')
  const [serie,                setSerie]        = useState('')
  const [numeroFactura,        setNumFact]      = useState('')
  const [numeroAutorizacionSat,setNumSat]       = useState('')
  const [idPropiedad,          setIdProp]       = useState('')
  const [idResidente,          setIdRes]        = useState('')
  const [receptorNombre,       setRecNombre]    = useState('')
  const [receptorNit,          setRecNit]       = useState('')
  const [receptorDireccion,    setRecDir]       = useState('')
  const [fechaEmision,         setFechaEmis]    = useState('')
  const [fechaVencimiento,     setFechaVenc]    = useState('')
  const [periodoInicio,        setPeriodoIn]    = useState('')
  const [periodoFin,           setPeriodoFin]   = useState('')
  const [idMoneda,             setIdMoneda]     = useState('')
  const [tipoCambio,           setTipoCambio]   = useState('')
  const [subtotal,             setSubtotal]     = useState('')
  const [totalDescuentos,      setTotalDesc]    = useState('0')
  const [baseImponible,        setBaseImp]      = useState('')
  const [totalIva,             setTotalIva]     = useState('')
  const [total,                setTotal]        = useState('')
  const [totalEnLetras,        setTotalLetras]  = useState('')
  const [saldoPendiente,       setSaldoPend]    = useState('')
  const [estado,               setEstado]       = useState('PENDIENTE')
  const [idCicloOrigen,        setIdCiclo]      = useState('')
  const [idContratoOrigen,     setIdContrato]   = useState('')
  const [motivoAnulacion,      setMotivo]       = useState('')
  const [observaciones,        setObs]          = useState('')

  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  // ── Poblar al editar ─────────────────────────────────────
  useEffect(() => {
    if (factura) {
      setIdTipoDoc(factura.idTipoDocFiscal      ?? '')
      setIdCorrel(factura.idCorrelativo         ?? '')
      setSerie(factura.serie                    ?? '')
      setNumFact(factura.numeroFactura          ?? '')
      setNumSat(factura.numeroAutorizacionSat   ?? '')
      setIdProp(factura.idPropiedad             ?? '')
      setIdRes(factura.idResidente              ?? '')
      setRecNombre(factura.receptorNombre       ?? '')
      setRecNit(factura.receptorNit             ?? '')
      setRecDir(factura.receptorDireccion       ?? '')
      setFechaEmis(factura.fechaEmision         ? factura.fechaEmision.substring(0, 10) : '')
      setFechaVenc(factura.fechaVencimiento     ? factura.fechaVencimiento.substring(0, 10) : '')
      setPeriodoIn(factura.periodoInicio        ? factura.periodoInicio.substring(0, 10) : '')
      setPeriodoFin(factura.periodoFin          ? factura.periodoFin.substring(0, 10) : '')
      setIdMoneda(factura.idMoneda              ?? '')
      setTipoCambio(factura.tipoCambio          ?? '')
      setSubtotal(factura.subtotal              ?? '')
      setTotalDesc(factura.totalDescuentos      ?? '0')
      setBaseImp(factura.baseImponible          ?? '')
      setTotalIva(factura.totalIva              ?? '')
      setTotal(factura.total                    ?? '')
      setTotalLetras(factura.totalEnLetras      ?? '')
      setSaldoPend(factura.saldoPendiente       ?? '')
      setEstado(factura.estado                  ?? 'PENDIENTE')
      setIdCiclo(factura.idCicloOrigen          ?? '')
      setIdContrato(factura.idContratoOrigen    ?? '')
      setMotivo(factura.motivoAnulacion         ?? '')
      setObs(factura.observaciones              ?? '')
    } else {
      setIdTipoDoc(''); setIdCorrel(''); setSerie(''); setNumFact('')
      setNumSat(''); setIdProp(''); setIdRes(''); setRecNombre('')
      setRecNit(''); setRecDir(''); setFechaEmis(''); setFechaVenc('')
      setPeriodoIn(''); setPeriodoFin(''); setIdMoneda(''); setTipoCambio('')
      setSubtotal(''); setTotalDesc('0'); setBaseImp(''); setTotalIva('')
      setTotal(''); setTotalLetras(''); setSaldoPend(''); setEstado('PENDIENTE')
      setIdCiclo(''); setIdContrato(''); setMotivo(''); setObs('')
    }
    setError(null)
  }, [factura, show])

  // ── Submit ───────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!receptorNombre.trim()) return setError('El nombre del receptor es requerido')
    if (!receptorNit.trim())    return setError('El NIT del receptor es requerido')
    if (!fechaEmision)          return setError('La fecha de emisión es requerida')
    if (!fechaVencimiento)      return setError('La fecha de vencimiento es requerida')

    setLoading(true); setError(null)
    try {
      const payload = {
        id:                    factura ? factura.id : 0,
        idTipoDocFiscal:       Number(idTipoDocFiscal)   || null,
        idCorrelativo:         Number(idCorrelativo)      || null,
        serie,
        numeroFactura,
        numeroAutorizacionSat,
        idPropiedad:           Number(idPropiedad)        || null,
        idResidente:           Number(idResidente)        || null,
        receptorNombre,
        receptorNit,
        receptorDireccion,
        fechaEmision,
        fechaVencimiento,
        periodoInicio:         periodoInicio   || null,
        periodoFin:            periodoFin      || null,
        idMoneda:              Number(idMoneda)           || null,
        tipoCambio:            Number(tipoCambio)         || null,
        subtotal:              Number(subtotal)           || 0,
        totalDescuentos:       Number(totalDescuentos)    || 0,
        baseImponible:         Number(baseImponible)      || 0,
        totalIva:              Number(totalIva)           || 0,
        total:                 Number(total)              || 0,
        totalEnLetras,
        saldoPendiente:        Number(saldoPendiente)     || 0,
        estado,
        idCicloOrigen:         Number(idCicloOrigen)      || null,
        idContratoOrigen:      Number(idContratoOrigen)   || null,
        motivoAnulacion,
        observaciones,
      }

      // Con backend real:
      // factura ? await updateFactura(factura.id, payload) : await createFactura(payload)

      onSaved(payload)
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
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">

            {/* Header */}
            <div className="modal-header">
              <h5 className="modal-title">
                {factura ? '✏️ Editar Factura' : '🧾 Nueva Factura'}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>

            {/* Body */}
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />{error}
                </div>
              )}

              {/* ── Sección 1: Datos fiscales ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-file-earmark-text me-1" />DATOS FISCALES
              </p>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">ID Tipo Doc. Fiscal</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idTipoDocFiscal} onChange={e => setIdTipoDoc(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">ID Correlativo</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idCorrelativo} onChange={e => setIdCorrel(e.target.value)} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Serie</label>
                  <input className="form-control form-control-sm" placeholder="Ej. A"
                    value={serie} onChange={e => setSerie(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Número Factura</label>
                  <input className="form-control form-control-sm" placeholder="Ej. 00000001"
                    value={numeroFactura} onChange={e => setNumFact(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">No. Autorización SAT</label>
                  <input className="form-control form-control-sm"
                    placeholder="Número de autorización SAT"
                    value={numeroAutorizacionSat} onChange={e => setNumSat(e.target.value)} />
                </div>
              </div>

              {/* ── Sección 2: Receptor ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-person me-1" />DATOS DEL RECEPTOR
              </p>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">ID Propiedad (FK)</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idPropiedad} onChange={e => setIdProp(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">ID Residente (FK)</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idResidente} onChange={e => setIdRes(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Nombre Receptor <span className="text-danger">*</span>
                  </label>
                  <input className="form-control form-control-sm" autoFocus
                    placeholder="Nombre completo"
                    value={receptorNombre} onChange={e => setRecNombre(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">
                    NIT <span className="text-danger">*</span>
                  </label>
                  <input className="form-control form-control-sm" placeholder="CF o NIT"
                    value={receptorNit} onChange={e => setRecNit(e.target.value)} />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Dirección</label>
                  <input className="form-control form-control-sm"
                    placeholder="Ciudad, Zona"
                    value={receptorDireccion} onChange={e => setRecDir(e.target.value)} />
                </div>
              </div>

              {/* ── Sección 3: Fechas y período ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-calendar me-1" />FECHAS Y PERÍODO
              </p>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Fecha Emisión <span className="text-danger">*</span>
                  </label>
                  <input type="date" className="form-control form-control-sm"
                    value={fechaEmision} onChange={e => setFechaEmis(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    Fecha Vencimiento <span className="text-danger">*</span>
                  </label>
                  <input type="date" className="form-control form-control-sm"
                    value={fechaVencimiento} onChange={e => setFechaVenc(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Período Inicio</label>
                  <input type="date" className="form-control form-control-sm"
                    value={periodoInicio} onChange={e => setPeriodoIn(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Período Fin</label>
                  <input type="date" className="form-control form-control-sm"
                    value={periodoFin} onChange={e => setPeriodoFin(e.target.value)} />
                </div>
              </div>

              {/* ── Sección 4: Moneda y montos ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-cash-stack me-1" />MONEDA Y MONTOS
              </p>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">ID Moneda (FK)</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idMoneda} onChange={e => setIdMoneda(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Tipo Cambio</label>
                  <input type="number" step="0.000001" className="form-control form-control-sm"
                    placeholder="1.000000"
                    value={tipoCambio} onChange={e => setTipoCambio(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Subtotal</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={subtotal} onChange={e => setSubtotal(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Total Descuentos</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={totalDescuentos} onChange={e => setTotalDesc(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Base Imponible</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={baseImponible} onChange={e => setBaseImp(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Total IVA</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={totalIva} onChange={e => setTotalIva(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Total</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={total} onChange={e => setTotal(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Saldo Pendiente</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={saldoPendiente} onChange={e => setSaldoPend(e.target.value)} />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Total en Letras</label>
                  <input className="form-control form-control-sm"
                    placeholder="Ej. Novecientos cincuenta y dos quetzales exactos"
                    value={totalEnLetras} onChange={e => setTotalLetras(e.target.value)} />
                </div>
              </div>

              {/* ── Sección 5: Estado y origen ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-gear me-1" />ESTADO Y ORIGEN
              </p>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select form-select-sm"
                    value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">ID Ciclo Origen (FK)</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idCicloOrigen} onChange={e => setIdCiclo(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">ID Contrato Origen (FK)</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idContratoOrigen} onChange={e => setIdContrato(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Motivo Anulación</label>
                  <input className="form-control form-control-sm"
                    placeholder="Solo si aplica"
                    value={motivoAnulacion} onChange={e => setMotivo(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>

            </div>

            {/* Footer */}
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : factura ? 'Guardar cambios' : 'Crear Factura'}
              </button>
            </div>

          </div>
        </div>
      </div>
    </>
  )
}