import { useState, useEffect } from 'react'
import { getRegistros, createRegistro } from './registroAccesoService'
import { getResidentes }    from '../residentes/residenteService'
import { getVehiculos }     from './vehiculoService'
import FkSelector           from '../../components/FkSelector'
import { usePaginacion }    from '../../shared/hooks/usePaginacion'
import PaginacionFooter     from '../../shared/components/PaginacionFooter'
 
const TIPO_MOV_COLOR    = { ENTRADA: 'text-bg-success', SALIDA: 'text-bg-secondary' }
const TIPO_PERSONA_COLOR = { RESIDENTE: 'text-bg-primary', VISITANTE: 'text-bg-warning', PROVEEDOR: 'text-bg-info', EMPLEADO: 'text-bg-dark', OTRO: 'text-bg-light text-dark' }
 
export default function RegistroAccesoTable({ moduleColor }) {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [showModal, setShowModal] = useState(false)
 
  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)
 
  const fetchData = () => {
    setLoading(true)
    getRegistros()
      .then(res => setRows(res.data?.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
 
  useEffect(() => { fetchData() }, [])
 
  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando registros de acceso...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>
 
  return (
    <>
      <PaginacionFooter
        titulo="Registro de Accesos" icono="bi-door-open" labelBoton="Registrar Ingreso/Egreso"
        onNuevo={() => setShowModal(true)} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por nombre, tipo..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="registros"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Movimiento</th><th>Persona</th><th>Tipo Persona</th>
              <th>Placa</th><th>Observaciones</th><th>Fecha/Hora</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={7} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin registros de acceso</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id_Acceso ?? r.idAcceso}</td>
                <td>
                  <span className={`badge ${TIPO_MOV_COLOR[r.tipo_Movimiento ?? r.tipoMovimiento] || 'text-bg-secondary'}`}>
                    {r.tipo_Movimiento ?? r.tipoMovimiento}
                  </span>
                </td>
                <td className="fw-semibold">{r.nombre_Persona ?? r.nombrePersona}</td>
                <td>
                  <span className={`badge ${TIPO_PERSONA_COLOR[r.tipo_Persona ?? r.tipoPersona] || 'text-bg-light text-dark'}`}>
                    {r.tipo_Persona ?? r.tipoPersona}
                  </span>
                </td>
                <td className="text-muted">{r.placa_Vehiculo ?? r.placaVehiculo ?? '—'}</td>
                <td className="text-muted small">{r.observaciones ?? '—'}</td>
                <td className="text-muted small">
                  {r.fecha_Hora ?? r.fechaHora
                    ? new Date(r.fecha_Hora ?? r.fechaHora).toLocaleString('es-GT')
                    : '—'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginacionFooter
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="registros" moduleColor={moduleColor}
      />
      {showModal && (
        <RegistroAccesoModal
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}
 
function RegistroAccesoModal({ onClose, onSaved }) {
  const [tipoMovimiento, setTipoMov]      = useState('ENTRADA')
  const [tipoPersona,    setTipoPer]      = useState('VISITANTE')
  const [nombrePersona,  setNombre]       = useState('')
  const [dpiPersona,     setDpi]          = useState('')
  const [idVehiculo,     setIdVehiculo]   = useState('')      // ← nuevo: ID del vehículo
  const [placaVehiculo,  setPlacaVehiculo]= useState('')      // ← se autocompleta al elegir vehículo
  const [idPropiedad,    setIdProp]       = useState('')
  const [labelPropiedad, setLabelProp]    = useState('')
  const [idMotivoVisita, setIdMotivo]     = useState('')
  const [labelMotivo,    setLabelMotivo]  = useState('')
  const [idResidente,    setIdRes]        = useState('')
  const [labelResidente, setLabelRes]     = useState('')
  const [observaciones,  setObs]          = useState('')
  const [loading,        setLoading]      = useState(false)
  const [error,          setError]        = useState(null)
 
  // Lista de vehículos para el selector
  const [vehiculos,      setVehiculos]    = useState([])
  const [loadingVehs,    setLoadingVehs]  = useState(true)
 
  useEffect(() => {
    getVehiculos()
      .then(res => setVehiculos(res.data?.data ?? []))
      .catch(() => setVehiculos([]))
      .finally(() => setLoadingVehs(false))
  }, [])
 
  // Al seleccionar un vehículo del select, guardar id y placa
  const handleVehiculoChange = (e) => {
    const selectedId = e.target.value
    if (!selectedId) {
      setIdVehiculo('')
      setPlacaVehiculo('')
      return
    }
    const veh = vehiculos.find(v => String(v.id_Vehiculo ?? v.idVehiculo ?? v.id) === selectedId)
    setIdVehiculo(selectedId)
    setPlacaVehiculo(veh?.placa ?? '')
  }
 
  // Filtro: solo letras, espacios, guión y apóstrofe para nombres
  const handleNombreChange = (e) => {
    const val = e.target.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚüÜñÑ\s'.,-]/g, '')
    if (val.length <= 200) setNombre(val)
  }
 
  // Filtro: solo dígitos para DPI
  const handleDpiChange = (e) => {
    const val = e.target.value.replace(/\D/g, '')
    if (val.length <= 20) setDpi(val)
  }
 
  // Filtro: máx 500 caracteres en observaciones
  const handleObsChange = (e) => {
    const val = e.target.value
    if (val.length <= 500) setObs(val)
  }
 
  const handleSubmit = async () => {
    if (!nombrePersona.trim()) { setError('El nombre de la persona es requerido'); return }
    setLoading(true); setError(null)
    try {
      await createRegistro({
        Tipo_Movimiento:  tipoMovimiento,
        Tipo_Persona:     tipoPersona,
        Id_Residente:     idResidente    ? Number(idResidente)    : null,
        Id_Visita:        null,                                         // reservado para uso futuro
        Id_Vehiculo:      idVehiculo     ? Number(idVehiculo)     : null,
        Nombre_Persona:   nombrePersona,
        Dpi_Persona:      dpiPersona     || null,
        Placa_Vehiculo:   placaVehiculo  || null,
        Id_Propiedad:     idPropiedad    ? Number(idPropiedad)    : null,
        Id_Motivo_Visita: idMotivoVisita ? Number(idMotivoVisita) : null,
        Observaciones:    observaciones  || null,
        Registrado_Por:   1,
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
              <h5 className="modal-title">🚪 Registrar Ingreso / Egreso</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
 
                {/* Tipo Movimiento */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tipo de Movimiento <span className="text-danger">*</span></label>
                  <select className="form-select" value={tipoMovimiento} onChange={e => setTipoMov(e.target.value)}>
                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SALIDA">SALIDA</option>
                  </select>
                </div>
 
                {/* Tipo Persona */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tipo de Persona <span className="text-danger">*</span></label>
                  <select className="form-select" value={tipoPersona} onChange={e => setTipoPer(e.target.value)}>
                    <option value="RESIDENTE">RESIDENTE</option>
                    <option value="VISITANTE">VISITANTE</option>
                    <option value="PROVEEDOR">PROVEEDOR</option>
                    <option value="EMPLEADO">EMPLEADO</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
 
                {/* Nombre — solo letras y caracteres válidos */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Nombre Completo <span className="text-danger">*</span>
                  </label>
                  <input
                    className="form-control"
                    value={nombrePersona}
                    onChange={handleNombreChange}
                    placeholder="Nombre de quien ingresa/sale"
                    maxLength={200}
                  />
                  <div className="form-text text-end">{nombrePersona.length}/200</div>
                </div>
 
                {/* DPI — solo números */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">DPI / Pasaporte</label>
                  <input
                    className="form-control"
                    value={dpiPersona}
                    onChange={handleDpiChange}
                    placeholder="Solo números, máx. 20 dígitos"
                    maxLength={20}
                    inputMode="numeric"
                  />
                </div>
 
                {/* Propiedad */}
                <div className="col-md-6">
                  <FkSelector
                    label="Propiedad"
                    fetchFn={getPropiedades}
                    getId={p => p.id_propiedad ?? p.idPropiedad ?? p.id}
                    getLabel={p => p.codigo ?? `Propiedad #${p.id_propiedad ?? p.id}`}
                    value={idPropiedad}
                    displayValue={labelPropiedad}
                    onChange={(id, lbl) => { setIdProp(id); setLabelProp(lbl) }}
                    placeholder="Selecciona propiedad..."
                  />
                </div>
 
                {/* Motivo de Visita */}
                <div className="col-md-6">
                  <FkSelector
                    label="Motivo de Visita"
                    fetchFn={getMotivosVisita}
                    getId={m => m.id ?? m.id_MotivoVisita}
                    getLabel={m => m.nombre ?? `#${m.id}`}
                    value={idMotivoVisita}
                    displayValue={labelMotivo}
                    onChange={(id, lbl) => { setIdMotivo(id); setLabelMotivo(lbl) }}
                    placeholder="Selecciona motivo..."
                  />
                </div>
 
                {/* Residente (solo si Tipo = RESIDENTE) */}
                {tipoPersona === 'RESIDENTE' && (
                  <div className="col-md-6">
                    <FkSelector
                      label="Residente"
                      fetchFn={getResidentes}
                      getId={r => r.id_Residente ?? r.idResidente}
                      getLabel={r => `Residente #${r.id_Residente ?? r.idResidente} — Prop. ${r.id_Propiedad ?? r.idPropiedad}`}
                      value={idResidente}
                      displayValue={labelResidente}
                      onChange={(id, lbl) => { setIdRes(id); setLabelRes(lbl) }}
                      placeholder="Selecciona residente..."
                    />
                  </div>
                )}
 
                {/* Vehículo — select de vehículos registrados */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Vehículo</label>
                  {loadingVehs ? (
                    <div className="form-control d-flex align-items-center gap-2 text-muted">
                      <span className="spinner-border spinner-border-sm" /> Cargando vehículos...
                    </div>
                  ) : (
                    <select
                      className="form-select"
                      value={idVehiculo}
                      onChange={handleVehiculoChange}
                    >
                      <option value="">— Sin vehículo —</option>
                      {vehiculos.map(v => {
                        const vid = v.id_Vehiculo ?? v.idVehiculo ?? v.id
                        return (
                          <option key={vid} value={vid}>
                            {v.placa}
                            {v.marca  ? ` — ${v.marca}`  : ''}
                            {v.modelo ? ` ${v.modelo}`   : ''}
                            {v.color  ? ` (${v.color})`  : ''}
                          </option>
                        )
                      })}
                    </select>
                  )}
                  {placaVehiculo && (
                    <div className="form-text">
                      Placa seleccionada: <strong>{placaVehiculo}</strong>
                    </div>
                  )}
                </div>
 
                {/* Observaciones */}
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea
                    className="form-control"
                    rows={2}
                    value={observaciones}
                    onChange={handleObsChange}
                    maxLength={500}
                  />
                  <div className="form-text text-end">{observaciones.length}/500</div>
                </div>
 
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Registrando...</>
                  : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}