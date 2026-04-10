import { useState, useEffect } from 'react'
import { getPaises, deletePais } from './paisService'
import PaisModal from './PaisModal'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

export default function PaisTable({ moduleColor }) {
  const [rows, setRows]           = useState([])
  const [loading, setLoading]     = useState(true)
  const [error, setError]         = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected, setSelected]   = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const fetchData = () => {
    setLoading(true)
    getPaises()
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
    try { await deletePais(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      {/* Header + buscador + selector — reemplaza el antiguo d-flex justify-content-between */}
            <PaginacionFooter
              titulo="Pais"
              icono="bi-bank"
              labelBoton="Nuevo Pais"
              onNuevo={() => { setSelected(null); setShowModal(true) }}
              moduleColor={moduleColor}
              filtro={filtro}
              setFiltro={setFiltro}
              placeholder="Filtrar pais..."
              paginaSegura={paginaSegura}
              totalPaginas={totalPaginas}
              porPagina={porPagina}
              setPorPagina={setPorPagina}
              irA={irA}
              paginas={paginas}
              totalDatos={datosFiltrados.length}
              label="pais"
            />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead><tr><th>#</th><th>Código</th><th>Nombre</th><th>Acciones</th></tr></thead>
          <tbody>
            {datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td>{row.codigo}</td>
                <td>{row.nombre}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(row); setShowModal(true) }}><i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar</button>
                    {confirmId === row.id ? (
                      <><span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(row.id)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button></>
                    ) : (
                      <button className="btn btn-sm btn-outline-danger py-0 px-2" onClick={() => setConfirmId(row.id)}><i className="bi bi-trash me-1" style={{ fontSize: 11 }} />Eliminar</button>
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
              label="pais"
              moduleColor={moduleColor}
            />
      <PaisModal show={showModal} pais={selected} onClose={() => setShowModal(false)} onSaved={() => { setShowModal(false); fetchData() }} />
    </>
  )
}