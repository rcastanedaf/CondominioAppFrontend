import { useState, useEffect } from 'react'
import { createPago, updatePago } from './pagoService'
import FkSelector from '../../components/FkSelector'
import { getFacturasByPropiedad } from '../facturacion/facturacionService'
import { getTipoMonedas } from '../catalogos/tipoMonedaService'
import { getMetodosPago } from '../catalogos/metodoPagoService'
import { getBancos } from '../catalogos/bancoService'
import { getPersonas } from '../residentes/personaService'

const ESTADOS = ['PENDIENTE', 'CONFIRMADO', 'RECHAZADO', 'REVERTIDO']

export default function PagoModal({ show, onClose, onSaved, pago, facturaInicial, residente }) {
  const [idFactura,        setIdFactura]        = useState('')
  const [labelFactura,     setLabelFactura]      = useState('')
  const [numeroRecibo,     setNumRecibo]         = useState('')
  const [fechaPago,        setFechaPago]         = useState('')
  const [fechaValor,       setFechaValor]        = useState('')
  const [montoPagado,      setMonto]             = useState('')
  const [idMoneda,         setIdMoneda]          = useState('')
  const [labelMoneda,      setLabelMoneda]       = useState('')
  const [tipoCambio,       setTipoCambio]        = useState('')
  const [montoEnGtq,       setMontoGtq]          = useState('')
  const [idMetodoPago,     setMetodo]            = useState('')
  const [labelMetodo,      setLabelMetodo]       = useState('')
  const [idBancoOrigen,    setBancoOr]           = useState('')
  const [labelBancoOr,     setLabelBancoOr]      = useState('')
  const [idBancoDest,      setBancoDest]         = useState('')
  const [labelBancoDest,   setLabelBancoDest]    = useState('')
  const [referencia,       setReferencia]        = useState('')
  const [imagenUrl,        setImgUrl]            = useState('')
  const [estado,           setEstado]            = useState('PENDIENTE')
  const [observaciones,    setObs]               = useState('')
  const [registradoPor,    setRegistradoPor]     = useState('')
  const [labelRegistrado,  setLabelRegistrado]   = useState('')
  const [loading,          setLoading]           = useState(false)
  const [error,            setError]             = useState(null)

  useEffect(() => {
    if (!show) return
    if (pago) {
      setIdFactura(pago.idFactura      ?? '')
      setLabelFactura(pago.idFactura   ? `Factura #${pago.idFactura}` : '')
      setNumRecibo(pago.numeroRecibo   ?? '')
      setFechaPago(pago.fechaPago?.substring(0, 10)  ?? '')
      setFechaValor(pago.fechaValor?.substring(0, 10) ?? '')
      setMonto(pago.montoPagado        ?? '')
      setIdMoneda(pago.idMoneda        ?? ''); setLabelMoneda('')
      setTipoCambio(pago.tipoCambio    ?? '')
      setMontoGtq(pago.montoEnGtq      ?? '')
      setMetodo(pago.idMetodoPago      ?? ''); setLabelMetodo('')
      setBancoOr(pago.idBancoOrigen    ?? ''); setLabelBancoOr('')
      setBancoDest(pago.idBancoDestino ?? ''); setLabelBancoDest('')
      setReferencia(pago.referencia    ?? '')
      setImgUrl(pago.imagenVoucherUrl  ?? '')
      setEstado(pago.estado            ?? 'PENDIENTE')
      setObs(pago.observaciones        ?? '')
      setRegistradoPor(pago.registradoPor ?? ''); setLabelRegistrado('')
    } else if (facturaInicial) {
      setIdFactura(facturaInicial.idFactura ?? '')
      setLabelFactura(
        facturaInicial.serie
          ? `${facturaInicial.serie}-${facturaInicial.numeroFactura} — ${facturaInicial.receptorNombre}`
          : `#${facturaInicial.idFactura} — ${facturaInicial.receptorNombre}`
      )
      setMonto(facturaInicial.saldoPendiente ?? facturaInicial.total ?? '')
      setNumRecibo(''); setFechaPago(''); setFechaValor('')
      setIdMoneda(facturaInicial.idMoneda ?? ''); setLabelMoneda('')
      setTipoCambio(''); setMontoGtq('')
      setMetodo(''); setLabelMetodo('')
      setBancoOr(''); setLabelBancoOr('')
      setBancoDest(''); setLabelBancoDest('')
      setReferencia(''); setImgUrl('')
      setEstado('PENDIENTE'); setObs('')
      setRegistradoPor(''); setLabelRegistrado('')
    } else {
      setIdFactura(''); setLabelFactura(''); setNumRecibo('')
      setFechaPago(''); setFechaValor(''); setMonto('')
      setIdMoneda(''); setLabelMoneda(''); setTipoCambio(''); setMontoGtq('')
      setMetodo(''); setLabelMetodo('')
      setBancoOr(''); setLabelBancoOr('')
      setBancoDest(''); setLabelBancoDest('')
      setReferencia(''); setImgUrl(''); setEstado('PENDIENTE'); setObs('')
      setRegistradoPor(''); setLabelRegistrado('')
    }
    setError(null)
  }, [show]) // eslint-disable-line

  const camposFaltantes = [
    !idFactura      && 'Factura',
    !numeroRecibo   && 'Número de recibo',
    !fechaPago      && 'Fecha de pago',
    !fechaValor     && 'Fecha valor',
    !montoPagado    && 'Monto pagado',
    !registradoPor  && 'Registrado por',
  ].filter(Boolean)

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      const payload = {
        // ✅ FIX: lee idPago primero, luego id como fallback (por el normalize de PagosResidente)
        IdPago:           pago ? (pago.idPago ?? pago.id ?? 0) : 0,
        IdFactura:        Number(idFactura),
        NumeroRecibo:     numeroRecibo,
        FechaPago:        fechaPago,
        FechaValor:       fechaValor,
        MontoPagado:      Number(montoPagado),
        IdMoneda:         Number(idMoneda)       || null,
        TipoCambio:       Number(tipoCambio)     || null,
        MontoEnGtq:       Number(montoEnGtq)     || null,
        IdMetodoPago:     Number(idMetodoPago)   || null,
        IdBancoOrigen:    Number(idBancoOrigen)  || null,
        IdBancoDestino:   Number(idBancoDest)    || null,
        Referencia:       referencia,
        ImagenVoucherUrl: imagenUrl,
        Estado:           estado,
        RegistradoPor:    Number(registradoPor),
        AprobadoPor:      null,
        Observaciones:    observaciones,
      }
      pago ? await updatePago(payload) : await createPago(payload)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally { setLoading(false) }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{pago ? '✏️ Editar Pago' : '💳 Nuevo Pago'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {camposFaltantes.length > 0 && (
                <div className="alert alert-danger py-2 mb-3 d-flex align-items-start gap-2">
                  <i className="bi bi-exclamation-circle-fill mt-1" style={{ flexShrink: 0 }} />
                  <div>
                    <strong>Campos requeridos:</strong>{' '}
                    {camposFaltantes.join(', ')}
                  </div>
                </div>
              )}
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />{error}
                </div>
              )}
              <div className="row g-3">

                {/* Factura */}
                <div className="col-md-8">
                  <FkSelector
                    label="Factura" required
                    invalid={!idFactura}
                    fetchFn={() =>
                      getFacturasByPropiedad(residente?.id_Propiedad).then(res => {
                        const all = Array.isArray(res.data) ? res.data : res.data?.data ?? []
                        return { data: all.filter(f => f.idResidente === residente?.id) }
                      })
                    }
                    getId={f => f.idFactura}
                    getLabel={f => f.serie
                      ? `${f.serie}-${f.numeroFactura} — ${f.receptorNombre ?? ''}`
                      : `#${f.idFactura} — ${f.receptorNombre ?? ''}`}
                    value={idFactura}
                    displayValue={labelFactura}
                    onChange={(id, lbl, f) => {
                      setIdFactura(id)
                      setLabelFactura(lbl)
                      if (f) {
                        setIdMoneda(f.idMoneda ?? '')
                        setTipoCambio(f.tipoCambio ?? '')
                        const monto = f.saldoPendiente ?? f.total ?? ''
                        setMonto(monto)
                        setMontoGtq(
                          monto && f.tipoCambio
                            ? (Number(monto) * Number(f.tipoCambio)).toFixed(2)
                            : monto ?? ''
                        )
                      }
                    }}
                    placeholder="Selecciona una factura..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Número Recibo <span className="text-danger">*</span></label>
                  <input
                    className={`form-control form-control-sm${!numeroRecibo ? ' is-invalid' : ''}`}
                    value={numeroRecibo} onChange={e => setNumRecibo(e.target.value)} />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Fecha Pago <span className="text-danger">*</span>
                  </label>
                  <input type="date"
                    className={`form-control form-control-sm${!fechaPago ? ' is-invalid' : ''}`}
                    value={fechaPago} onChange={e => setFechaPago(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Fecha Valor <span className="text-danger">*</span>
                  </label>
                  <input type="date"
                    className={`form-control form-control-sm${!fechaValor ? ' is-invalid' : ''}`}
                    value={fechaValor} onChange={e => setFechaValor(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Monto Pagado <span className="text-danger">*</span>
                  </label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01"
                      className={`form-control${!montoPagado ? ' is-invalid' : ''}`}
                      value={montoPagado} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>

                {/* Moneda */}
                <div className="col-md-4">
                  <FkSelector
                    label="Moneda"
                    fetchFn={getTipoMonedas}
                    getId={m => m.idTipoMoneda ?? m.id}
                    getLabel={m => m.nombre ?? m.descripcion ?? m.codigo ?? `#${m.idTipoMoneda ?? m.id}`}
                    value={idMoneda}
                    displayValue={labelMoneda}
                    onChange={(id, lbl) => { setIdMoneda(id); setLabelMoneda(lbl) }}
                    placeholder="Selecciona moneda..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Tipo Cambio</label>
                  <input type="number" step="0.000001" className="form-control form-control-sm"
                    placeholder="1.000000" value={tipoCambio}
                    onChange={e => setTipoCambio(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Monto en GTQ</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={montoEnGtq} onChange={e => setMontoGtq(e.target.value)} />
                  </div>
                </div>

                {/* Método de pago */}
                <div className="col-md-4">
                  <FkSelector
                    label="Método de Pago"
                    fetchFn={getMetodosPago}
                    getId={m => m.idMetodoPago ?? m.id}
                    getLabel={m => m.nombre ?? m.descripcion ?? `#${m.idMetodoPago ?? m.id}`}
                    value={idMetodoPago}
                    displayValue={labelMetodo}
                    onChange={(id, lbl) => { setMetodo(id); setLabelMetodo(lbl) }}
                    placeholder="Selecciona método..."
                  />
                </div>

                {/* Banco Origen */}
                <div className="col-md-4">
                  <FkSelector
                    label="Banco Origen"
                    fetchFn={getBancos}
                    getId={b => b.idBanco ?? b.id}
                    getLabel={b => b.nombre ?? b.descripcion ?? `#${b.idBanco ?? b.id}`}
                    value={idBancoOrigen}
                    displayValue={labelBancoOr}
                    onChange={(id, lbl) => { setBancoOr(id); setLabelBancoOr(lbl) }}
                    placeholder="Selecciona banco..."
                  />
                </div>

                {/* Banco Destino */}
                <div className="col-md-4">
                  <FkSelector
                    label="Banco Destino"
                    fetchFn={getBancos}
                    getId={b => b.idBanco ?? b.id}
                    getLabel={b => b.nombre ?? b.descripcion ?? `#${b.idBanco ?? b.id}`}
                    value={idBancoDest}
                    displayValue={labelBancoDest}
                    onChange={(id, lbl) => { setBancoDest(id); setLabelBancoDest(lbl) }}
                    placeholder="Selecciona banco..."
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Estado</label>
                  <select className="form-select form-select-sm" value={estado}
                    onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>

                {/* Registrado Por */}
                <div className="col-md-6">
                  <FkSelector
                    label="Registrado Por" required
                    invalid={!registradoPor}
                    fetchFn={getPersonas}
                    getId={p => p.id_Persona ?? p.Id_Persona ?? p.idPersona ?? p.id}
                    getLabel={p => p.nombres
                      ? `${p.nombres} ${p.apellidos ?? ''}`.trim()
                      : `#${p.id_Persona ?? p.idPersona ?? p.id}`}
                    value={registradoPor}
                    displayValue={labelRegistrado}
                    onChange={(id, lbl) => { setRegistradoPor(id); setLabelRegistrado(lbl) }}
                    placeholder="Selecciona persona..."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Referencia</label>
                  <input className="form-control form-control-sm" value={referencia}
                    onChange={e => setReferencia(e.target.value)} />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>URL Voucher</label>
                  <input className="form-control form-control-sm" placeholder="https://..."
                    value={imagenUrl} onChange={e => setImgUrl(e.target.value)} />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Observaciones</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || camposFaltantes.length > 0}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : pago ? 'Guardar cambios' : 'Crear Pago'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
