import { useState, useEffect } from 'react'
import { getTipoServicios, deleteTipoServicio } from './tipoServicioService'
import TipoServicioModal from './TipoServicioModal'

export default function TipoServicioTable({ moduleColor }) {
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const fetchData = () => {
    setLoading(true)
    getTipoServicios()
      .then(res => setRows(res.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteTipoServicio(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="badge text-bg-light border">{rows.length} registros</span>
        <button className="btn btn-sm btn-primary" onClick={() => { setSelected(null); setShowModal(true) }}>
          <i className="bi bi-plus-lg me-1" />Nuevo Tipo Servicio
        </button>
      </div>
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead><tr><th>#</th><th>Nombre</th><th>Periodicidad</th><th>Monto Base</th><th>IVA</th><th>Mora</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.idTipoServicio ?? i}>
                <td className="text-muted">{row.idTipoServicio}</td>
                <td className="fw-semibold">{row.nombre}</td>
                <td><span className="badge text-bg-light border" style={{ fontSize: 10 }}>{row.periodicidad}</span></td>
                <td>Q {Number(row.montoBase || 0).toFixed(2)}</td>
                <td><span className={`badge text-bg-${row.aplicaIva === 1 ? 'info' : 'secondary'}`}>{row.aplicaIva === 1 ? 'Sí' : 'No'}</span></td>
                <td><span className={`badge text-bg-${row.aplicaMora === 1 ? 'warning' : 'secondary'}`}>{row.aplicaMora === 1 ? 'Sí' : 'No'}</span></td>
                <td><span className={`badge text-bg-${row.activo === 1 ? 'success' : 'secondary'}`}>{row.activo === 1 ? 'Activo' : 'Inactivo'}</span></td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(row); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === row.idTipoServicio ? (
                      <><span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(row.idTipoServicio)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button></>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setConfirmId(row.idTipoServicio)}>
                        <i className="bi bi-trash me-1" style={{ fontSize: 11 }} />Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <TipoServicioModal show={showModal} tipoServicio={selected}
        onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
    </>
  )
}