import { useState, useEffect, useCallback } from 'react'
import axios from 'axios'

// ✅ Sin /api/, igual que residenteService.js y personaService.js
const BASE_RES = 'https://localhost:44352/Residente'
const BASE_PER = 'https://localhost:44352/Persona'

export default function ArrendatarioTable({ moduleColor }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [error,   setError]   = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    Promise.all([
      axios.get(`${BASE_RES}/get-all-residente`),   // ✅ ruta correcta
      axios.get(`${BASE_PER}/get-all-persona`),      // ✅ ruta correcta
    ])
    .then(([resRes, perRes]) => {
      // ✅ axios devuelve res.data = { success, message, data: [...] }
      const residentes  = resRes.data?.data ?? []
      const personasArr = perRes.data?.data ?? []

      // Mapa id → persona para lookup rápido
      const personaMap = {}
      personasArr.forEach(p => {
        personaMap[p.id_Persona] = p
      })

      // Solo INQUILINO
      const inquilinos = residentes
        .filter(r => (r.tipo_Residente ?? '').toUpperCase() === 'INQUILINO')
        .map(r => ({
          ...r,
          _persona: personaMap[r.id_Persona] ?? null,
        }))

      setRows(inquilinos)
    })
    .catch(() => setError('Error al cargar arrendatarios'))
    .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const filtrados = rows.filter(r => {
    const nombre = r._persona
      ? `${r._persona.nombres ?? ''} ${r._persona.apellidos ?? ''}`.toLowerCase()
      : ''
    return nombre.includes(search.toLowerCase())
  })

  return (
    <div className="p-3">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-2 mb-3 align-items-center">
        <span className="badge" style={{ background: moduleColor, fontSize: 12 }}>
          {rows.length} arrendatarios
        </span>
        <input
          className="form-control form-control-sm flex-grow-1"
          placeholder="Buscar por nombre..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <button className="btn btn-sm btn-outline-secondary" onClick={cargar}>
          <i className="bi bi-arrow-clockwise" />
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" style={{ color: moduleColor }} />
        </div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID Residente</th>
                <th>Nombre</th>
                <th>Propiedad</th>
                <th>Fecha Ingreso</th>
                <th>Fecha Salida</th>
                <th>Estado</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center text-muted py-4">
                    Sin arrendatarios registrados
                  </td>
                </tr>
              ) : filtrados.map((r, i) => {
                const nombre = r._persona
                  ? `${r._persona.nombres ?? ''} ${r._persona.apellidos ?? ''}`
                  : `Persona #${r.id_Persona}`
                return (
                  <tr key={r.id_Residente ?? i}>
                    <td>{r.id_Residente}</td>
                    <td className="fw-semibold">{nombre}</td>
                    <td>{r.id_Propiedad ?? '—'}</td>
                    <td>{r.fecha_Ingreso ? String(r.fecha_Ingreso).slice(0, 10) : '—'}</td>
                    <td>{r.fecha_Salida  ? String(r.fecha_Salida).slice(0, 10)  : <span className="text-muted">Vigente</span>}</td>
                    <td>
                      <span className={`badge ${r.activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {r.activo === 1 ? 'Activo' : 'Inactivo'}
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