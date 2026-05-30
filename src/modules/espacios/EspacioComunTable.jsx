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
      .then(res => setRows(res.data?.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try {
      await deleteEspacio(id)
      setConfirmId(null)
      fetchData()
    } catch (err) {
      alert('Error al eliminar: ' + (err.response?.data?.message ?? err.message))
    }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando espacios...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Catálogo de Espacios Comunes" icono="bi-building" labelBoton="Nuevo Espacio"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
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
                    <button className="btn btn-sm btn-outline-primary" onClick={() => { setSelected(r); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === r.id ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger" onClick={() => handleEliminar(r.id_Espacio ?? r.id)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary" onClick={() => setConfirmId(null)}>No</button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger" onClick={() => setConfirmId(r.id)}>
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
  const [form, setForm] = useState({
    nombre:           espacio?.nombre ?? '',
    descripcion:      espacio?.descripcion ?? '',
    capacidad:        espacio?.capacidad_Max ?? espacio?.capacidadMax ?? '',
    requiereReserva:  espacio?.requiere_Reserva ?? espacio?.requiereReserva ?? 1,
    tieneCosto:       espacio?.tiene_Costo ?? espacio?.tieneCosto ?? 0,
    costoPorHora:     espacio?.costo_Por_Hora ?? espacio?.costoPorHora ?? '',
    costoPorDia:      espacio?.costo_Por_Dia ?? espacio?.costoPorDia ?? '',
    depositoGarantia: espacio?.deposito_Garantia ?? espacio?.depositoGarantia ?? '',
    horarioApertura:  espacio?.horario_Apertura ?? espacio?.horarioApertura ?? '',
    horarioCierre:    espacio?.horario_Cierre ?? espacio?.horarioCierre ?? '',
    reglas:           espacio?.reglas ?? '',
    estado:           espacio?.estado ?? 'DISPONIBLE',
    activo:           espacio?.activo ?? 1,
  })
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))
  const setN  = (k) => (e) => setForm(f => ({ ...f, [k]: Number(e.target.value) }))

  const validate = () => {
    if (!form.nombre.trim())   return 'El nombre es obligatorio'
    const cap = Number(form.capacidad)
    if (!form.capacidad || isNaN(cap) || cap < 1 || cap > 1000)
      return 'La capacidad debe estar entre 1 y 1000 personas'
    if (!form.horarioApertura) return 'La hora de apertura es obligatoria'
    if (!form.horarioCierre)   return 'La hora de cierre es obligatoria'
    if (Number(form.tieneCosto) === 1) {
      if (Number(form.costoPorHora) <= 0 && Number(form.costoPorDia) <= 0)
        return 'Si el espacio tiene costo, ingrese al menos el costo por hora o por día'
    }
    return null
  }

  const handleSubmit = async () => {
    const err = validate()
    if (err) { setError(err); return }

    setLoading(true)
    setError(null)
    try {
      const payload = {
        Nombre:            form.nombre.trim(),
        Descripcion:       form.descripcion || null,
        Capacidad_Max:     Number(form.capacidad),
        Requiere_Reserva:  Number(form.requiereReserva),
        Tiene_Costo:       Number(form.tieneCosto),
        Costo_Por_Hora:    Number(form.costoPorHora) || 0,
        Costo_Por_Dia:     Number(form.costoPorDia)  || 0,
        Deposito_Garantia: Number(form.depositoGarantia) || 0,
        Horario_Apertura:  form.horarioApertura || null,
        Horario_Cierre:    form.horarioCierre   || null,
        Reglas:            form.reglas || null,
        Estado:            form.estado,
        Activo:            Number(form.activo),
      }
      const id = espacio?.id_Espacio ?? espacio?.id
      if (espacio) {
        await updateEspacio(id, { ...payload, Id_Espacio: id })
      } else {
        await createEspacio(payload)
      }
      onSaved()
    } catch (e) {
      setError(e.response?.data?.message ?? e.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h6 className="modal-title fw-bold">{espacio ? 'Editar Espacio Común' : 'Nuevo Espacio Común'}</h6>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-warning alert-dismissible py-2 mb-3">
                  <i className="bi bi-exclamation-triangle me-2" />{error}
                  <button className="btn-close" onClick={() => setError(null)} />
                </div>
              )}
              <div className="row g-3">
                {/* Nombre */}
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
                  <input className="form-control form-control-sm" value={form.nombre}
                    onChange={set('nombre')} placeholder="Ej. Piscina, Salón de Eventos..." />
                </div>
                {/* Capacidad Máx */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Capacidad Máx. <span className="text-danger">*</span></label>
                  <input type="number" min="1" max="1000" className="form-control form-control-sm"
                    value={form.capacidad} onChange={set('capacidad')} placeholder="1 – 1000" />
                </div>
                {/* Descripción */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={form.descripcion} onChange={set('descripcion')} placeholder="Descripción del espacio..." />
                </div>
                {/* Requiere Reserva / Tiene Costo / Estado */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Requiere Reserva <span className="text-danger">*</span></label>
                  <select className="form-select form-select-sm" value={form.requiereReserva} onChange={setN('requiereReserva')}>
                    <option value={1}>Sí</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tiene Costo <span className="text-danger">*</span></label>
                  <select className="form-select form-select-sm" value={form.tieneCosto} onChange={setN('tieneCosto')}>
                    <option value={0}>No</option>
                    <option value={1}>Sí</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado <span className="text-danger">*</span></label>
                  <select className="form-select form-select-sm" value={form.estado} onChange={set('estado')}>
                    <option value="DISPONIBLE">Disponible</option>
                    <option value="EN_MANTENIMIENTO">En Mantenimiento</option>
                    <option value="INACTIVO">Inactivo</option>
                  </select>
                </div>
                {/* Costos */}
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Costo por Hora (Q)</label>
                  <input type="number" step="0.01" min="0" className="form-control form-control-sm"
                    value={form.costoPorHora} onChange={set('costoPorHora')} placeholder="0.00"
                    disabled={Number(form.tieneCosto) === 0} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Costo por Día (Q)</label>
                  <input type="number" step="0.01" min="0" className="form-control form-control-sm"
                    value={form.costoPorDia} onChange={set('costoPorDia')} placeholder="0.00"
                    disabled={Number(form.tieneCosto) === 0} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Depósito Garantía (Q)</label>
                  <input type="number" step="0.01" min="0" className="form-control form-control-sm"
                    value={form.depositoGarantia} onChange={set('depositoGarantia')} placeholder="0.00"
                    disabled={Number(form.tieneCosto) === 0} />
                </div>
                {/* Horarios */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Apertura <span className="text-danger">*</span></label>
                  <input type="time" className="form-control form-control-sm"
                    value={form.horarioApertura} onChange={set('horarioApertura')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Cierre <span className="text-danger">*</span></label>
                  <input type="time" className="form-control form-control-sm"
                    value={form.horarioCierre} onChange={set('horarioCierre')} />
                </div>
                {/* Activo */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Activo</label>
                  <select className="form-select form-select-sm" value={form.activo} onChange={setN('activo')}>
                    <option value={1}>Sí</option>
                    <option value={0}>No</option>
                  </select>
                </div>
                {/* Reglas */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Reglas del Espacio</label>
                  <textarea className="form-control form-control-sm" rows={3}
                    value={form.reglas} onChange={set('reglas')}
                    placeholder="Reglas de uso, restricciones, horarios especiales..." />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-sm btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : espacio ? 'Guardar Cambios' : 'Crear Espacio'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
