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
        const renovaciones = rRes.data ?? []
        const contratos    = cRes.data ?? []
        const propiedades  = pRes.data?.data   ?? []

        const enriched = renovaciones.map(r => {
        // Dapper serializa ID_CONTRATO → idContrato con la configuración actual
        const idContrato = r.idContrato ?? r.id_Contrato
        const contrato = contratos.find(c =>
          (c.idContrato ?? c.id_Contrato ?? c.id) === idContrato
        )
        const idPropiedad = contrato
          ? (contrato.idPropiedad ?? contrato.id_Propiedad)
          : null
        const propiedad = idPropiedad
          ? propiedades.find(p => (p.idPropiedad ?? p.id_Propiedad) === idPropiedad)
          : null
        const codigoProp = propiedad
          ? (propiedad.codigoPropiedad ?? propiedad.codigo_Propiedad ?? propiedad.codigo ?? `#${idPropiedad}`)
          : `Prop. #${idPropiedad ?? '—'}`

        return {
          ...r,
          _labelContrato: `Contrato #${idContrato ?? '—'} — ${codigoProp}`,
          _estadoContrato: contrato?.estado ?? contrato?.Estado ?? '—',
          _tipoContrato:   contrato?.tipoContrato ?? contrato?.tipo_Contrato ?? '—',
        }
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
              <th>#</th>
              <th>Contrato</th>
              <th>Nueva Vigencia</th>
              <th>Nuevo Monto</th>
              <th>F. Registro</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={6} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin renovaciones registradas</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id_renovacion ?? r.id_Renovacion  ?? i+1}>
                <td>{r.idRenovacion   ?? r.id_Renovacion  ?? i+1}</td>
                <td>{r._labelContrato}</td>
                <td>{(r.fechaInicio   ?? r.fecha_Inicio   ?? '').toString().slice(0,10)}</td>
                <td>{(r.fechaFin      ?? r.fecha_Fin      ?? '—').toString?.()?.slice(0,10) ?? '—'}</td>
                <td>Q {Number(r.montoNuevo ?? r.monto_Nuevo ?? 0).toFixed(2)}</td>
                <td>
                  <span className={`badge ${
                    (r.estado ?? '').toUpperCase() === 'ACTIVO'     ? 'bg-success' :
                    (r.estado ?? '').toUpperCase() === 'FINALIZADO' ? 'bg-secondary' : 'bg-danger'
                  }`}>
                    {r.estado ?? '—'}
                  </span>
                </td>
                  <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(r); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === r.id_renovacion ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(r.id_renovacion)}>Sí</button>
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