import { useState, useEffect } from 'react'
import { getReservas, createReserva, updateReserva, cambiarEstadoReserva } from './reservaService'
import { getEspacios }    from './espacioComunService'
import { getResidentes }  from '../residentes/residenteService'
import { getPersonas }    from '../residentes/personaService'
import { getPropiedades } from '../catalogos/propiedadService'
import FkSelector         from '../../components/FkSelector'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

const ESTADO_COLOR = { PENDIENTE: 'warning', APROBADA: 'success', RECHAZADA: 'danger', CANCELADA: 'secondary', COMPLETADA: 'info' }

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
        const reservas    = Array.isArray(rRes.data)   ? rRes.data   : rRes.data?.data   ?? []
        const espacios    = Array.isArray(eRes.data)   ? eRes.data   : eRes.data?.data   ?? []
        const residentes  = Array.isArray(resRes.data) ? resRes.data : resRes.data?.data ?? []
        const personas    = Array.isArray(perRes.data) ? perRes.data : perRes.data?.data ?? []
        const propiedades = Array.isArray(pRes.data)   ? pRes.data   : pRes.data?.data   ?? []

        const enriched = reservas.map(rv => {
          const espacio   = espacios.find(e => (e.id ?? e.idEspacio) === (rv.id_Espacio ?? rv.idEspacio))
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
  const [idEspacio,    setIdEsp]     = useState(reserva?.id_Espacio ?? reserva?.idEspacio ?? '')
  const [labelEspacio, setLabelEsp]  = useState('')
  const [idResidente,  setIdRes]     = useState(reserva?.id_Residente ?? reserva?.idResidente ?? '')
  const [labelRes,     setLabelRes]  = useState('')
  const [idPropiedad,  setIdProp]    = useState(reserva?.id_Propiedad ?? reserva?.idPropiedad ?? '')
  const [labelProp,    setLabelProp] = useState('')
  const [fechaReserva, setFecha]     = useState(reserva?.fecha_Reserva?.substring(0, 10) ?? reserva?.fechaReserva?.substring(0, 10) ?? '')
  const [horaInicio,   setHoraIn]    = useState(reserva?.hora_Inicio ?? reserva?.horaInicio ?? '')
  const [horaFin,      setHoraFin]   = useState(reserva?.hora_Fin ?? reserva?.horaFin ?? '')
  const [numPersonas,  setNumPer]    = useState(reserva?.num_Personas ?? reserva?.numPersonas ?? 1)
  const [motivo,       setMotivo]    = useState(reserva?.motivo ?? '')
  const [montoCobro,   setMonto]     = useState(reserva?.monto_Cobro ?? reserva?.montoCobro ?? '')
  const [depositoCobrado, setDeposito] = useState(reserva?.deposito_Cobrado ?? reserva?.depositoCobrado ?? '')
  const [observaciones,setObs]       = useState(reserva?.observaciones ?? '')
  const [loading,      setLoading]   = useState(false)
  const [error,        setError]     = useState(null)

  const handleSubmit = async () => {
    if (!idEspacio)   { setError('El espacio es requerido'); return }
    if (!idResidente) { setError('El residente es requerido'); return }
    if (!fechaReserva){ setError('La fecha de reserva es requerida'); return }
    setLoading(true); setError(null)
    try {
      const payload = {
        Id_Espacio:        Number(idEspacio),
        Id_Residente:      Number(idResidente),
        Id_Propiedad:      idPropiedad ? Number(idPropiedad) : null,
        Fecha_Reserva:     fechaReserva,
        Hora_Inicio:       horaInicio   || null,
        Hora_Fin:          horaFin      || null,
        Num_Personas:      Number(numPersonas) || 1,
        Motivo:            motivo       || null,
        Monto_Cobro:       Number(montoCobro)    || 0,
        Deposito_Cobrado:  Number(depositoCobrado) || 0,
        Observaciones:     observaciones || null,
      }
      reserva
        ? await updateReserva(reserva.id, { ...payload, Id: reserva.id })
        : await createReserva(payload)
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
              <h5 className="modal-title">{reserva ? '✏️ Editar Reserva' : '📅 Nueva Reserva'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Espacio Común" required
                    fetchFn={getEspacios}
                    getId={e => e.id ?? e.idEspacio}
                    getLabel={e => e.nombre ?? `Espacio #${e.id}`}
                    value={idEspacio}
                    displayValue={labelEspacio}
                    onChange={(id, lbl) => { setIdEsp(id); setLabelEsp(lbl) }}
                    placeholder="Selecciona espacio..."
                  />
                </div>
                <div className="col-md-6">
                  <FkSelector
                    label="Residente" required
                    fetchFn={getResidentes}
                    getId={r => r.id_Residente ?? r.idResidente}
                    getLabel={r => `Residente #${r.id_Residente ?? r.idResidente} — Prop. ${r.id_Propiedad ?? r.idPropiedad}`}
                    value={idResidente}
                    displayValue={labelRes}
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
                    displayValue={labelProp}
                    onChange={(id, lbl) => { setIdProp(id); setLabelProp(lbl) }}
                    placeholder="Selecciona propiedad..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Fecha de Reserva <span className="text-danger">*</span></label>
                  <input type="date" className="form-control" value={fechaReserva} onChange={e => setFecha(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Inicio</label>
                  <input type="time" className="form-control" value={horaInicio} onChange={e => setHoraIn(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Hora Fin</label>
                  <input type="time" className="form-control" value={horaFin} onChange={e => setHoraFin(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Núm. de Personas</label>
                  <input type="number" className="form-control" value={numPersonas} onChange={e => setNumPer(e.target.value)} min={1} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Monto Cobro (Q)</label>
                  <input type="number" step="0.01" className="form-control" value={montoCobro} onChange={e => setMonto(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Depósito (Q)</label>
                  <input type="number" step="0.01" className="form-control" value={depositoCobrado} onChange={e => setDeposito(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Motivo de Reserva</label>
                  <input className="form-control" value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Quinceañera, Reunión de condóminos..." />
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : reserva ? 'Guardar cambios' : 'Crear Reserva'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}