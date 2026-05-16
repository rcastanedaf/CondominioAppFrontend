import { useState } from 'react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';

const modulos = [
    {
        id: 'general',
        label: 'General',
        icon: 'bi-grid-1x2-fill',
        color: '#1e50a0',
        links: [
            { to: '/dashboard',          icon: 'bi-speedometer2',     label: 'Dashboard General' },
            { to: '/log-auditoria',      icon: 'bi-journal-text',      label: 'Log de Auditoría' },
        ],
    },
    {
        id: 'financiero',
        label: 'Financiero',
        icon: 'bi-cash-stack',
        color: '#28a745',
        links: [
            { to: '/dashboard/financiero',   icon: 'bi-speedometer2',      label: 'Dashboard Financiero', badge: 'KPI' },
            { to: '/facturas',               icon: 'bi-receipt',           label: 'Facturas' },
            { to: '/ciclofacturacion',       icon: 'bi bi-arrow-repeat',           label: 'Ciclo Facturacion' },
            { to: '/tiposervicio',       icon: 'bi bi-code-slash',           label: 'Tipo Servicio' },
            { to: '/pagos',                  icon: 'bi-credit-card',       label: 'Pagos' },
            { to: '/cuentas-por-cobrar',     icon: 'bi-collection',        label: 'Cuentas por Cobrar' },
            { to: '/cobro-mora',             icon: 'bi-exclamation-circle',label: 'Cobro de Mora' },
            { to: '/acuerdos-pago',          icon: 'bi bi-cash-coin',         label: 'Acuerdos de Pago' },
            { to: '/saldo-a-favor',          icon: 'bi-piggy-bank',        label: 'Saldo a Favor' },
        ],
    },
    {
        id: 'residentes',
        label: 'Residentes y Propiedades',
        icon: 'bi-house-fill',
        color: '#6f42c1',
        links: [
            { to: '/dashboard/residentes',   icon: 'bi-speedometer2',  label: 'Dashboard Residentes', badge: 'KPI' },
            { to: '/propiedades',            icon: 'bi-building',      label: 'Propiedades' },
            { to: '/residentes',             icon: 'bi-people-fill',   label: 'Residentes' },
            { to: '/familiares',             icon: 'bi-person-hearts', label: 'Familiares' },
            { to: '/vehiculos',              icon: 'bi-car-front-fill',label: 'Vehículos' },
            { to: '/persona',              icon: 'bi bi-person',label: 'Persona' },
            { to: '/arrendatario',              icon: 'bi bi-file-earmark-text',label: 'Arrendatario' },
        ],
    },
    {
        id: 'acceso',
        label: 'Acceso y Seguridad',
        icon: 'bi-shield-check',
        color: '#dc3545',
        links: [
            { to: '/dashboard/acceso',       icon: 'bi-speedometer2',      label: 'Dashboard Acceso', badge: 'KPI' },
            { to: '/registro-acceso',        icon: 'bi-door-open-fill',    label: 'Registro de Acceso' },
            { to: '/visitas-autorizadas',    icon: 'bi-person-check-fill', label: 'Visitas Autorizadas' },
            { to: '/lista-negra',            icon: 'bi-ban',               label: 'Lista Negra' },
        ],
    },
    {
        id: 'incidencias',
        label: 'Incidencias',
        icon: 'bi-exclamation-triangle-fill',
        color: '#fd7e14',
        links: [
            { to: '/dashboard/incidencias',  icon: 'bi-speedometer2',      label: 'Dashboard Incidencias', badge: 'KPI' },
            { to: '/incidenciadetalle', icon: 'bi-search',            label: 'Seguimiento' },
            { to: '/categorias-incidencia',  icon: 'bi-tags-fill',         label: 'Categorías' },
        ],
    },
    {
        id: 'espacios',
        label: 'Espacios Comunes',
        icon: 'bi-building',
        color: '#17a2b8',
        links: [
            { to: '/dashboard/espacios',     icon: 'bi-speedometer2',      label: 'Dashboard Espacios', badge: 'KPI' },
            { to: '/espacios-comunes',       icon: 'bi-buildings-fill',    label: 'Espacios' },
            { to: '/reservas',               icon: 'bi-calendar-check',    label: 'Reservas' },
            { to: '/cobroreservas',               icon: 'bi-calendar-check',    label: 'Cobro de Reservas' },
        ],
    },
    {
        id: 'personal',
        label: 'Personal',
        icon: 'bi-person-workspace',
        color: '#20c997',
        links: [
            { to: '/dashboard/personal',     icon: 'bi-speedometer2',      label: 'Dashboard Personal', badge: 'KPI' },
            { to: '/empleados',              icon: 'bi-person-badge-fill', label: 'Empleados' },
            { to: '/asistencia',             icon: 'bi-calendar-event',    label: 'Asistencia' },
            { to: '/cargos',                 icon: 'bi-briefcase-fill',    label: 'Cargos' },
            { to: '/horarios-turno',         icon: 'bi-clock-fill',        label: 'Horarios y Turnos' },
        ],
    },
    {
        id: 'contratos',
        label: 'Contratos',
        icon: 'bi-file-earmark-text',
        color: '#0dcaf0',
        links: [
            { to: '/dashboard/contratos',    icon: 'bi-speedometer2',      label: 'Dashboard Contratos', badge: 'KPI' },
            { to: '/contratos',              icon: 'bi-file-earmark-check',label: 'Contratos' },
            { to: '/contratosvigentes',              icon: 'bi-file-earmark-check',label: 'Contratos Vigentes' },
            { to: '/contratosvencidos',              icon: 'bi-file-earmark-check',label: 'Contratos Vencidos' },
            { to: '/renovaciones',           icon: 'bi-arrow-repeat',      label: 'Renovaciones' },
        ],
    },
    {
        id: 'multas',
        label: 'Multas',
        icon: 'bi-file-earmark-x',
        color: '#dc3545',
        links: [
            { to: '/dashboard/multas',       icon: 'bi-speedometer2',      label: 'Dashboard Multas', badge: 'KPI' },
            { to: '/multas',                 icon: 'bi-exclamation-octagon-fill', label: 'Multas' },
        ],
    },

    {
        id: 'catalogos',
        label: 'Catalogos',
        icon: 'bi bi-collection',
        color: '#3eccff',
        links: [
            { to: '/bancos',        icon: 'bi-bank2',        label: 'Bancos' },
            { to: '/metodos-pago',        icon: 'bi bi-wallet2',        label: 'Métodos de Pago' },
            { to: '/tipo-propiedad',        icon: 'bi bi-house-door-fill',        label: 'Tipo de Propiedad' },
            { to: '/pais',        icon: 'bi bi-globe-americas',        label: 'Pais' },
            { to: '/parentesco',        icon: 'bi bi-person-hearts',        label: 'Parentesco' },
            { to: '/propiedades',        icon: 'bi-house-gear',        label: 'Propiedades' },
            { to: '/tipocontrato',         icon: 'bi-list-check',        label: 'Tipo Contrato' },
            { to: '/tipomodena',                icon: 'bi bi-currency-exchange',             label: 'Tipo de Moneda' },
            { to: '/motivovisita',          icon: 'bi bi-question-diamond',           label: 'Motivo Visita' },
            { to: '/concepto-descuento',          icon: 'bi bi-database-fill-dash',           label: 'Concepto de Descuento' },
        ],
    },

    {
        id: 'configuracion',
        label: 'Configuración',
        icon: 'bi-gear-fill',
        color: '#6c757d',
        links: [
            { to: '/usuarios',              icon: 'bi-person-lock',       label: 'Usuarios' },
            { to: '/roles',                 icon: 'bi-shield-lock-fill',  label: 'Roles y Permisos' },
            { to: '/proveedores',           icon: 'bi-truck',             label: 'Proveedores' },
        ],
    },
];

export default function Sidebar({ collapsed, onToggle }) {
    const navigate = useNavigate();
    const location  = useLocation();
    const [open, setOpen] = useState(() => {
        // Abrir automáticamente el módulo activo
        const mod = modulos.find(m =>
            m.links.some(l => location.pathname.startsWith(l.to))
        );
        return mod ? mod.id : 'general';
    });

    const toggle = (id) => setOpen(prev => (prev === id ? null : id));

    return (
        <aside
            style={{
                width:          collapsed ? 64 : 260,
                height:         '100vh',          // ← era minHeight: '100vh'
                background:     'linear-gradient(180deg, #0f2044 0%, #1a3560 100%)',
                transition:     'width 0.25s ease',
                overflowX:      'hidden',
                overflowY:      'auto',           // ← ya lo tenías, esto activa el scroll del sidebar
                display:        'flex',
                flexDirection:  'column',
                boxShadow:      '3px 0 15px rgba(0,0,0,0.25)',
                flexShrink:     0,
                // ← elimina position: 'sticky' y top: 0
            }}
        >
            {/* ── Logo / Header ── */}
            <div
                style={{
                    padding:        '20px 16px 16px',
                    borderBottom:   '1px solid rgba(255,255,255,0.08)',
                    display:        'flex',
                    alignItems:     'center',
                    gap:            12,
                    cursor:         'pointer',
                }}
                onClick={() => navigate('/')}
            >
                <div
                    style={{
                        width:          36,
                        height:         36,
                        background:     'linear-gradient(135deg,#3b82f6,#1e50a0)',
                        borderRadius:   10,
                        display:        'flex',
                        alignItems:     'center',
                        justifyContent:'center',
                        flexShrink:     0,
                        boxShadow:      '0 2px 8px rgba(59,130,246,0.4)',
                    }}
                >
                    <i className="bi bi-buildings-fill text-white" style={{ fontSize: 18 }} />
                </div>

                {!collapsed && (
                    <div style={{ overflow: 'hidden' }}>
                        <div
                            style={{
                                color:       '#fff',
                                fontWeight:  700,
                                fontSize:    15,
                                lineHeight:  1.2,
                                whiteSpace:  'nowrap',
                            }}
                        >
                            CondominioApp
                        </div>
                        <div style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>
                            Sistema de Administración
                        </div>
                    </div>
                )}
            </div>

            {/* ── Módulos ── */}
            <nav style={{ flex: 1, padding: '8px 0' }}>
                {modulos.map(mod => {
                    const isModActive = mod.links.some(l =>
                        location.pathname === l.to ||
                        location.pathname.startsWith(l.to + '/')
                    );
                    const isOpen = open === mod.id;

                    return (
                        <div key={mod.id}>
                            {/* Cabecera del módulo */}
                            <button
                                onClick={() => toggle(mod.id)}
                                style={{
                                    width:          '100%',
                                    display:        'flex',
                                    alignItems:     'center',
                                    gap:            10,
                                    padding:        collapsed ? '10px 14px' : '10px 16px',
                                    background:     isModActive
                                        ? 'rgba(255,255,255,0.07)'
                                        : 'transparent',
                                    border:         'none',
                                    cursor:         'pointer',
                                    color:          isModActive ? '#fff' : 'rgba(255,255,255,0.65)',
                                    textAlign:      'left',
                                    transition:     'all 0.15s',
                                    borderLeft:     isModActive
                                        ? `3px solid ${mod.color}`
                                        : '3px solid transparent',
                                }}
                                title={collapsed ? mod.label : ''}
                            >
                                {/* Ícono del módulo */}
                                <div
                                    style={{
                                        width:          28,
                                        height:         28,
                                        borderRadius:   8,
                                        background:     isModActive
                                            ? mod.color
                                            : 'rgba(255,255,255,0.08)',
                                        display:        'flex',
                                        alignItems:     'center',
                                        justifyContent: 'center',
                                        flexShrink:     0,
                                        transition:     'background 0.15s',
                                    }}
                                >
                                    <i
                                        className={`bi ${mod.icon}`}
                                        style={{ fontSize: 13, color: isModActive ? '#fff' : mod.color }}
                                    />
                                </div>

                                {!collapsed && (
                                    <>
                                        <span style={{ flex: 1, fontSize: 13, fontWeight: isModActive ? 600 : 400 }}>
                                            {mod.label}
                                        </span>
                                        <i
                                            className={`bi bi-chevron-${isOpen ? 'up' : 'down'}`}
                                            style={{ fontSize: 11, opacity: 0.6 }}
                                        />
                                    </>
                                )}
                            </button>

                            {/* Submenú */}
                            {!collapsed && isOpen && (
                                <div style={{ background: 'rgba(0,0,0,0.15)' }}>
                                    {mod.links.map(link => {
                                        const isActive = location.pathname === link.to;
                                        const isDash   = !!link.badge;

                                        return (
                                            <NavLink
                                                key={link.to}
                                                to={link.to}
                                                style={{
                                                    display:        'flex',
                                                    alignItems:     'center',
                                                    gap:            10,
                                                    padding:        '8px 16px 8px 52px',
                                                    textDecoration: 'none',
                                                    color:          isActive
                                                        ? '#fff'
                                                        : isDash
                                                            ? 'rgba(147,197,253,0.9)'
                                                            : 'rgba(255,255,255,0.55)',
                                                    background:     isActive
                                                        ? `linear-gradient(90deg, ${mod.color}33, transparent)`
                                                        : 'transparent',
                                                    borderLeft:     isActive
                                                        ? `2px solid ${mod.color}`
                                                        : '2px solid transparent',
                                                    fontSize:       12.5,
                                                    fontWeight:     isActive ? 600 : isDash ? 500 : 400,
                                                    transition:     'all 0.15s',
                                                }}
                                            >
                                                <i
                                                    className={`bi ${link.icon}`}
                                                    style={{
                                                        fontSize: 13,
                                                        color:    isActive
                                                            ? mod.color
                                                            : isDash
                                                                ? '#93c5fd'
                                                                : 'rgba(255,255,255,0.4)',
                                                    }}
                                                />
                                                <span style={{ flex: 1 }}>{link.label}</span>

                                                {link.badge && (
                                                    <span
                                                        style={{
                                                            fontSize:       9,
                                                            padding:        '1px 6px',
                                                            borderRadius:   10,
                                                            background:     mod.color,
                                                            color:          '#fff',
                                                            fontWeight:     700,
                                                            letterSpacing:  0.5,
                                                        }}
                                                    >
                                                        {link.badge}
                                                    </span>
                                                )}
                                            </NavLink>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    );
                })}
            </nav>

            {/* ── Footer del sidebar ── */}
            {!collapsed && (
                <div
                    style={{
                        padding:     '12px 16px',
                        borderTop:   '1px solid rgba(255,255,255,0.08)',
                        color:       'rgba(255,255,255,0.3)',
                        fontSize:    11,
                        textAlign:   'center',
                    }}
                >
                    CondominioApp v1.0 · VNSC_20
                </div>
            )}
        </aside>
    );
}