import { useState, useEffect } from 'react'
import { getContratos, deleteContrato } from './contratoService'
import ContratoModal from './ContratoModal'

const ESTADO_COLOR = { VIGENTE: 'success', VENCIDO: 'danger', RESCINDIDO: 'secondary', PENDIENTE: 'warning' }

export default function ContratoTable({ moduleColor }) {
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const fetchData = () => {
    setLoading(true)
    getContratos()
      .then(res => setRows(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteContrato(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="badge text-bg-light border">{rows.length} registros</span>
        <button className="btn btn-sm btn-primary" onClick={() => { setSelected(null); setShowModal(true) }}>
          <i className="bi bi-plus-lg me-1" />Nuevo Contrato
        </button>
      </div>
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead><tr><th>#</th><th>Propiedad</th><th>Residente</th><th>Tipo</th><th>F. Inicio</th><th>F. Fin</th><th>Monto</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td>{row.idPropiedad}</td>
                <td>{row.idResidente}</td>
                <td><span className="badge text-bg-light border" style={{ fontSize: 10 }}>{row.tipoContrato}</span></td>
                <td>{row.fechaInicio?.substring(0, 10)}</td>
                <td className="text-muted">{row.fechaFin?.substring(0, 10) ?? '—'}</td>
                <td className="fw-semibold">Q {Number(row.monto).toFixed(2)}</td>
                <td><span className={`badge text-bg-${ESTADO_COLOR[row.estado] || 'secondary'}`}>{row.estado}</span></td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(row); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === row.id ? (
                      <><span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(row.id)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button></>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setConfirmId(row.id)}>
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
      <ContratoModal show={showModal} contrato={selected}
        onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
    </>
  )
}