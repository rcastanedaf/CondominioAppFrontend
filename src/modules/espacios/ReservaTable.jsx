import { useState, useEffect } from 'react'
import { getReservas, createReserva, updateReserva, cambiarEstadoReserva } from './reservaService'
import { getEspacios }    from './espacioComunService'
import { getResidentes }  from '../residentes/residenteService'
import { getPersonas }    from '../residentes/personaService'
import { getPropiedades } from '../catalogos/propiedadService'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

const ESTADO_COLOR = { PENDIENTE: 'warning', APROBADA: 'success', RECHAZADA: 'danger', CANCELADA: 'secondary', COMPLETADA: 'primary' }

export default function ReservaTable({ moduleColor }) {
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
    Promise.all([getReservas(), getEspacios(), getResidentes(), getPersonas(), getPropiedades()])
      .then(([rRes, eRes, resRes, perRes, pRes]) => {
        const reservas    = rRes.data?.data ?? []
        const espacios    = eRes.data?.data ?? []
        const residentes  = resRes.data?.data ?? []
        const personas    = perRes.data?.data ?? []
        const propiedades = pRes.data?.data ?? []

        const enriched = reservas.map(rv => {
          const espId     = rv.id_Espacio ?? rv.Id_Espacio ?? rv.idEspacio
          const espacio   = espacios.find(e => (e.id_Espacio ?? e.Id_Espacio ?? e.id ?? e.idEspacio) === espId)
          const residente = residentes.find(r => (r.id_Residente ?? r.idResidente) === (rv.id_Residente ?? rv.idResidente))
          const persona   = personas.find(p => (p.id_Persona ?? p.idPersona) === (residente?.id_Persona ?? residente?.idPersona))
          const propiedad = propiedades.find(p => (p.id_propiedad ?? p.idPropiedad) === (rv.id_Propiedad ?? rv.idPropiedad))

          return {
            ...rv,
            _nombreEspacio:   espacio?.nombre    ?? `Espacio #${rv.id_Espacio ?? rv.idEspacio}`,
            _nombreResidente: persona
              ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
              : `Residente #${rv.id_Residente ?? rv.idResidente}`,
            _codigoPropiedad: propiedad?.codigo ?? (rv.id_Propiedad ? `Prop. #${rv.id_Propiedad}` : '—'),
          }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando reservas...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Reservas de Espacios" icono="bi-calendar-check" labelBoton="Nueva Reserva"
        onNuevo={() => { setSelected(null); setShowModal(true) }} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por espacio, residente..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="reservas"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Espacio</th><th>Residente</th><th>Propiedad</th>
              <th>Fecha</th><th>Hora Inicio</th><th>Hora Fin</th>
              <th>Personas</th><th>Monto</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={11} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin reservas registradas</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id}</td>
                <td className="fw-semibold">{r._nombreEspacio}</td>
                <td>{r._nombreResidente}</td>
                <td>{r._codigoPropiedad}</td>
                <td>{r.fecha_Reserva?.substring(0, 10) ?? r.fechaReserva?.substring(0, 10) ?? '—'}</td>
                <td className="text-muted small">{r.hora_Inicio ?? r.horaInicio ?? '—'}</td>
                <td className="text-muted small">{r.hora_Fin ?? r.horaFin ?? '—'}</td>
                <td>{r.num_Personas ?? r.numPersonas ?? '—'}</td>
                <td className="fw-semibold">Q {Number(r.monto_Cobro ?? r.montoCobro ?? 0).toFixed(2)}</td>
                <td>
                  <span className={`badge text-bg-${ESTADO_COLOR[r.estado] || 'secondary'}`}>{r.estado}</span>
                </td>
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
        totalDatos={datosFiltrados.length} label="reservas" moduleColor={moduleColor}
      />
      {showModal && (
        <ReservaModal
          reserva={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}

function ReservaModal({ reserva, onClose, onSaved }) {
  const [form, setForm] = useState({
    idEspacio:       reserva?.id_Espacio        ?? reserva?.idEspacio        ?? '',
    idPersona:       '',   // selector de persona (UI only, no va al payload)
    idResidente:     reserva?.id_Residente       ?? reserva?.idResidente       ?? '',
    idPropiedad:     reserva?.id_Propiedad       ?? reserva?.idPropiedad       ?? '',
    fechaReserva:    (reserva?.fecha_Reserva     ?? reserva?.fechaReserva     ?? '').substring(0, 10),
    horaInicio:      reserva?.hora_Inicio        ?? reserva?.horaInicio        ?? '',
    horaFin:         reserva?.hora_Fin           ?? reserva?.horaFin           ?? '',
    numPersonas:     reserva?.num_Personas       ?? reserva?.numPersonas       ?? 1,
    motivo:          reserva?.motivo             ?? '',
    montoCobro:       reserva?.monto_Cobro         ?? reserva?.montoCobro        ?? '',
    depositoCobrado:  reserva?.deposito_Cobrado    ?? reserva?.depositoCobrado   ?? '',
    depositoDevuelto: reserva?.deposito_Devuelto   ?? reserva?.depositoDevuelto  ?? 0,
    estado:           reserva?.estado              ?? 'PENDIENTE',
    observaciones:    reserva?.observaciones       ?? '',
  })

  const [espacios,        setEspacios]        = useState([])
  // personasUnicas: lista deduplicada { idPersona, nombre }
  const [personasUnicas,  setPersonasUnicas]  = useState([])
  // todosRegistros: todos los registros de residente con sus propiedades
  const [todosRegistros,  setTodosRegistros]  = useState([])
  const [propiedades,     setPropiedades]     = useState([])
  const [propsFiltradas,  setPropsFiltradas]  = useState([])
  const [loadingData,     setLoadingData]     = useState(true)
  const [loading,         setLoading]         = useState(false)
  const [error,           setError]           = useState(null)

  const set = (k) => (e) => setForm(f => ({ ...f, [k]: e.target.value }))

  // Carga inicial
  useEffect(() => {
    Promise.all([getEspacios(), getResidentes(), getPersonas(), getPropiedades()])
      .then(([eRes, rRes, pRes, propRes]) => {
        setEspacios(eRes.data?.data ?? [])

        const personas = pRes.data?.data ?? []
        const props    = propRes.data?.data ?? []
        setPropiedades(props)

        // Enriquecer cada registro de residente con nombre e idPersona
        const registros = (rRes.data?.data ?? []).map(r => {
          const idPersona = r.id_Persona ?? r.idPersona
          const persona   = personas.find(p => (p.id_Persona ?? p.idPersona) === idPersona)
          return {
            idResidente:  r.id_Residente ?? r.idResidente,
            idPersona,
            idPropiedad:  r.id_Propiedad ?? r.idPropiedad,
            nombre: persona
              ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
              : `Persona #${idPersona}`,
          }
        })
        setTodosRegistros(registros)

        // Deduplicar por idPersona para el combobox de residente
        const seen = new Set()
        const unicas = []
        for (const r of registros) {
          if (!seen.has(r.idPersona)) {
            seen.add(r.idPersona)
            unicas.push({ idPersona: r.idPersona, nombre: r.nombre })
          }
        }
        setPersonasUnicas(unicas)

        // Si editamos: pre-cargar persona e idPersona desde el idResidente existente
        if (reserva) {
          const idRes = reserva.id_Residente ?? reserva.idResidente
          const reg   = registros.find(r => String(r.idResidente) === String(idRes))
          if (reg) {
            const filtradas = props.filter(p =>
              registros
                .filter(r => r.idPersona === reg.idPersona)
                .some(r => r.idPropiedad === (p.id_propiedad ?? p.idPropiedad))
            )
            setPropsFiltradas(filtradas)
            setForm(f => ({ ...f, idPersona: String(reg.idPersona) }))
          }
        }
      })
      .catch(() => setError('Error al cargar datos del formulario'))
      .finally(() => setLoadingData(false))
  }, [])

  // Al cambiar la persona: cargar sus propiedades y resetear residente/propiedad
  const handlePersonaChange = (e) => {
    const idPersona = e.target.value
    if (!idPersona) {
      setPropsFiltradas([])
      setForm(f => ({ ...f, idPersona: '', idResidente: '', idPropiedad: '' }))
      return
    }

    // Todos los registros de residente para esta persona
    const regsPersona = todosRegistros.filter(r => String(r.idPersona) === String(idPersona))
    const idsProp     = regsPersona.map(r => r.idPropiedad)
    const filtradas   = propiedades.filter(p => idsProp.includes(p.id_propiedad ?? p.idPropiedad))

    setPropsFiltradas(filtradas)

    // Si la persona tiene exactamente un registro de residente, auto-seleccionar
    const autoResidente = regsPersona.length === 1 ? String(regsPersona[0].idResidente) : ''
    const autoPropiedad = filtradas.length === 1
      ? String(filtradas[0].id_propiedad ?? filtradas[0].idPropiedad)
      : ''

    setForm(f => ({
      ...f,
      idPersona,
      idResidente: autoResidente,
      idPropiedad: autoPropiedad,
    }))
  }

  // Al cambiar el espacio: auto-completar precios desde el espacio seleccionado
  const handleEspacioChange = (e) => {
    const idEsp  = e.target.value
    const espacio = espacios.find(es => String(es.id_Espacio ?? es.Id_Espacio ?? es.id ?? es.idEspacio) === String(idEsp))

    if (!espacio) {
      setForm(f => ({ ...f, idEspacio: idEsp }))
      return
    }

    const tieneCosto   = Number(espacio.tiene_Costo   ?? espacio.tieneCosto   ?? 0)
    const costoPorHora = Number(espacio.costo_Por_Hora ?? espacio.costoPorHora ?? 0)
    const costoPorDia  = Number(espacio.costo_Por_Dia  ?? espacio.costoPorDia  ?? 0)
    const deposito     = Number(espacio.deposito_Garantia ?? espacio.depositoGarantia ?? 0)
    const capacidad    = espacio.capacidad_Max ?? espacio.capacidadMax ?? ''

    // Precio sugerido: hora si existe, si no día
    const montoSugerido = tieneCosto
      ? (costoPorHora > 0 ? costoPorHora : costoPorDia > 0 ? costoPorDia : '')
      : ''

    setForm(f => ({
      ...f,
      idEspacio:       idEsp,
      montoCobro:      montoSugerido !== '' ? String(montoSugerido) : f.montoCobro,
      depositoCobrado: deposito > 0 ? String(deposito) : f.depositoCobrado,
      numPersonas:     capacidad ? Math.min(Number(f.numPersonas) || 1, Number(capacidad)) : f.numPersonas,
    }))
  }

  // Al cambiar la propiedad: resolver el id_Residente correcto (persona + propiedad)
  const handlePropiedadChange = (e) => {
    const idProp = e.target.value
    const reg = todosRegistros.find(r =>
      String(r.idPersona)   === String(form.idPersona) &&
      String(r.idPropiedad) === String(idProp)
    )
    setForm(f => ({
      ...f,
      idPropiedad: idProp,
      idResidente: reg ? String(reg.idResidente) : '',
    }))
  }

  const handleSubmit = async () => {
    if (!form.idEspacio)    return setError('El espacio es requerido')
    if (!form.idPersona)    return setError('El residente es requerido')
    if (!form.idPropiedad)  return setError('La propiedad es requerida')
    if (!form.idResidente)  return setError('No se pudo resolver el residente, verifique la propiedad')
    if (!form.fechaReserva) return setError('La fecha de reserva es requerida')
    if (!form.horaInicio)   return setError('La hora de inicio es requerida')
    if (!form.horaFin)      return setError('La hora de fin es requerida')
    if (form.horaFin <= form.horaInicio)
      return setError('La hora de fin debe ser posterior a la hora de inicio')
    if (Number(form.numPersonas) < 1)
      return setError('El número de personas debe ser al menos 1')
    const hoy = new Date().toISOString().slice(0, 10)
    if (!reserva && form.fechaReserva < hoy)
      return setError('La fecha de reserva no puede ser en el pasado')

    setLoading(true); setError(null)
    try {
      const base = {
        Id_Espacio:       Number(form.idEspacio),
        Id_Residente:     Number(form.idResidente),
        Id_Propiedad:     Number(form.idPropiedad),
        Fecha_Reserva:    form.fechaReserva,
        Hora_Inicio:      form.horaInicio || null,
        Hora_Fin:         form.horaFin    || null,
        Num_Personas:     Number(form.numPersonas) || 1,
        Motivo:           form.motivo          || null,
        Monto_Cobro:      Number(form.montoCobro)      || 0,
        Deposito_Cobrado: Number(form.depositoCobrado) || 0,
        Observaciones:    form.observaciones   || null,
      }
      if (reserva) {
        const idReserva = reserva.id_Reserva ?? reserva.Id_Reserva ?? reserva.id
        await updateReserva(idReserva, {
          ...base,
          Id_Reserva:        idReserva,
          Estado:            form.estado,
          Deposito_Devuelto: Number(form.depositoDevuelto) || 0,
        })
      } else {
        await createReserva(base)
      }
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
              <h6 className="modal-title fw-bold">{reserva ? 'Editar Reserva' : 'Nueva Reserva'}</h6>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-warning alert-dismissible py-2 mb-3">
                  <i className="bi bi-exclamation-triangle me-2" />{error}
                  <button className="btn-close" onClick={() => setError(null)} />
                </div>
              )}
              {loadingData ? (
                <div className="text-center py-4">
                  <div className="spinner-border spinner-border-sm me-2" />Cargando datos...
                </div>
              ) : (
              <div className="row g-3">
                {/* Espacio */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Espacio Común <span className="text-danger">*</span></label>
                  <select className="form-select form-select-sm" value={form.idEspacio} onChange={handleEspacioChange}>
                    <option value="">Seleccionar espacio...</option>
                    {espacios.map(e => {
                      const id = e.id_Espacio ?? e.Id_Espacio ?? e.id ?? e.idEspacio
                      return <option key={id} value={id}>{e.nombre ?? `Espacio #${id}`}</option>
                    })}
                  </select>
                  {(() => {
                    const esp = espacios.find(e => String(e.id_Espacio ?? e.Id_Espacio ?? e.id ?? e.idEspacio) === String(form.idEspacio))
                    if (!esp || !Number(esp.tiene_Costo ?? esp.tieneCosto)) return null
                    const hora = Number(esp.costo_Por_Hora ?? esp.costoPorHora ?? 0)
                    const dia  = Number(esp.costo_Por_Dia  ?? esp.costoPorDia  ?? 0)
                    const dep  = Number(esp.deposito_Garantia ?? esp.depositoGarantia ?? 0)
                    const cap  = esp.capacidad_Max ?? esp.capacidadMax
                    return (
                      <small className="text-muted d-block mt-1">
                        {hora > 0 && <span className="me-2">Q{hora.toFixed(2)}/hora</span>}
                        {dia  > 0 && <span className="me-2">Q{dia.toFixed(2)}/día</span>}
                        {dep  > 0 && <span className="me-2">Depósito: Q{dep.toFixed(2)}</span>}
                        {cap       && <span>Cap. máx: {cap} personas</span>}
                      </small>
                    )
                  })()}
                </div>

                {/* Residente (personas únicas) */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Residente <span className="text-danger">*</span></label>
                  <select className="form-select form-select-sm" value={form.idPersona} onChange={handlePersonaChange}>
                    <option value="">Seleccionar residente...</option>
                    {personasUnicas.map(p => (
                      <option key={p.idPersona} value={p.idPersona}>{p.nombre}</option>
                    ))}
                  </select>
                </div>

                {/* Propiedad — se habilita al seleccionar residente */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Propiedad <span className="text-danger">*</span></label>
                  <select
                    className="form-select form-select-sm"
                    value={form.idPropiedad}
                    disabled={!form.idPersona}
                    onChange={handlePropiedadChange}
                  >
                    <option value="">
                      {!form.idPersona
                        ? 'Primero seleccione un residente...'
                        : propsFiltradas.length === 0
                          ? 'Sin propiedades registradas'
                          : 'Seleccionar propiedad...'}
                    </option>
                    {propsFiltradas.map(p => {
                      const id = p.id_propiedad ?? p.idPropiedad
                      return <option key={id} value={id}>{p.codigo ?? `Propiedad #${id}`}</option>
                    })}
                  </select>
                  {form.idPersona && propsFiltradas.length === 0 && (
                    <small className="text-muted">Este residente no tiene propiedades registradas.</small>
                  )}
                </div>

                {/* Fecha */}
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Fecha de Reserva <span className="text-danger">*</span></label>
                  <input type="date" className="form-control form-control-sm" value={form.fechaReserva} onChange={set('fechaReserva')} />
                </div>

                {/* Horarios */}
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Inicio <span className="text-danger">*</span></label>
                  <input type="time" className="form-control form-control-sm" value={form.horaInicio} onChange={set('horaInicio')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Fin <span className="text-danger">*</span></label>
                  <input type="time" className="form-control form-control-sm" value={form.horaFin} onChange={set('horaFin')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Núm. de Personas</label>
                  <input type="number" min={1} className="form-control form-control-sm"
                    value={form.numPersonas} onChange={set('numPersonas')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Monto Cobro (Q)</label>
                  <input type="number" step="0.01" min={0} className="form-control form-control-sm"
                    value={form.montoCobro} onChange={set('montoCobro')} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Depósito (Q)</label>
                  <input type="number" step="0.01" min={0} className="form-control form-control-sm"
                    value={form.depositoCobrado} onChange={set('depositoCobrado')} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Motivo de Reserva</label>
                  <input className="form-control form-control-sm" value={form.motivo}
                    onChange={set('motivo')} placeholder="Quinceañera, Reunión de condóminos..." />
                </div>
                {/* Estado y Depósito Devuelto — solo al editar */}
                {reserva && (
                  <>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Estado <span className="text-danger">*</span></label>
                      <select className="form-select form-select-sm" value={form.estado} onChange={set('estado')}>
                        <option value="PENDIENTE">Pendiente</option>
                        <option value="APROBADA">Aprobada</option>
                        <option value="RECHAZADA">Rechazada</option>
                        <option value="CANCELADA">Cancelada</option>
                        <option value="COMPLETADA">Completada</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Depósito Devuelto</label>
                      <select className="form-select form-select-sm" value={form.depositoDevuelto}
                        onChange={e => setForm(f => ({ ...f, depositoDevuelto: Number(e.target.value) }))}>
                        <option value={0}>No</option>
                        <option value={1}>Sí</option>
                      </select>
                    </div>
                  </>
                )}
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={form.observaciones} onChange={set('observaciones')} />
                </div>
              </div>
              )}
            </div>
            <div className="modal-footer">
              <button className="btn btn-sm btn-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-sm btn-primary" onClick={handleSubmit} disabled={loading || loadingData}>
                {loading ? <span className="spinner-border spinner-border-sm" /> : reserva ? 'Guardar Cambios' : 'Crear Reserva'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}