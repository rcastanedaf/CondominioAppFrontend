import { useNavigate } from 'react-router-dom';

export default function Topbar({ collapsed, onToggle, usuario }) {
    const navigate = useNavigate();

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('usuario');
        navigate('/login');
    };

    return (
        <header
            style={{
                height:         56,
                background:     '#fff',
                borderBottom:   '1px solid #e9ecef',
                display:        'flex',
                alignItems:     'center',
                padding:        '0 20px',
                gap:            16,
                position:       'sticky',
                top:            0,
                zIndex:         100,
                boxShadow:      '0 1px 6px rgba(0,0,0,0.06)',
            }}
        >
            {/* Botón colapsar sidebar */}
            <button
                className="btn btn-sm btn-light"
                onClick={onToggle}
                style={{ padding: '6px 10px', borderRadius: 8 }}
            >
                <i className={`bi ${collapsed ? 'bi-layout-sidebar' : 'bi-layout-sidebar-reverse'}`} />
            </button>

            {/* Breadcrumb / título dinámico */}
            <div style={{ flex: 1 }}>
                <span className="text-muted" style={{ fontSize: 13 }}>
                    <i className="bi bi-house me-1"></i>
                    CondominioApp
                </span>
            </div>

            {/* Acciones rápidas */}
            <div className="d-flex align-items-center gap-2">

                {/* Notificaciones (placeholder) */}
                <button className="btn btn-sm btn-light position-relative" style={{ borderRadius: 8 }}>
                    <i className="bi bi-bell"></i>
                    <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style={{ fontSize: 9 }}>
                        3
                    </span>
                </button>

                {/* Usuario */}
                <div className="dropdown">
                    <button
                        className="btn btn-sm btn-light dropdown-toggle d-flex align-items-center gap-2"
                        data-bs-toggle="dropdown"
                        style={{ borderRadius: 8 }}
                    >
                        <div
                            style={{
                                width:          28,
                                height:         28,
                                borderRadius:   '50%',
                                background:     'linear-gradient(135deg,#1e50a0,#3b82f6)',
                                display:        'flex',
                                alignItems:     'center',
                                justifyContent: 'center',
                                color:          '#fff',
                                fontWeight:     700,
                                fontSize:       12,
                            }}
                        >
                            {usuario?.nombre?.charAt(0)?.toUpperCase() ?? 'A'}
                        </div>
                        <span style={{ fontSize: 13 }}>
                            {usuario?.nombre ?? 'Administrador'}
                        </span>
                    </button>
                    <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0">
                        <li>
                            <span className="dropdown-item-text text-muted small">
                                {usuario?.email ?? ''}
                            </span>
                        </li>
                        <li><hr className="dropdown-divider my-1" /></li>
                        <li>
                            <button className="dropdown-item small" onClick={handleLogout}>
                                <i className="bi bi-box-arrow-right me-2 text-danger"></i>
                                Cerrar sesión
                            </button>
                        </li>
                    </ul>
                </div>
            </div>
        </header>
    );
}