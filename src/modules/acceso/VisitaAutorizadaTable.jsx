import { useState, useEffect } from 'react'
import { getVisitas, createVisita, updateVisita } from './visitaService'
import { getResidentes }    from '../residentes/residenteService'
import { getPersonas }      from '../residentes/personaService'
import { getPropiedades }   from '../catalogos/propiedadService'
import { getMotivosVisita } from '../catalogos/motivoVisitaService'
import FkSelector           from '../../components/FkSelector'
import { usePaginacion }    from '../../shared/hooks/usePaginacion'
import PaginacionFooter     from '../../shared/components/PaginacionFooter'

const ESTADO_COLOR = { ACTIVA: 'text-bg-success', USADA: 'text-bg-secondary', CANCELADA: 'text-bg-danger', VENCIDA: 'text-bg-warning' }

export default function VisitaAutorizadaTable({ moduleColor }) {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected,  setSelected]  = useState(null)

  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  const fetchData = () => {
    setLoading(true)
    Promise.all([getVisitas(), getResidentes(), getPersonas(), getPropiedades(), getMotivosVisita()])
      .then(([vRes, rRes, perRes, pRes, mvRes]) => {
        const visitas     = vRes.data?.data   ?? []
        const residentes  = rRes.data?.data   ?? []
        const personas    = perRes.data?.data ?? []
        const propiedades = pRes.data?.data   ?? []
        const motivos     = mvRes.data?.data  ?? []

        const enriched = visitas.map(v => {
          const residente = residentes.find(r =>
            (r.id_Residente ?? r.idResidente) === (v.id_Residente ?? v.idResidente))
          const persona   = personas.find(p =>
            (p.id_Persona ?? p.idPersona) === (residente?.id_Persona ?? residente?.idPersona))
          const propiedad = propiedades.find(p =>
            (p.id_propiedad ?? p.idPropiedad) === (v.id_Propiedad ?? v.idPropiedad))
          const motivo    = motivos.find(m =>
            (m.id ?? m.id_MotivoVisita) === (v.id_Motivo_Visita ?? v.idMotivoVisita))

          return {
            ...v,
            _nombreResidente:  persona
              ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
              : `Residente #${v.id_Residente ?? v.idResidente}`,
            _codigoPropiedad:  propiedad?.codigo ?? `Prop. #${v.id_Propiedad ?? v.idPropiedad}`,
            _motivoNombre:     motivo?.nombre ?? '—',
          }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando visitas...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Visitas Autorizadas" icono="bi-person-check" labelBoton="Nueva Visita"
        onNuevo={() => { setSelected(null); setShowModal(true) }} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por visitante, residente..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="visitas"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Visitante</th>
              <th>DPI</th>
              <th>Residente</th>
              <th>Propiedad</th>
              <th>Motivo</th>
              <th>Tipo</th>
              <th>Placa</th>
              <th>Desde</th>
              <th>Hasta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={12} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin visitas registradas</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id_Visita}</td>
                <td className="fw-semibold">{r.nombre_Visitante ?? r.nombreVisitante}</td>
                <td className="text-muted small">{r.dpi_Visitante ?? r.dpiVisitante ?? '—'}</td>
                <td>{r._nombreResidente}</td>
                <td>{r._codigoPropiedad}</td>
                <td className="text-muted small">{r._motivoNombre}</td>
                <td><span className="badge text-bg-light border" style={{ fontSize: 10 }}>{r.tipo}</span></td>
                <td className="text-muted small">{r.placa_Vehiculo ?? r.placaVehiculo ?? '—'}</td>
                <td className="text-muted small">{r.fecha_Desde?.substring(0, 10) ?? r.fechaDesde?.substring(0, 10) ?? '—'}</td>
                <td className="text-muted small">{r.fecha_Hasta?.substring(0, 10) ?? r.fechaHasta?.substring(0, 10) ?? '—'}</td>
                <td><span className={`badge ${ESTADO_COLOR[r.estado] || 'text-bg-light text-dark'}`}>{r.estado}</span></td>
                <td>
                  <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(r); setShowModal(true) }}>
                    <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginacionFooter
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="visitas" moduleColor={moduleColor}
      />
      {showModal && (
        <VisitaModal
          visita={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}

function VisitaModal({ visita, onClose, onSaved }) {
  const [idResidente,    setIdRes]      = useState(visita?.id_Residente ?? visita?.idResidente ?? '')
  const [labelResidente, setLabelRes]   = useState('')
  const [idPropiedad,    setIdProp]     = useState(visita?.id_Propiedad ?? visita?.idPropiedad ?? '')
  const [labelPropiedad, setLabelProp]  = useState('')
  const [idMotivoVisita, setIdMotivo]   = useState(visita?.id_Motivo_Visita ?? visita?.idMotivoVisita ?? '')
  const [labelMotivo,    setLabelMotivo]= useState('')
  const [nombreVisitante,setNombre]     = useState(visita?.nombre_Visitante ?? visita?.nombreVisitante ?? '')
  const [dpiVisitante,   setDpi]        = useState(visita?.dpi_Visitante ?? visita?.dpiVisitante ?? '')
  const [placaVehiculo,  setPlaca]      = useState(visita?.placa_Vehiculo ?? visita?.placaVehiculo ?? '')
  const [fechaDesde,     setFechaDesde] = useState(visita?.fecha_Desde?.substring(0, 10) ?? '')
  const [fechaHasta,     setFechaHasta] = useState(visita?.fecha_Hasta?.substring(0, 10) ?? '')
  const [horaDesde,      setHoraDesde]  = useState(visita?.hora_Desde ?? '')
  const [horaHasta,      setHoraHasta]  = useState(visita?.hora_Hasta ?? '')
  const [tipo,           setTipo]       = useState(visita?.tipo ?? 'UNICA')
  const [estado,         setEstado]     = useState(visita?.estado ?? 'ACTIVA')
  const [observaciones,  setObs]        = useState(visita?.observaciones ?? '')
  const [loading,        setLoading]    = useState(false)
  const [error,          setError]      = useState(null)

  // Estados para errores específicos de cada campo
  const [nombreError, setNombreError] = useState('')
  const [dpiError, setDpiError] = useState('')
  const [placaError, setPlacaError] = useState('')

  // Funciones de validación
  const validarNombre = (nombre) => {
    if (!nombre.trim()) {
      setNombreError('El nombre es requerido')
      return false
    }
    const regexNombre = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{2,}$/
    if (!regexNombre.test(nombre)) {
      setNombreError('Solo letras y mínimo 2 caracteres')
      return false
    }
    setNombreError('')
    return true
  }

  const validarDPI = (dpi) => {
    if (dpi === '') {
      setDpiError('')
      return true // DPI es opcional
    }
    const regexDPI = /^\d{13}$/
    if (!regexDPI.test(dpi)) {
      setDpiError('Debe tener 13 dígitos numéricos')
      return false
    }
    setDpiError('')
    return true
  }

  const validarPlaca = (placa) => {
    if (placa === '') {
      setPlacaError('')
      return true // Placa es opcional
    }
    // Formato guatemalteco: letra-guion-3letras o letra-guion-3números
    const regexPlaca = /^[A-Za-z]-[A-Za-z0-9]{3}[A-Za-z0-9]?$/
    if (!regexPlaca.test(placa.toUpperCase())) {
      setPlacaError('Formato inválido (ej: P-123ABC, M-456D)')
      return false
    }
    setPlacaError('')
    return true
  }

  // Handlers con validación en tiempo real
  const handleNombreChange = (e) => {
    const valor = e.target.value
    setNombre(valor)
    validarNombre(valor)
  }

  const handleDpiChange = (e) => {
    const valor = e.target.value
    // Solo permitir números
    if (/^\d*$/.test(valor) && valor.length <= 13) {
      setDpi(valor)
      validarDPI(valor)
    }
  }

  const handlePlacaChange = (e) => {
    const valor = e.target.value.toUpperCase()
    setPlaca(valor)
    validarPlaca(valor)
  }

  const handleSubmit = async () => {
    // Validar todos los campos antes de enviar
    const esNombreValido = validarNombre(nombreVisitante)
    const esDpiValido = validarDPI(dpiVisitante)
    const esPlacaValida = validarPlaca(placaVehiculo)

    if (!esNombreValido || !esDpiValido || !esPlacaValida) {
      setError('Por favor corrige los campos marcados')
      return
    }

    if (!idResidente) {
      setError('El residente es requerido')
      return
    }

    if (fechaDesde && fechaHasta && new Date(fechaHasta) < new Date(fechaDesde)) {
      setError('La fecha de fin no puede ser anterior a la fecha de inicio')
      return
    }

    setLoading(true)
    setError(null)

    try {
      const payload = {
        Id_Residente:      Number(idResidente),
        Id_Propiedad:      idPropiedad  ? Number(idPropiedad)  : null,
        Id_Motivo_Visita:  idMotivoVisita ? Number(idMotivoVisita) : null,
        Nombre_Visitante:  nombreVisitante.trim(),
        Dpi_Visitante:     dpiVisitante  || null,
        Placa_Vehiculo:    placaVehiculo || null,
        Fecha_Desde:       fechaDesde   || null,
        Fecha_Hasta:       fechaHasta   || null,
        Hora_Desde:        horaDesde    || null,
        Hora_Hasta:        horaHasta    || null,
        Tipo:              tipo,
        Estado:            estado,
        Observaciones:     observaciones || null,
      }
      visita
        ? await updateVisita(visita.id_Visita, { ...payload, Id: visita.id_Visita })
        : await createVisita(payload)
      onSaved()
    } catch (e) {
      setError(e.response?.data?.message || e.message)
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
              <h5 className="modal-title">{visita ? '✏️ Editar Visita Autorizada' : '👤 Nueva Visita Autorizada'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Residente" required
                    fetchFn={getResidentes}
                    getId={r => r.id_Residente ?? r.idResidente}
                    getLabel={r => `Residente #${r.id_Residente ?? r.idResidente} — Prop. ${r.id_Propiedad ?? r.idPropiedad}`}
                    value={idResidente}
                    displayValue={labelResidente}
                    onChange={(id, lbl) => { setIdRes(id); setLabelRes(lbl) }}
                    placeholder="Selecciona residente..."
                  />
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
                
                {/* Campo Nombre Visitante con validación */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">
                    Nombre Visitante <span className="text-danger">*</span>
                  </label>
                  <input 
                    className={`form-control ${nombreError ? 'is-invalid' : ''}`}
                    value={nombreVisitante} 
                    onChange={handleNombreChange}
                    onBlur={() => validarNombre(nombreVisitante)}
                  />
                  {nombreError && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-triangle-fill me-1" />{nombreError}
                    </div>
                  )}
                </div>

                {/* Campo DPI Visitante con validación */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">DPI Visitante</label>
                  <input 
                    className={`form-control ${dpiError ? 'is-invalid' : ''}`}
                    value={dpiVisitante} 
                    onChange={handleDpiChange}
                    onBlur={() => validarDPI(dpiVisitante)}
                    placeholder="1234567890123"
                    maxLength={13}
                  />
                  {dpiError && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-triangle-fill me-1" />{dpiError}
                    </div>
                  )}
                  <small className="text-muted">Opcional - 13 dígitos</small>
                </div>

                {/* Campo Placa Vehículo con validación */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Placa Vehículo</label>
                  <input 
                    className={`form-control ${placaError ? 'is-invalid' : ''}`}
                    value={placaVehiculo} 
                    onChange={handlePlacaChange}
                    onBlur={() => validarPlaca(placaVehiculo)}
                    placeholder="P-123ABC"
                  />
                  {placaError && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-triangle-fill me-1" />{placaError}
                    </div>
                  )}
                  <small className="text-muted">Opcional - Formato: L-123ABC</small>
                </div>

                <div className="col-md-3">
                  <label className="form-label fw-semibold">Tipo</label>
                  <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                    <option value="UNICA">ÚNICA</option>
                    <option value="RECURRENTE">RECURRENTE</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Fecha Desde</label>
                  <input type="date" className="form-control" value={fechaDesde} onChange={e => setFechaDesde(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Fecha Hasta</label>
                  <input type="date" className="form-control" value={fechaHasta} onChange={e => setFechaHasta(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Desde</label>
                  <input type="time" className="form-control" value={horaDesde} onChange={e => setHoraDesde(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Hasta</label>
                  <input type="time" className="form-control" value={horaHasta} onChange={e => setHoraHasta(e.target.value)} />
                </div>
                {visita && (
                  <div className="col-md-4">
                    <label className="form-label fw-semibold">Estado</label>
                    <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                      <option value="ACTIVA">ACTIVA</option>
                      <option value="USADA">USADA</option>
                      <option value="CANCELADA">CANCELADA</option>
                      <option value="VENCIDA">VENCIDA</option>
                    </select>
                  </div>
                )}
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : visita ? 'Guardar cambios' : 'Crear Visita'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}