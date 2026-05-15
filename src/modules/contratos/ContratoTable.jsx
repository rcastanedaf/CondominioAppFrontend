import { useState, useEffect } from 'react'
import { getContratos, deleteContrato } from './contratoService'
import { getResidentes }   from '../residentes/residenteService'
import { getPropiedades }  from '../catalogos/propiedadService'
import { getPersonas }     from '../residentes/personaService'
import ContratoModal from './ContratoModal'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

const ESTADO_COLOR = { VIGENTE: 'success', VENCIDO: 'danger', RESCINDIDO: 'secondary', PENDIENTE: 'warning' }

export default function ContratoTable({ moduleColor }) {
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
    Promise.all([getContratos(), getResidentes(), getPropiedades(), getPersonas()])
      .then(([cRes, rRes, pRes, perRes]) => {
        const contratos   = Array.isArray(cRes.data)   ? cRes.data   : cRes.data?.data   ?? []
        const residentes  = rRes.data.data  ?? rRes.data   ?? rRes.data?.data   ?? []
        const propiedades = pRes.data.data  ?? pRes.data   ?? pRes.data?.data   ?? []
        const personas    = perRes.data.data ?? perRes.data ?? perRes.data?.data ?? []

        const enriched = contratos.map(c => {
          const residente  = residentes.find(r =>
            (r.id_Residente ?? r.idResidente) === (c.idResidente ?? c.id_Residente))
          const propiedad  = propiedades.find(p =>
            (p.id_propiedad ?? p.idPropiedad) === (c.idPropiedad ?? c.id_Propiedad))
          const persona    = personas.find(p =>
            (p.id_Persona ?? p.idPersona) === (residente?.id_Persona ?? residente?.idPersona))

          const nombreResidente = persona
            ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
            : residente ? `Residente #${residente.id_Residente ?? residente.idResidente}` : `#${c.idResidente}`

          const codigoPropiedad = propiedad?.codigo ?? `Prop. #${c.idPropiedad}`

          return { ...c, _nombreResidente: nombreResidente, _codigoPropiedad: codigoPropiedad }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteContrato(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando contratos...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Contratos" icono="bi-file-earmark-text" labelBoton="Nuevo Contrato"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar contratos..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="contratos"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Propiedad</th><th>Residente</th><th>Tipo</th>
              <th>F. Inicio</th><th>F. Fin</th><th>Monto</th><th>Estado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={9} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin contratos registrados</td></tr>
            ) : datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td className="fw-semibold">{row._codigoPropiedad}</td>
                <td>{row._nombreResidente}</td>
                <td><span className="badge text-bg-light border" style={{ fontSize: 10 }}>{row.tipoContrato}</span></td>
                <td>{row.fechaInicio?.substring(0, 10)}</td>
                <td className="text-muted">{row.fechaFin?.substring(0, 10) ?? '—'}</td>
                <td className="fw-semibold">Q {Number(row.monto ?? 0).toFixed(2)}</td>
                <td><span className={`badge text-bg-${ESTADO_COLOR[row.estado] || 'secondary'}`}>{row.estado}</span></td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(row); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === row.id ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2" onClick={() => handleEliminar(row.id_contrato)}>Sí</button>
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
        totalDatos={datosFiltrados.length} label="contratos" moduleColor={moduleColor}
      />
      <ContratoModal
        show={showModal} contrato={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}