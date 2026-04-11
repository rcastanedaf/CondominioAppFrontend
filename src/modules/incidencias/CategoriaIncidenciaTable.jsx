import { useState, useEffect } from 'react'
import { getCategorias, deleteCategoria } from './categoriaIncidenciaService'
import CategoriaIncidenciaModal from './CategoriaIncidenciaModal'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

export default function CategoriaIncidenciaTable({ moduleColor }) {
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const fetchData = () => {
    setLoading(true)
    getCategorias()
      .then(res => setRows(res.data?.data ?? res.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }
  useEffect(() => { fetchData() }, [])

  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  const handleEliminar = async (id) => {
    try { await deleteCategoria(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Categoría de Incidencias"
        icono="bi-tag"
        labelBoton="Nueva Categoría"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro}
        setFiltro={setFiltro}
        placeholder="Filtrar categoría..."
        paginaSegura={paginaSegura}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        setPorPagina={setPorPagina}
        irA={irA}
        paginas={paginas}
        totalDatos={datosFiltrados.length}
        label="categorías"
      />
      <div className="cms-table-wrap" style={{ overflowY: 'auto' }}>
        <table className="table table-hover cms-table">
          <thead><tr><th>#</th><th>Nombre</th><th>Descripción</th><th>Estado</th><th>Acciones</th></tr></thead>
          <tbody>
            {datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td className="fw-semibold">{row.nombre}</td>
                <td className="text-muted" style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row.descripcion ?? '—'}
                </td>
                <td>
                  <span className={`badge ${row.activo === 1 ? 'text-bg-success' : 'text-bg-secondary'}`}>
                    {row.activo === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(row); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === row.id ? (
                      <><span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(row.id)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button></>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setConfirmId(row.id)}>
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
        paginaSegura={paginaSegura}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        setPorPagina={setPorPagina}
        irA={irA}
        paginas={paginas}
        totalDatos={datosFiltrados.length}
        label="categorías"
        moduleColor={moduleColor}
      />
      <CategoriaIncidenciaModal
        show={showModal}
        categoria={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}
