import { useState, useEffect, useCallback } from 'react'
import { getAllRoles, getAllPermisos, getPermisosByRol, createRol, updateRol, toggleRol, deleteRol, asignarPermiso, quitarPermiso } from './rolService'

const EMPTY = { nombre: '', descripcion: '' }

export default function RolPermisosTable({ moduleColor }) {
  const [roles,          setRoles]          = useState([])
  const [todosPermisos,  setTodosPermisos]  = useState([])
  const [permisosSel,    setPermisosSel]    = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showModal,      setShowModal]      = useState(false)
  const [showPermisos,   setShowPermisos]   = useState(false)
  const [rolActivo,      setRolActivo]      = useState(null)
  const [editId,         setEditId]         = useState(null)
  const [form,           setForm]           = useState(EMPTY)
  const [search,         setSearch]         = useState('')
  const [saving,         setSaving]         = useState(false)
  const [msg,            setMsg]            = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    Promise.all([getAllRoles(), getAllPermisos()])
      .then(([r, p]) => {
        setRoles(r.data.data ?? [])
        setTodosPermisos(p.data.data ?? [])
      })
      .catch(() => setMsg({ type: 'danger', text: 'Error al cargar datos' }))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  const abrirPermisos = async (rol) => {
    setRolActivo(rol)
    const res = await getPermisosByRol(rol.idRol)
    setPermisosSel(res.data?.data ?? [])
    setShowPermisos(true)
  }

  const handleTogglePermiso = async (permiso) => {
    const yaAsignado = permisosSel.some(p => p.idPermiso === permiso.idPermiso)
    try {
      if (yaAsignado) {
        await quitarPermiso(rolActivo.idRol, permiso.idPermiso)
        setPermisosSel(ps => ps.filter(p => p.idPermiso !== permiso.idPermiso))
      } else {
        await asignarPermiso(rolActivo.idRol, permiso.idPermiso)
        setPermisosSel(ps => [...ps, permiso])
      }
    } catch {
      setMsg({ type: 'danger', text: 'Error al actualizar permiso' })
    }
  }

  const guardar = async () => {
    if (!form.nombre) {
      setMsg({ type: 'warning', text: 'El nombre del rol es obligatorio' })
      return
    }
    setSaving(true)
    try {
      editId ? await updateRol(editId, form) : await createRol(form)
      setMsg({ type: 'success', text: editId ? 'Rol actualizado' : 'Rol creado correctamente' })
      setShowModal(false)
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al guardar el rol' })
    } finally {
      setSaving(false)
    }
  }

  const eliminar = async (id) => {
    if (!confirm('¿Eliminar este rol? Se quitarán todos sus permisos.')) return
    try {
      await deleteRol(id)
      setMsg({ type: 'success', text: 'Rol eliminado' })
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al eliminar' })
    }
  }

  const toggle = async (r) => {
    try {
      await toggleRol(r.idRol, r.activo === 1 ? 0 : 1)
      cargar()
    } catch {
      setMsg({ type: 'danger', text: 'Error al cambiar estado' })
    }
  }

  // Agrupar permisos por módulo para mostrarlos mejor
  const permisosAgrupados = todosPermisos.reduce((acc, p) => {
    const mod = p.modulo ?? 'General'
    if (!acc[mod]) acc[mod] = []
    acc[mod].push(p)
    return acc
  }, {})

  const filtrados = roles.filter(r =>
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
          placeholder="Buscar rol..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <button className="btn btn-sm text-white" style={{ background: moduleColor }}
          onClick={() => { setForm(EMPTY); setEditId(null); setShowModal(true) }}>
          <i className="bi bi-plus-lg me-1" /> Nuevo Rol
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
                <th>Descripción</th>
                <th>Estado</th>
                <th>Permisos</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filtrados.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Sin roles registrados</td></tr>
              ) : filtrados.map(r => (
                <tr key={r.idRol}>
                  <td>{r.idRol}</td>
                  <td className="fw-semibold">{r.nombre}</td>
                  <td><small className="text-muted">{r.descripcion ?? '—'}</small></td>
                  <td>
                    <span className={`badge ${r.activo === 1 ? 'bg-success' : 'bg-secondary'}`}>
                      {r.activo === 1 ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-xs btn-outline-info btn-sm"
                      onClick={() => abrirPermisos(r)}>
                      <i className="bi bi-shield-check me-1" />Gestionar
                    </button>
                  </td>
                  <td>
                    <div className="d-flex gap-1">
                      <button className="btn btn-xs btn-outline-primary btn-sm"
                        onClick={() => { setForm({ nombre: r.nombre, descripcion: r.descripcion ?? '' }); setEditId(r.idRol); setShowModal(true) }}>
                        <i className="bi bi-pencil" />
                      </button>
                      <button className={`btn btn-xs btn-sm ${r.activo === 1 ? 'btn-outline-warning' : 'btn-outline-success'}`}
                        onClick={() => toggle(r)}>
                        <i className={`bi ${r.activo === 1 ? 'bi-toggle-on' : 'bi-toggle-off'}`} />
                      </button>
                      <button className="btn btn-xs btn-outline-danger btn-sm"
                        onClick={() => eliminar(r.idRol)}>
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

      {/* Modal Crear/Editar Rol */}
      {showModal && (
        <div className="modal fade show d-block" style={{ background: '#00000060' }}>
          <div className="modal-dialog modal-md">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: `3px solid ${moduleColor}` }}>
                <h6 className="modal-title fw-bold">{editId ? 'Editar Rol' : 'Nuevo Rol'}</h6>
                <button className="btn-close" onClick={() => setShowModal(false)} />
              </div>
              <div className="modal-body row g-3">
                <div className="col-12">
                  <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
                  <input className="form-control form-control-sm" placeholder="Ej: Administrador"
                    value={form.nombre} onChange={e => setForm(f => ({ ...f, nombre: e.target.value }))} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control form-control-sm" rows={3}
                    value={form.descripcion} onChange={e => setForm(f => ({ ...f, descripcion: e.target.value }))}
                    placeholder="Descripción del rol..." />
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

      {/* Modal Permisos */}
      {showPermisos && (
        <div className="modal fade show d-block" style={{ background: '#00000060' }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header" style={{ borderBottom: `3px solid ${moduleColor}` }}>
                <h6 className="modal-title fw-bold">
                  <i className="bi bi-shield-check me-2" />
                  Permisos — {rolActivo?.nombre}
                </h6>
                <button className="btn-close" onClick={() => setShowPermisos(false)} />
              </div>
              <div className="modal-body" style={{ maxHeight: '60vh', overflowY: 'auto' }}>
                {Object.entries(permisosAgrupados).map(([modulo, permisos]) => (
                  <div key={modulo} className="mb-3">
                    <h6 className="fw-semibold text-uppercase mb-2"
                      style={{ fontSize: 11, letterSpacing: 1, color: moduleColor }}>
                      {modulo}
                    </h6>
                    <div className="d-flex flex-wrap gap-2">
                      {permisos.map(p => {
                        const asignado = permisosSel.some(ps => ps.idPermiso === p.idPermiso)
                        return (
                          <button key={p.idPermiso} type="button"
                            className={`btn btn-sm ${asignado ? 'text-white' : 'btn-outline-secondary'}`}
                            style={asignado ? { background: moduleColor, borderColor: moduleColor } : {}}
                            onClick={() => handleTogglePermiso(p)}
                            title={p.descripcion ?? p.accion}>
                            <i className={`bi ${asignado ? 'bi-check-circle-fill' : 'bi-circle'} me-1`} />
                            {p.accion}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
                {Object.keys(permisosAgrupados).length === 0 && (
                  <div className="text-center text-muted py-4">
                    No hay permisos registrados en el sistema
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <small className="text-muted me-auto">
                  {permisosSel.length} permiso(s) asignado(s)
                </small>
                <button className="btn btn-sm btn-secondary" onClick={() => setShowPermisos(false)}>Cerrar</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}