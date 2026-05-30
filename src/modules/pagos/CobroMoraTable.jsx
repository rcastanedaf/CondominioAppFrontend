import { useState, useEffect } from 'react'
import { getCobrosMora, deleteCobroMora }  from './cobroMoraService'
import { getCuentasCobrar }                from './cuentaCobrarService'
import { getResidentes }                   from '../residentes/residenteService'
import { getPersonas }                     from '../residentes/personaService'
import CobroMoraModal                      from './CobroMoraModal'
import { usePaginacion }                   from '../../shared/hooks/usePaginacion'
import PaginacionFooter                    from '../../shared/components/PaginacionFooter'

const fmt = (n) => `Q ${Number(n ?? 0).toLocaleString('es-GT', { minimumFractionDigits: 2 })}`

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
    setError(null)
    Promise.all([
      getCobrosMora(),
      getCuentasCobrar(),
      getResidentes(),
      getPersonas(),
    ])
      .then(([cRes, ccRes, rRes, perRes]) => {
        const toArr = r => Array.isArray(r.data) ? r.data : r.data?.data ?? r.data?.Data ?? []
        const cobros     = toArr(cRes)
        const cuentas    = toArr(ccRes)
        const residentes = toArr(rRes)
        const personas   = toArr(perRes)

        const enriched = cobros.map(c => {
          // El modelo usa PascalCase → Dapper lo serializa a camelCase en la respuesta JSON
          // Los campos reales son: idMora, idCuenta, fechaCalculo, diasAtraso,
          //                        saldoBase, porcentajeAplicado, montoMora, acumuladoTotal
          const idCuentaDelCobro = c.idCuenta ?? c.id_Cuenta

          // CuentaPorCobrar tiene: idCuentaPorCobrar o id — verificar con el controller
          const cuenta = cuentas.find(cc => {
            const idCuenta = cc.idCuentaPorCobrar ?? cc.idCuenta ?? cc.id ?? cc.id_Cuenta
            return idCuenta === idCuentaDelCobro
          })

          const idResidenteDeCuenta = cuenta
            ? (cuenta.idResidente ?? cuenta.id_Residente)
            : null

          const residente = idResidenteDeCuenta
            ? residentes.find(r =>
                (r.id_Residente ?? r.idResidente) === idResidenteDeCuenta)
            : null

          const idPersona = residente
            ? (residente.id_Persona ?? residente.idPersona)
            : null

          const persona = idPersona
            ? personas.find(p => (p.id_Persona ?? p.idPersona) === idPersona)
            : null

          const labelCuenta = cuenta
            ? `Cuenta #${cuenta.idCuentaPorCobrar ?? cuenta.idCuenta ?? cuenta.id}${
                cuenta.descripcion ? ` — ${cuenta.descripcion}` : ''
              }`
            : `Cuenta #${idCuentaDelCobro ?? '—'}`

          const nombreResidente = persona
            ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
            : residente
              ? `Residente #${residente.id_Residente ?? residente.idResidente}`
              : '—'

          return {
            ...c,
            _labelCuenta:      labelCuenta,
            _nombreResidente:  nombreResidente,
          }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try {
      await deleteCobroMora(id)
      setConfirmId(null)
      fetchData()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" />
      Cargando cobros de mora...
    </div>
  )

  if (error) return (
    <div className="alert alert-danger py-2">
      <i className="bi bi-exclamation-circle me-2" />{error}
      <button className="btn btn-sm btn-outline-danger ms-3" onClick={fetchData}>
        Reintentar
      </button>
    </div>
  )

  return (
    <>
      <PaginacionFooter
        titulo="Cobros de Mora"
        icono="bi-exclamation-triangle"
        labelBoton="Nuevo Cobro Mora"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro}
        placeholder="Filtrar cobros..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="cobros"
      />

      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Cuenta</th>
              <th>Residente</th>
              <th>F. Cálculo</th>
              <th>Días Atraso</th>
              <th>Saldo Base</th>
              <th>% Mora</th>
              <th>Monto Mora</th>
              <th>Acumulado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr>
                <td colSpan={10} className="text-center text-muted py-4">
                  <i className="bi bi-inbox me-2" />Sin cobros de mora registrados
                </td>
              </tr>
            ) : datosPagina.map((row, i) => {
              // ── Usar nombres correctos del modelo (camelCase desde Dapper) ──
              const id         = row.idMora
              const fechaCal   = row.fechaCalculo
              const dias       = row.diasAtraso       ?? 0
              const saldo      = row.saldoBase        ?? 0
              const pct        = row.porcentajeAplicado ?? 0
              const monto      = row.montoMora        ?? 0
              const acumulado  = row.acumuladoTotal   ?? 0

              return (
                <tr key={id ?? i}>
                  <td className="text-muted">{id}</td>
                  <td
                    className="fw-semibold"
                    style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}
                    title={row._labelCuenta}
                  >
                    {row._labelCuenta}
                  </td>
                  <td>{row._nombreResidente}</td>
                  <td>{fechaCal ? String(fechaCal).substring(0, 10) : '—'}</td>
                  <td>
                    <span className={`badge ${dias > 30 ? 'text-bg-danger' : dias > 15 ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                      {dias} días
                    </span>
                  </td>
                  <td>{fmt(saldo)}</td>
                  <td>
                    <span className="badge text-bg-info">{pct}%</span>
                  </td>
                  <td className="text-danger fw-semibold">{fmt(monto)}</td>
                  <td className="fw-semibold">{fmt(acumulado)}</td>
                  <td>
                    <div className="d-flex gap-1">
                      <button
                        className="btn btn-sm btn-outline-primary py-0 px-2"
                        onClick={() => { setSelected(row); setShowModal(true) }}
                      >
                        <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                      </button>
                      {confirmId === id ? (
                        <>
                          <span className="text-danger small align-self-center">¿Confirmar?</span>
                          <button
                            className="btn btn-sm btn-danger py-0 px-2"
                            onClick={() => handleEliminar(id)}
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
                          onClick={() => setConfirmId(id)}
                        >
                          <i className="bi bi-trash me-1" style={{ fontSize: 11 }} />Eliminar
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <PaginacionFooter
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="cobros" moduleColor={moduleColor}
      />

      <CobroMoraModal
        show={showModal}
        cobro={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}