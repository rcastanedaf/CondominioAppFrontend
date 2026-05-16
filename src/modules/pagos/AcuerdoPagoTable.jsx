import { useState, useEffect, useCallback } from 'react'
import { getAllAcuerdos, getCuotas, createAcuerdo, updateAcuerdo, pagarCuota, deleteAcuerdo } from './acuerdoPagoService'
import axios from 'axios'
import { getCuentasCobrar } from './cuentaCobrarService'


const BASE_RES = 'https://localhost:44352/Residente'
const EMPTY_FORM = {
  idResidente:  '',
  idCuenta:     '',
  descripcion:  '',
  montoTotal:   '',
  montoCuota:   '',
  numCuotas:    '',
  diaPago:      '',
  fechaInicio:  '',
  aprobadoPor:  1,
  observaciones: '',
}

const fmt = (n) => new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0)

export default function AcuerdoPagoTable({ moduleColor }) {
  const [rows,       setRows]       = useState([])
  const [residentes, setResidentes] = useState([])
  const [loading,    setLoading]    = useState(true)
  const [showModal,  setShowModal]  = useState(false)
  const [showCuotas, setShowCuotas] = useState(false)
  const [cuotas,     setCuotas]     = useState([])
  const [editId,     setEditId]     = useState(null)
  const [form,       setForm]       = useState(EMPTY_FORM)
  const [search,     setSearch]     = useState('')
  const [saving,     setSaving]     = useState(false)
  const [msg,        setMsg]        = useState(null)
  const [acuerdoSel, setAcuerdoSel] = useState(null)
  const [cuentas, setCuentas] = useState([])

  const cargar = useCallback(() => {
    setLoading(true)
    Promise.all([
      getAllAcuerdos(),
      getCuentasCobrar(),
      axios.get(`${BASE_RES}/get-all-residente`),
    ]).then(([ac, cRes, res]) => {
      setRows(ac.data.data      ?? [])
      setResidentes(res.data.data ?? [])
      setCuentas(cRes.data ?? [])
    }).catch(() => setMsg({ type: 'danger', text: 'Error al cargar datos' }))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirCuotas = async (acuerdo) => {
    setAcuerdoSel(acuerdo)
    const res = await getCuotas(acuerdo.idAcuerdo)
    setCuotas(res.data.data ?? res)
    setShowCuotas(true)
  }

  const handlePagarCuota = async (idCuota) => {
    if (!confirm('¿Marcar esta cuota como pagada?')) return
    try {
      await pagarCuota(idCuota)
      const res = await getCuotas(acuerdoSel.idAcuerdo)
      setCuotas(res.data.data ?? res)
      setMsg({ type: 'success', text: 'Cuota marcada como pagada' })
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al pagar cuota' })
    }
  }

  const guardar = async () => {
  if (!form.idResidente)  return setMsg({ type: 'warning', text: 'El residente es obligatorio' })
  if (!form.idCuenta)     return setMsg({ type: 'warning', text: 'La cuenta por cobrar es obligatoria' })
  if (!form.descripcion?.trim()) return setMsg({ type: 'warning', text: 'La descripción es obligatoria' })
  if (!form.montoTotal || Number(form.montoTotal) <= 0)
    return setMsg({ type: 'warning', text: 'El monto total debe ser mayor a 0' })
  if (!form.montoCuota || Number(form.montoCuota) <= 0)
    return setMsg({ type: 'warning', text: 'El monto de cuota debe ser mayor a 0' })
  if (!form.numCuotas || Number(form.numCuotas) < 1)
    return setMsg({ type: 'warning', text: 'El número de cuotas debe ser al menos 1' })
  if (!form.diaPago || Number(form.diaPago) < 1 || Number(form.diaPago) > 31)
    return setMsg({ type: 'warning', text: 'El día de pago debe estar entre 1 y 31' })
  if (!form.fechaInicio)  return setMsg({ type: 'warning', text: 'La fecha de inicio es obligatoria' })

  setSaving(true)
  try {
    if (editId) {
      await updateAcuerdo(editId, {
        estado:        form.estado ?? 'ACTIVO',
        observaciones: form.observaciones || null,
      })
      setMsg({ type: 'success', text: 'Acuerdo actualizado correctamente' })
    } else {
      await createAcuerdo({
        idResidente:   Number(form.idResidente),
        idCuenta:      Number(form.idCuenta),
        descripcion:   form.descripcion,
        montoTotal:    Number(form.montoTotal),
        montoCuota:    Number(form.montoCuota),
        numCuotas:     Number(form.numCuotas),
        diaPago:       Number(form.diaPago),
        fechaInicio:   form.fechaInicio,
        aprobadoPor:   Number(form.aprobadoPor) || 1,
        observaciones: form.observaciones || null,
      })
      setMsg({ type: 'success', text: 'Acuerdo de pago creado correctamente' })
    }
    setShowModal(false)
    cargar()
  } catch (e) {
    setMsg({ type: 'danger', text: e.response?.data?.message ?? e.message })
  } finally {
    setSaving(false)
  }
}

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este acuerdo de pago?')) return
    try {
      await deleteAcuerdo(id)
      setMsg({ type: 'success', text: 'Acuerdo eliminado' })
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al eliminar' })
    }
  }

  const filtrados = rows.filter(r =>
    (r.nombreResidente ?? '').toLowerCase().includes(search.toLowerCase()) ||
    String(r.idAcuerdo ?? '').includes(search)
  )

  const estadoBadge = (e) => ({
    VIGENTE:    'bg-success',
    CUMPLIDO:   'bg-primary',
    INCUMPLIDO: 'bg-danger',
    CANCELADO:  'bg-secondary',
  }[e] ?? 'bg-secondary')

  return (
    <div className="p-3">
      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible`}>
          {msg.text}
          <button className="btn-close" onClick={() => setMsg(null)} />
        </div>
      )}

      <div className="d-flex flex-wrap gap-2 justify-content-between align-items-center mb-3">
        <input className="form-control form-control-sm w-auto flex-grow-1"
          placeholder="Buscar por residente o ID..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-secondary" style={{ background: moduleColor }}
          onClick={() => { setForm(EMPTY_FORM); setEditId(null); setShowModal(true) }}>
          <i className="bi bi-plus-lg me-1" /> Nuevo Acuerdo
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
                <th>Fecha Acuerdo</th>
                <th>Monto Total</th>
                <th>Cuotas</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">Sin acuerdos de pago</td></tr>
              ) : filtrados.map(r => (
                <tr key={r.idAcuerdo}>
                  <td>{r.idAcuerdo}</td>
                  <td className="fw-semibold">{r.nombreResidente ?? `Residente #${r.idResidente}`}</td>
                  <td>{String(r.fechaAcuerdo ?? '').slice(0, 10)}</td>
                  <td>{r.descripcion ?? '—'}</td>
                  <td>{String(r.fechaInicio ?? '').slice(0, 10)}</td>
                  <td className="text-center">{r.numCuotas}</td>
                  <td>Q {Number(r.montoCuota ?? 0).toFixed(2)}</td>
                  <td>Día {r.diaPago}</td>
                  <td><span className={`badge ${estadoBadge(r.estado)}`}>{r.estado}</span></td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-xs btn-outline-primary btn-sm"
                        onClick={() => { setForm({ ...r, idResidente: r.idResidente }); setEditId(r.idAcuerdo); setShowModal(true) }}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className="btn btn-xs btn-outline-danger btn-sm"
                        onClick={() => eliminar(r.idAcuerdo)}>
                        <i className="bi bi-trash" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Modal Crear/Editar */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: '#00000060' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: `3px solid ${moduleColor}` }}>
                <h6 className="modal-title fw-bold">
                  {editId ? 'Editar Acuerdo' : 'Nuevo Acuerdo de Pago'}
                </h6>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body row g-3">
                {!editId && (
                  <div className="col-12">
                    <label className="form-label fw-semibold">Residente <span className="text-danger">*</span></label>
                    <select className="form-select form-select-sm"
                      value={form.idResidente}
                      onChange={e => setForm(f => ({ ...f, idResidente: e.target.value }))}>
                      <option value="">Seleccionar residente...</option>
                      {residentes.map(r => {
                        const id = r.id_Residente ?? r.idResidente
                        return <option key={id} value={id}>Residente #{id}</option>
                      })}
                    </select>
                    </div>
                  )}
                  {!editId && (
                    <>
                    {/* Cuenta por cobrar */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Cuenta por Cobrar <span className="text-danger">*</span>
                      </label>
                      <select className="form-select form-select-sm"
                        value={form.idCuenta}
                        onChange={e => setForm(f => ({ ...f, idCuenta: e.target.value }))}>
                        <option value="">Seleccionar cuenta...</option>
                        {cuentas.map(c => {
                          const id = c.idCuenta ?? c.id_Cuenta ?? c.id
                          return (
                            <option key={id} value={id}>
                              Cuenta #{id}
                            </option>
                          )
                        })}
                      </select>
                    </div>

                    {/* Descripción */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Descripción <span className="text-danger">*</span>
                      </label>
                      <input className="form-control form-control-sm"
                        placeholder="Ej: Acuerdo por deuda de cuotas enero-marzo"
                        value={form.descripcion}
                        onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))} />
                    </div>

                    {/* Montos */}
                    <div className="col-6">
                      <label className="form-label fw-semibold">
                        Monto Total (GTQ) <span className="text-danger">*</span>
                      </label>
                      <input type="number" min="0.01" step="0.01" className="form-control form-control-sm"
                        value={form.montoTotal}
                        onChange={e => setForm(f => ({ ...f, montoTotal: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">
                        Monto por Cuota (GTQ) <span className="text-danger">*</span>
                      </label>
                      <input type="number" min="0.01" step="0.01" className="form-control form-control-sm"
                        value={form.montoCuota}
                        onChange={e => setForm(f => ({ ...f, montoCuota: e.target.value }))} />
                    </div>

                    {/* Cuotas y día de pago */}
                    <div className="col-6">
                      <label className="form-label fw-semibold">
                        Número de Cuotas <span className="text-danger">*</span>
                      </label>
                      <input type="number" min="1" max="120" className="form-control form-control-sm"
                        value={form.numCuotas}
                        onChange={e => setForm(f => ({ ...f, numCuotas: e.target.value }))} />
                    </div>
                    <div className="col-6">
                      <label className="form-label fw-semibold">
                        Día de Pago (1-31) <span className="text-danger">*</span>
                      </label>
                      <input type="number" min="1" max="31" className="form-control form-control-sm"
                        placeholder="Ej: 15"
                        value={form.diaPago}
                        onChange={e => setForm(f => ({ ...f, diaPago: e.target.value }))} />
                    </div>

                    {/* Fecha inicio */}
                    <div className="col-12">
                      <label className="form-label fw-semibold">
                        Fecha de Inicio <span className="text-danger">*</span>
                      </label>
                      <input type="date" className="form-control form-control-sm"
                        value={form.fechaInicio}
                        onChange={e => setForm(f => ({ ...f, fechaInicio: e.target.value }))} />
                    </div>
                  </>
                )}
                {editId && (
                  <div className="col-12">
                    <label className="form-label fw-semibold">Estado</label>
                    <select className="form-select form-select-sm"
                      value={form.estado ?? 'VIGENTE'}
                      onChange={e => setForm(f => ({ ...f, estado: e.target.value }))}>
                      <option value="VIGENTE">Vigente</option>
                      <option value="CUMPLIDO">Cumplido</option>
                      <option value="INCUMPLIDO">Incumplido</option>
                      <option value="CANCELADO">Cancelado</option>
                    </select>
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control form-control-sm" rows={3}
                    value={form.observaciones ?? ''}
                    onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))} />
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>Cancelar</button>
                <button className="btn btn-sm text-white" style={{ background: moduleColor }}
                  onClick={guardar} disabled={saving}>
                  {saving ? <span className="spinner-border spinner-border-sm" /> : 'Guardar'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Cuotas */}
      {showCuotas && (
        <div className="modal fade show d-block" style={{ background: '#00000060' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: `3px solid ${moduleColor}` }}>
                <h6 className="modal-title fw-bold">
                  Cuotas — Acuerdo #{acuerdoSel?.idAcuerdo} | {acuerdoSel?.nombreResidente}
                </h6>
                <button className="btn-close" onClick={() => setShowCuotas(false)} />
              </div>
              <div className="modal-body">
                <div className="table-responsive">
                  <table className="table table-sm align-middle">
                    <thead className="table-light">
                      <tr>
                        <th>#</th>
                        <th>Vencimiento</th>
                        <th>Monto</th>
                        <th>Estado</th>
                        <th>Fecha Pago</th>
                        <th>Acción</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cuotas.map(c => (
                        <tr key={c.idCuota}>
                          <td>{c.numeroCuota}</td>
                          <td>{String(c.fechaVencimiento ?? '').slice(0, 10)}</td>
                          <td className="fw-semibold">{fmt(c.monto)}</td>
                          <td>
                            <span className={`badge ${
                              c.estado === 'PAGADA'   ? 'bg-success' :
                              c.estado === 'VENCIDA'  ? 'bg-danger'  :
                              'bg-warning text-dark'
                            }`}>
                              {c.estado}
                            </span>
                          </td>
                          <td>{c.fechaPago ? String(c.fechaPago).slice(0, 10) : <span className="text-muted">—</span>}</td>
                          <td>
                            {c.estado !== 'PAGADO' && (
                              <button className="btn btn-xs btn-success btn-sm"
                                onClick={() => handlePagarCuota(c.idCuota)}>
                                <i className="bi bi-check-circle me-1" />Pagar
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button className="btn btn-sm btn-secondary" onClick={() => setShowCuotas(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}