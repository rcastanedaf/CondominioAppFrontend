import { useState, useEffect } from 'react'
import { createUsuario, updateUsuario } from './usuarioService'
import { getAllRoles }  from './rolService'
import { getPersonas } from '../residentes/personaService'
import FkSelector      from '../../components/FkSelector'

export default function UsuarioModal({ show, onClose, onSaved, usuario }) {

    // ── Campos del formulario ────────────────────────────────
    const [idPersona,       setIdPersona]       = useState('')
    const [labelPersona,    setLabelPersona]    = useState('')
    const [username,        setUsername]        = useState('')
    const [password,        setPassword]        = useState('')
    const [showPass,        setShowPass]        = useState(false)
    const [idRol,           setIdRol]           = useState('')
    const [labelRol,        setLabelRol]        = useState('')
    const [activo,          setActivo]          = useState(true)
    const [primerIngreso,   setPrimerIngreso]   = useState(true)
    const [bloqueado,       setBloqueado]       = useState(false)
    const [fechaVencimiento,setFechaVencimiento]= useState('')

    const [loading, setLoading] = useState(false)
    const [error,   setError]   = useState(null)

    // ── Poblar al editar ─────────────────────────────────────
    useEffect(() => {
        if (usuario) {
            setIdPersona(String(usuario.id_Persona ?? usuario.idPersona ?? ''))
            setLabelPersona(usuario._nombrePersona ?? `Persona #${usuario.id_Persona ?? usuario.idPersona}`)
            setUsername(usuario.username ?? '')
            setPassword('')                // no se muestra el hash
            setIdRol(String(usuario.id_Rol ?? usuario.idRol ?? ''))
            setLabelRol(usuario._nombreRol ?? `Rol #${usuario.id_Rol ?? usuario.idRol}`)
            setActivo(usuario.activo === 1 || usuario.activo === true)
            setPrimerIngreso(usuario.primer_Ingreso === 1 || usuario.primerIngreso === 1 || usuario.primerIngreso === true)
            setBloqueado(usuario.bloqueado === 1 || usuario.bloqueado === true)
            setFechaVencimiento(usuario.fecha_Vencimiento?.substring(0, 10) ?? usuario.fechaVencimiento?.substring(0, 10) ?? '')
        } else {
            setIdPersona(''); setLabelPersona('')
            setUsername('');  setPassword('')
            setIdRol('');     setLabelRol('')
            setActivo(true);  setPrimerIngreso(true); setBloqueado(false)
            setFechaVencimiento('')
        }
        setError(null)
        setShowPass(false)
    }, [usuario, show])

    // ── fetchFn para PERSONA (enriquece con nombre completo) ─
    const fetchPersonas = async () => {
        const res = await getPersonas()
        const lista = res.data?.data ?? res.data ?? []
        return {
            data: lista.map(p => ({
                ...p,
                _nombreCompleto: `${p.nombres ?? ''} ${p.apellidos ?? ''}`.trim()
            }))
        }
    }

    // ── Validar y guardar ────────────────────────────────────
    const handleSubmit = async () => {
        if (!idPersona)         return setError('Selecciona una persona.')
        if (!username.trim())   return setError('El username es requerido.')
        if (!usuario && !password.trim()) return setError('La contraseña es requerida al crear.')
        if (!idRol)             return setError('Selecciona un rol.')

        setLoading(true); setError(null)
        try {
            const payload = {
                Id_Persona:        Number(idPersona),
                Username:          username.trim(),
                Id_Rol:            Number(idRol),
                Activo:            activo ? 1 : 0,
                Primer_Ingreso:    primerIngreso ? 1 : 0,
                Bloqueado:         bloqueado ? 1 : 0,
                Fecha_Vencimiento: fechaVencimiento || null,
            }

            // Solo incluir password si se escribió algo
            if (password.trim()) {
                payload.Password = password.trim()
            }

            if (usuario) {
                await updateUsuario(usuario.id_Usuario ?? usuario.idUsuario, payload)
            } else {
                await createUsuario(payload)
            }

            onSaved()
        } catch (err) {
            setError(err.response?.data?.message ?? err.message)
        } finally {
            setLoading(false)
        }
    }

    if (!show) return null

    return (
        <>
            {/* Backdrop */}
            <div className="modal-backdrop fade show" onClick={onClose} />

            {/* Modal */}
            <div className="modal fade show d-block" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content">

                        {/* Header */}
                        <div className="modal-header">
                            <h5 className="modal-title">
                                {usuario
                                    ? <><i className="bi bi-pencil-square me-2 text-primary" />Editar Usuario</>
                                    : <><i className="bi bi-person-plus-fill me-2 text-success" />Nuevo Usuario del Sistema</>
                                }
                            </h5>
                            <button className="btn-close" onClick={onClose} />
                        </div>

                        {/* Body */}
                        <div className="modal-body">

                            {error && (
                                <div className="alert alert-danger py-2 mb-3">
                                    <i className="bi bi-exclamation-circle me-2" />{error}
                                </div>
                            )}

                            <div className="row g-3">

                                {/* ── FK: Persona ── */}
                                <div className="col-md-6">
                                    <FkSelector
                                        label="Persona"
                                        required
                                        fetchFn={fetchPersonas}
                                        getId={p => p.id_Persona ?? p.idPersona ?? p.id}
                                        getLabel={p => p._nombreCompleto || `${p.nombres ?? ''} ${p.apellidos ?? ''}`.trim()}
                                        value={idPersona}
                                        displayValue={labelPersona}
                                        onChange={(id, lbl) => { setIdPersona(id); setLabelPersona(lbl) }}
                                        placeholder="Selecciona persona..."
                                    />
                                </div>

                                {/* ── FK: Rol ── */}
                                <div className="col-md-6">
                                    <FkSelector
                                        label="Rol del Sistema"
                                        required
                                        fetchFn={getAllRoles}
                                        getId={r => r.id ?? r.id_Rol ?? r.idRol}
                                        getLabel={r => r.nombre ?? r.name ?? `Rol #${r.id}`}
                                        value={idRol}
                                        displayValue={labelRol}
                                        onChange={(id, lbl) => { setIdRol(id); setLabelRol(lbl) }}
                                        placeholder="Selecciona rol..."
                                    />
                                </div>

                                {/* ── Username ── */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        Username <span className="text-danger">*</span>
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-at text-secondary" />
                                        </span>
                                        <input
                                            type="text"
                                            className="form-control"
                                            placeholder="Ej. jgonzalez"
                                            value={username}
                                            onChange={e => setUsername(e.target.value)}
                                            autoComplete="off"
                                        />
                                    </div>
                                </div>

                                {/* ── Password ── */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        Contraseña {!usuario && <span className="text-danger">*</span>}
                                        {usuario && (
                                            <span className="text-muted fw-normal ms-2" style={{ fontSize: 11 }}>
                                                (dejar vacío para no cambiar)
                                            </span>
                                        )}
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-lock text-secondary" />
                                        </span>
                                        <input
                                            type={showPass ? 'text' : 'password'}
                                            className="form-control"
                                            placeholder={usuario ? '••••••••' : 'Mínimo 8 caracteres'}
                                            value={password}
                                            onChange={e => setPassword(e.target.value)}
                                            autoComplete="new-password"
                                        />
                                        <button
                                            type="button"
                                            className="btn btn-outline-secondary"
                                            onClick={() => setShowPass(p => !p)}
                                            title={showPass ? 'Ocultar' : 'Mostrar'}
                                        >
                                            <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* ── Fecha de Vencimiento ── */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold">
                                        Fecha de Vencimiento
                                        <span className="text-muted fw-normal ms-2" style={{ fontSize: 11 }}>
                                            (opcional)
                                        </span>
                                    </label>
                                    <input
                                        type="date"
                                        className="form-control"
                                        value={fechaVencimiento}
                                        onChange={e => setFechaVencimiento(e.target.value)}
                                        min={new Date().toISOString().substring(0, 10)}
                                    />
                                </div>

                                {/* ── Switches de estado ── */}
                                <div className="col-md-6">
                                    <label className="form-label fw-semibold d-block">Estado</label>
                                    <div className="d-flex flex-wrap gap-3 mt-1">

                                        {/* Activo */}
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="chk-activo"
                                                checked={activo}
                                                onChange={e => setActivo(e.target.checked)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label className="form-check-label" htmlFor="chk-activo">
                                                <span className={`badge ${activo ? 'bg-success' : 'bg-secondary'}`}>
                                                    {activo ? 'Activo' : 'Inactivo'}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Primer ingreso */}
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="chk-primer"
                                                checked={primerIngreso}
                                                onChange={e => setPrimerIngreso(e.target.checked)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label className="form-check-label" htmlFor="chk-primer">
                                                <span className={`badge ${primerIngreso ? 'bg-info' : 'bg-secondary'}`}>
                                                    {primerIngreso ? 'Primer ingreso' : 'Ya ingresó'}
                                                </span>
                                            </label>
                                        </div>

                                        {/* Bloqueado */}
                                        <div className="form-check form-switch">
                                            <input
                                                className="form-check-input"
                                                type="checkbox"
                                                id="chk-bloqueado"
                                                checked={bloqueado}
                                                onChange={e => setBloqueado(e.target.checked)}
                                                style={{ cursor: 'pointer' }}
                                            />
                                            <label className="form-check-label" htmlFor="chk-bloqueado">
                                                <span className={`badge ${bloqueado ? 'bg-danger' : 'bg-secondary'}`}>
                                                    {bloqueado ? '🔒 Bloqueado' : 'Sin bloqueo'}
                                                </span>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        </div>

                        {/* Footer */}
                        <div className="modal-footer">
                            <button
                                className="btn btn-outline-secondary"
                                onClick={onClose}
                                disabled={loading}
                            >
                                Cancelar
                            </button>
                            <button
                                className="btn btn-primary"
                                onClick={handleSubmit}
                                disabled={loading}
                            >
                                {loading
                                    ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                                    : usuario
                                        ? <><i className="bi bi-check-lg me-2" />Guardar cambios</>
                                        : <><i className="bi bi-person-plus me-2" />Crear usuario</>
                                }
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </>
    )
}