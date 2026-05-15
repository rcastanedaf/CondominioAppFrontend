import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '../auth/authService';

export default function LoginPage() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading]   = useState(false);
    const [error, setError]       = useState('');
    const [showPass, setShowPass] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!username.trim() || !password.trim()) {
            setError('Por favor ingresa tu usuario y contraseña.');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const result = await login(username, password);

            if (result.success) {
                // Guardar token y datos del usuario
                const token   = result.data?.token ?? 'authenticated';
                const usuario = result.data ?? { nombre: username };

                localStorage.setItem('token',   token);
                localStorage.setItem('usuario', JSON.stringify(usuario));

                navigate('/', { replace: true });
            } else {
                setError(result.message ?? 'Usuario o contraseña incorrectos.');
            }
        } catch (err) {
            if (err.response?.status === 401) {
                setError('Usuario o contraseña incorrectos.');
            } else {
                setError('No se pudo conectar con el servidor. Verifica que el backend esté corriendo.');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div
            style={{
                minHeight:       '100vh',
                display:         'flex',
                alignItems:      'center',
                justifyContent:  'center',
                background:      'linear-gradient(135deg, #0f2044 0%, #1e50a0 60%, #3b82f6 100%)',
                padding:         '20px',
            }}
        >
            {/* ── Fondo decorativo ── */}
            <div
                style={{
                    position:   'fixed',
                    inset:      0,
                    overflow:   'hidden',
                    pointerEvents: 'none',
                }}
            >
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        style={{
                            position:     'absolute',
                            borderRadius: '50%',
                            background:   'rgba(255,255,255,0.03)',
                            width:        `${200 + i * 150}px`,
                            height:       `${200 + i * 150}px`,
                            top:          `${10 + i * 15}%`,
                            left:         `${-5 + i * 20}%`,
                        }}
                    />
                ))}
            </div>

            {/* ── Card de Login ── */}
            <div
                style={{
                    width:        '100%',
                    maxWidth:     420,
                    background:   '#fff',
                    borderRadius: 20,
                    boxShadow:    '0 25px 60px rgba(0,0,0,0.35)',
                    overflow:     'hidden',
                    position:     'relative',
                    zIndex:       1,
                }}
            >
                {/* Header */}
                <div
                    style={{
                        background: 'linear-gradient(135deg, #0f2044 0%, #1e50a0 100%)',
                        padding:    '36px 40px 28px',
                        textAlign:  'center',
                    }}
                >
                    {/* Logo */}
                    <div
                        style={{
                            width:          64,
                            height:         64,
                            borderRadius:   16,
                            background:     'rgba(255,255,255,0.15)',
                            display:        'inline-flex',
                            alignItems:     'center',
                            justifyContent: 'center',
                            marginBottom:   16,
                            backdropFilter: 'blur(10px)',
                            border:         '1px solid rgba(255,255,255,0.2)',
                        }}
                    >
                        <i className="bi bi-buildings-fill text-white" style={{ fontSize: 30 }} />
                    </div>

                    <h4
                        style={{
                            color:      '#fff',
                            fontWeight: 700,
                            margin:     0,
                            fontSize:   22,
                        }}
                    >
                        CondominioApp
                    </h4>
                    <p style={{ color: 'rgba(255,255,255,0.65)', margin: '6px 0 0', fontSize: 13 }}>
                        Sistema de Administración de Condominios
                    </p>
                </div>

                {/* Formulario */}
                <div style={{ padding: '32px 40px 36px' }}>
                    <p
                        style={{
                            textAlign:  'center',
                            color:      '#6c757d',
                            fontSize:   14,
                            marginBottom: 24,
                        }}
                    >
                        Ingresa tus credenciales para continuar
                    </p>

                    <form onSubmit={handleSubmit} noValidate>

                        {/* Error */}
                        {error && (
                            <div
                                className="alert alert-danger d-flex align-items-center gap-2 py-2"
                                style={{ borderRadius: 10, fontSize: 13 }}
                            >
                                <i className="bi bi-exclamation-circle-fill"></i>
                                {error}
                            </div>
                        )}

                        {/* Usuario */}
                        <div className="mb-3">
                            <label
                                htmlFor="username"
                                style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}
                            >
                                Usuario
                            </label>
                            <div className="input-group">
                                <span
                                    className="input-group-text"
                                    style={{ background: '#f8f9fa', border: '1.5px solid #e5e7eb', borderRight: 'none' }}
                                >
                                    <i className="bi bi-person text-secondary" />
                                </span>
                                <input
                                    id="username"
                                    type="text"
                                    className="form-control"
                                    placeholder="Ingresa tu usuario"
                                    value={username}
                                    onChange={e => setUsername(e.target.value)}
                                    autoComplete="username"
                                    style={{
                                        border:       '1.5px solid #e5e7eb',
                                        borderLeft:   'none',
                                        borderRadius: '0 8px 8px 0',
                                        fontSize:     14,
                                        padding:      '10px 14px',
                                    }}
                                />
                            </div>
                        </div>

                        {/* Contraseña */}
                        <div className="mb-4">
                            <label
                                htmlFor="password"
                                style={{ fontSize: 13, fontWeight: 600, color: '#374151', marginBottom: 6 }}
                            >
                                Contraseña
                            </label>
                            <div className="input-group">
                                <span
                                    className="input-group-text"
                                    style={{ background: '#f8f9fa', border: '1.5px solid #e5e7eb', borderRight: 'none' }}
                                >
                                    <i className="bi bi-lock text-secondary" />
                                </span>
                                <input
                                    id="password"
                                    type={showPass ? 'text' : 'password'}
                                    className="form-control"
                                    placeholder="Ingresa tu contraseña"
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    autoComplete="current-password"
                                    style={{
                                        border:       '1.5px solid #e5e7eb',
                                        borderLeft:   'none',
                                        borderRight:  'none',
                                        fontSize:     14,
                                        padding:      '10px 14px',
                                    }}
                                />
                                <button
                                    type="button"
                                    className="input-group-text"
                                    onClick={() => setShowPass(p => !p)}
                                    style={{
                                        background:   '#f8f9fa',
                                        border:       '1.5px solid #e5e7eb',
                                        borderLeft:   'none',
                                        cursor:       'pointer',
                                        borderRadius: '0 8px 8px 0',
                                    }}
                                    title={showPass ? 'Ocultar' : 'Mostrar'}
                                >
                                    <i className={`bi ${showPass ? 'bi-eye-slash' : 'bi-eye'} text-secondary`} />
                                </button>
                            </div>
                        </div>

                        {/* Botón */}
                        <button
                            type="submit"
                            className="btn w-100"
                            disabled={loading}
                            style={{
                                background:   'linear-gradient(135deg, #1e50a0, #3b82f6)',
                                color:        '#fff',
                                fontWeight:   600,
                                fontSize:     15,
                                padding:      '12px',
                                borderRadius: 10,
                                border:       'none',
                                boxShadow:    '0 4px 15px rgba(30,80,160,0.35)',
                                transition:   'opacity 0.15s',
                                opacity:      loading ? 0.8 : 1,
                            }}
                        >
                            {loading ? (
                                <>
                                    <span className="spinner-border spinner-border-sm me-2" role="status" />
                                    Iniciando sesión…
                                </>
                            ) : (
                                <>
                                    <i className="bi bi-box-arrow-in-right me-2"></i>
                                    Ingresar al Sistema
                                </>
                            )}
                        </button>
                    </form>
                </div>

                {/* Footer de la card */}
                <div
                    style={{
                        textAlign:  'center',
                        padding:    '0 40px 24px',
                        color:      '#9ca3af',
                        fontSize:   12,
                    }}
                >
                    <i className="bi bi-shield-lock me-1"></i>
                    Acceso restringido · Solo personal autorizado
                </div>
            </div>
        </div>
    );
}