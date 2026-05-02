import { useState, useEffect } from 'react'
import { getEspacios, createEspacio, updateEspacio, deleteEspacio } from './espacioComunService'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

const ESTADO_COLOR = { DISPONIBLE: 'success', EN_MANTENIMIENTO: 'warning', INACTIVO: 'secondary' }

export default function EspacioComunTable({ moduleColor }) {
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
    getEspacios()
      .then(res => setRows(Array.isArray(res.data) ? res.data : res.data?.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteEspacio(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando espacios...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Catálogo de Espacios Comunes" icono="bi-building" labelBoton="Nuevo Espacio"
        onNuevo={() => { setSelected(null); setShowModal(true) }} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por nombre..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="espacios"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Nombre</th><th>Capacidad</th><th>Req. Reserva</th>
              <th>Costo/Hora</th><th>Costo/Día</th><th>Depósito</th>
              <th>Apertura</th><th>Cierre</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={11} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin espacios registrados</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id}</td>
                <td className="fw-semibold">{r.nombre}</td>
                <td>{r.capacidad_Max ?? r.capacidadMax} personas</td>
                <td>
                  <span className={`badge ${(r.requiere_Reserva ?? r.requiereReserva) === 1 ? 'text-bg-info' : 'text-bg-light text-dark'}`}>
                    {(r.requiere_Reserva ?? r.requiereReserva) === 1 ? 'Sí' : 'No'}
                  </span>
                </td>
                <td>Q {Number(r.costo_Por_Hora ?? r.costoPorHora ?? 0).toFixed(2)}</td>
                <td>Q {Number(r.costo_Por_Dia ?? r.costoPorDia ?? 0).toFixed(2)}</td>
                <td>Q {Number(r.deposito_Garantia ?? r.depositoGarantia ?? 0).toFixed(2)}</td>
                <td className="text-muted small">{r.horario_Apertura ?? r.horarioApertura ?? '—'}</td>
                <td className="text-muted small">{r.horario_Cierre ?? r.horarioCierre ?? '—'}</td>
                <td>
                  <span className={`badge text-bg-${ESTADO_COLOR[r.estado] || 'secondary'}`}>{r.estado}</span>
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
        totalDatos={datosFiltrados.length} label="espacios" moduleColor={moduleColor}
      />
      {showModal && (
        <EspacioModal
          espacio={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}

function EspacioModal({ espacio, onClose, onSaved }) {
  const [nombre,          setNombre]       = useState(espacio?.nombre ?? '')
  const [descripcion,     setDesc]         = useState(espacio?.descripcion ?? '')
  const [capacidadMax,    setCapacidad]    = useState(espacio?.capacidad_Max ?? espacio?.capacidadMax ?? '')
  const [requiereReserva, setReqRes]       = useState(espacio?.requiere_Reserva ?? espacio?.requiereReserva ?? 1)
  const [tieneCosto,      setTieneCosto]   = useState(espacio?.tiene_Costo ?? espacio?.tieneCosto ?? 0)
  const [costoPorHora,    setCostoPorHora] = useState(espacio?.costo_Por_Hora ?? espacio?.costoPorHora ?? '')
  const [costoPorDia,     setCostoPorDia]  = useState(espacio?.costo_Por_Dia ?? espacio?.costoPorDia ?? '')
  const [depositoGarantia,setDeposito]     = useState(espacio?.deposito_Garantia ?? espacio?.depositoGarantia ?? '')
  const [horarioApertura, setApertura]     = useState(espacio?.horario_Apertura ?? espacio?.horarioApertura ?? '')
  const [horarioCierre,   setCierre]       = useState(espacio?.horario_Cierre ?? espacio?.horarioCierre ?? '')
  const [reglas,          setReglas]       = useState(espacio?.reglas ?? '')
  const [estado,          setEstado]       = useState(espacio?.estado ?? 'DISPONIBLE')
  const [loading,         setLoading]      = useState(false)
  const [error,           setError]        = useState(null)

  const handleSubmit = async () => {
    if (!nombre.trim())  { setError('El nombre es requerido'); return }
    if (!capacidadMax)   { setError('La capacidad es requerida'); return }
    setLoading(true); setError(null)
    try {
      const payload = {
        Nombre:            nombre,
        Descripcion:       descripcion  || null,
        Capacidad_Max:     Number(capacidadMax),
        Requiere_Reserva:  Number(requiereReserva),
        Tiene_Costo:       Number(tieneCosto),
        Costo_Por_Hora:    Number(costoPorHora)    || 0,
        Costo_Por_Dia:     Number(costoPorDia)     || 0,
        Deposito_Garantia: Number(depositoGarantia)|| 0,
        Horario_Apertura:  horarioApertura || null,
        Horario_Cierre:    horarioCierre   || null,
        Reglas:            reglas          || null,
        Estado:            estado,
        Activo:            1,
      }
      espacio
        ? await updateEspacio(espacio.id, { ...payload, Id: espacio.id })
        : await createEspacio(payload)
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
              <h5 className="modal-title">{espacio ? '✏️ Editar Espacio' : '🏊 Nuevo Espacio Común'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
                  <input className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} placeholder="Ej. Piscina, Salón de Eventos..." />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Capacidad Máx. <span className="text-danger">*</span></label>
                  <input type="number" className="form-control" value={capacidadMax} onChange={e => setCapacidad(e.target.value)} placeholder="50" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" rows={2} value={descripcion} onChange={e => setDesc(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Requiere Reserva</label>
                  <select className="form-select" value={requiereReserva} onChange={e => setReqRes(Number(e.target.value))}>
                    <option value={1}>Sí</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tiene Costo</label>
                  <select className="form-select" value={tieneCosto} onChange={e => setTieneCosto(Number(e.target.value))}>
                    <option value={0}>No</option>
                    <option value={1}>Sí</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    <option value="DISPONIBLE">DISPONIBLE</option>
                    <option value="EN_MANTENIMIENTO">EN MANTENIMIENTO</option>
                    <option value="INACTIVO">INACTIVO</option>
                  </select>
                </div>
                {Number(tieneCosto) === 1 && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Costo por Hora (Q)</label>
                      <input type="number" step="0.01" className="form-control" value={costoPorHora} onChange={e => setCostoPorHora(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Costo por Día (Q)</label>
                      <input type="number" step="0.01" className="form-control" value={costoPorDia} onChange={e => setCostoPorDia(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Depósito Garantía (Q)</label>
                      <input type="number" step="0.01" className="form-control" value={depositoGarantia} onChange={e => setDeposito(e.target.value)} />
                    </div>
                  </>
                )}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Apertura</label>
                  <input type="time" className="form-control" value={horarioApertura} onChange={e => setApertura(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Cierre</label>
                  <input type="time" className="form-control" value={horarioCierre} onChange={e => setCierre(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Reglas del Espacio</label>
                  <textarea className="form-control" rows={3} value={reglas} onChange={e => setReglas(e.target.value)} placeholder="Reglas de uso, restricciones, etc." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : espacio ? 'Guardar cambios' : 'Crear Espacio'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}