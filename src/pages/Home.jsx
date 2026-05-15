import { useNavigate } from 'react-router-dom';

const modulos = [
    {
        id:          'financiero',
        titulo:      'Financiero',
        descripcion: 'Facturas, pagos, cartera y morosidad',
        icon:        'bi-cash-stack',
        color:       '#28a745',
        gradient:    'linear-gradient(135deg,#28a745,#20c997)',
        dashboard:   '/dashboard/financiero',
        links: [
            { label: 'Facturas',           to: '/facturas' },
            { label: 'Ciclo Facturacion',           to: '/cliclofaturacion' },
            { label: 'Tipo Servicio',           to: '/tiposervicio' },
            { label: 'Pagos',              to: '/pagos' },
            { label: 'Cuentas por Cobrar', to: '/cuentas-por-cobrar' },
            { label: 'Cobro de Mora',      to: '/cobro-mora' },
            { label: 'Acuerdos de Pago',   to: '/acuerdos-pago' },
        ],
    },
    {
        id:          'residentes',
        titulo:      'Residentes y Propiedades',
        descripcion: 'Gestión de propiedades, residentes y vehículos',
        icon:        'bi-house-fill',
        color:       '#6f42c1',
        gradient:    'linear-gradient(135deg,#6f42c1,#9b59b6)',
        dashboard:   '/dashboard/residentes',
        links: [
            { label: 'Propiedades',  to: '/propiedadesresidentes' },
            { label: 'Residentes',   to: '/residentes' },
            { label: 'Familiares',   to: '/familiares' },
            { label: 'Vehículos',    to: '/vehiculos' },
            { label: 'Persona',   to: '/persona' },
            { label: 'Arrendatario',    to: '/arrendatario' },
        ],
    },
    {
        id:          'acceso',
        titulo:      'Acceso y Seguridad',
        descripcion: 'Control de entradas, visitas y lista negra',
        icon:        'bi-shield-check',
        color:       '#dc3545',
        gradient:    'linear-gradient(135deg,#dc3545,#e74c3c)',
        dashboard:   '/dashboard/acceso',
        links: [
            { label: 'Registro de Acceso',  to: '/registro-acceso' },
            { label: 'Visitas Autorizadas', to: '/visitas-autorizadas' },
            { label: 'Lista Negra',         to: '/lista-negra' },
        ],
    },
    {
        id:          'incidencias',
        titulo:      'Incidencias',
        descripcion: 'Reportes, seguimiento y resolución de incidencias',
        icon:        'bi-exclamation-triangle-fill',
        color:       '#fd7e14',
        gradient:    'linear-gradient(135deg,#fd7e14,#e67e22)',
        dashboard:   '/dashboard/incidencias',
        links: [
            { label: 'Incidencias',  to: '/incidencias' },
            { label: 'Seguimiento',  to: '/incidenciadetalles' },
            { label: 'Categorías',   to: '/categorias-incidencia' },
        ],
    },
    {
        id:          'espacios',
        titulo:      'Espacios Comunes',
        descripcion: 'Disponibilidad y reservas de espacios',
        icon:        'bi-building',
        color:       '#17a2b8',
        gradient:    'linear-gradient(135deg,#17a2b8,#1abc9c)',
        dashboard:   '/dashboard/espacios',
        links: [
            { label: 'Espacios', to: '/espacios-comunes' },
            { label: 'Reservas', to: '/reservas' },
            { label: 'Cobros Reservas', to: '/cobroreservas' },
        ],
    },
    {
        id:          'personal',
        titulo:      'Personal',
        descripcion: 'Empleados, asistencia y cargos',
        icon:        'bi-person-workspace',
        color:       '#20c997',
        gradient:    'linear-gradient(135deg,#20c997,#27ae60)',
        dashboard:   null,   // No existe DashboardPersonal — se va directo al módulo
        links: [
            { label: 'Empleados',         to: '/empleados' },
            { label: 'Asistencia',        to: '/asistencia' },
            { label: 'Cargos',            to: '/cargos' },
            { label: 'Horarios y Turnos', to: '/horarios-turno' },
            { label: 'Proveedores',       to: '/proveedores' },
        ],
    },
    {
        id:          'contratos',
        titulo:      'Contratos',
        descripcion: 'Arrendamientos, ventas y renovaciones',
        icon:        'bi-file-earmark-text',
        color:       '#0dcaf0',
        gradient:    'linear-gradient(135deg,#0dcaf0,#3498db)',
        dashboard:   '/dashboard/contratos',
        links: [
            { label: 'Contratos',    to: '/contratos' },
            { label: 'Contratos Vigentes', to: '/contratosvigentes' },
            { label: 'Contratos Vencidos', to: '/contratosvencidos' },
            { label: 'Renovaciones', to: '/renovaciones' },
        ],
    },
    {
        id:          'multas',
        titulo:      'Multas',
        descripcion: 'Infracciones, apelaciones y cobros',
        icon:        'bi-file-earmark-x',
        color:       '#e74c3c',
        gradient:    'linear-gradient(135deg,#e74c3c,#c0392b)',
        dashboard:   '/dashboard/multas',
        links: [
            { label: 'Multas', to: '/multas' },
        ],
    },
    {
        id:          'catalogos',
        titulo:      'Catálogos',
        descripcion: 'Bancos, métodos de pago, tipos y más',
        icon:        'bi-journal-bookmark-fill',
        color:       '#6610f2',
        gradient:    'linear-gradient(135deg,#6610f2,#6f42c1)',
        dashboard:   null,
        links: [
            { label: 'Bancos',             to: '/bancos' },
            { label: 'Métodos de Pago',    to: '/metodos-pago' },
            { label: 'Tipo de Propiedad',  to: '/tipo-propiedad' },
            { label: 'Pais',   to: '/pais' },
            { label: 'Parentesco',   to: '/parentesco' },
            { label: 'Propiedades',   to: '/propiedades' },
            { label: 'Tipo Contrato',   to: '/tipocontrato' },
            { label: 'Tipo Moneda',   to: '/tipomodena' },
            { label: 'Motivo Visita',   to: '/motivovisita' },
            { label: 'Concepto Descuento', to: '/concepto-descuento' },
        ],
    },
    {
        id:          'sistema',
        titulo:      'Sistema',
        descripcion: 'Usuarios, roles y auditoría',
        icon:        'bi-gear-fill',
        color:       '#343a40',
        gradient:    'linear-gradient(135deg,#343a40,#495057)',
        dashboard:   null,
        links: [
            { label: 'Usuarios',       to: '/usuarios' },
            { label: 'Roles',          to: '/roles' },
            { label: 'Log Auditoría',  to: '/log-auditoria' },
        ],
    },
];

export default function Home() {
    const navigate = useNavigate();

    return (
        <div className="container-fluid py-4 px-4">

            {/* Bienvenida */}
            <div
                className="rounded-4 mb-4 p-4 d-flex align-items-center justify-content-between"
                style={{
                    background: 'linear-gradient(135deg,#0f2044 0%,#1e50a0 100%)',
                    color:      '#fff',
                    boxShadow:  '0 4px 20px rgba(30,80,160,0.3)',
                }}
            >
                <div>
                    <h3 className="fw-bold mb-1">
                        <i className="bi bi-buildings-fill me-2" />
                        CondominioApp
                    </h3>
                    <p className="mb-0 opacity-75">
                        Sistema de Administración de Condominios — Bienvenido al panel de control
                    </p>
                </div>
                <button
                    className="btn btn-light fw-semibold"
                    onClick={() => navigate('/dashboard')}
                    style={{ borderRadius: 10, whiteSpace: 'nowrap' }}
                >
                    <i className="bi bi-speedometer2 me-2 text-primary" />
                    Dashboard General
                </button>
            </div>

            {/* Cards de módulos */}
            <div className="row g-4">
                {modulos.map(mod => (
                    <div key={mod.id} className="col-xl-3 col-lg-4 col-md-6">
                        <div
                            className="card border-0 shadow-sm h-100"
                            style={{ borderRadius: 16, overflow: 'hidden' }}
                        >
                            {/* Header */}
                            <div style={{ background: mod.gradient, padding: '20px 20px 16px' }}>
                                <div className="d-flex align-items-center justify-content-between mb-2">
                                    <div
                                        style={{
                                            width: 42, height: 42, borderRadius: 12,
                                            background: 'rgba(255,255,255,0.2)',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                        }}
                                    >
                                        <i className={`bi ${mod.icon} text-white fs-4`} />
                                    </div>
                                    <span
                                        style={{
                                            fontSize: 10, background: 'rgba(255,255,255,0.25)',
                                            color: '#fff', padding: '3px 10px', borderRadius: 20,
                                            fontWeight: 600, letterSpacing: 0.5,
                                        }}
                                    >
                                        MÓDULO
                                    </span>
                                </div>
                                <h6 className="text-white fw-bold mb-1 mt-2">{mod.titulo}</h6>
                                <p style={{ color: 'rgba(255,255,255,0.75)', fontSize: 12, margin: 0 }}>
                                    {mod.descripcion}
                                </p>
                            </div>

                            {/* Cuerpo */}
                            <div className="card-body p-0" style={{ background: '#fff' }}>

                                {/* Botón Dashboard — solo si existe */}
                                {mod.dashboard && (
                                    <button
                                        className="w-100 border-0 d-flex align-items-center gap-2 px-3 py-3"
                                        onClick={() => navigate(mod.dashboard)}
                                        style={{
                                            background:   `${mod.color}10`,
                                            borderBottom: `1px solid ${mod.color}20`,
                                            cursor: 'pointer', transition: 'background 0.15s',
                                        }}
                                        onMouseEnter={e => e.currentTarget.style.background = `${mod.color}20`}
                                        onMouseLeave={e => e.currentTarget.style.background = `${mod.color}10`}
                                    >
                                        <div
                                            style={{
                                                width: 30, height: 30, borderRadius: 8,
                                                background: mod.color,
                                                display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            }}
                                        >
                                            <i className="bi bi-speedometer2 text-white" style={{ fontSize: 14 }} />
                                        </div>
                                        <div style={{ textAlign: 'left', flex: 1 }}>
                                            <div style={{ fontSize: 13, fontWeight: 600, color: mod.color }}>
                                                Ver Dashboard
                                            </div>
                                            <div style={{ fontSize: 11, color: '#6c757d' }}>
                                                KPIs, gráficas y reportes
                                            </div>
                                        </div>
                                        <i className="bi bi-arrow-right-circle-fill"
                                            style={{ color: mod.color, fontSize: 18 }} />
                                    </button>
                                )}

                                {/* Links del módulo */}
                                <div style={{ padding: '8px 0 4px' }}>
                                    {mod.links.map((link, i) => (
                                        <button
                                            key={i}
                                            className="w-100 border-0 d-flex align-items-center gap-2 px-3 py-2"
                                            onClick={() => navigate(link.to)}
                                            style={{
                                                background: 'transparent', cursor: 'pointer',
                                                color: '#495057', fontSize: 13,
                                                transition: 'background 0.12s', textAlign: 'left',
                                            }}
                                            onMouseEnter={e => e.currentTarget.style.background = '#f8f9fa'}
                                            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                                        >
                                            <i className="bi bi-chevron-right"
                                                style={{ fontSize: 11, color: '#adb5bd' }} />
                                            {link.label}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}