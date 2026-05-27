import { useState, useEffect } from 'react'
import { getLogs } from './logAuditoriaService'
import { usePaginacion } from '../../shared/hooks/usePaginacion'
import PaginacionFooter from '../../shared/components/PaginacionFooter'

export default function LogAuditoriaTable({ moduleColor }) {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [top, setTop] = useState(500)

  const { 
    datosPagina, 
    datosFiltrados, 
    filtro, 
    setFiltro,
    paginaSegura, 
    totalPaginas, 
    porPagina, 
    setPorPagina, 
    irA, 
    paginas 
  } = usePaginacion(rows) 

  const fetchData = () => {
    setLoading(true)
    getLogs(top)
    .then(r => setRows(r.data ?? []))
    .catch(e => setError(e.message))
    .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [top])

  if (loading) return <div className="text-center py-5"><div className="spinner-border spinner-border-sm" /> Cargando logs...</div>
  if (error)   return <div className="alert alert-danger">{error}</div>

  const RES_COLOR = { EXITO: 'text-bg-success', ERROR: 'text-bg-danger' }

  return (
    <>
      <PaginacionFooter
        titulo="Log de Auditoría" icono="bi-shield-check"
        moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por módulo, acción, usuario..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas} porPagina={porPagina}
        setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="eventos"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table" style={{ fontSize: 12 }}>
          <thead>
            <tr><th>#</th><th>Usuario</th><th>Módulo</th><th>Acción</th><th>Tabla</th><th>Resultado</th><th>IP</th><th>Fecha</th></tr>
          </thead>
          <tbody>
            {datosPagina.map((r, i) => (
              <tr key={r.id_Log ?? i}>
                <td className="text-muted">{r.id_Log}</td>
                <td>{r.username ?? '-'}</td>
                <td>{r.modulo}</td>
                <td>{r.accion}</td>
                <td className="text-muted">{r.tabla_Afectada ?? '-'}</td>
                <td><span className={`badge ${RES_COLOR[r.resultado] || 'text-bg-secondary'}`}>{r.resultado}</span></td>
                <td className="text-muted">{r.ip_Origen ?? '-'}</td>
                <td className="text-muted">{r.fecha_Hora ? new Date(r.fecha_Hora).toLocaleString('es-GT') : '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginacionFooter
        paginaSegura={paginaSegura} totalPaginas={totalPaginas} porPagina={porPagina}
        setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="eventos" moduleColor={moduleColor}
      />
    </>
  )
}