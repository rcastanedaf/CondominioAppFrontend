import { useState, useEffect } from 'react'
import { getRegistros, createRegistro } from './registroAccesoService'
import { getResidentes }    from '../residentes/residenteService'
import { getPersonas }      from '../residentes/personaService'
import { getPropiedades }   from '../catalogos/propiedadService'
import { getMotivosVisita } from '../catalogos/motivoVisitaService'
import FkSelector           from '../../components/FkSelector'
import { usePaginacion }    from '../../shared/hooks/usePaginacion'
import PaginacionFooter     from '../../shared/components/PaginacionFooter'

const TIPO_MOV_COLOR    = { ENTRADA: 'text-bg-success', SALIDA: 'text-bg-secondary' }
const TIPO_PERSONA_COLOR = { RESIDENTE: 'text-bg-primary', VISITA: 'text-bg-warning', PROVEEDOR: 'text-bg-info', EMPLEADO: 'text-bg-dark' }

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
    Promise.all([getRegistros(), getPropiedades(), getMotivosVisita()])
      .then(([rRes, pRes, mvRes]) => {
        const registros   = rRes.data?.data ?? []
        const propiedades = pRes.data?.data ?? []
        const motivos     = mvRes.data?.data ?? []

        const enriched = registros.map(r => {
          const propiedad = propiedades.find(p =>
            (p.id_propiedad ?? p.idPropiedad) === (r.id_Propiedad ?? r.idPropiedad))
          const motivo = motivos.find(m =>
            (m.id ?? m.id_MotivoVisita) === (r.id_Motivo_Visita ?? r.idMotivoVisita))

          return {
            ...r,
            _codigoPropiedad: propiedad?.codigo ?? (r.id_Propiedad ? `Prop. #${r.id_Propiedad}` : '—'),
            _motivoNombre:    motivo?.nombre ?? (r.id_Motivo_Visita ? `Motivo #${r.id_Motivo_Visita}` : '—'),
          }
        })

        setRows(enriched)
      })
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
              <th>Propiedad</th><th>Placa</th><th>Motivo</th><th>Fecha/Hora</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={8} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin registros de acceso</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id}</td>
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
                <td>{r._codigoPropiedad}</td>
                <td className="text-muted">{r.placa_Vehiculo ?? r.placaVehiculo ?? '—'}</td>
                <td className="text-muted small">{r._motivoNombre}</td>
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
  const [tipoMovimiento, setTipoMov]    = useState('ENTRADA')
  const [tipoPersona,    setTipoPer]    = useState('VISITA')
  const [nombrePersona,  setNombre]     = useState('')
  const [dpiPersona,     setDpi]        = useState('')
  const [placaVehiculo,  setPlaca]      = useState('')
  const [idPropiedad,    setIdProp]     = useState('')
  const [labelPropiedad, setLabelProp]  = useState('')
  const [idMotivoVisita, setIdMotivo]   = useState('')
  const [labelMotivo,    setLabelMotivo]= useState('')
  const [idResidente,    setIdRes]      = useState('')
  const [labelResidente, setLabelRes]   = useState('')
  const [observaciones,  setObs]        = useState('')
  const [loading,        setLoading]    = useState(false)
  const [error,          setError]      = useState(null)

  const handleSubmit = async () => {
    if (!nombrePersona.trim()) { setError('El nombre de la persona es requerido'); return }
    setLoading(true); setError(null)
    try {
      await createRegistro({
        Tipo_Movimiento:   tipoMovimiento,
        Tipo_Persona:      tipoPersona,
        Id_Residente:      idResidente  ? Number(idResidente)  : null,
        Id_Propiedad:      idPropiedad  ? Number(idPropiedad)  : null,
        Id_Motivo_Visita:  idMotivoVisita ? Number(idMotivoVisita) : null,
        Nombre_Persona:    nombrePersona,
        Dpi_Persona:       dpiPersona   || null,
        Placa_Vehiculo:    placaVehiculo || null,
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
              <h5 className="modal-title">🚪 Registrar Ingreso / Egreso</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tipo de Movimiento <span className="text-danger">*</span></label>
                  <select className="form-select" value={tipoMovimiento} onChange={e => setTipoMov(e.target.value)}>
                    <option value="ENTRADA">ENTRADA</option>
                    <option value="SALIDA">SALIDA</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Tipo de Persona <span className="text-danger">*</span></label>
                  <select className="form-select" value={tipoPersona} onChange={e => setTipoPer(e.target.value)}>
                    <option value="RESIDENTE">RESIDENTE</option>
                    <option value="VISITA">VISITA</option>
                    <option value="PROVEEDOR">PROVEEDOR</option>
                    <option value="EMPLEADO">EMPLEADO</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre Completo <span className="text-danger">*</span></label>
                  <input className="form-control" value={nombrePersona} onChange={e => setNombre(e.target.value)} placeholder="Nombre de quien ingresa/sale" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">DPI / Pasaporte</label>
                  <input className="form-control" value={dpiPersona} onChange={e => setDpi(e.target.value)} placeholder="Documento de identidad" />
                </div>
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
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Placa Vehículo</label>
                  <input className="form-control" value={placaVehiculo} onChange={e => setPlaca(e.target.value)} placeholder="Ej. P-123ABC" />
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Registrando...</> : 'Registrar'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}