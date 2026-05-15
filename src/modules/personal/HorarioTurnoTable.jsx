import { useState, useEffect, useCallback } from 'react'
import { getAllHorarios, createHorario, updateHorario, deleteHorario, toggleHorario } from './horarioTurnoService'

const DIAS = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']
const EMPTY = { nombre: '', horaInicio: '', horaFin: '', diasSemana: '', activo: 1 }

export default function HorarioTurnoTable({ moduleColor }) {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editId,    setEditId]    = useState(null)
  const [form,      setForm]      = useState(EMPTY)
  const [search,    setSearch]    = useState('')
  const [saving,    setSaving]    = useState(false)
  const [msg,       setMsg]       = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    getAllHorarios()
      .then(res => setRows(res.data?.data ?? []))
      .catch(() => setMsg({ type: 'danger', text: 'Error al cargar horarios' }))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirNuevo   = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const abrirEditar  = (r) => {
    setForm({
      nombre:      r.nombre      ?? '',
      horaInicio:  r.horaInicio  ?? '',
      horaFin:     r.horaFin     ?? '',
      diasSemana:  r.diasSemana  ?? '',
      activo:      r.activo      ?? 1,
    })
    setEditId(r.idTurno)
    setShowModal(true)
  }

  const guardar = async () => {
    if (!form.nombre || !form.horaInicio || !form.horaFin) {
      setMsg({ type: 'warning', text: 'Nombre, hora inicio y hora fin son obligatorios' })
      return
    }
    setSaving(true)
    try {
      const payload = {
        nombre:     form.nombre,
        horaInicio: form.horaInicio,
        horaFin:    form.horaFin,
        diasSemana: form.diasSemana || null,
        activo:     form.activo,
      }
      editId ? await updateHorario(editId, payload) : await createHorario(payload)
      setMsg({ type: 'success', text: editId ? 'Horario actualizado' : 'Horario creado correctamente' })
      setShowModal(false)
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este horario?')) return
    try {
      await deleteHorario(id)
      setMsg({ type: 'success', text: 'Horario eliminado' })
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al eliminar' })
    }
  }

  const toggle = async (r) => {
    try {
      await toggleHorario(r.idTurno, r.activo === 1 ? 0 : 1)
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al cambiar estado' })
    }
  }

  const filtrados = rows.filter(r =>
    (r.nombre ?? '').toLowerCase().includes(search.toLowerCase())
  )

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
          placeholder="Buscar por nombre de turno..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-sm text-white" style={{ background: moduleColor }} onClick={abrirNuevo}>
          <i className="bi bi-plus-lg me-1" /> Nuevo Turno
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
                <th>Nombre</th>
                <th>Hora Inicio</th>
                <th>Hora Fin</th>
                <th>Días</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">Sin turnos registrados</td></tr>
              ) : filtrados.map(r => (
                <tr key={r.idTurno}>
                  <td>{r.idTurno}</td>
                  <td className="fw-semibold">{r.nombre}</td>
                  <td>{r.horaInicio}</td>
                  <td>{r.horaFin}</td>
                  <td><small className="text-muted">{r.diasSemana ?? '—'}</small></td>
                  <td>
                    <span className={`badge ${r.activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                      {r.activo === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-xs btn-outline-primary btn-sm" onClick={() => abrirEditar(r)}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className={`btn btn-xs btn-sm ${r.activo === 1 ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => toggle(r)}>
                        <i className={`bi ${r.activo === 1 ? 'bi-toggle-on' : 'bi-toggle-off'}`} />
                      </button>
                      <button className="btn btn-xs btn-outline-danger btn-sm" onClick={() => eliminar(r.idTurno)}>
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

      {showModal && (
        <div className="modal fade show d-block" style={{ background: '#00000060' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: `3px solid ${moduleColor}` }}>
                <h6 className="modal-title fw-bold">{editId ? 'Editar Turno' : 'Nuevo Turno'}</h6>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
                  <input className="form-control form-control-sm" placeholder="Ej: Turno Mañana"
                    value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold">Hora Inicio <span className="text-danger">*</span></label>
                  <input type="time" className="form-control form-control-sm"
                    value={form.horaInicio} onChange={e => setForm(f => ({ ...f, horaInicio: e.target.value }))} />
                </div>
                <div className="col-6">
                  <label className="form-label fw-semibold">Hora Fin <span className="text-danger">*</span></label>
                  <input type="time" className="form-control form-control-sm"
                    value={form.horaFin} onChange={e => setForm(f => ({ ...f, horaFin: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Días de la Semana</label>
                  <div className="d-flex flex-wrap gap-2 mt-1">
                    {DIAS.map(dia => {
                      const selected = (form.diasSemana ?? '').includes(dia)
                      return (
                        <button key={dia} type="button"
                          className={`btn btn-xs btn-sm ${selected ? 'text-white' : 'btn-outline-secondary'}`}
                          style={selected ? { background: moduleColor, border: `1px solid ${moduleColor}` } : {}}
                          onClick={() => {
                            const dias = form.diasSemana ? form.diasSemana.split(',').map(d => d.trim()).filter(Boolean) : []
                            const nuevo = selected ? dias.filter(d => d !== dia) : [...dias, dia]
                            setForm(f => ({ ...f, diasSemana: nuevo.join(', ') }))
                          }}>
                          {dia.slice(0, 3)}
                        </button>
                      )
                    })}
                  </div>
                </div>
                {editId && (
                  <div className="col-12">
                    <label className="form-label fw-semibold">Estado</label>
                    <select className="form-select form-select-sm"
                      value={form.activo}
                      onChange={e => setForm(f => ({ ...f, activo: Number(e.target.value) }))}>
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </div>
                )}
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
    </div>
  )
}