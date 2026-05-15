import { useState, useEffect, useCallback } from 'react'
import { getAllFamiliares, createFamiliar, updateFamiliar, deleteFamiliar, toggleFamiliar } from './familiarService'
import axios from 'axios'

const BASE_RES  = 'https://localhost:44352/Residente'
const BASE_PAR  = 'https://localhost:44352/Parentesco'
const BASE_PER  = 'https://localhost:44352/Persona'

const EMPTY = { idResidente: '', idPersona: '', idParentesco: '', observaciones: '' }

export default function FamiliarTable({ moduleColor }) {
  const [rows,        setRows]        = useState([])
  const [residentes,  setResidentes]  = useState([])
  const [parentescos, setParentescos] = useState([])
  const [personas,    setPersonas]    = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showModal,   setShowModal]   = useState(false)
  const [editId,      setEditId]      = useState(null)
  const [form,        setForm]        = useState(EMPTY)
  const [search,      setSearch]      = useState('')
  const [saving,      setSaving]      = useState(false)
  const [msg,         setMsg]         = useState(null)

  const cargar = useCallback(() => {
  setLoading(true)
  Promise.all([
    getAllFamiliares(),                                          // axios response
    axios.get(`${BASE_RES}/get-all-residente`),                 // ✅ ruta correcta
    axios.get(`${BASE_PAR}/get-all-parentesco`),                // ✅ ruta correcta
    axios.get(`${BASE_PER}/get-all-persona`),                   // ✅ ruta correcta
  ])
  .then(([famRes, resRes, parRes, perRes]) => {
    // Todos devuelven axios response → .data = { success, message, data: [...] }
    setRows(       famRes.data?.data ?? [])
    setResidentes( resRes.data?.data ?? [])
    setParentescos(parRes.data?.data ?? [])
    setPersonas(   perRes.data?.data ?? [])
  })
  .catch(() => setMsg({ type: 'danger', text: 'Error al cargar datos' }))
  .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirNuevo = () => { setForm(EMPTY); setEditId(null); setShowModal(true) }
  const abrirEditar = (r) => {
    setForm({
      idResidente:   r.idResidente   ?? '',
      idPersona:     r.idPersona     ?? '',
      idParentesco:  r.idParentesco  ?? '',
      observaciones: r.observaciones ?? '',
      activo:        r.activo        ?? 1,
    })
    setEditId(r.idFamiliar)
    setShowModal(true)
  }

  const guardar = async () => {
    if (!form.idResidente || !form.idPersona) {
      setMsg({ type: 'warning', text: 'Residente y Persona son obligatorios' })
      return
    }
    setSaving(true)
    try {
      if (editId) {
        await updateFamiliar(editId, {
          idParentesco:  form.idParentesco  || null,
          observaciones: form.observaciones || null,
          activo:        form.activo        ?? 1,
        })
        setMsg({ type: 'success', text: 'Familiar actualizado correctamente' })
      } else {
        await createFamiliar({
          idResidente:   Number(form.idResidente),
          idPersona:     Number(form.idPersona),
          idParentesco:  form.idParentesco  ? Number(form.idParentesco)  : null,
          observaciones: form.observaciones || null,
        })
        setMsg({ type: 'success', text: 'Familiar registrado correctamente' })
      }
      setShowModal(false)
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al guardar' })
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este familiar?')) return
    try {
      await deleteFamiliar(id)
      setMsg({ type: 'success', text: 'Familiar eliminado' })
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al eliminar' })
    }
  }

  const toggle = async (r) => {
    try {
      await toggleFamiliar(r.idFamiliar, r.activo === 1 ? 0 : 1)
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al cambiar estado' })
    }
  }

  const filtrados = rows.filter(r =>
    (r.nombrePersona    ?? '').toLowerCase().includes(search.toLowerCase()) ||
    (r.nombreParentesco ?? '').toLowerCase().includes(search.toLowerCase())
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
          placeholder="Buscar por nombre o parentesco..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-sm text-white" style={{ background: moduleColor }}
          onClick={abrirNuevo}>
          <i className="bi bi-plus-lg me-1" /> Nuevo Familiar
        </button>
      </div>

      {loading ? (
        <div className="text-center py-5"><div className="spinner-border text-primary" /></div>
      ) : (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>#</th>
                <th>Persona</th>
                <th>Parentesco</th>
                <th>Residente ID</th>
                <th>Observaciones</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={7} className="text-center text-muted py-4">Sin registros</td></tr>
              ) : filtrados.map(r => (
                <tr key={r.idFamiliar}>
                  <td>{r.idFamiliar}</td>
                  <td className="fw-semibold">{r.nombrePersona}</td>
                  <td>{r.nombreParentesco ?? <span className="text-muted">—</span>}</td>
                  <td>{r.idResidente}</td>
                  <td>{r.observaciones ?? <span className="text-muted">—</span>}</td>
                  <td>
                    <span className={`badge ${r.activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                      {r.activo === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-xs btn-outline-primary btn-sm"
                        onClick={() => abrirEditar(r)} title="Editar">
                        <i className="bi bi-pencil" />
                      </button>
                      <button className={`btn btn-xs btn-sm ${r.activo === 1 ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => toggle(r)} title={r.activo === 1 ? 'Desactivar' : 'Activar'}>
                        <i className={`bi ${r.activo === 1 ? 'bi-toggle-on' : 'bi-toggle-off'}`} />
                      </button>
                      <button className="btn btn-xs btn-outline-danger btn-sm"
                        onClick={() => eliminar(r.idFamiliar)} title="Eliminar">
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

      {/* Modal */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: '#00000060' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: `3px solid ${moduleColor}` }}>
                <h6 className="modal-title fw-bold">
                  {editId ? 'Editar Familiar' : 'Nuevo Familiar'}
                </h6>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body">
                {!editId && (
                  <>
                    <label className="form-label fw-semibold">Residente <span className="text-danger">*</span></label>
                    <select className="form-select form-select-sm mb-3"
                      value={form.idResidente}
                      onChange={e => setForm(f => ({ ...f, idResidente: e.target.value }))}>
                      <option value="">Seleccionar residente...</option>
                      {residentes.map(r => (
                        <option key={r.id_Residente ?? r.idResidente} value={r.id_Residente ?? r.idResidente}>
                          {r.id_Residente ?? r.idResidente}
                        </option>
                      ))}
                    </select>

                    <label className="form-label fw-semibold">Persona <span className="text-danger">*</span></label>
                    <select className="form-select form-select-sm mb-3"
                      value={form.idPersona}
                      onChange={e => setForm(f => ({ ...f, idPersona: e.target.value }))}>
                      <option value="">Seleccionar persona...</option>
                      {personas.map(p => (
                        <option key={p.id_Persona ?? p.idPersona} value={p.id_Persona ?? p.idPersona}>
                          {p.nombres ?? p.nombre} {p.apellidos ?? ''}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <label className="form-label fw-semibold">Parentesco</label>
                <select className="form-select form-select-sm mb-3"
                  value={form.idParentesco}
                  onChange={e => setForm(f => ({ ...f, idParentesco: e.target.value }))}>
                  <option value="">Sin especificar</option>
                  {parentescos.map(p => (
                    <option key={p.id ?? p.Id} value={p.id ?? p.Id}>{p.nombre ?? p.Nombre}</option>
                  ))}
                </select>

                {editId && (
                  <>
                    <label className="form-label fw-semibold">Estado</label>
                    <select className="form-select form-select-sm mb-3"
                      value={form.activo}
                      onChange={e => setForm(f => ({ ...f, activo: Number(e.target.value) }))}>
                      <option value={1}>Activo</option>
                      <option value={0}>Inactivo</option>
                    </select>
                  </>
                )}

                <label className="form-label fw-semibold">Observaciones</label>
                <textarea className="form-control form-control-sm" rows={3}
                  value={form.observaciones}
                  onChange={e => setForm(f => ({ ...f, observaciones: e.target.value }))}
                  placeholder="Observaciones opcionales..." />
              </div>
              <div className="modal-footer">
                <button className="btn btn-sm btn-secondary" onClick={() => setShowModal(false)}>
                  Cancelar
                </button>
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