import { useState, useEffect, useCallback } from 'react'
import { getAllPropiedades } from './propiedadResidenteService'

export default function PropiedadResidenteTable({ moduleColor }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [search,  setSearch]  = useState('')
  const [error,   setError]   = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    getAllPropiedades()
      .then(res => setRows(res.data.data ?? res.data))
      .catch(() => setError('Error al cargar propiedades'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const filtrados = rows.filter(r =>
    String(r.numeroPiso        ?? r.numero_Piso        ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(r.idTipoPropiedad   ?? r.id_Tipo_Propiedad  ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(r.codigoPropiedad   ?? r.codigo_Propiedad   ?? '').toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="p-3">
      {error && <div className="alert alert-danger">{error}</div>}

      <div className="d-flex gap-2 mb-3">
        <input className="form-control form-control-sm"
          placeholder="Buscar propiedad..."
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
                <th>Código</th>
                <th>Tipo</th>
                <th>Piso</th>
                <th>Área m²</th>
                <th>Estado</th>
                <th>Activo</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">Sin propiedades</td></tr>
              ) : filtrados.map((r, i) => {
                const id     = r.idPropiedad    ?? r.id_Propiedad
                const codigo = r.codigoPropiedad ?? r.codigo_Propiedad ?? '—'
                const tipo   = r.idTipoPropiedad ?? r.id_Tipo_Propiedad ?? '—'
                const piso   = r.numeroPiso      ?? r.numero_Piso       ?? '—'
                const area   = r.areaM2          ?? r.area_M2           ?? '—'
                const estado = r.estado          ?? '—'
                const activo = r.activo          ?? 1
                return (
                  <tr key={id ?? i}>
                    <td>{id}</td>
                    <td className="fw-semibold">{codigo}</td>
                    <td>{tipo}</td>
                    <td>{piso}</td>
                    <td>{area}</td>
                    <td>
                      <span className={`badge ${
                        estado === 'DISPONIBLE' ? 'bg-success' :
                        estado === 'OCUPADO'    ? 'bg-primary' :
                        estado === 'RESERVADO'  ? 'bg-warning text-dark' : 'bg-secondary'
                      }`}>{estado}</span>
                    </td>
                    <td>
                      <span className={`badge ${activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                        {activo === 1 ? 'Sí' : 'No'}
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