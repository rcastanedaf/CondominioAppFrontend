import { useState, useEffect } from 'react'
import { getTipoPropiedades, deleteTipoPropiedad } from './tipoPropiedadService'
import TipoPropiedadModal from './TipoPropiedadModal'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

export default function TipoPropiedadTable({ moduleColor }) {
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const fetchData = () => {
    setLoading(true)
    getTipoPropiedades()
      .then(res => setRows(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

    // ── hook — filtra + pagina ────────────────────────────────
  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteTipoPropiedad(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      {/* Header + buscador + selector — reemplaza el antiguo d-flex justify-content-between */}

      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead><tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Acciones</th></tr></thead>
          <tbody>
            {datosPagina.map((row, i) => (
              <tr key={row.id_tipo_propiedad ?? i}>
                <td className="text-muted">{row.id_tipo_propiedad}</td>
                <td>{row.nombre}</td>
                <td className="text-muted" style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{row.descripcion}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(row); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === row.id_tipo_propiedad ? (
                      <><span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(row.id_tipo_propiedad)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button></>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setConfirmId(row.id_tipo_propiedad)}>
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
      {/* Footer paginación — segundo uso del mismo componente */}
            <PaginacionFooter
              paginaSegura={paginaSegura}
              totalPaginas={totalPaginas}
              porPagina={porPagina}
              setPorPagina={setPorPagina}
              irA={irA}
              paginas={paginas}
              totalDatos={datosFiltrados.length}
              label="tipo propiedad"
              moduleColor={moduleColor}
            />

      <TipoPropiedadModal show={showModal} tipoPropiedad={selected}
        onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
    </>
  )
}