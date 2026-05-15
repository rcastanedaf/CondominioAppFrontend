import { useState, useEffect } from 'react'
import { usePaginacion } from '../../shared/hooks/usePaginacion'
import { getResidentes, getPersonas } from './residentePagoService'
import { getFacturas } from '../facturacion/facturacionService'

const fmt = (n) =>
  `Q ${Number(n || 0).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`

// Estados que indican factura pagada
const ESTADOS_PAGADA = new Set(['PAGADA'])

// Estados que indican factura pendiente de pago
const ESTADOS_PENDIENTE = new Set([
  'PENDIENTE', 'EN_MORA', 'PARCIALMENTE_PAGADA', 'VENCIDA', 'BORRADOR'
])

export default function CuentaCobrarResidente({ modColor = '#fd7e14' }) {

  // ── Residentes ─────────────────────────────────────────────
  const [residentes,      setResidentes]  = useState([])
  const [loadingRes,      setLoadingRes]  = useState(true)
  const [errorRes,        setErrorRes]    = useState(null)
  const [resSeleccionado, setResSelec]    = useState(null)
  const [todasFacturas,   setTodasFacturas] = useState([])

  const {
    datosPagina: resPagina,   datosFiltrados: resFiltrados,
    filtro: filtroRes,         setFiltro: setFiltroRes,
    paginaSegura: pagRes,      totalPaginas: totPagRes,
    porPagina: ppRes,          setPorPagina: setPpRes,
    irA: irARes,               paginas: paginasRes,
  } = usePaginacion(residentes)

  // ── Facturas del residente seleccionado ────────────────────
  const [factPagadas,    setFactPagadas] = useState([])
  const [factPendientes, setFactPend]    = useState([])

  // ── Carga inicial ──────────────────────────────────────────
  useEffect(() => {
    setLoadingRes(true)
    Promise.all([getResidentes(), getPersonas(), getFacturas()])
      .then(([resRes, perRes, facRes]) => {

        // ✅ CORRECCIÓN 1: extraer el array correctamente
        const listaRes      = resRes.data?.data ?? []
        const listaPersonas = perRes.data?.data ?? []
        // getFacturas() devuelve res completo — el array está en res.data.data
        const listaFacturas = facRes.data ?? []

        setTodasFacturas(listaFacturas)

        const enriched = listaRes.map(r => {
          const idPersonaResidente =
            r.idPersona ?? r.id_Persona ?? r.Id_Persona

          const persona = listaPersonas.find(p => {
            const idP = p.idPersona ?? p.id_Persona ?? p.Id_Persona
            return idP === idPersonaResidente
          })

          return {
            id:            r.idResidente  ?? r.id_Residente  ?? r.Id_Residente,
            idPersona:     idPersonaResidente,
            idPropiedad:   r.idPropiedad  ?? r.id_Propiedad  ?? r.Id_Propiedad,
            tipoResidente: r.tipoResidente ?? r.tipo_Residente ?? r.Tipo_Residente,
            estado:        r.estado        ?? r.Estado,
            activo:        r.activo        ?? r.Activo,
            nombres:  persona?.nombres   ?? persona?.Nombres   ?? `Persona #${idPersonaResidente}`,
            apellidos: persona?.apellidos ?? persona?.Apellidos ?? '',
          }
        })

        setResidentes(enriched)
      })
      .catch(err => setErrorRes(err.message))
      .finally(() => setLoadingRes(false))
  }, [])

  // ── Filtrar facturas cuando cambia el residente ────────────
  useEffect(() => {
    if (!resSeleccionado) {
      setFactPagadas([])
      setFactPend([])
      return
    }

    // ✅ CORRECCIÓN 2: comparación robusta de IDs (Number() para evitar type mismatch)
    const idRes = Number(resSeleccionado.id)

    const facturasDelResidente = todasFacturas.filter(f => {
      const idFactRes = Number(
        f.idResidente ?? f.id_Residente ?? f.Id_Residente ?? -1
      )
      return idFactRes === idRes
    })

    // ✅ CORRECCIÓN 3: estados correctos según constraint de la DB
    setFactPagadas(
      facturasDelResidente.filter(f =>
        ESTADOS_PAGADA.has((f.estado ?? f.Estado ?? '').toUpperCase())
      )
    )
    setFactPend(
      facturasDelResidente.filter(f =>
        ESTADOS_PENDIENTE.has((f.estado ?? f.Estado ?? '').toUpperCase())
      )
    )
  }, [resSeleccionado, todasFacturas])

  // ── Totales ────────────────────────────────────────────────
  const sumar = (arr) =>
    arr.reduce(
      (a, f) => ({
        subtotal:   a.subtotal   + Number(f.subtotal          ?? f.Subtotal          ?? 0),
        iva:        a.iva        + Number(f.totalIva           ?? f.TotalIva          ?? 0),
        descuentos: a.descuentos + Number(f.totalDescuentos    ?? f.TotalDescuentos   ?? 0),
        total:      a.total      + Number(f.total              ?? f.Total             ?? 0),
        saldo:      a.saldo      + Number(f.saldoPendiente     ?? f.SaldoPendiente    ?? 0),
      }),
      { subtotal: 0, iva: 0, descuentos: 0, total: 0, saldo: 0 }
    )

  const totPagadas    = sumar(factPagadas)
  const totPendientes = sumar(factPendientes)
  // ✅ CORRECCIÓN 4: usar saldoPendiente real en lugar del total
  const saldo = totPendientes.saldo > 0
    ? totPendientes.saldo
    : totPendientes.total

  // ── Helper paginación ──────────────────────────────────────
  const BtnPag = ({ pagina, total, irA, paginas, color }) => (
    <ul className="pagination pagination-sm mb-0">
      <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => irA(1)}>«</button>
      </li>
      <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => irA(pagina - 1)}>‹</button>
      </li>
      {paginas().map((p, idx) =>
        p === '...'
          ? <li key={`e${idx}`} className="page-item disabled">
              <span className="page-link border-0 bg-transparent">…</span>
            </li>
          : <li key={p} className="page-item">
              <button
                className="page-link"
                style={pagina === p
                  ? { background: color, borderColor: color, color: '#fff' }
                  : {}}
                onClick={() => irA(p)}
              >{p}</button>
            </li>
      )}
      <li className={`page-item ${pagina === total ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => irA(pagina + 1)}>›</button>
      </li>
      <li className={`page-item ${pagina === total ? 'disabled' : ''}`}>
        <button className="page-link" onClick={() => irA(total)}>»</button>
      </li>
    </ul>
  )

  // ── Tabla facturas ─────────────────────────────────────────
  const TablaFacturas = ({ datos, tipo }) => {
    const esPagada = tipo === 'pagada'
    const color    = esPagada ? '#198754' : '#dc3545'
    const totales  = esPagada ? totPagadas : totPendientes

    const badgeEstado = (estado) => {
      const e = (estado ?? '').toUpperCase()
      if (e === 'PAGADA')               return 'bg-success'
      if (e === 'PENDIENTE')            return 'bg-warning text-dark'
      if (e === 'EN_MORA')              return 'bg-danger'
      if (e === 'PARCIALMENTE_PAGADA')  return 'bg-info text-dark'
      if (e === 'VENCIDA')              return 'bg-danger'
      if (e === 'BORRADOR')             return 'bg-secondary'
      return 'bg-secondary'
    }

    return (
      <div className="card border-0 shadow-sm h-100">
        <div
          className="card-header bg-white py-2 px-3"
          style={{ borderBottom: `2px solid ${color}` }}
        >
          <span className="fw-bold" style={{ color }}>
            <i className={`bi ${esPagada ? 'bi-check-circle' : 'bi-clock-history'} me-2`} />
            {esPagada ? 'Facturas Pagadas' : 'Facturas Pendientes'}
            <span
              className={`badge text-bg-${esPagada ? 'success' : 'danger'} ms-2`}
              style={{ fontSize: 10 }}
            >
              {datos.length}
            </span>
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="table table-sm cms-table mb-0" style={{ fontSize: 12 }}>
            <thead className="table-light">
              <tr>
                <th>N° Factura</th>
                <th>Receptor</th>
                <th>{esPagada ? 'F. Emisión' : 'Vencimiento'}</th>
                <th className="text-end">Subtotal</th>
                <th className="text-end">IVA</th>
                <th className="text-end">Total</th>
                <th className="text-center">Estado</th>
                {!esPagada && <th className="text-end">Saldo</th>}
              </tr>
            </thead>
            <tbody>
              {datos.length === 0 ? (
                <tr>
                  <td colSpan={esPagada ? 7 : 8} className="text-center text-muted py-3">
                    <i className={`bi ${esPagada ? 'bi-inbox' : 'bi-check2-circle text-success'} me-1`} />
                    {esPagada ? 'Sin facturas pagadas' : 'Sin facturas pendientes'}
                  </td>
                </tr>
              ) : datos.map((f, i) => {
                // ✅ CORRECCIÓN 5: usar nombres correctos del modelo (camelCase exacto)
                const numFac   = f.numeroFactura  ?? f.NumeroFactura  ?? `#${f.idFactura}`
                const receptor = f.receptorNombre ?? f.ReceptorNombre ?? '—'
                const fEmision = f.fechaEmision   ?? f.FechaEmision
                const fVence   = f.fechaVencimiento ?? f.FechaVencimiento
                const subtotal = f.subtotal        ?? f.Subtotal        ?? 0
                const iva      = f.totalIva        ?? f.TotalIva        ?? 0
                const total    = f.total           ?? f.Total           ?? 0
                const saldoPend = f.saldoPendiente ?? f.SaldoPendiente  ?? 0
                const estado   = f.estado          ?? f.Estado          ?? '—'

                return (
                  <tr
                    key={f.idFactura ?? i}
                    className={
                      !esPagada && ['EN_MORA', 'VENCIDA'].includes(estado.toUpperCase())
                        ? 'table-danger'
                        : ''
                    }
                  >
                    <td className="fw-semibold" style={{ color }}>{numFac}</td>
                    <td style={{ maxWidth: 140, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {receptor}
                    </td>
                    <td>
                      {esPagada
                        ? (fEmision  ? new Date(fEmision).toISOString().slice(0,10)  : '—')
                        : (fVence    ? new Date(fVence).toISOString().slice(0,10)    : '—')
                      }
                    </td>
                    <td className="text-end">{fmt(subtotal)}</td>
                    <td className="text-end">{fmt(iva)}</td>
                    <td className="text-end fw-semibold">{fmt(total)}</td>
                    <td className="text-center">
                      <span className={`badge ${badgeEstado(estado)}`} style={{ fontSize: 10 }}>
                        {estado}
                      </span>
                    </td>
                    {!esPagada && (
                      <td className="text-end fw-semibold text-danger">
                        {fmt(saldoPend)}
                      </td>
                    )}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Subtotales de la sección */}
        <div
          className="card-footer bg-white py-2 px-3"
          style={{ borderTop: '1px solid #dee2e6', fontSize: 12 }}
        >
          <div className="d-flex justify-content-between text-muted mb-1">
            <span>Subtotal</span><span>{fmt(totales.subtotal)}</span>
          </div>
          <div className="d-flex justify-content-between text-muted mb-1">
            <span>IVA</span><span>{fmt(totales.iva)}</span>
          </div>
          {totales.descuentos > 0 && (
            <div className="d-flex justify-content-between text-muted mb-1">
              <span>Descuentos</span><span>— {fmt(totales.descuentos)}</span>
            </div>
          )}
          <div
            className="d-flex justify-content-between fw-bold border-top pt-1 mt-1"
            style={{ color }}
          >
            <span>{esPagada ? 'Total Pagado' : 'Total Pendiente'}</span>
            <span style={{ fontSize: 14 }}>{fmt(totales.total)}</span>
          </div>
          {!esPagada && totales.saldo > 0 && (
            <div className="d-flex justify-content-between fw-bold mt-1" style={{ color: '#dc3545' }}>
              <span>Saldo Real Pendiente</span>
              <span style={{ fontSize: 14 }}>{fmt(totales.saldo)}</span>
            </div>
          )}
        </div>
      </div>
    )
  }

  // ─────────────────────────────────────────────────────────
  return (
    <div className="d-flex flex-column gap-3" style={{ overflowY: 'auto' }}>

      {/* ══ RESIDENTES ══════════════════════════════════════ */}
      <div className="card border-0 shadow-sm">
        <div
          className="card-header bg-white py-2 px-3"
          style={{ borderBottom: `2px solid ${modColor}` }}
        >
          <div className="d-flex align-items-center justify-content-between mb-2">
            <span className="fw-bold" style={{ color: modColor }}>
              <i className="bi bi-people me-2" />Residentes
              <span className="badge text-bg-light border ms-2" style={{ fontSize: 10 }}>
                {residentes.length}
              </span>
            </span>
            <div className="d-flex align-items-center gap-2">
              <span className="text-muted" style={{ fontSize: 12 }}>Mostrar</span>
              <select
                className="form-select form-select-sm"
                style={{ width: 70 }}
                value={ppRes}
                onChange={e => setPpRes(Number(e.target.value))}
              >
                {[5, 10, 20].map(n => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div className="input-group input-group-sm" style={{ maxWidth: 300 }}>
            <span className="input-group-text bg-white border-end-0">
              <i className="bi bi-search text-muted" style={{ fontSize: 11 }} />
            </span>
            <input
              className="form-control border-start-0"
              placeholder="Buscar residente..."
              value={filtroRes}
              onChange={e => setFiltroRes(e.target.value)}
            />
            {filtroRes && (
              <button
                className="btn btn-outline-secondary btn-sm"
                onClick={() => setFiltroRes('')}
              >
                <i className="bi bi-x" />
              </button>
            )}
          </div>
        </div>

        {loadingRes ? (
          <div className="text-center py-4 text-muted">
            <div className="spinner-border spinner-border-sm me-2" />
            Cargando residentes...
          </div>
        ) : errorRes ? (
          <div className="alert alert-danger m-3 py-2">
            <i className="bi bi-exclamation-circle me-2" />{errorRes}
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              className="table table-hover table-sm cms-table mb-0"
              style={{ fontSize: 12 }}
            >
              <thead className="table-light">
                <tr>
                  <th style={{ width: 30 }} />
                  <th>#</th>
                  <th>Nombres</th>
                  <th>Apellidos</th>
                  <th>Propiedad</th>
                  <th>Tipo</th>
                  <th>Estado</th>
                </tr>
              </thead>
              <tbody>
                {resPagina.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center text-muted py-4">
                      <i className="bi bi-inbox me-2" />Sin residentes
                    </td>
                  </tr>
                ) : resPagina.map(r => (
                  <tr
                    key={r.id}
                    style={{
                      cursor: 'pointer',
                      background: resSeleccionado?.id === r.id
                        ? `${modColor}18`
                        : undefined,
                    }}
                    onClick={() => setResSelec(prev =>
                      prev?.id === r.id ? null : r
                    )}
                  >
                    <td className="text-center align-middle">
                      {resSeleccionado?.id === r.id && (
                        <i
                          className="bi bi-caret-right-fill"
                          style={{ color: modColor, fontSize: 12 }}
                        />
                      )}
                    </td>
                    <td className="text-muted">{r.id}</td>
                    <td className="fw-semibold">{r.nombres}</td>
                    <td>{r.apellidos}</td>
                    <td>
                      <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                        {r.idPropiedad ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                        {r.tipoResidente ?? '—'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge text-bg-${r.activo === 1 ? 'success' : 'secondary'}`}>
                        {r.activo === 1 ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div
          className="card-footer bg-white d-flex align-items-center justify-content-between flex-wrap gap-2 py-2"
          style={{ borderTop: '1px solid #dee2e6' }}
        >
          <small className="text-muted">
            {resFiltrados.length === 0
              ? 'Sin residentes'
              : `Mostrando ${(pagRes - 1) * ppRes + 1}–${Math.min(
                  pagRes * ppRes,
                  resFiltrados.length
                )} de ${resFiltrados.length} residentes`}
          </small>
          <nav>
            <BtnPag
              pagina={pagRes} total={totPagRes}
              irA={irARes} paginas={paginasRes} color={modColor}
            />
          </nav>
        </div>
      </div>

      {/* ══ ESTADO DE CUENTA ════════════════════════════════ */}
      {!resSeleccionado ? (
        <div className="card border-0 shadow-sm">
          <div className="d-flex align-items-center justify-content-center text-muted flex-column py-5">
            <i className="bi bi-arrow-up-circle fs-1 mb-2 opacity-25" />
            <span style={{ fontSize: 13 }}>
              Selecciona un residente para ver su estado de cuenta
            </span>
          </div>
        </div>
      ) : (
        <>
          {/* Resumen del residente seleccionado */}
          <div
            className="alert mb-0 d-flex align-items-center gap-2 py-2"
            style={{ background: `${modColor}12`, border: `1px solid ${modColor}40` }}
          >
            <i className="bi bi-person-circle" style={{ color: modColor, fontSize: 18 }} />
            <span style={{ fontSize: 13 }}>
              Estado de cuenta de{' '}
              <strong>{resSeleccionado.nombres} {resSeleccionado.apellidos}</strong>
              {' '}— Propiedad #{resSeleccionado.idPropiedad ?? '—'}
            </span>
            <button
              className="btn btn-sm btn-outline-secondary ms-auto py-0"
              style={{ fontSize: 11 }}
              onClick={() => setResSelec(null)}
            >
              <i className="bi bi-x me-1" />Cerrar
            </button>
          </div>

          {/* Tablas lado a lado */}
          <div className="row g-3">
            <div className="col-md-6">
              <TablaFacturas datos={factPagadas} tipo="pagada" />
            </div>
            <div className="col-md-6">
              <TablaFacturas datos={factPendientes} tipo="pendiente" />
            </div>
          </div>

          {/* Saldo total */}
          <div
            className="card border-0 shadow-sm"
            style={{ background: saldo > 0 ? '#fff5f5' : '#f0fff4' }}
          >
            <div className="card-body py-3 px-4 d-flex align-items-center justify-content-between flex-wrap gap-3">
              <div>
                <p className="mb-1 text-muted" style={{ fontSize: 12 }}>
                  Resumen financiero
                </p>
                <div className="d-flex gap-4 flex-wrap" style={{ fontSize: 13 }}>
                  <span>
                    Total facturado:{' '}
                    <strong>{fmt(totPagadas.total + totPendientes.total)}</strong>
                  </span>
                  <span>
                    Pagado:{' '}
                    <strong className="text-success">{fmt(totPagadas.total)}</strong>
                  </span>
                  <span>
                    Facturas pendientes:{' '}
                    <strong className="text-danger">{factPendientes.length}</strong>
                  </span>
                </div>
              </div>
              <div className="text-end">
                <p className="mb-0 text-muted" style={{ fontSize: 11 }}>SALDO PENDIENTE</p>
                <span
                  className="fw-bold"
                  style={{ fontSize: 28, color: saldo > 0 ? '#dc3545' : '#198754' }}
                >
                  {fmt(saldo)}
                </span>
                {saldo === 0 && (
                  <p className="mb-0 text-success" style={{ fontSize: 11 }}>
                    <i className="bi bi-check-circle me-1" />Al corriente
                  </p>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}