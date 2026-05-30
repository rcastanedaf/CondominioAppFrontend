import { useState, useEffect, useCallback } from 'react'
import { getReservas, cambiarEstadoReserva }    from './reservaService'
import { getEspacios }                          from './espacioComunService'
import { getResidentes }                        from '../residentes/residenteService'
import { getPersonas }                          from '../residentes/personaService'
import { createFactura, getNextCorrelative }    from '../facturacion/facturacionService'
import { createPago }                           from '../pagos/pagoService'
import { getMetodosPago }                       from '../catalogos/metodoPagoService'
import { usePaginacion }                        from '../../shared/hooks/usePaginacion'
import PaginacionFooter                         from '../../shared/components/PaginacionFooter'

const fmt = (n) =>
  `Q ${Number(n ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`

// ─────────────────────────────────────────────────────────────
//  Tabla principal
// ─────────────────────────────────────────────────────────────
export default function CobroReservaTable({ moduleColor }) {
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [msg,        setMsg]        = useState(null)
  const [reservaSel, setReservaSel] = useState(null)

  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  const fetchData = useCallback(() => {
    setLoading(true); setError(null)
    Promise.all([getReservas(), getEspacios(), getResidentes(), getPersonas()])
      .then(([rRes, eRes, resRes, perRes]) => {
        const todas      = rRes.data?.data  ?? []
        const espacios   = eRes.data?.data  ?? []
        const residentes = resRes.data?.data ?? []
        const personas   = perRes.data?.data ?? []

        const aprobadas = todas.filter(r =>
          (r.estado ?? '').toUpperCase() === 'APROBADA'
        )

        const enriched = aprobadas.map(r => {
          const idEsp = r.id_Espacio ?? r.Id_Espacio ?? r.idEspacio
          const espacio = espacios.find(
            e => (e.id_Espacio ?? e.Id_Espacio ?? e.id ?? e.idEspacio) === idEsp
          )
          const idRes = r.id_Residente ?? r.Id_Residente ?? r.idResidente
          const residente = residentes.find(
            res => (res.id_Residente ?? res.idResidente) === idRes
          )
          const persona = personas.find(
            p => (p.id_Persona ?? p.idPersona) ===
                 (residente?.id_Persona ?? residente?.idPersona)
          )
          // Calcular monto según duración y tarifa del espacio
          const costoPorHora = Number(espacio?.costo_Por_Hora ?? espacio?.Costo_Por_Hora ?? 0)
          const costoPorDia  = Number(espacio?.costo_Por_Dia  ?? espacio?.Costo_Por_Dia  ?? 0)
          const deposito     = Number(espacio?.deposito_Garantia ?? espacio?.Deposito_Garantia ?? 0)
          const tieneCosto   = Number(espacio?.tiene_Costo ?? espacio?.Tiene_Costo ?? 0)

          let montoCalculado = 0
          if (tieneCosto) {
            const hIni = r.hora_Inicio ?? r.horaInicio ?? ''
            const hFin = r.hora_Fin   ?? r.horaFin    ?? ''
            if (costoPorHora > 0 && hIni && hFin) {
              const [h1, m1] = hIni.split(':').map(Number)
              const [h2, m2] = hFin.split(':').map(Number)
              const horas = ((h2 * 60 + m2) - (h1 * 60 + m1)) / 60
              montoCalculado = +(costoPorHora * Math.max(horas, 0)).toFixed(2)
            } else if (costoPorDia > 0) {
              montoCalculado = costoPorDia
            }
          }

          return {
            ...r,
            _idReserva:        r.id_Reserva ?? r.Id_Reserva ?? r.id,
            _idPropiedad:      r.id_Propiedad ?? r.Id_Propiedad ?? r.idPropiedad,
            _idResidente:      idRes,
            _nombreEspacio:    espacio?.nombre ?? `Espacio #${idEsp}`,
            _nombreResidente:  persona
              ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
              : `Residente #${idRes}`,
            _costoPorHora:     costoPorHora,
            _costoPorDia:      costoPorDia,
            _depositoGarantia: deposito,
            _montoCalculado:   montoCalculado,
          }
        })
        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" />Cargando reservas...
    </div>
  )
  if (error) return (
    <div className="alert alert-danger py-2">
      <i className="bi bi-exclamation-circle me-2" />{error}
      <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchData}>Reintentar</button>
    </div>
  )

  return (
    <>
      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible py-2 mx-3 mt-3`}>
          {msg.text}
          <button className="btn-close" onClick={() => setMsg(null)} />
        </div>
      )}

      <PaginacionFooter
        titulo="Cobro de Reservas" icono="bi-cash-coin" moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por espacio o residente..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="reservas pendientes de cobro"
      />

      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Espacio</th><th>Residente</th>
              <th>Fecha</th><th>Horario</th><th>Personas</th>
              <th>Monto</th><th>Depósito</th><th>Estado</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted py-4">
                  <i className="bi bi-check-circle-fill text-success me-2" />
                  No hay reservas aprobadas pendientes de cobro
                </td>
              </tr>
            ) : datosPagina.map((r, i) => {
              const monto   = r.monto_Cobro ?? r.montoCobro ?? 0
              const deposito = r.deposito_Cobrado ?? r.depositoCobrado ?? 0
              return (
                <tr key={r._idReserva ?? i}>
                  <td className="text-muted">{r._idReserva}</td>
                  <td className="fw-semibold">{r._nombreEspacio}</td>
                  <td>{r._nombreResidente}</td>
                  <td>{String(r.fecha_Reserva ?? r.fechaReserva ?? '').slice(0, 10)}</td>
                  <td className="text-muted small">
                    {r.hora_Inicio ?? r.horaInicio ?? '—'} – {r.hora_Fin ?? r.horaFin ?? '—'}
                  </td>
                  <td>{r.num_Personas ?? r.numPersonas ?? '—'}</td>
                  <td className="fw-semibold text-success">{fmt(monto)}</td>
                  <td>{deposito > 0 ? fmt(deposito) : <span className="text-muted">—</span>}</td>
                  <td><span className="badge bg-success">{r.estado}</span></td>
                  <td>
                    <button className="btn btn-sm btn-primary" onClick={() => setReservaSel(r)}>
                      <i className="bi bi-receipt me-1" style={{ fontSize: 11 }} />Cobrar
                    </button>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <PaginacionFooter
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="reservas" moduleColor={moduleColor}
      />

      {reservaSel && (
        <CobroModal
          reserva={reservaSel}
          onClose={() => setReservaSel(null)}
          onSaved={(idReserva) => {
            setReservaSel(null)
            setMsg({ type: 'success', text: `Cobro generado correctamente para reserva #${idReserva}` })
            fetchData()
          }}
        />
      )}
    </>
  )
}

// ─────────────────────────────────────────────────────────────
//  Modal de cobro
// ─────────────────────────────────────────────────────────────
function CobroModal({ reserva, onClose, onSaved }) {
  const ahora  = new Date()
  const hoy    = ahora.toISOString().slice(0, 10)
  const pad    = (n) => String(n).padStart(2, '0')
  const stamp  = `${ahora.getFullYear()}${pad(ahora.getMonth()+1)}${pad(ahora.getDate())}${pad(ahora.getHours())}${pad(ahora.getMinutes())}${pad(ahora.getSeconds())}`

  // Prioridad: valor calculado del espacio > monto registrado en la reserva > 0
  const montoInicial    = reserva._montoCalculado    > 0
    ? reserva._montoCalculado
    : Number(reserva.monto_Cobro ?? reserva.montoCobro ?? 0)
  const depositoInicial = reserva._depositoGarantia  > 0
    ? reserva._depositoGarantia
    : Number(reserva.deposito_Cobrado ?? reserva.depositoCobrado ?? 0)

  const [form, setForm] = useState({
    monto:             String(montoInicial),
    deposito:          String(depositoInicial),
    receptorNombre:    reserva._nombreResidente ?? '',
    receptorNit:       'C/F',
    receptorDireccion: '',
    idTipoDocFiscal:   '1',
    serie:             'A',
    numeroFactura:     `RES-${reserva._idReserva}-${stamp}`,
    idCorrelativo:     '',
    idMetodoPago:      '',
    referencia:        '',
    fechaPago:         hoy,
    observaciones:     '',
  })

  const [metodosPago,  setMetodosPago]  = useState([])
  const [loadingData,  setLoadingData]  = useState(true)
  const [loading,      setLoading]      = useState(false)
  const [error,        setError]        = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  useEffect(() => {
    Promise.all([getMetodosPago(), getNextCorrelative()])
      .then(([mRes, cRes]) => {
        setMetodosPago(mRes.data?.data ?? mRes.data ?? [])
        // El endpoint devuelve { nextCorrelative: N }
        const corrRaw = cRes.data?.nextCorrelative
          ?? cRes.data?.data?.nextCorrelative
          ?? cRes.data?.data?.idCorrelativo
          ?? cRes.data?.idCorrelativo
          ?? cRes.data?.data
          ?? cRes.data
        const corrNum = Number(corrRaw)
        if (corrNum > 0) setForm(f => ({ ...f, idCorrelativo: String(corrNum) }))
      })
      .catch(() => {})
      .finally(() => setLoadingData(false))
  }, [])

  const handleSubmit = async () => {
    const monto    = Number(form.monto)    || 0
    const deposito = Number(form.deposito) || 0

    if (!form.idTipoDocFiscal || Number(form.idTipoDocFiscal) < 1) return setError('El tipo de documento fiscal es obligatorio')
    if (!form.receptorNombre.trim()) return setError('El nombre del receptor es obligatorio')
    if (!form.receptorNit.trim())    return setError('El NIT del receptor es obligatorio')
    if (!form.numeroFactura.trim())  return setError('El número de factura es obligatorio')
    if (!form.idCorrelativo)         return setError('El ID de correlativo es obligatorio')
    if (!form.idMetodoPago)          return setError('El método de pago es obligatorio')
    if (!form.fechaPago)             return setError('La fecha de pago es obligatoria')
    if (monto <= 0)                  return setError('El monto a cobrar debe ser mayor a 0')

    // IVA 12% Guatemala
    const baseImponible = +(monto / 1.12).toFixed(2)
    const totalIva      = +(monto - baseImponible).toFixed(2)

    setLoading(true); setError(null)
    try {
      // ── 1. Crear Factura ───────────────────────────────────
      const facturaRes = await createFactura({
        idFactura:           0,
        idTipoDocFiscal:     Number(form.idTipoDocFiscal) || 1,
        serie:               form.serie || 'A',
        idCorrelativo:       Number(form.idCorrelativo),
        numeroFactura:       form.numeroFactura,
        idPropiedad:         Number(reserva._idPropiedad) || null,
        idResidente:         Number(reserva._idResidente) || null,
        receptorNombre:      form.receptorNombre,
        receptorNit:         form.receptorNit,
        receptorDireccion:   form.receptorDireccion || null,
        fechaEmision:        hoy,
        fechaVencimiento:    hoy,
        idMoneda:            1,
        tipoCambio:          1,
        subtotal:            monto,
        totalDescuentos:     0,
        baseImponible,
        totalIva,
        totalOtrosImpuestos: 0,
        total:               monto,
        totalEnLetras:       `Q${monto.toFixed(2)}`,
        saldoPendiente:      0,
        estado:              'PAGADA',
        idReservaOrigen:     Number(reserva._idReserva),
        generadoPor:         1,
        observaciones:       form.observaciones || null,
      })

      const idFactura =
        facturaRes.data?.idFactura ??
        facturaRes.data?.data?.idFactura ??
        facturaRes.data?.Id_Factura ??
        facturaRes.data?.data?.Id_Factura

      if (!idFactura) throw new Error('No se recibió el ID de factura creada')

      // ── 2. Crear Pago del monto de reserva ────────────────
      const pagoBase = {
        IdPago:        0,
        IdFactura:     idFactura,
        NumeroRecibo:  form.referencia || form.numeroFactura,
        FechaPago:     form.fechaPago,
        FechaValor:    form.fechaPago,
        IdMoneda:      1,
        TipoCambio:    1,
        IdMetodoPago:  Number(form.idMetodoPago) || null,
        Referencia:    form.referencia || null,
        Estado:        'CONFIRMADO',
        RegistradoPor: 1,
        Observaciones: form.observaciones || null,
      }

      await createPago({ ...pagoBase, MontoPagado: monto, MontoEnGtq: monto })

      // ── 3. Pago adicional si hay depósito de garantía ─────
      if (deposito > 0) {
        await createPago({
          ...pagoBase,
          NumeroRecibo:  `${pagoBase.NumeroRecibo}-DEP`,
          MontoPagado:   deposito,
          MontoEnGtq:    deposito,
          Referencia:    'Depósito de garantía',
          Observaciones: `Depósito reserva #${reserva._idReserva}`,
        })
      }

      // ── 4. Marcar reserva como COMPLETADA ─────────────────
      await cambiarEstadoReserva(reserva._idReserva, 'COMPLETADA')

      onSaved(reserva._idReserva)
    } catch (e) {
      setError(e.response?.data?.message ?? e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title fw-bold">
                Generar Cobro — Reserva #{reserva._idReserva}
              </h6>
              <button className="btn-close" onClick={onClose} />
            </div>

            <div className="modal-body">
              {error && (
                <div className="alert alert-warning alert-dismissible py-2 mb-3">
                  <i className="bi bi-exclamation-triangle me-2" />{error}
                  <button className="btn-close" onClick={() => setError(null)} />
                </div>
              )}

              {/* ── Resumen de la reserva ── */}
              <div className="rounded bg-light border p-3 mb-3 small">
                <div className="row g-1">
                  <div className="col-md-4"><span className="text-muted">Espacio:</span> <strong>{reserva._nombreEspacio}</strong></div>
                  <div className="col-md-4"><span className="text-muted">Residente:</span> <strong>{reserva._nombreResidente}</strong></div>
                  <div className="col-md-4"><span className="text-muted">Fecha:</span> {String(reserva.fecha_Reserva ?? '').slice(0, 10)}</div>
                  <div className="col-md-4"><span className="text-muted">Horario:</span> {reserva.hora_Inicio ?? '—'} – {reserva.hora_Fin ?? '—'}</div>
                  <div className="col-md-4"><span className="text-muted">Personas:</span> {reserva.num_Personas ?? reserva.numPersonas ?? '—'}</div>
                  {reserva._costoPorHora > 0 && (
                    <div className="col-md-4"><span className="text-muted">Tarifa/hora:</span> {fmt(reserva._costoPorHora)}</div>
                  )}
                  {reserva._costoPorDia > 0 && (
                    <div className="col-md-4"><span className="text-muted">Tarifa/día:</span> {fmt(reserva._costoPorDia)}</div>
                  )}
                  {reserva._depositoGarantia > 0 && (
                    <div className="col-md-4"><span className="text-muted">Depósito espacio:</span> {fmt(reserva._depositoGarantia)}</div>
                  )}
                </div>
              </div>

              <div className="row g-3">
                {/* Sección Factura */}
                <div className="col-12">
                  <p className="fw-semibold text-muted mb-0" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Datos de Factura
                  </p>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tipo Documento Fiscal <span className="text-danger">*</span></label>
                  <select className="form-select form-select-sm" value={form.idTipoDocFiscal} onChange={set('idTipoDocFiscal')}>
                    <option value="1">Factura</option>
                    <option value="2">Factura Cambiaria</option>
                    <option value="3">Nota de Crédito</option>
                    <option value="4">Nota de Débito</option>
                    <option value="5">Recibo</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Receptor <span className="text-danger">*</span></label>
                  <input className="form-control form-control-sm" value={form.receptorNombre} onChange={set('receptorNombre')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">NIT <span className="text-danger">*</span></label>
                  <input className="form-control form-control-sm" value={form.receptorNit} onChange={set('receptorNit')} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold">Serie <span className="text-danger">*</span></label>
                  <input className="form-control form-control-sm" value={form.serie}
                    onChange={set('serie')} placeholder="A" maxLength={10} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">No. Factura <span className="text-danger">*</span></label>
                  <input className="form-control form-control-sm" value={form.numeroFactura} onChange={set('numeroFactura')} />
                </div>
                <div className="col-md-5">
                  <label className="form-label fw-semibold">Dirección</label>
                  <input className="form-control form-control-sm" value={form.receptorDireccion}
                    onChange={set('receptorDireccion')} placeholder="Ciudad de Guatemala" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">
                    ID Correlativo <span className="text-danger">*</span>
                  </label>
                  <input type="number" min={1} className="form-control form-control-sm"
                    value={form.idCorrelativo} onChange={set('idCorrelativo')}
                    placeholder={loadingData ? 'Cargando...' : '1'} />
                </div>

                {/* Sección Pago */}
                <div className="col-12 mt-1">
                  <p className="fw-semibold text-muted mb-0" style={{ fontSize: 11, textTransform: 'uppercase', letterSpacing: '.06em' }}>
                    Montos y Pago
                  </p>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Monto a Cobrar (Q) <span className="text-danger">*</span></label>
                  <input type="number" step="0.01" min={0} className="form-control form-control-sm"
                    value={form.monto} onChange={set('monto')} placeholder="0.00" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Depósito Garantía (Q)</label>
                  <input type="number" step="0.01" min={0} className="form-control form-control-sm"
                    value={form.deposito} onChange={set('deposito')} placeholder="0.00" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Método de Pago <span className="text-danger">*</span></label>
                  <select className="form-select form-select-sm" value={form.idMetodoPago} onChange={set('idMetodoPago')}>
                    <option value="">Seleccionar...</option>
                    {metodosPago.map(m => {
                      const id = m.idMetodoPago ?? m.id_MetodoPago ?? m.id
                      return <option key={id} value={id}>{m.nombre ?? m.Nombre ?? `Método #${id}`}</option>
                    })}
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Fecha de Pago <span className="text-danger">*</span></label>
                  <input type="date" className="form-control form-control-sm" value={form.fechaPago} onChange={set('fechaPago')} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Referencia / No. Recibo</label>
                  <input className="form-control form-control-sm" value={form.referencia}
                    onChange={set('referencia')} placeholder="Cheque, transferencia..." />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={form.observaciones} onChange={set('observaciones')} />
                </div>

                {/* Resumen dinámico */}
                {(() => {
                  const m  = Number(form.monto)    || 0
                  const d  = Number(form.deposito) || 0
                  const bi = +(m / 1.12).toFixed(2)
                  const iv = +(m - bi).toFixed(2)
                  return (
                    <div className="col-md-6">
                      <div className="card border p-3">
                        <p className="fw-semibold mb-2" style={{ fontSize: 12 }}>Resumen de cobro</p>
                        <div className="d-flex justify-content-between small"><span className="text-muted">Base imponible:</span><span>{fmt(bi)}</span></div>
                        <div className="d-flex justify-content-between small"><span className="text-muted">IVA (12%):</span><span>{fmt(iv)}</span></div>
                        <hr className="my-2" />
                        <div className="d-flex justify-content-between fw-bold"><span>Total reserva:</span><span className="text-success">{fmt(m)}</span></div>
                        {d > 0 && (
                          <div className="d-flex justify-content-between small text-muted mt-1">
                            <span>+ Depósito garantía:</span><span>{fmt(d)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })()}
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-sm btn-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-sm btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-1" />Procesando...</>
                  : <><i className="bi bi-receipt me-1" />Generar Cobro</>}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
