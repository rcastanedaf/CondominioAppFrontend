import { useState, useEffect, useCallback } from 'react'
import { getReservas, cambiarEstadoReserva } from './reservaService'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

const fmt = (n) => `Q ${Number(n ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`

export default function CobroReservaTable({ moduleColor }) {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [msg,       setMsg]       = useState(null)

  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  const fetchData = useCallback(() => {
    setLoading(true)
    setError(null)
    getReservas()
      .then(res => {
        const todas = res.data?.data ?? []
        // Solo mostrar reservas confirmadas pendientes de cobro
        setRows(todas.filter(r => {
          const estado = (r.estado ?? r.Estado ?? '').toUpperCase()
          return estado === 'CONFIRMADA' || estado === 'PENDIENTE_COBRO'
        }))
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { fetchData() }, [fetchData])

  const handleCobrar = async (reserva) => {
    const idReserva = reserva.idReserva ?? reserva.id_Reserva ?? reserva.id
    if (!confirm(`¿Marcar reserva #${idReserva} como cobrada?`)) return
    try {
      await cambiarEstadoReserva(idReserva, 'COBRADA')
      setMsg({ type: 'success', text: `Reserva #${idReserva} marcada como cobrada` })
      fetchData()
    } catch (e) {
      setMsg({ type: 'danger', text: e.response?.data?.message ?? e.message })
    }
  }

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" />Cargando reservas pendientes de cobro...
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
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar reservas..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="reservas pendientes"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Espacio</th><th>Residente</th><th>Fecha Reserva</th>
              <th>Hora Inicio</th><th>Hora Fin</th><th>Monto</th><th>Estado</th><th>Acción</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted py-4">
                  <i className="bi bi-check-circle-fill text-success me-2" />
                  No hay reservas pendientes de cobro
                </td>
              </tr>
            ) : datosPagina.map((r, i) => {
              const id       = r.idReserva       ?? r.id_Reserva      ?? r.id
              const espacio  = r.idEspacioComun   ?? r.id_Espacio_Comun ?? '—'
              const residente = r.idResidente     ?? r.id_Residente    ?? '—'
              const fecha    = r.fechaReserva     ?? r.fecha_Reserva   ?? '—'
              const hIni     = r.horaInicio       ?? r.hora_Inicio     ?? '—'
              const hFin     = r.horaFin          ?? r.hora_Fin        ?? '—'
              const monto    = r.montoCobro       ?? r.monto_Cobro     ?? r.monto ?? 0
              const estado   = r.estado           ?? r.Estado          ?? '—'
              return (
                <tr key={id ?? i}>
                  <td className="text-muted">{id}</td>
                  <td>{r._nombreEspacio ?? `Espacio #${espacio}`}</td>
                  <td>{r._nombreResidente ?? `Residente #${residente}`}</td>
                  <td>{String(fecha).slice(0, 10)}</td>
                  <td>{hIni}</td>
                  <td>{hFin}</td>
                  <td className="fw-semibold">{fmt(monto)}</td>
                  <td>
                    <span className="badge bg-warning text-dark">{estado}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-sm btn-success py-0 px-2"
                      onClick={() => handleCobrar(r)}
                    >
                      <i className="bi bi-cash-coin me-1" style={{ fontSize: 11 }} />Cobrar
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
    </>
  )
}