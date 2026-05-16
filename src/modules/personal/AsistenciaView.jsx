import { useState, useEffect } from 'react'
import { getAsistenciaByEmpleado, createAsistencia, registrarSalida } from './asistenciaService'
import axios from 'axios'

const BASE_EMP = 'https://localhost:44352/Empleado'
const BASE_PER = 'https://localhost:44352/Persona'

export default function AsistenciaView({ moduleColor }) {
  const [empleados,   setEmpleados]   = useState([])
  const [personas,    setPersonas]    = useState([])
  const [idEmp,       setIdEmp]       = useState('')
  const [registros,   setRegistros]   = useState([])
  const [loading,     setLoading]     = useState(false)
  const [loadingEmp,  setLoadingEmp]  = useState(true)
  const [msg,         setMsg]         = useState(null)

  // Cargar lista de empleados al montar
  useEffect(() => {
    Promise.all([
      axios.get(`${BASE_EMP}/get-all`),
      axios.get(`${BASE_PER}/get-all-persona`), 
    ]).then(([eRes, pRes]) => {
      setEmpleados(eRes.data?.data ?? [])
      setPersonas(pRes.data?.data  ?? [])
    }).catch(e => setMsg({ type: 'danger', text: e.message }))
      .finally(() => setLoadingEmp(false))
  }, [])

  const cargarAsistencia = (id) => {
    console.log('ID que se manda:', id, typeof id)  // ← agrega esto
    if (!id) return
    setLoading(true)
    getAsistenciaByEmpleado(id)
      .then(res => setRegistros(res.data?.data ?? []))
      .catch(e => setMsg({ type: 'danger', text: e.message }))
      .finally(() => setLoading(false))
  }

  const handleSeleccion = (e) => {
    const id = e.target.value
    setIdEmp(id)
    setRegistros([])
    if (id) cargarAsistencia(id)
  }

  const handleRegistrarEntrada = async () => {
    if (!idEmp) return setMsg({ type: 'warning', text: 'Selecciona un empleado' })
    try {
      await createAsistencia({ Id_Empleado: Number(idEmp) })
      setMsg({ type: 'success', text: 'Entrada registrada' })
      cargarAsistencia(idEmp)
    } catch (e) {
      setMsg({ type: 'danger', text: e.response?.data?.message ?? e.message })
    }
  }

  const handleRegistrarSalida = async (idAsistencia) => {
    try {
      await registrarSalida(idAsistencia)
      setMsg({ type: 'success', text: 'Salida registrada' })
      cargarAsistencia(idEmp)
    } catch (e) {
      setMsg({ type: 'danger', text: e.response?.data?.message ?? e.message })
    }
  }

  const nombreEmpleado = (emp) => {
    const per = personas.find(p =>
      (p.id_Persona ?? p.idPersona) === (emp.id_Persona ?? emp.idPersona))
    return per ? `${per.nombres ?? ''} ${per.apellidos ?? ''}`.trim() : `Empleado #${emp.id_Empleado ?? emp.idEmpleado}`
  }

  return (
    <div className="p-3">
      {msg && (
        <div className={`alert alert-${msg.type} alert-dismissible py-2`}>
          {msg.text}
          <button className="btn-close" onClick={() => setMsg(null)} />
        </div>
      )}

      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body">
          <h6 className="fw-semibold mb-3">
            <i className="bi bi-person-check me-2" style={{ color: moduleColor }} />
            Control de Asistencia
          </h6>
          <div className="row g-3 align-items-end">
            <div className="col-12 col-md-5">
              <label className="form-label fw-semibold small">Seleccionar Empleado</label>
              {loadingEmp
                ? <div className="text-muted small">Cargando empleados...</div>
                : (
                  <select className="form-select form-select-sm" value={idEmp} onChange={handleSeleccion}>
                    <option value="">-- Seleccionar --</option>
                    {empleados.map(e => {
                      const id = e.id_Empleado ?? e.idEmpleado
                      return <option key={id} value={id}>{nombreEmpleado(e)}</option>
                    })}
                  </select>
                )
              }
            </div>
            <div className="col-auto">
              <button className="btn btn-sm text-white" style={{ background: moduleColor }}
                onClick={handleRegistrarEntrada} disabled={!idEmp}>
                <i className="bi bi-box-arrow-in-right me-1" /> Registrar Entrada
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading && <div className="text-center py-4"><div className="spinner-border spinner-border-sm" /></div>}

      {!loading && idEmp && (
        <div className="table-responsive">
          <table className="table table-sm table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>ID</th><th>Fecha Entrada</th><th>Hora Entrada</th>
                <th>Hora Salida</th><th>Estado</th><th>Acción</th>
              </tr>
            </thead>
            <tbody>
              {registros.length === 0 ? (
                <tr><td colSpan={6} className="text-center text-muted py-4">Sin registros de asistencia</td></tr>
              ) : registros.map(r => {
                const id      = r.id_Asistencia ?? r.idAsistencia
                const entrada = r.hora_Entrada  ?? r.horaEntrada  ?? '—'
                const salida  = r.hora_Salida   ?? r.horaSalida
                const fecha   = r.fecha         ?? '—'
                return (
                  <tr key={id}>
                    <td>{id}</td>
                    <td>{String(fecha).slice(0, 10)}</td>
                    <td>{entrada}</td>
                    <td>{salida ?? <span className="text-muted">Pendiente</span>}</td>
                    <td>
                      <span className={`badge ${salida ? 'bg-success' : 'bg-warning text-dark'}`}>
                        {salida ? 'Completo' : 'En curso'}
                      </span>
                    </td>
                    <td>
                      {!salida && (
                        <button className="btn btn-xs btn-outline-danger btn-sm"
                          onClick={() => handleRegistrarSalida(id)}>
                          <i className="bi bi-box-arrow-right me-1" />Salida
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}