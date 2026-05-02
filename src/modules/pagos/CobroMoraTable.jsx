import { useState, useEffect } from 'react'
import { getCobrosMora, deleteCobroMora } from './cobroMoraService'
import { getCuentasCobrar }   from './cuentaCobrarService'
import { getResidentes }      from '../residentes/residenteService'
import { getPersonas }        from '../residentes/personaService'
import CobroMoraModal from './CobroMoraModal'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

export default function CobroMoraTable({ moduleColor }) {
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
    Promise.all([getCobrosMora(), getCuentasCobrar(), getResidentes(), getPersonas()])
      .then(([cRes, ccRes, rRes, perRes]) => {
        const cobros    = Array.isArray(cRes.data)   ? cRes.data   : cRes.data?.data   ?? []
        const cuentas   = Array.isArray(ccRes.data)  ? ccRes.data  : ccRes.data?.data  ?? []
        const residentes = Array.isArray(rRes.data)  ? rRes.data   : rRes.data?.data   ?? []
        const personas  = Array.isArray(perRes.data) ? perRes.data : perRes.data?.data ?? []

        const enriched = cobros.map(c => {
          const cuenta    = cuentas.find(cc =>
            (cc.idCuenta ?? cc.id) === (c.idCuenta ?? c.id_Cuenta))
          const residente = cuenta
            ? residentes.find(r =>
                (r.id_Residente ?? r.idResidente) === (cuenta.idResidente ?? cuenta.id_Residente))
            : null
          const persona   = residente
            ? personas.find(p =>
                (p.id_Persona ?? p.idPersona) === (residente.id_Persona ?? residente.idPersona))
            : null

          const labelCuenta = cuenta
            ? `Cuenta #${cuenta.idCuenta ?? cuenta.id}${cuenta.descripcion ? ` — ${cuenta.descripcion}` : ''}`
            : `Cuenta #${c.idCuenta}`
          const nombreResidente = persona
            ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
            : residente ? `Residente #${residente.id_Residente ?? residente.idResidente}` : '—'

          return { ...c, _labelCuenta: labelCuenta, _nombreResidente: nombreResidente }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deleteCobroMora(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando cobros de mora...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Cobros de Mora" icono="bi-exclamation-triangle" labelBoton="Nuevo Cobro Mora"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar cobros..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="cobros"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th><th>Cuenta</th><th>Residente</th><th>F. Cálculo</th>
              <th>Días Atraso</th><th>Saldo Base</th><th>% Mora</th><th>Monto Mora</th><th>Acumulado</th><th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Sin cobros de mora registrados</td></tr>
            ) : datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td className="fw-semibold" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {row._labelCuenta}
                </td>
                <td>{row._nombreResidente}</td>
                <td>{row.fechaCalculo?.substring(0, 10)}</td>
                <td><span className="badge text-bg-danger">{row.diasAtraso} días</span></td>
                <td>Q {Number(row.saldoBase ?? 0).toFixed(2)}</td>
                <td>{row.porcentajeAplicado}%</td>
                <td className="text-danger fw-semibold">Q {Number(row.montoMora ?? 0).toFixed(2)}</td>
                <td className="fw-semibold">Q {Number(row.acumuladoTotal ?? 0).toFixed(2)}</td>
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
        totalDatos={datosFiltrados.length} label="cobros" moduleColor={moduleColor}
      />
      <CobroMoraModal
        show={showModal} cobro={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}