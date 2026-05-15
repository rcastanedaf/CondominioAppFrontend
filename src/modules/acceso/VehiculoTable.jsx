import { useState, useEffect } from 'react'
import { getVehiculos, createVehiculo, updateVehiculo, deleteVehiculo } from './vehiculoService'
import { getResidentes }  from '../residentes/residenteService'
import { getPersonas }    from '../residentes/personaService'
import { getPropiedades } from '../catalogos/propiedadService'
import FkSelector         from '../../components/FkSelector'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

export default function VehiculoTable({ moduleColor }) {
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
    Promise.all([getVehiculos(), getResidentes(), getPersonas(), getPropiedades()])
      .then(([vRes, rRes, perRes, pRes]) => {
        const vehiculos   = vRes.data?.data ?? []
        const residentes  = rRes.data?.data ?? []
        const personas    = perRes.data?.data ?? []
        const propiedades = pRes.data?.data ?? []

        const enriched = vehiculos.map(v => {
          const residente = residentes.find(r =>
            (r.id_Residente ?? r.idResidente) === (v.id_Residente ?? v.idResidente))
          const persona   = personas.find(p =>
            (p.id_Persona ?? p.idPersona) === (residente?.id_Persona ?? residente?.idPersona))
          const propiedad = propiedades.find(p =>
            (p.id_propiedad ?? p.idPropiedad) === (v.id_Propiedad ?? v.idPropiedad))

          return {
            ...v,
            _nombreResidente: persona
              ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
              : `Residente #${v.id_Residente ?? v.idResidente}`,
            _codigoPropiedad: propiedad?.codigo ?? (v.id_Propiedad ? `Prop. #${v.id_Propiedad}` : '—'),
          }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteVehiculo(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando vehículos...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Vehículos" icono="bi-car-front" labelBoton="Nuevo Vehículo"
        onNuevo={() => { setSelected(null); setShowModal(true) }} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por placa, marca, residente..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="vehículos"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Placa</th><th>Marca / Modelo</th><th>Año</th><th>Color</th>
              <th>Tipo</th><th>Residente</th><th>Propiedad</th><th>Parqueo</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={11} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin vehículos registrados</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id}</td>
                <td className="fw-semibold">{r.placa}</td>
                <td>{r.marca} {r.modelo}</td>
                <td>{r.anio ?? '—'}</td>
                <td>{r.color}</td>
                <td>{r.tipo}</td>
                <td>{r._nombreResidente}</td>
                <td>{r._codigoPropiedad}</td>
                <td className="text-muted small">{r.parqueo_Asignado ?? r.parqueoAsignado ?? '—'}</td>
                <td>
                  <span className={`badge ${r.activo === 1 ? 'text-bg-success' : 'text-bg-secondary'}`}>
                    {r.activo === 1 ? 'Activo' : 'Inactivo'}
                  </span>
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
        totalDatos={datosFiltrados.length} label="vehículos" moduleColor={moduleColor}
      />
      {showModal && (
        <VehiculoModal
          vehiculo={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}

function VehiculoModal({ vehiculo, onClose, onSaved }) {
  const [idResidente,    setIdRes]      = useState(vehiculo?.id_Residente ?? vehiculo?.idResidente ?? '')
  const [labelResidente, setLabelRes]   = useState('')
  const [idPropiedad,    setIdProp]     = useState(vehiculo?.id_Propiedad ?? vehiculo?.idPropiedad ?? '')
  const [labelPropiedad, setLabelProp]  = useState('')
  const [placa,          setPlaca]      = useState(vehiculo?.placa ?? '')
  const [marca,          setMarca]      = useState(vehiculo?.marca ?? '')
  const [modelo,         setModelo]     = useState(vehiculo?.modelo ?? '')
  const [anio,           setAnio]       = useState(vehiculo?.anio ?? '')
  const [color,          setColor]      = useState(vehiculo?.color ?? '')
  const [tipo,           setTipo]       = useState(vehiculo?.tipo ?? 'AUTOMOVIL')
  const [parqueoAsignado,setParqueo]    = useState(vehiculo?.parqueo_Asignado ?? vehiculo?.parqueoAsignado ?? '')
  const [observaciones,  setObs]        = useState(vehiculo?.observaciones ?? '')
  const [activo,         setActivo]     = useState(vehiculo?.activo ?? 1)
  const [loading,        setLoading]    = useState(false)
  const [error,          setError]      = useState(null)

  const handleSubmit = async () => {
    if (!placa.trim())     { setError('La placa es requerida'); return }
    if (!idResidente)      { setError('El residente es requerido'); return }
    setLoading(true); setError(null)
    try {
      const payload = {
        Id_Residente:      Number(idResidente),
        Id_Propiedad:      idPropiedad ? Number(idPropiedad) : null,
        Placa:             placa,
        Marca:             marca  || null,
        Modelo:            modelo || null,
        Anio:              anio   ? Number(anio) : null,
        Color:             color  || null,
        Tipo:              tipo,
        Parqueo_Asignado:  parqueoAsignado || null,
        Observaciones:     observaciones   || null,
        Activo:            Number(activo),
      }
      vehiculo
        ? await updateVehiculo(vehiculo.id, { ...payload, Id: vehiculo.id })
        : await createVehiculo(payload)
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
              <h5 className="modal-title">{vehiculo ? '✏️ Editar Vehículo' : '🚗 Nuevo Vehículo'}</h5>
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
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Placa <span className="text-danger">*</span></label>
                  <input className="form-control" value={placa} onChange={e => setPlaca(e.target.value)} placeholder="P-123ABC" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Marca</label>
                  <input className="form-control" value={marca} onChange={e => setMarca(e.target.value)} placeholder="Toyota, Ford..." />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Modelo</label>
                  <input className="form-control" value={modelo} onChange={e => setModelo(e.target.value)} placeholder="Corolla, F-150..." />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Año</label>
                  <input type="number" className="form-control" value={anio} onChange={e => setAnio(e.target.value)} placeholder="2024" />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Color</label>
                  <input className="form-control" value={color} onChange={e => setColor(e.target.value)} placeholder="Blanco, Negro..." />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Tipo</label>
                  <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                    <option value="AUTOMOVIL">AUTOMÓVIL</option>
                    <option value="MOTO">MOTO</option>
                    <option value="PICKUP">PICKUP</option>
                    <option value="CAMION">CAMIÓN</option>
                    <option value="OTRO">OTRO</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Parqueo Asignado</label>
                  <input className="form-control" value={parqueoAsignado} onChange={e => setParqueo(e.target.value)} placeholder="P-01" />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={activo} onChange={e => setActivo(e.target.value)}>
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
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
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : vehiculo ? 'Guardar cambios' : 'Crear Vehículo'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}