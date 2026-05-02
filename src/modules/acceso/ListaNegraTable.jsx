import { useState, useEffect } from 'react'
import { getListaNegra, createListaNegra, updateListaNegra, desactivarListaNegra } from './listaNegraService'
import { getPersonas }    from '../residentes/personaService'
import FkSelector         from '../../components/FkSelector'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

export default function ListaNegraTable({ moduleColor }) {
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
    Promise.all([getListaNegra(), getPersonas()])
      .then(([lRes, perRes]) => {
        const lista   = Array.isArray(lRes.data)   ? lRes.data   : lRes.data?.data   ?? []
        const personas = Array.isArray(perRes.data) ? perRes.data : perRes.data?.data ?? []

        const enriched = lista.map(l => {
          const persona = personas.find(p =>
            (p.id_Persona ?? p.idPersona) === (l.id_Persona ?? l.idPersona))
          const nombrePersona = persona
            ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
            : null

          return { ...l, _nombrePersona: nombrePersona }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleDesactivar = async (id) => {
    try { await desactivarListaNegra(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando lista negra...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Lista Negra" icono="bi-slash-circle" labelBoton="Agregar a Lista Negra"
        onNuevo={() => { setSelected(null); setShowModal(true) }} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por nombre, DPI, placa..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="registros"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Tipo</th><th>Nombre</th><th>Persona vinculada</th>
              <th>DPI</th><th>Placa</th><th>Motivo</th><th>Válido hasta</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Lista negra vacía</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id ?? i}>
                <td className="text-muted">{r.id}</td>
                <td><span className="badge text-bg-danger">{r.tipo}</span></td>
                <td className="fw-semibold">{r.nombres ?? '—'}</td>
                <td className="text-muted small">{r._nombrePersona ?? '—'}</td>
                <td className="text-muted small">{r.dpi ?? '—'}</td>
                <td className="text-muted small">{r.placa ?? '—'}</td>
                <td className="text-muted small" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.motivo}
                </td>
                <td className="text-muted small">{r.fecha_Fin ?? r.fechaFin ?? 'Sin límite'}</td>
                <td>
                  <span className={`badge ${r.activo === 1 ? 'text-bg-danger' : 'text-bg-secondary'}`}>
                    {r.activo === 1 ? 'Bloqueado' : 'Desactivado'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(r); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === r.id ? (
                      <>
                        <span className="text-warning small align-self-center">¿Desactivar?</span>
                        <button className="btn btn-sm btn-warning py-0 px-2" onClick={() => handleDesactivar(r.id)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-outline-warning py-0 px-2" onClick={() => setConfirmId(r.id)}>
                        <i className="bi bi-x-circle me-1" style={{ fontSize: 11 }} />Desactivar
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
        totalDatos={datosFiltrados.length} label="registros" moduleColor={moduleColor}
      />
      {showModal && (
        <ListaNegraModal
          item={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}

function ListaNegraModal({ item, onClose, onSaved }) {
  const [tipo,          setTipo]    = useState(item?.tipo ?? 'PERSONA')
  const [idPersona,     setIdPer]   = useState(item?.id_Persona ?? item?.idPersona ?? '')
  const [labelPersona,  setLabelPer]= useState('')
  const [placa,         setPlaca]   = useState(item?.placa ?? '')
  const [nombres,       setNombres] = useState(item?.nombres ?? '')
  const [dpi,           setDpi]     = useState(item?.dpi ?? '')
  const [motivo,        setMotivo]  = useState(item?.motivo ?? '')
  const [activo,        setActivo]  = useState(item?.activo ?? 1)
  const [fechaInicio,   setFechaIn] = useState(item?.fecha_Inicio ?? item?.fechaInicio ?? '')
  const [fechaFin,      setFechaFin]= useState(item?.fecha_Fin ?? item?.fechaFin ?? '')
  const [observaciones, setObs]     = useState(item?.observaciones ?? '')
  const [loading,       setLoading] = useState(false)
  const [error,         setError]   = useState(null)

  const handleSubmit = async () => {
    if (!motivo.trim()) { setError('El motivo es requerido'); return }
    setLoading(true); setError(null)
    try {
      const payload = {
        Tipo:           tipo,
        Id_Persona:     idPersona ? Number(idPersona) : null,
        Placa:          placa        || null,
        Nombres:        nombres      || null,
        Dpi:            dpi          || null,
        Motivo:         motivo,
        Activo:         Number(activo),
        Registrado_Por: 1,
        Fecha_Inicio:   fechaInicio  || null,
        Fecha_Fin:      fechaFin     || null,
        Observaciones:  observaciones || null,
      }
      item
        ? await updateListaNegra(item.id, { ...payload, Id: item.id })
        : await createListaNegra(payload)
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
              <h5 className="modal-title">{item ? '✏️ Editar Registro' : '🚫 Agregar a Lista Negra'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tipo</label>
                  <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                    <option value="PERSONA">PERSONA</option>
                    <option value="VEHICULO">VEHÍCULO</option>
                  </select>
                </div>
                <div className="col-md-8">
                  <FkSelector
                    label="Persona del Sistema (opcional)"
                    fetchFn={getPersonas}
                    getId={p => p.id_Persona ?? p.idPersona ?? p.id}
                    getLabel={p => `${p.nombres ?? ''} ${p.apellidos ?? ''}`.trim() || `#${p.id_Persona ?? p.id}`}
                    value={idPersona}
                    displayValue={labelPersona}
                    onChange={(id, lbl) => { setIdPer(id); setLabelPer(lbl) }}
                    placeholder="Vincular con persona registrada..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre(s) en lista</label>
                  <input className="form-control" value={nombres} onChange={e => setNombres(e.target.value)} placeholder="Nombre como aparece en lista" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">DPI</label>
                  <input className="form-control" value={dpi} onChange={e => setDpi(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Placa (si aplica)</label>
                  <input className="form-control" value={placa} onChange={e => setPlaca(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Inicio</label>
                  <input type="date" className="form-control" value={fechaInicio} onChange={e => setFechaIn(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Fin</label>
                  <input type="date" className="form-control" value={fechaFin} onChange={e => setFechaFin(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Motivo <span className="text-danger">*</span></label>
                  <textarea className="form-control" rows={2} value={motivo} onChange={e => setMotivo(e.target.value)} placeholder="Razón por la que se agrega a lista negra" />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-danger" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : item ? 'Guardar cambios' : 'Agregar a lista negra'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}