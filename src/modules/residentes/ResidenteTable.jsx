import { useState, useEffect } from 'react'
import { getResidentes, deleteResidente } from './residenteService'
import { getPersonas } from '../residentes/personaService'
import ResidenteModal from './ResidenteModal'
import { usePaginacion } from '../../shared/hooks/usePaginacion'
import PaginacionFooter from '../../shared/components/PaginacionFooter'

export default function ResidenteTable({ moduleColor }) {
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
    Promise.all([getResidentes(), getPersonas()])
      .then(([resRes, perRes]) => {
        const listaResidentes = Array.isArray(resRes.data)
          ? resRes.data
          : resRes.data?.data ?? []

        const listaPersonas = Array.isArray(perRes.data)
          ? perRes.data
          : perRes.data?.data ?? []

        const enriched = listaResidentes.map(r => {
          const persona = listaPersonas.find(
            p => (p.id_Persona ?? p.Id_Persona ?? p.idPersona) ===
                (r.id_Persona ?? r.Id_Persona ?? r.idPersona)
          )
          return {
            id:            r.id_Residente   ?? r.Id_Residente   ?? r.idResidente,
            idPersona:     r.id_Persona     ?? r.Id_Persona     ?? r.idPersona,
            idPropiedad:   r.id_Propiedad   ?? r.Id_Propiedad   ?? r.idPropiedad,
            tipoResidente: r.tipo_Residente ?? r.Tipo_Residente ?? r.tipoResidente,
            fechaIngreso:  r.fecha_Ingreso  ?? r.Fecha_Ingreso  ?? r.fechaIngreso,
            fechaSalida:   r.fecha_Salida   ?? r.Fecha_Salida   ?? r.fechaSalida,
            activo:        r.activo         ?? r.Activo,
            observaciones: r.observaciones  ?? r.Observaciones,
            nombres:       persona?.nombres    ?? persona?.Nombres    ?? `(Persona #${r.id_Persona ?? r.idPersona})`,
            apellidos:     persona?.apellidos  ?? persona?.Apellidos  ?? '',
            dpi:           persona?.dpi        ?? persona?.DPI        ?? '—',
            telefono:      persona?.telefono_Principal ?? persona?.Telefono_Principal ?? '—',
            email:         persona?.email      ?? persona?.Email      ?? '—',
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
      await deleteResidente(id)
      setConfirmId(null)
      fetchData()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" />Cargando...
    </div>
  )

  if (error) return (
    <div className="alert alert-danger py-2">
      <i className="bi bi-exclamation-circle me-2" />{error}
    </div>
  )

  return (
    <>
      {/* Header + buscador + paginación superior */}
      <PaginacionFooter
        titulo="Residentes"
        icono="bi-people"
        labelBoton="Residente"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro}
        setFiltro={setFiltro}
        placeholder="Filtrar residentes..."
        paginaSegura={paginaSegura}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        setPorPagina={setPorPagina}
        irA={irA}
        paginas={paginas}
        totalDatos={datosFiltrados.length}
        label="residentes"
      />

      {/* Tabla */}
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>DPI</th>
              <th>ID Propiedad</th>
              <th>Tipo</th>
              <th>F. Ingreso</th>
              <th>F. Salida</th>
              <th>Teléfono</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr>
                <td colSpan={11} className="text-center text-muted py-4">
                  <i className="bi bi-inbox me-2" />Sin residentes registrados
                </td>
              </tr>
            ) : datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td className="fw-semibold">{row.nombres}</td>
                <td>{row.apellidos}</td>
                <td className="text-muted">{row.dpi}</td>
                <td>
                  <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                    {row.idPropiedad ?? '—'}
                  </span>
                </td>
                <td>
                  <span className="badge text-bg-light border" style={{ fontSize: 10 }}>
                    {row.tipoResidente}
                  </span>
                </td>
                <td>{row.fechaIngreso?.substring(0, 10) ?? '—'}</td>
                <td className="text-muted">{row.fechaSalida?.substring(0, 10) ?? '—'}</td>
                <td>{row.telefono}</td>
                <td>
                  <span className={`badge text-bg-${row.activo === 1 ? 'success' : 'secondary'}`}>
                    {row.activo === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button
                      className="btn btn-sm btn-outline-primary py-0 px-2"
                      onClick={() => { setSelected(row); setShowModal(true) }}
                    >
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === row.id ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button className="btn btn-sm btn-danger py-0 px-2"
                          onClick={() => handleEliminar(row.id)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={() => setConfirmId(null)}>No</button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => setConfirmId(row.id)}
                      >
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

      {/* Footer paginación inferior */}
      <PaginacionFooter
        paginaSegura={paginaSegura}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        setPorPagina={setPorPagina}
        irA={irA}
        paginas={paginas}
        totalDatos={datosFiltrados.length}
        label="residentes"
        moduleColor={moduleColor}
      />

      <ResidenteModal
        show={showModal}
        residente={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}