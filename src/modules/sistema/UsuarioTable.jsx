import { useState } from 'react'
import { getAsistenciaByEmpleado, createAsistencia, registrarSalida } from '../personal/asistenciaService'
import { getEmpleados }  from '../personal/empleadoService'
import { getPersonas }   from '../residentes/personaService'
import FkSelector        from '../../components/FkSelector'

const ESTADO_COLOR = { PRESENTE: 'success', AUSENTE: 'danger', TARDANZA: 'warning', PERMISO: 'info', VACACIONES: 'primary' }

export default function AsistenciaView({ moduleColor }) {
  const [idEmpleado,    setIdEmp]   = useState('')
  const [labelEmpleado, setLabelEmp]= useState('')
  const [registros,     setRegistros] = useState([])
  const [loading,       setLoading] = useState(false)
  const [error,         setError]   = useState(null)
  const [showModal,     setShowModal] = useState(false)
  const [confirmSalida, setConfirmSalida] = useState(null)

  const buscarAsistencia = async (id) => {
    if (!id) return
    setLoading(true); setError(null)
    try {
      const res = await getAsistenciaByEmpleado(id)
      setRegistros(res.data?.data ?? [])
    } catch (e) { setError(e.response?.data?.message || e.message); setRegistros([]) }
    finally { setLoading(false) }
  }

  const handleSelectEmpleado = (id, lbl) => {
    setIdEmp(id); setLabelEmp(lbl)
    buscarAsistencia(id)
  }

  const handleRegistrarSalida = async (id) => {
    try {
      await registrarSalida(id)
      setConfirmSalida(null)
      buscarAsistencia(idEmpleado)
    } catch (e) { alert('Error: ' + e.message) }
  }

  // Para el FkSelector de empleados necesitamos personas también
  const fetchEmpleadosEnriquecidos = async () => {
    const [eRes, perRes] = await Promise.all([getEmpleados(), getPersonas()])
    const empleados = eRes.data?.data ?? []
    const personas  = perRes.data?.data ?? []
    return {
      data: empleados.map(e => {
        const persona = personas.find(p =>
          (p.id_Persona ?? p.idPersona) === (e.id_Persona ?? e.idPersona))
        return { ...e, _nombreCompleto: persona ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim() : `Empleado #${e.id}` }
      })
    }
  }

  return (
    <div>
      {/* Selector de empleado */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <h6 className="fw-bold mb-3" style={{ color: moduleColor }}>
            <i className="bi bi-search me-2" />Buscar asistencia por empleado
          </h6>
          <div className="row g-3 align-items-end">
            <div className="col-md-6">
              <FkSelector
                label="Empleado"
                fetchFn={fetchEmpleadosEnriquecidos}
                getId={e => e.id}
                getLabel={e => e._nombreCompleto ?? `Empleado #${e.id}`}
                value={idEmpleado}
                displayValue={labelEmpleado}
                onChange={handleSelectEmpleado}
                placeholder="Selecciona un empleado..."
              />
            </div>
            {idEmpleado && (
              <div className="col-md-3">
                <button
                  className="btn btn-primary w-100"
                  onClick={() => setShowModal(true)}
                >
                  <i className="bi bi-plus-lg me-2" />Registrar Asistencia
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Resultado */}
      {error && <div className="alert alert-danger"><i className="bi bi-exclamation-circle me-2" />{error}</div>}

      {loading && (
        <div className="text-center py-5 text-muted">
          <div className="spinner-border spinner-border-sm me-2" />Cargando asistencia...
        </div>
      )}

      {!loading && idEmpleado && registros.length === 0 && (
        <div className="text-center py-5 text-muted">
          <i className="bi bi-inbox fs-2 d-block mb-2" />
          Sin registros de asistencia para este empleado
        </div>
      )}

      {!loading && registros.length > 0 && (
        <div className="cms-table-wrap">
          <table className="table table-hover cms-table">
            <thead>
              <tr>
                <th>#</th><th>Fecha</th><th>Entrada</th><th>Salida</th>
                <th>Estado</th><th>Min. Extra</th><th>Min. Tardanza</th><th>Observaciones</th><th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {registros.map((r, i) => (
                <tr key={r.id ?? i}>
                  <td className="text-muted">{r.id}</td>
                  <td className="fw-semibold">{r.fecha?.substring(0, 10) ?? '—'}</td>
                  <td>{r.hora_Entrada ?? r.horaEntrada ?? '—'}</td>
                  <td>{r.hora_Salida ?? r.horaSalida ?? <span className="badge text-bg-warning">Pendiente</span>}</td>
                  <td>
                    <span className={`badge text-bg-${ESTADO_COLOR[r.estado] || 'secondary'}`}>{r.estado}</span>
                  </td>
                  <td>{r.minutos_Extra ?? r.minutosExtra ?? 0} min</td>
                  <td>{r.minutos_Tardanza ?? r.minutosTardanza ?? 0} min</td>
                  <td className="text-muted small">{r.observaciones ?? '—'}</td>
                  <td>
                    {!(r.hora_Salida ?? r.horaSalida) && (
                      confirmSalida === r.id ? (
                        <div className="d-flex gap-1">
                          <span className="text-warning small align-self-center">¿Registrar salida?</span>
                          <button className="btn btn-sm btn-success py-0 px-2" onClick={() => handleRegistrarSalida(r.id)}>Sí</button>
                          <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmSalida(null)}>No</button>
                        </div>
                      ) : (
                        <button className="btn btn-sm btn-outline-success py-0 px-2" onClick={() => setConfirmSalida(r.id)}>
                          <i className="bi bi-box-arrow-right me-1" style={{ fontSize: 11 }} />Registrar Salida
                        </button>
                      )
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <AsistenciaModal
          idEmpleado={idEmpleado}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); buscarAsistencia(idEmpleado) }}
        />
      )}
    </div>
  )
}

function AsistenciaModal({ idEmpleado, onClose, onSaved }) {
  const hoy = new Date().toISOString().substring(0, 10)
  const ahora = new Date().toTimeString().substring(0, 5)

  const [fecha,         setFecha]   = useState(hoy)
  const [horaEntrada,   setHoraIn]  = useState(ahora)
  const [horaSalida,    setHoraSal] = useState('')
  const [estado,        setEstado]  = useState('PRESENTE')
  const [minutosExtra,  setMExtra]  = useState(0)
  const [minutosTard,   setMTard]   = useState(0)
  const [observaciones, setObs]     = useState('')
  const [loading,       setLoading] = useState(false)
  const [error,         setError]   = useState(null)

  const handleSubmit = async () => {
    if (!fecha)      { setError('La fecha es requerida'); return }
    if (!horaEntrada){ setError('La hora de entrada es requerida'); return }
    setLoading(true); setError(null)
    try {
      await createAsistencia({
        Id_Empleado:       Number(idEmpleado),
        Fecha:             fecha,
        Hora_Entrada:      horaEntrada,
        Hora_Salida:       horaSalida || null,
        Estado:            estado,
        Minutos_Extra:     Number(minutosExtra)  || 0,
        Minutos_Tardanza:  Number(minutosTard)   || 0,
        Observaciones:     observaciones || null,
        Registrado_Por:    1,
      })
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
              <h5 className="modal-title">📋 Registrar Asistencia</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fecha} onChange={e => setFecha(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Hora Entrada <span className="text-danger">*</span></label>
                  <input type="time" className="form-control" value={horaEntrada} onChange={e => setHoraIn(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Hora Salida</label>
                  <input type="time" className="form-control" value={horaSalida} onChange={e => setHoraSal(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    <option value="PRESENTE">PRESENTE</option>
                    <option value="AUSENTE">AUSENTE</option>
                    <option value="TARDANZA">TARDANZA</option>
                    <option value="PERMISO">PERMISO</option>
                    <option value="VACACIONES">VACACIONES</option>
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Min. Extra</label>
                  <input type="number" className="form-control" value={minutosExtra} onChange={e => setMExtra(e.target.value)} min={0} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Min. Tardanza</label>
                  <input type="number" className="form-control" value={minutosTard} onChange={e => setMTard(e.target.value)} min={0} />
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Registrando...</> : 'Registrar Asistencia'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}