import { useState, useEffect } from 'react'
import ModuleLayout from '../../shared/components/ModuleLayout'
import DataTable from '../../shared/components/DataTable'
import { getBancos, createBanco, updateBanco, deleteBanco } from './bancoService'
import BancoModal from './BancoModal'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'


export default function BancoTable({ moduleColor }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [showModal,  setShowModal]  = useState(false)
  const [selected,   setSelected]   = useState(null)
  const [confirmId,  setConfirmId]  = useState(null)

    // Carga la tabla
  const fetchData = () => {
    setLoading(true)
    getBancos()
      .then(res => setRows(res.data.data ?? []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  // ── hook — filtra + pagina ────────────────────────────────
  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  useEffect(() => { fetchData() }, [])

  // Abrir modal Nuevo
  const handleNuevo = () => {
    setSelected(null)
    setShowModal(true)
  }

  // Abrir modal Editar
  const handleEditar = (row) => {
    setSelected(row)
    setShowModal(true)
  }

  // Confirmar y ejecutar eliminación
  const handleEliminar = async (id) => {
    try {
      await deleteBanco(id)
      setConfirmId(null)
      fetchData()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" />
      Cargando bancos...
    </div>
  )

  if (error) return (
    <div className="alert alert-danger py-2">
      <i className="bi bi-exclamation-circle me-2" />
      {error}
    </div>
  )

  return (
    <>
      {/* Header + buscador + selector — reemplaza el antiguo d-flex justify-content-between */}
      <PaginacionFooter
        titulo="Bancos"
        icono="bi-receipt-cutoff"
        labelBoton="Nuevo Banco"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro}
        setFiltro={setFiltro}
        placeholder="Filtrar bancos..."
        paginaSegura={paginaSegura}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        setPorPagina={setPorPagina}
        irA={irA}
        paginas={paginas}
        totalDatos={datosFiltrados.length}
        label="bancos"
      />

      {/* Tabla */}
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td>{row.nombre}</td>
                <td>
                  <span className={`badge ${row.activo === 1 ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                    {row.activo === 1 ? 'Activo.' : 'No Activo.'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    {/* Editar */}
                    <button
                      className="btn btn-sm btn-outline-primary py-0 px-2"
                      onClick={() => handleEditar(row)}
                    >
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />
                      Editar
                    </button>

                    {/* Eliminar — muestra confirmación inline */}
                    {confirmId === row.id ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button
                          className="btn btn-sm btn-danger py-0 px-2"
                          onClick={() => handleEliminar(row.id)}
                        >
                          Sí
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={() => setConfirmId(null)}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => setConfirmId(row.id)}
                      >
                        <i className="bi bi-trash me-1" style={{ fontSize: 11 }} />
                        Eliminar
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
        label="bancos"
        moduleColor={moduleColor}
      />

      {/* Modal crear/editar */}
      <BancoModal
        show={showModal}
        banco={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}
