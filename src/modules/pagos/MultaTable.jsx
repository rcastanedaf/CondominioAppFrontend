import { useState, useEffect } from 'react'
import { getMultas, deleteMulta } from './multaService'
import { getResidentes }  from '../residentes/residenteService'
import { getPersonas }    from '../residentes/personaService'
import { getPropiedades } from '../catalogos/propiedadService'
import MultaModal from './MultaModal'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

const ESTADO_COLOR = { PENDIENTE: 'warning', PAGADA: 'success', APELADA: 'info', ANULADA: 'secondary', VENCIDA: 'danger' }

export default function MultaTable({ moduleColor }) {
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
  Promise.all([getMultas(), getResidentes(), getPersonas(), getPropiedades()])
    .then(([mRes, rRes, perRes, pRes]) => {
      const multas      = mRes.data?.data   ?? []
      const residentes  = rRes.data?.data   ?? []
      const personas    = perRes.data?.data ?? []
      const propiedades = pRes.data?.data   ?? []

      const enriched = multas.map(m => {
        const residente = residentes.find(r =>
          (r.id_Residente ?? r.idResidente) === (m.id_Residente ?? m.idResidente))
        const persona = personas.find(p =>
          (p.id_Persona ?? p.idPersona) === (residente?.id_Persona ?? residente?.idPersona))
        const propiedad = propiedades.find(p =>
          (p.id_Propiedad ?? p.idPropiedad) === (m.id_Propiedad ?? m.idPropiedad))

        return {
          ...m,
          _nombreResidente: persona
            ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
            : `Residente #${m.id_Residente ?? m.idResidente}`,
          _codigoPropiedad: propiedad?.codigo ?? (m.id_Propiedad ? `Prop. #${m.id_Propiedad}` : '—'),
        }
      })
      setRows(enriched)
    })
    .catch(err => setError(err.message))
    .finally(() => setLoading(false))
}

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteMulta(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando multas...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Gestión de Multas" icono="bi-slash-circle" labelBoton="Nueva Multa"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar multas..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="multas"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Residente</th><th>Propiedad</th><th>Descripción</th>
              <th>Monto</th><th>F. Infracción</th><th>F. Vencimiento</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin multas registradas</td></tr>
            ) : datosPagina.map((row, i) => (
              <tr key={row.id_Multa ?? i}>
                <td className="text-muted">{row.id_Multa}</td>
                <td className="fw-semibold">{row._nombreResidente}</td>
                <td>{row._codigoPropiedad}</td>
                <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.descripcion}
                </td>
                <td className="fw-semibold text-danger">Q {Number(row.monto ?? 0).toFixed(2)}</td>
                <td>{row.fecha_Infraccion?.substring(0, 10)}</td>
                <td className="text-muted">{row.fecha_Vencimiento?.substring(0, 10) ?? '—'}</td>
                <td><span className={`badge text-bg-${ESTADO_COLOR[row.estado] || 'secondary'}`}>{row.estado}</span></td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(row); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === row.id_Multa ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(row.id_Multa)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setConfirmId(row.id_Multa)}>
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
        totalDatos={datosFiltrados.length} label="multas" moduleColor={moduleColor}
      />
      <MultaModal
        show={showModal} multa={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}