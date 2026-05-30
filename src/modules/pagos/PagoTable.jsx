import { useState, useEffect } from 'react'
import { getPagos, deletePago } from './pagoService'
import PagoModal from './PagoModal'

const ESTADO_COLOR = {
  PENDIENTE:  'warning',
  CONFIRMADO: 'success',
  RECHAZADO:  'danger',
  REVERTIDO:  'secondary',
}

export default function PagoTable({ moduleColor }) {
  const [rows,       setRows]       = useState([])
  const [loading,    setLoading]    = useState(true)
  const [error,      setError]      = useState(null)
  const [showModal,  setShowModal]  = useState(false)
  const [selected,   setSelected]   = useState(null)
  const [confirmId,  setConfirmId]  = useState(null)

  const fetchData = () => {
    setLoading(true)
    getPagos()
      .then(res => setRows(res.data?.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deletePago(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + (err.response?.data?.message ?? err.message)) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando pagos...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <div className="d-flex justify-content-between align-items-center mb-3">
        <span className="badge text-bg-light border">{rows.length} registros</span>
        <button className="btn btn-sm btn-primary" onClick={() => { setSelected(null); setShowModal(true) }}>
          Nuevo Pago
        </button>
      </div>

      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Factura</th><th>No. Recibo</th>
              <th>Fecha Pago</th><th>Monto</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted py-4">Sin pagos registrados</td></tr>
            ) : rows.map((row, i) => {
              const id     = row.idPago    ?? row.IdPago    ?? row.id    ?? i
              const estado = row.estado    ?? row.Estado    ?? '—'
              return (
                <tr key={id}>
                  <td className="text-muted">{id}</td>
                  <td>{row.idFactura    ?? row.IdFactura    ?? '—'}</td>
                  <td className="fw-semibold">{row.numeroRecibo ?? row.NumeroRecibo ?? '—'}</td>
                  <td>{(row.fechaPago   ?? row.FechaPago   ?? '').substring(0, 10) || '—'}</td>
                  <td className="fw-semibold">Q {Number(row.montoPagado ?? row.MontoPagado ?? 0).toFixed(2)}</td>
                  <td>
                    <span className={`badge text-bg-${ESTADO_COLOR[estado] ?? 'secondary'}`}>
                      {estado}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-sm btn-outline-primary"
                        onClick={() => { setSelected(row); setShowModal(true) }}>
                        <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                      </button>
                      {confirmId === id ? (
                        <>
                          <span className="text-danger small align-self-center">¿Confirmar?</span>
                          <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(id)}>Sí</button>
                          <button className="btn btn-sm btn-outline-secondary" onClick={() => setConfirmId(null)}>No</button>
                        </>
                      ) : (
                        <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmId(id)}>
                          <i className="bi bi-trash me-1" style={{ fontSize: 11 }} />Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <PagoModal
        show={showModal}
        pago={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}
