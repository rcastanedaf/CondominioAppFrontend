import { useState, useEffect } from 'react'
import { getRenovaciones, deleteRenovacion } from './renovacionService'
import { getContratos }   from '../contratos/contratoService'
import { getPropiedades } from '../catalogos/propiedadService'
import RenovacionModal from './RenovacionModal'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

export default function RenovacionTable({ moduleColor }) {
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
    Promise.all([getRenovaciones(), getContratos(), getPropiedades()])
      .then(([rRes, cRes, pRes]) => {
        const renovaciones = Array.isArray(rRes.data) ? rRes.data : rRes.data?.data ?? []
        const contratos    = Array.isArray(cRes.data) ? cRes.data : cRes.data?.data ?? []
        const propiedades  = Array.isArray(pRes.data) ? pRes.data : pRes.data?.data ?? []

        const enriched = renovaciones.map(r => {
          const contrato  = contratos.find(c => (c.id ?? c.idContrato) === (r.idContrato ?? r.id_Contrato))
          const propiedad = contrato
            ? propiedades.find(p => (p.id_propiedad ?? p.idPropiedad) === (contrato.idPropiedad ?? contrato.id_Propiedad))
            : null

          const labelContrato = contrato
            ? `Contrato #${contrato.id}${propiedad ? ` — ${propiedad.codigo}` : ''}`
            : `Contrato #${r.idContrato}`

          return { ...r, _labelContrato: labelContrato }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteRenovacion(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando renovaciones...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Renovaciones de Contrato" icono="bi-arrow-repeat" labelBoton="Nueva Renovación"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar renovaciones..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="renovaciones"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Contrato</th><th>Nueva Vigencia</th>
              <th>Nuevo Monto</th><th>F. Registro</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin renovaciones registradas</td></tr>
            ) : datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td className="fw-semibold">{row._labelContrato}</td>
                <td>{row.fechaNuevaVigencia?.substring(0, 10)}</td>
                <td className="fw-semibold">Q {Number(row.nuevoMonto || 0).toFixed(2)}</td>
                <td className="text-muted">{row.fechaRegistro?.substring(0, 10)}</td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(row); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === row.id ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(row.id)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button>
                      </>
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
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="renovaciones" moduleColor={moduleColor}
      />
      <RenovacionModal
        show={showModal} renovacion={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}