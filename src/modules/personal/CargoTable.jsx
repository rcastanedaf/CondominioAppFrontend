import { useState, useEffect } from 'react'
import { getEmpleados, createEmpleado, updateEmpleado, deleteEmpleado } from './empleadoService'
import { getPersonas }   from '../residentes/personaService'
import { getCargos }     from './cargoService'
import FkSelector        from '../../components/FkSelector'
import { usePaginacion } from '../../shared/hooks/usePaginacion'
import PaginacionFooter  from '../../shared/components/PaginacionFooter'

const ESTADO_COLOR  = { ACTIVO: 'success', INACTIVO: 'secondary', SUSPENDIDO: 'warning' }
const JORNADA_LABEL = { COMPLETA: 'Completa', PARCIAL: 'Parcial', NOCTURNA: 'Nocturna' }

export default function EmpleadoTable({ moduleColor }) {
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
    Promise.all([getEmpleados(), getPersonas(), getCargos()])
      .then(([eRes, perRes, cRes]) => {
        const empleados = eRes.data?.data ?? []
        const personas  = perRes.data?.data ?? []
        const cargos    = cRes.data?.data ?? []

        const enriched = empleados.map(e => {
          const persona = personas.find(p =>
            (p.id_Persona ?? p.idPersona) === (e.id_Persona ?? e.idPersona))
          const cargo   = cargos.find(c =>
            (c.id ?? c.idCargo) === (e.id_Cargo ?? e.idCargo))

          return {
            ...e,
            _nombreCompleto: persona
              ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
              : `Persona #${e.id_Persona ?? e.idPersona}`,
            _nombreCargo: cargo?.nombre ?? `Cargo #${e.id_Cargo ?? e.idCargo}`,
            _salarioCargo: cargo?.salario_Base ?? null,
          }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteEmpleado(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando empleados...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Empleados" icono="bi-person-badge" labelBoton="Nuevo Empleado"
        onNuevo={() => { setSelected(null); setShowModal(true) }} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por nombre, cargo, código..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="empleados"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Código</th><th>Nombre</th><th>Cargo</th>
              <th>Jornada</th><th>Salario</th><th>F. Ingreso</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin empleados registrados</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id}</td>
                <td className="fw-semibold text-muted small">{r.codigo_Empleado ?? r.codigoEmpleado ?? '—'}</td>
                <td className="fw-semibold">{r._nombreCompleto}</td>
                <td>{r._nombreCargo}</td>
                <td>
                  <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                    {JORNADA_LABEL[r.tipo_Jornada ?? r.tipoJornada] ?? r.tipo_Jornada ?? '—'}
                  </span>
                </td>
                <td>Q {Number(r.salario ?? 0).toFixed(2)}</td>
                <td className="text-muted small">{r.fecha_Ingreso?.substring(0, 10) ?? r.fechaIngreso?.substring(0, 10) ?? '—'}</td>
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
        totalDatos={datosFiltrados.length} label="empleados" moduleColor={moduleColor}
      />
      {showModal && (
        <EmpleadoModal
          empleado={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}

function EmpleadoModal({ empleado, onClose, onSaved }) {
  const [idPersona,     setIdPer]    = useState(empleado?.id_Persona ?? empleado?.idPersona ?? '')
  const [labelPersona,  setLabelPer] = useState('')
  const [idCargo,       setIdCargo]  = useState(empleado?.id_Cargo ?? empleado?.idCargo ?? '')
  const [labelCargo,    setLabelCar] = useState('')
  const [codigoEmpleado,setCodigo]   = useState(empleado?.codigo_Empleado ?? empleado?.codigoEmpleado ?? '')
  const [fechaIngreso,  setFechaIn]  = useState(empleado?.fecha_Ingreso?.substring(0, 10) ?? empleado?.fechaIngreso?.substring(0, 10) ?? '')
  const [salario,       setSalario]  = useState(empleado?.salario ?? '')
  const [tipoJornada,   setJornada]  = useState(empleado?.tipo_Jornada ?? empleado?.tipoJornada ?? 'COMPLETA')
  const [estado,        setEstado]   = useState(empleado?.estado ?? 'ACTIVO')
  const [observaciones, setObs]      = useState(empleado?.observaciones ?? '')
  const [loading,       setLoading]  = useState(false)
  const [error,         setError]    = useState(null)

  const handleSubmit = async () => {
    if (!idPersona)    { setError('La persona es requerida'); return }
    if (!idCargo)      { setError('El cargo es requerido'); return }
    if (!fechaIngreso) { setError('La fecha de ingreso es requerida'); return }
    setLoading(true); setError(null)
    try {
      const payload = {
        Id_Persona:      Number(idPersona),
        Id_Cargo:        Number(idCargo),
        Codigo_Empleado: codigoEmpleado || null,
        Fecha_Ingreso:   fechaIngreso,
        Salario:         Number(salario) || 0,
        Tipo_Jornada:    tipoJornada,
        Estado:          estado,
        Observaciones:   observaciones || null,
      }
      empleado
        ? await updateEmpleado(empleado.id, { ...payload, Id: empleado.id })
        : await createEmpleado(payload)
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
              <h5 className="modal-title">{empleado ? '✏️ Editar Empleado' : '👷 Nuevo Empleado'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Persona" required
                    fetchFn={getPersonas}
                    getId={p => p.id_Persona ?? p.idPersona ?? p.id}
                    getLabel={p => `${p.nombres ?? ''} ${p.apellidos ?? ''}`.trim() || `#${p.id_Persona ?? p.id}`}
                    value={idPersona}
                    displayValue={labelPersona}
                    onChange={(id, lbl) => { setIdPer(id); setLabelPer(lbl) }}
                    placeholder="Selecciona persona..."
                  />
                </div>
                <div className="col-md-6">
                  <FkSelector
                    label="Cargo" required
                    fetchFn={getCargos}
                    getId={c => c.id ?? c.idCargo}
                    getLabel={c => c.nombre ?? `Cargo #${c.id}`}
                    value={idCargo}
                    displayValue={labelCargo}
                    onChange={(id, lbl) => { setIdCargo(id); setLabelCar(lbl) }}
                    placeholder="Selecciona cargo..."
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Código de Empleado</label>
                  <input className="form-control" value={codigoEmpleado} onChange={e => setCodigo(e.target.value)} placeholder="EMP-001" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha de Ingreso <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaIngreso} onChange={e => setFechaIn(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Salario (Q)</label>
                  <input type="number" step="0.01" className="form-control" value={salario} onChange={e => setSalario(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tipo de Jornada</label>
                  <select className="form-select" value={tipoJornada} onChange={e => setJornada(e.target.value)}>
                    <option value="COMPLETA">COMPLETA</option>
                    <option value="PARCIAL">PARCIAL</option>
                    <option value="NOCTURNA">NOCTURNA</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    <option value="ACTIVO">ACTIVO</option>
                    <option value="INACTIVO">INACTIVO</option>
                    <option value="SUSPENDIDO">SUSPENDIDO</option>
                  </select>
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : empleado ? 'Guardar cambios' : 'Crear Empleado'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}