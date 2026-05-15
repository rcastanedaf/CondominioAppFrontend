import { useEffect, useState } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardAcceso } from '../services/dashboardService';
import { exportExcel, exportPDF, fmtDate } from '../utils/exportUtils';

const COLORS = ['#1e50a0', '#28a745', '#ffc107', '#dc3545', '#17a2b8', '#6f42c1'];

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

export default function DashboardAcceso() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    useEffect(() => {
        getDashboardAcceso()
            .then(r => setData(r.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <div className="spinner-border text-primary" role="status" />
            <span className="ms-3 text-muted">Cargando datos de acceso…</span>
        </div>
    );
    if (error || !data) return (
        <div className="alert alert-danger m-4">
            <i className="bi bi-exclamation-triangle me-2"></i>Error al cargar el dashboard de acceso.
        </div>
    );

    // ── Exportaciones ────────────────────────────────────────
    const exportAccesoDiarioExcel = () => exportExcel(
        data.accesosPorDia.map(a => ({
            Fecha:    a.fecha,
            Entradas: a.entradas,
            Salidas:  a.salidas,
            Total:    a.total,
        })),
        'Accesos Diarios',
        'Accesos_Diarios'
    );

    const exportAccesoDiarioPDF = () => exportPDF(
        ['Fecha', 'Entradas', 'Salidas', 'Total'],
        data.accesosPorDia.map(a => [a.fecha, a.entradas, a.salidas, a.total]),
        'Reporte de Accesos — Últimos 14 Días',
        'Accesos_Diarios'
    );

    const exportListaNegraExcel = () => exportExcel(
        data.listaNegra.map(l => ({
            Tipo:           l.tipo,
            'Nombre/Placa': l.nombre,
            Motivo:         l.motivo,
            'Válido hasta': fmtDate(l.fechaFin),
        })),
        'Lista Negra',
        'Lista_Negra'
    );

    const exportListaNegraPDF = () => exportPDF(
        ['Tipo', 'Nombre / Placa', 'Motivo', 'Válido hasta'],
        data.listaNegra.map(l => [
            l.tipo,
            l.nombre,
            l.motivo,
            l.fechaFin ? fmtDate(l.fechaFin) : 'Indefinido',
        ]),
        'Lista de Restricciones Activas',
        'Lista_Negra'
    );

    return (
        <div className="container-fluid py-3">

            {/* ── Encabezado ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-shield-check me-2 text-primary"></i>
                        Dashboard Acceso y Seguridad
                    </h4>
                    <small className="text-muted">
                        Control de entradas, salidas y lista de restricciones
                    </small>
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* ── KPIs ── */}
            <div className="row g-3 mb-4">
                <KpiCard
                    icon="bi-door-open-fill"
                    label="Accesos Hoy"
                    value={data.accesosHoy}
                    color="primary"
                    sub={`${data.entradasHoy} entradas · ${data.salidasHoy} salidas`}
                />
                <KpiCard
                    icon="bi-person-walking"
                    label="Visitas Hoy"
                    value={data.visitasHoy}
                    color="info"
                    sub={`${data.visitasActivasHoy} visitas autorizadas activas`}
                />
                <KpiCard
                    icon="bi-person-x-fill"
                    label="Lista Negra — Personas"
                    value={data.personasEnLista}
                    color="danger"
                />
                <KpiCard
                    icon="bi-car-front-fill"
                    label="Lista Negra — Vehículos"
                    value={data.vehiculosEnLista}
                    color="warning"
                />
            </div>

            {/* ── Gráficas fila 1 ── */}
            <div className="row g-3 mb-4">

                {/* Accesos por día */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-calendar3 me-2 text-primary"></i>
                                Accesos Últimos 14 Días
                            </h6>
                            <div className="d-flex gap-2">
                                <button
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={exportAccesoDiarioPDF}
                                >
                                    <i className="bi bi-file-pdf me-1"></i>PDF
                                </button>
                                <button
                                    className="btn btn-sm btn-outline-success"
                                    onClick={exportAccesoDiarioExcel}
                                >
                                    <i className="bi bi-file-excel me-1"></i>Excel
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={data.accesosPorDia}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="fecha" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="entradas" name="Entradas" fill="#28a745" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="salidas"  name="Salidas"  fill="#1e50a0" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Por tipo de persona */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-pie-chart me-2 text-info"></i>
                                Por Tipo de Persona (30 días)
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <PieChart>
                                    <Pie
                                        data={data.accesosPorTipo}
                                        dataKey="total"
                                        nameKey="tipoPersona"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ tipoPersona, percent }) =>
                                            `${tipoPersona} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {data.accesosPorTipo.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Accesos por hora ── */}
            {data.accesosPorHora.length > 0 && (
                <div className="card border-0 shadow-sm mb-4">
                    <div className="card-header bg-white border-0">
                        <h6 className="mb-0 fw-semibold">
                            <i className="bi bi-clock me-2 text-warning"></i>
                            Distribución por Hora del Día (últimos 7 días)
                        </h6>
                    </div>
                    <div className="card-body">
                        <ResponsiveContainer width="100%" height={180}>
                            <BarChart data={data.accesosPorHora}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                <XAxis
                                    dataKey="hora"
                                    tickFormatter={h => `${h}:00`}
                                    tick={{ fontSize: 10 }}
                                />
                                <YAxis tick={{ fontSize: 10 }} />
                                <Tooltip labelFormatter={h => `${h}:00 hrs`} />
                                <Bar dataKey="total" name="Accesos" fill="#ffc107" radius={[3, 3, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            )}

            {/* ── Tabla Lista Negra ── */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-ban me-2 text-danger"></i>
                        Lista de Restricciones Activas
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportListaNegraPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportListaNegraExcel}
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
                                    <th>Tipo</th>
                                    <th>Nombre / Placa</th>
                                    <th>Motivo</th>
                                    <th>Válido hasta</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.listaNegra.map((l, i) => (
                                    <tr key={i}>
                                        <td>
                                            <span className={`badge ${l.tipo === 'PERSONA' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                                                {l.tipo}
                                            </span>
                                        </td>
                                        <td className="fw-semibold">{l.nombre}</td>
                                        <td className="text-muted">{l.motivo}</td>
                                        <td>
                                            {l.fechaFin
                                                ? fmtDate(l.fechaFin)
                                                : <span className="badge bg-dark">Indefinido</span>
                                            }
                                        </td>
                                    </tr>
                                ))}
                                {data.listaNegra.length === 0 && (
                                    <tr>
                                        <td colSpan={4} className="text-center text-muted py-4">
                                            <i className="bi bi-check-circle text-success me-2"></i>
                                            Sin registros en lista de restricciones
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