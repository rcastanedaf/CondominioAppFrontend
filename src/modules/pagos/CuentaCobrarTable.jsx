import { useState, useEffect } from 'react'
import { getCuentasCobrar, deleteCuentaCobrar } from './cuentaCobrarService'
import CuentaCobrarModal from './CuentaCobrarModal'

const ESTADO_COLOR = { PENDIENTE: 'warning', PARCIAL: 'info', PAGADA: 'success', VENCIDA: 'danger', ANULADA: 'secondary' }

export default function CuentaCobrarTable({ moduleColor }) {
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const fetchData = () => {
    setLoading(true)
    getCuentasCobrar()
      .then(res => setRows(res.data.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteCuentaCobrar(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="badge text-bg-light border">{rows.length} registros</span>
        <button className="btn btn-sm btn-primary" onClick={() => { setSelected(null); setShowModal(true) }}>
          <i className="bi bi-plus-lg me-1" />Nueva Cuenta x Cobrar
        </button>
      </div>
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead><tr><th>#</th><th>Residente</th><th>Factura</th><th>Original</th><th>Pagado</th><th>Mora</th><th>Pendiente</th><th>Días Atraso</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {rows.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td>{row.idResidente}</td>
                <td>{row.idFactura}</td>
                <td>Q {Number(row.montoOriginal).toFixed(2)}</td>
                <td>Q {Number(row.montoPagado || 0).toFixed(2)}</td>
                <td className="text-danger">Q {Number(row.montoMora || 0).toFixed(2)}</td>
                <td className="fw-semibold text-danger">Q {Number(row.montoPendiente).toFixed(2)}</td>
                <td>{row.diasAtraso ?? 0}</td>
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
      <CuentaCobrarModal show={showModal} cuenta={selected}
        onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
    </>
  )
}