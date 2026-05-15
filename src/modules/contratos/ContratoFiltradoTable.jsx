import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

const BASE = 'https://localhost:44352/api/Contrato'

export default function ContratoFiltradoTable({ moduleColor, tipo }) {
  // tipo: 'VIGENTE' | 'VENCIDO'
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [error,   setError]   = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    axios.get(`${BASE}/get-all`).then(r => {
      const todos = r.data?.data ?? []
      const filtrados = todos.filter(c => {
      const estado      = (c.estado ?? c.Estado ?? '').toUpperCase()
      const fechaFinRaw = c.fechaFin ?? c.fecha_Fin
      const fechaVence  = fechaFinRaw ? new Date(fechaFinRaw) : null
      const hoy         = new Date()

  if (tipo === 'VIGENTE') {
    // Activos que no han vencido
    return estado === 'ACTIVO' ||
           (estado === 'EN_MORA' && fechaVence && fechaVence >= hoy)
  }
  if (tipo === 'VENCIDO') {
    // Finalizados, cancelados o vencidos por fecha
    return estado === 'FINALIZADO' ||
           estado === 'CANCELADO'  ||
           (fechaVence && fechaVence < hoy && estado !== 'ACTIVO')
  }
  return true
})
setRows(filtrados)
    }).catch(() => setError('Error al cargar contratos'))
      .finally(() => setLoading(false))
  }, [tipo])

  useEffect(() => { cargar() }, [cargar])

  const filtrados = rows.filter(r =>
    String(r.idContrato   ?? r.id_Contrato   ?? '').includes(search) ||
    String(r.idResidente  ?? r.id_Residente  ?? '').includes(search) ||
    String(r.idPropiedad  ?? r.id_Propiedad  ?? '').includes(search)
  )

  const colorBadge = tipo === 'VIGENTE' ? 'bg-success' : 'bg-danger'
  const titulo     = tipo === 'VIGENTE' ? 'Contratos Vigentes' : 'Contratos Vencidos'

  return (
    <div className="p-3">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-2 mb-3 align-items-center">
        <span className={`badge ${colorBadge}`} style={{ fontSize: 12 }}>
          {rows.length} {titulo.toLowerCase()}
        </span>
        <input className="form-control form-control-sm flex-grow-1"
          placeholder="Buscar por ID contrato, residente o propiedad..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-sm btn-outline-secondary" onClick={cargar}>
          <i className="bi bi-arrow-clockwise" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border" style={{ color: moduleColor }} /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th>
                <th>Residente</th>
                <th>Propiedad</th>
                <th>Tipo Contrato</th>
                <th>Inicio</th>
                <th>Fin</th>
                <th>Monto</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={8} className="text-center text-muted py-4">Sin contratos {titulo.toLowerCase()}</td></tr>
              ) : filtrados.map((r, i) => {
                const id     = r.idContrato    ?? r.id_Contrato
                const res    = r.idResidente   ?? r.id_Residente   ?? '—'
                const prop   = r.idPropiedad   ?? r.id_Propiedad   ?? '—'
                const tipo_c = r.idTipoContrato ?? r.id_Tipo_Contrato ?? '—'
                const ini    = r.fechaInicio   ?? r.fecha_Inicio    ?? '—'
                const fin    = r.fechaFin      ?? r.fecha_Fin       ?? '—'
                const monto  = r.montoMensual  ?? r.monto_Mensual   ?? 0
                const estado = r.estado        ?? r.Estado          ?? '—'
                return (
                  <tr key={id ?? i}>
                    <td>{r.idContrato   ?? r.id_Contrato   ?? '—'}</td>
                    <td>{r.idResidente  ?? r.id_Residente  ?? '—'}</td>
                    <td>{r.idPropiedad  ?? r.id_Propiedad  ?? '—'}</td>
                    <td>{r.tipoContrato ?? r.tipo_Contrato ?? '—'}</td>
                    <td>{(r.fechaInicio ?? r.fecha_Inicio  ?? '').toString().slice(0,10)}</td>
                    <td>{(r.fechaFin    ?? r.fecha_Fin     ?? '—').toString?.()?.slice(0,10) ?? '—'}</td>
                    <td>Q {Number(r.monto ?? 0).toFixed(2)}</td>
                    <td>
                      <span className={`badge ${
                        (r.estado ?? '').toUpperCase() === 'ACTIVO'     ? 'bg-success'           :
                        (r.estado ?? '').toUpperCase() === 'EN_MORA'    ? 'bg-warning text-dark' :
                        (r.estado ?? '').toUpperCase() === 'FINALIZADO' ? 'bg-secondary'         :
                        'bg-danger'
                      }`}>
                        {r.estado ?? '—'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}