import { useState, useEffect } from 'react'
import { getUsuarios, deleteUsuario, desbloquear, toggleActivo } from './usuarioService'
import UsuarioModal        from './UsuarioModal'
import { usePaginacion }   from '../../shared/hooks/usePaginacion'
import PaginacionFooter    from '../../shared/components/PaginacionFooter'

// ── Helpers de formato ────────────────────────────────────────
const fmtFecha = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleDateString('es-GT', { day: '2-digit', month: '2-digit', year: 'numeric' })
}

const fmtTimestamp = (ts) => {
    if (!ts) return '—'
    return new Date(ts).toLocaleString('es-GT', {
        day: '2-digit', month: '2-digit', year: 'numeric',
        hour: '2-digit', minute: '2-digit'
    })
}

export default function UsuarioTable({ moduleColor = '#1e50a0' }) {

    const [rows,      setRows]      = useState([])
    const [loading,   setLoading]   = useState(true)
    const [error,     setError]     = useState(null)
    const [showModal, setShowModal] = useState(false)
    const [selected,  setSelected]  = useState(null)
    const [confirmId, setConfirmId] = useState(null)

    // ── Cargar datos ─────────────────────────────────────────
    const fetchData = () => {
        setLoading(true)
        getUsuarios()
            .then(res => setRows(res.data?.data ?? res.data ?? []))
            .catch(err => setError(err.message))
            .finally(() => setLoading(false))
    }

    useEffect(() => { fetchData() }, [])

    // ── Paginación + filtro ──────────────────────────────────
    const {
        datosPagina, datosFiltrados,
        filtro, setFiltro,
        paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
    } = usePaginacion(rows)

    // ── Acciones ─────────────────────────────────────────────
    const handleEliminar = async (id) => {
        try {
            await deleteUsuario(id)
            setConfirmId(null)
            fetchData()
        } catch (err) {
            alert('Error al eliminar: ' + (err.response?.data?.message ?? err.message))
        }
    }

    const handleDesbloquear = async (id) => {
        try {
            await desbloquear(id)
            fetchData()
        } catch (err) {
            alert('Error al desbloquear: ' + (err.response?.data?.message ?? err.message))
        }
    }

    const handleToggleActivo = async (row) => {
        const nuevoActivo = row.activo === 1 || row.activo === true ? 0 : 1
        try {
            await toggleActivo(row.id_Usuario ?? row.idUsuario, nuevoActivo)
            fetchData()
        } catch (err) {
            alert('Error al cambiar estado: ' + (err.response?.data?.message ?? err.message))
        }
    }

    // ── Render ───────────────────────────────────────────────
    if (loading) return (
        <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2" />Cargando usuarios...
        </div>
    )
    if (error) return (
        <div className="alert alert-danger py-2">
            <i className="bi bi-exclamation-circle me-2" />{error}
        </div>
    )

    return (
        <>
            {/* ── Header + buscador + paginación superior ── */}
            <PaginacionFooter
                titulo="Usuarios del Sistema"
                icono="bi-person-lock"
                labelBoton="Nuevo Usuario"
                onNuevo={() => { setSelected(null); setShowModal(true) }}
                moduleColor={moduleColor}
                filtro={filtro}
                setFiltro={setFiltro}
                placeholder="Filtrar por usuario, persona o rol..."
                paginaSegura={paginaSegura}
                totalPaginas={totalPaginas}
                porPagina={porPagina}
                setPorPagina={setPorPagina}
                irA={irA}
                paginas={paginas}
                totalDatos={datosFiltrados.length}
                label="usuarios"
            />

            {/* ── Tabla ── */}
            <div className="cms-table-wrap">
                <table className="table table-hover cms-table">
                    <thead>
                        <tr>
                            <th>#</th>
                            <th>Persona</th>
                            <th>Username</th>
                            <th>Rol</th>
                            <th className="text-center">Activo</th>
                            <th className="text-center">Bloqueado</th>
                            <th className="text-center">Intentos Fallidos</th>
                            <th>Último Acceso</th>
                            <th>Vencimiento</th>
                            <th>Acciones</th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosPagina.map((row, i) => {
                            const id      = row.id_Usuario ?? row.idUsuario
                            const activo  = row.activo === 1 || row.activo === true
                            const bloq    = row.bloqueado === 1 || row.bloqueado === true
                            const intentos= row.intentos_Fallidos ?? row.intentosFallidos ?? 0

                            return (
                                <tr key={id ?? i}>

                                    {/* ID */}
                                    <td className="text-muted">{id}</td>

                                    {/* Persona */}
                                    <td>
                                        <span className="fw-semibold">
                                            {row._nombrePersona
                                                ?? row.nombrePersona
                                                ?? `Persona #${row.id_Persona ?? row.idPersona}`}
                                        </span>
                                    </td>

                                    {/* Username */}
                                    <td>
                                        <span className="badge bg-primary bg-opacity-10 text-primary px-2 py-1">
                                            <i className="bi bi-at me-1" style={{ fontSize: 11 }} />
                                            {row.username}
                                        </span>
                                    </td>

                                    {/* Rol */}
                                    <td>
                                        <span className="badge bg-secondary bg-opacity-20 text-dark px-2">
                                            {row._nombreRol
                                                ?? row.nombreRol
                                                ?? row.rol
                                                ?? `Rol #${row.id_Rol ?? row.idRol}`}
                                        </span>
                                    </td>

                                    {/* Activo (toggle rápido) */}
                                    <td className="text-center">
                                        <button
                                            className={`btn btn-sm py-0 px-2 ${activo ? 'btn-success' : 'btn-outline-secondary'}`}
                                            onClick={() => handleToggleActivo(row)}
                                            title={activo ? 'Clic para desactivar' : 'Clic para activar'}
                                            style={{ fontSize: 11 }}
                                        >
                                            <i className={`bi ${activo ? 'bi-check-circle-fill' : 'bi-x-circle'} me-1`} />
                                            {activo ? 'Activo' : 'Inactivo'}
                                        </button>
                                    </td>

                                    {/* Bloqueado */}
                                    <td className="text-center">
                                        {bloq ? (
                                            <div className="d-flex align-items-center justify-content-center gap-1">
                                                <span className="badge bg-danger">
                                                    <i className="bi bi-lock-fill me-1" />Bloqueado
                                                </span>
                                                <button
                                                    className="btn btn-sm btn-outline-success py-0 px-1"
                                                    onClick={() => handleDesbloquear(id)}
                                                    title="Desbloquear usuario"
                                                    style={{ fontSize: 10 }}
                                                >
                                                    <i className="bi bi-unlock" />
                                                </button>
                                            </div>
                                        ) : (
                                            <span className="badge bg-success bg-opacity-20 text-success">
                                                <i className="bi bi-unlock-fill me-1" />Libre
                                            </span>
                                        )}
                                    </td>

                                    {/* Intentos fallidos */}
                                    <td className="text-center">
                                        <span className={`badge ${intentos >= 3 ? 'bg-danger' : intentos > 0 ? 'bg-warning text-dark' : 'bg-light text-muted'}`}>
                                            {intentos}
                                        </span>
                                    </td>

                                    {/* Último acceso */}
                                    <td className="text-muted small">
                                        {fmtTimestamp(row.ultimo_Acceso ?? row.ultimoAcceso)}
                                    </td>

                                    {/* Vencimiento */}
                                    <td className="text-muted small">
                                        {row.fecha_Vencimiento ?? row.fechaVencimiento
                                            ? fmtFecha(row.fecha_Vencimiento ?? row.fechaVencimiento)
                                            : <span className="text-muted">Sin vencimiento</span>
                                        }
                                    </td>

                                    {/* Acciones */}
                                    <td>
                                        <div className="d-flex gap-1 flex-wrap">

                                            {/* Editar */}
                                            <button
                                                className="btn btn-sm btn-outline-primary py-0 px-2"
                                                onClick={() => { setSelected(row); setShowModal(true) }}
                                            >
                                                <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />
                                                Editar
                                            </button>

                                            {/* Eliminar con confirmación */}
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
                                                    <i className="bi bi-trash me-1" style={{ fontSize: 11 }} />
                                                    Eliminar
                                                </button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            )
                        })}

                        {datosPagina.length === 0 && (
                            <tr>
                                <td colSpan={10} className="text-center text-muted py-5">
                                    <i className="bi bi-inbox fs-2 d-block mb-2" />
                                    Sin usuarios registrados
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── Paginación inferior ── */}
            <PaginacionFooter
                paginaSegura={paginaSegura}
                totalPaginas={totalPaginas}
                porPagina={porPagina}
                setPorPagina={setPorPagina}
                irA={irA}
                paginas={paginas}
                totalDatos={datosFiltrados.length}
                label="usuarios"
                moduleColor={moduleColor}
            />

            {/* ── Modal crear / editar ── */}
            <UsuarioModal
                show={showModal}
                usuario={selected}
                onClose={() => setShowModal(false)}
                onSaved={() => { setShowModal(false); fetchData() }}
            />
        </>
    )
}