import { useEffect, useState } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardResidentes } from '../services/dashboardService';
import { exportExcel, exportPDF, fmtDate } from '../utils/exportUtils';

const COLORS = ['#1e50a0', '#28a745', '#ffc107', '#dc3545', '#17a2b8'];

function KpiCard({ icon, label, value, color = 'primary', sub }) {
    return (
        <div className="col-md-3 col-sm-6 mb-3">
            <div className={`card border-0 shadow-sm h-100 border-start border-${color} border-4`}>
                <div className="card-body d-flex align-items-center gap-3">
                    <div className={`bg-${color} bg-opacity-10 rounded-circle p-3`}>
                        <i className={`bi ${icon} fs-4 text-${color}`}></i>
                    </div>
                    <div>
                        <div className="text-muted small">{label}</div>
                        <div className="fw-bold fs-5">{value}</div>
                        {sub && <div className="text-muted" style={{ fontSize: '0.75rem' }}>{sub}</div>}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function DashboardResidentes() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    useEffect(() => {
        getDashboardResidentes()
            .then(r => setData(r.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <div className="spinner-border text-primary" role="status" />
            <span className="ms-3 text-muted">Cargando datos de residentes…</span>
        </div>
    );
    if (error || !data) return (
        <div className="alert alert-danger m-4">
            <i className="bi bi-exclamation-triangle me-2"></i>Error al cargar el dashboard de residentes.
        </div>
    );

    // ── Datos para gráficas ──────────────────────────────────
    const ocupacionData = [
        { name: 'Ocupadas',      value: data.propiedadesOcupadas },
        { name: 'Disponibles',   value: data.propiedadesDisponibles },
        { name: 'Mantenimiento', value: data.propiedadesMantenimiento },
    ];

    const tipoResData = [
        { name: 'Propietarios', value: data.propietarios },
        { name: 'Inquilinos',   value: data.inquilinos },
    ];

    // ── Exportaciones ────────────────────────────────────────
    const exportResidentesPDF = () => exportPDF(
        ['Nombre', 'Propiedad', 'Tipo', 'Fecha Ingreso', 'Familiares', 'Vehículos'],
        data.residentesDetalle.map(r => [
            r.nombre,
            r.propiedad,
            r.tipoResidente,
            fmtDate(r.fechaIngreso),
            r.numFamiliares,
            r.numVehiculos
        ]),
        'Reporte de Residentes Activos',
        'Residentes'
    );

    const exportResidentesExcel = () => exportExcel(
        data.residentesDetalle.map(r => ({
            Nombre:          r.nombre,
            Propiedad:       r.propiedad,
            Tipo:            r.tipoResidente,
            'Fecha Ingreso': fmtDate(r.fechaIngreso),
            Familiares:      r.numFamiliares,
            Vehículos:       r.numVehiculos,
        })),
        'Residentes',
        'Residentes'
    );

    const exportPropiedadesExcel = () => exportExcel(
        data.propiedadesPorTipo.map(p => ({
            'Tipo Propiedad': p.tipo,
            'Total':          p.total,
            'Ocupadas':       p.ocupadas,
            'Disponibles':    p.total - p.ocupadas,
        })),
        'Propiedades por Tipo',
        'Propiedades_Tipo'
    );

    return (
        <div className="container-fluid py-3">

            {/* ── Encabezado ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-house-fill me-2 text-primary"></i>
                        Dashboard Residentes y Propiedades
                    </h4>
                    <small className="text-muted">
                        Ocupación, tipos de propiedad y detalle de residentes activos
                    </small>
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* ── KPIs ── */}
            <div className="row g-3 mb-4">
                <KpiCard
                    icon="bi-buildings"
                    label="Total Propiedades"
                    value={data.totalPropiedades}
                    color="primary"
                    sub={`${data.propiedadesOcupadas} ocupadas · ${data.propiedadesDisponibles} disponibles`}
                />
                <KpiCard
                    icon="bi-people-fill"
                    label="Residentes Activos"
                    value={data.totalResidentes}
                    color="success"
                    sub={`${data.propietarios} propietarios · ${data.inquilinos} inquilinos`}
                />
                <KpiCard
                    icon="bi-car-front-fill"
                    label="Vehículos Registrados"
                    value={data.totalVehiculos}
                    color="info"
                />
                <KpiCard
                    icon="bi-person-hearts"
                    label="Familiares Registrados"
                    value={data.totalFamiliares}
                    color="warning"
                />
            </div>

            {/* ── Gráficas fila 1 ── */}
            <div className="row g-3 mb-4">

                {/* Ocupación de propiedades */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-pie-chart me-2 text-primary"></i>
                                Ocupación de Propiedades
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={ocupacionData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {ocupacionData.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Tipo de residente */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-person-badge me-2 text-success"></i>
                                Tipo de Residente
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={220}>
                                <PieChart>
                                    <Pie
                                        data={tipoResData}
                                        dataKey="value"
                                        nameKey="name"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ name, percent }) =>
                                            `${name} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {tipoResData.map((_, i) => (
                                            <Cell key={i} fill={['#1e50a0', '#28a745'][i]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Propiedades por tipo */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-bar-chart me-2 text-info"></i>
                                Propiedades por Tipo
                            </h6>
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={exportPropiedadesExcel}
                            >
                                <i className="bi bi-file-excel me-1"></i>Excel
                            </button>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.propiedadesPorTipo}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="tipo" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="total"    name="Total"    fill="#1e50a0" radius={[4, 4, 0, 0]} />
                                    <Bar dataKey="ocupadas" name="Ocupadas" fill="#28a745" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Nuevos ingresos (histórico) ── */}
            {data.ocupacionHistorica.length > 0 && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-0">
                        <h6 className="mb-0 fw-semibold">
                            <i className="bi bi-graph-up me-2 text-primary"></i>
                            Nuevos Ingresos de Residentes (últimos 6 meses)
                        </h6>
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={data.ocupacionHistorica}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                                <YAxis tick={{ fontSize: 11 }} />
                                <Tooltip />
                                <Line
                                    type="monotone"
                                    dataKey="ingresos"
                                    name="Nuevos Residentes"
                                    stroke="#1e50a0"
                                    strokeWidth={2}
                                    dot={{ r: 5 }}
                                    activeDot={{ r: 7 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── Tabla Residentes ── */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-table me-2 text-primary"></i>
                        Detalle de Residentes Activos
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportResidentesPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportResidentesExcel}
                        >
                            <i className="bi bi-file-excel me-1"></i>Excel
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Nombre</th>
                                    <th>Propiedad</th>
                                    <th>Tipo</th>
                                    <th>Fecha Ingreso</th>
                                    <th className="text-center">Familiares</th>
                                    <th className="text-center">Vehículos</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.residentesDetalle.map((r, i) => (
                                    <tr key={i}>
                                        <td className="fw-semibold">{r.nombre}</td>
                                        <td>
                                            <span className="badge bg-primary bg-opacity-10 text-primary">
                                                {r.propiedad}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${r.tipoResidente === 'PROPIETARIO' ? 'bg-success' : 'bg-info'}`}>
                                                {r.tipoResidente}
                                            </span>
                                        </td>
                                        <td>{fmtDate(r.fechaIngreso)}</td>
                                        <td className="text-center">{r.numFamiliares}</td>
                                        <td className="text-center">{r.numVehiculos}</td>
                                    </tr>
                                ))}
                                {data.residentesDetalle.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            Sin residentes registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

        </div>
    );
}