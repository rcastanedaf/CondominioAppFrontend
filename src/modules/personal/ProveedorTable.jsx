import { useState, useEffect } from 'react'
import { getProveedores, createProveedor, updateProveedor, deleteProveedor } from './proveedorService'
import { usePaginacion } from '../../shared/hooks/usePaginacion'
import PaginacionFooter  from '../../shared/components/PaginacionFooter'

export default function ProveedorTable({ moduleColor }) {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected,  setSelected]  = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  const fetchData = () => {
    setLoading(true)
    getProveedores()
      .then(res => setRows(res.data?.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteProveedor(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando proveedores...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Proveedores Externos" icono="bi-truck" labelBoton="Nuevo Proveedor"
        onNuevo={() => { setSelected(null); setShowModal(true) }} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar proveedores..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="proveedores"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Empresa</th><th>NIT</th><th>Rubro</th>
              <th>Teléfono</th><th>Email</th><th>Contacto</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin proveedores registrados</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id}</td>
                <td className="fw-semibold">{r.nombre_Empresa ?? r.nombreEmpresa}</td>
                <td className="text-muted small">{r.nit ?? '—'}</td>
                <td>{r.rubro ?? '—'}</td>
                <td>{r.telefono ?? '—'}</td>
                <td className="text-muted small">{r.email ?? '—'}</td>
                <td className="text-muted small">{r.contacto_Nombre ?? r.contactoNombre ?? '—'}</td>
                <td>
                  <span className={`badge ${r.activo === 1 ? 'text-bg-success' : 'text-bg-secondary'}`}>
                    {r.activo === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(r); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === r.id ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(r.id)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setConfirmId(r.id)}>
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
      <PaginacionFooter
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="proveedores" moduleColor={moduleColor}
      />
      {showModal && (
        <ProveedorModal
          proveedor={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}

function ProveedorModal({ proveedor, onClose, onSaved }) {
  const [nombreEmpresa,    setNombre]    = useState(proveedor?.nombre_Empresa ?? proveedor?.nombreEmpresa ?? '')
  const [nit,              setNit]       = useState(proveedor?.nit ?? '')
  const [rubro,            setRubro]     = useState(proveedor?.rubro ?? '')
  const [telefono,         setTelefono]  = useState(proveedor?.telefono ?? '')
  const [email,            setEmail]     = useState(proveedor?.email ?? '')
  const [contactoNombre,   setContacto]  = useState(proveedor?.contacto_Nombre ?? proveedor?.contactoNombre ?? '')
  const [contactoTelefono, setConTel]    = useState(proveedor?.contacto_Telefono ?? proveedor?.contactoTelefono ?? '')
  const [direccion,        setDireccion] = useState(proveedor?.direccion ?? '')
  const [activo,           setActivo]    = useState(proveedor?.activo ?? 1)
  const [observaciones,    setObs]       = useState(proveedor?.observaciones ?? '')
  const [loading,          setLoading]   = useState(false)
  const [error,            setError]     = useState(null)

  const handleSubmit = async () => {
    if (!nombreEmpresa.trim()) { setError('El nombre de la empresa es requerido'); return }
    setLoading(true); setError(null)
    try {
      const payload = {
        Nombre_Empresa:    nombreEmpresa,
        Nit:               nit              || null,
        Rubro:             rubro            || null,
        Telefono:          telefono         || null,
        Email:             email            || null,
        Contacto_Nombre:   contactoNombre   || null,
        Contacto_Telefono: contactoTelefono || null,
        Direccion:         direccion        || null,
        Activo:            Number(activo),
        Observaciones:     observaciones    || null,
      }
      proveedor
        ? await updateProveedor(proveedor.id, { ...payload, Id: proveedor.id })
        : await createProveedor(payload)
      onSaved()
    } catch (e) { setError(e.response?.data?.message || e.message) }
    finally { setLoading(false) }
  }

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{proveedor ? '✏️ Editar Proveedor' : '🚛 Nuevo Proveedor'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre de Empresa <span className="text-danger">*</span></label>
                  <input className="form-control" value={nombreEmpresa} onChange={e => setNombre(e.target.value)} autoFocus />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">NIT</label>
                  <input className="form-control" value={nit} onChange={e => setNit(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Rubro</label>
                  <input className="form-control" value={rubro} onChange={e => setRubro(e.target.value)} placeholder="Plomería, Eléctrica..." />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Teléfono</label>
                  <input className="form-control" value={telefono} onChange={e => setTelefono(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={activo} onChange={e => setActivo(e.target.value)}>
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre del Contacto</label>
                  <input className="form-control" value={contactoNombre} onChange={e => setContacto(e.target.value)} />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Teléfono del Contacto</label>
                  <input className="form-control" value={contactoTelefono} onChange={e => setConTel(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Dirección</label>
                  <input className="form-control" value={direccion} onChange={e => setDireccion(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : proveedor ? 'Guardar cambios' : 'Crear Proveedor'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}