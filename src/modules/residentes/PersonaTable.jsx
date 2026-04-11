import { useState, useEffect } from 'react'
import { getPersonas, deletePersona } from './personaService'
import PersonaModal from './PersonaModal'
import { usePaginacion } from '../../shared/hooks/usePaginacion'
import PaginacionFooter from '../../shared/components/PaginacionFooter'

export default function PersonaTable({ moduleColor }) {
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
    getPersonas()
      .then(res => {
        const lista = Array.isArray(res.data) ? res.data : res.data?.data ?? []
        console.log('primer registro raw:', lista[0]) 
        const normalized = lista.map(p => ({
          id:                  p.id_Persona          ?? p.Id_Persona          ?? p.idPersona,
          tipo:                p.tipo_Persona         ?? p.Tipo_Persona         ?? p.tipopersona ?? p.tipo ?? p.Tipo,
          nombres:             p.nombres              ?? p.Nombres,
          apellidos:           p.apellidos            ?? p.Apellidos,
          dpi:                 p.dpi                  ?? p.DPI,
          pasaporte:           p.pasaporte            ?? p.Pasaporte            ?? '',
          fechaNacimiento:     p.fecha_Nacimiento     ?? p.Fecha_Nacimiento     ?? p.fechaNacimiento ?? '',
          telefonoPrincipal:   p.telefono_Principal   ?? p.Telefono_Principal   ?? p.telefonoPrincipal ?? '',
          telefonoSecundario:  p.telefono_Secundario  ?? p.Telefono_Secundario  ?? p.telefonoSecundario ?? '',
          email:               p.email                ?? p.Email                ?? '',
          nit:                 p.nit                  ?? p.NIT                  ?? '',
          observaciones:       p.observaciones        ?? p.Observaciones        ?? '',
          activo:              p.activo               ?? p.Activo               ?? 1,
        }))
        setRows(normalized)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleEliminar = async (id) => {
    try { await deletePersona(id); setConfirmId(null); fetchData() }
    catch (err) { alert('Error al eliminar: ' + err.message) }
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
      <PaginacionFooter
        titulo="Personas"
        icono="bi-person"
        labelBoton="Persona"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro}
        setFiltro={setFiltro}
        placeholder="Filtrar personas..."
        paginaSegura={paginaSegura}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        setPorPagina={setPorPagina}
        irA={irA}
        paginas={paginas}
        totalDatos={datosFiltrados.length}
        label="personas"
      />

      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Nombres</th>
              <th>Apellidos</th>
              <th>DPI</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr>
                <td colSpan={9} className="text-center text-muted py-4">
                  <i className="bi bi-inbox me-2" />Sin personas registradas
                </td>
              </tr>
            ) : datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td><span className="badge text-bg-light border" style={{ fontSize: 10 }}>{row.tipo}</span></td>
                <td>{row.nombres}</td>
                <td>{row.apellidos}</td>
                <td className="text-muted">{row.dpi}</td>
                <td>{row.telefonoPrincipal}</td>
                <td>{row.email}</td>
                <td>
                  <span className={`badge text-bg-${row.activo === 1 ? 'success' : 'secondary'}`}>
                    {row.activo === 1 ? 'Activo' : 'Inactivo'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2"
                      onClick={() => { setSelected(row); setShowModal(true) }}>
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
                      <button className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => setConfirmId(row.id)}>
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
        label="personas"
        moduleColor={moduleColor}
      />

      <PersonaModal
        show={showModal}
        persona={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}