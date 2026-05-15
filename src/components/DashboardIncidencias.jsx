import { useEffect, useState } from 'react';
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardIncidencias } from '../services/dashboardService';
import { exportExcel, exportPDF, fmtDate, fmtQ } from '../utils/exportUtils';

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

export default function DashboardIncidencias() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    useEffect(() => {
        getDashboardIncidencias()
            .then(r => setData(r.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <div className="spinner-border text-warning" role="status" />
            <span className="ms-3 text-muted">Cargando datos de incidencias…</span>
        </div>
    );
    if (error || !data) return (
        <div className="alert alert-danger m-4">
            <i className="bi bi-exclamation-triangle me-2"></i>Error al cargar el dashboard de incidencias.
        </div>
    );

    // ── Datos de prioridad para barras de progreso ───────────
    const totalActivas = data.totalAbiertas + data.totalEnProceso;
    const prioridadData = [
        { name: 'Alta',  value: data.totalAlta,  color: 'danger'  },
        { name: 'Media', value: data.totalMedia, color: 'warning' },
        { name: 'Baja',  value: data.totalBaja,  color: 'success' },
    ];

    // ── Exportaciones ────────────────────────────────────────
    const exportIncidenciasExcel = () => exportExcel(
        data.incidenciasRecientes.map(i => ({
            Título:    i.titulo,
            Categoría: i.categoria,
            Prioridad: i.prioridad,
            Estado:    i.estado,
            Apertura:  fmtDate(i.fechaApertura),
            Propiedad: i.propiedad,
        })),
        'Incidencias Activas',
        'Incidencias'
    );

    const exportIncidenciasPDF = () => exportPDF(
        ['Título', 'Categoría', 'Prioridad', 'Estado', 'Apertura', 'Propiedad'],
        data.incidenciasRecientes.map(i => [
            i.titulo,
            i.categoria,
            i.prioridad,
            i.estado,
            fmtDate(i.fechaApertura),
            i.propiedad,
        ]),
        'Reporte de Incidencias Activas',
        'Incidencias'
    );

    const exportCategoriaExcel = () => exportExcel(
        data.porCategoria.map(c => ({
            Categoría:    c.categoria,
            Abiertas:     c.abiertas,
            'En Proceso': c.enProceso,
            Resueltas:    c.resueltas,
            Alta:         c.alta,
            Media:        c.media,
            Baja:         c.baja,
        })),
        'Por Categoría',
        'Incidencias_Categoria'
    );

    return (
        <div className="container-fluid py-3">

            {/* ── Encabezado ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-exclamation-triangle-fill me-2 text-warning"></i>
                        Dashboard Incidencias
                    </h4>
                    <small className="text-muted">
                        Estado, prioridades, costos y tendencias de incidencias
                    </small>
                </div>
                <span className="badge bg-warning bg-opacity-20 text-warning px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* ── KPIs ── */}
            <div className="row g-3 mb-4">
                <KpiCard
                    icon="bi-exclamation-circle-fill"
                    label="Abiertas"
                    value={data.totalAbiertas}
                    color="danger"
                    sub={`${data.totalAlta} alta · ${data.totalMedia} media · ${data.totalBaja} baja`}
                />
                <KpiCard
                    icon="bi-arrow-repeat"
                    label="En Proceso"
                    value={data.totalEnProceso}
                    color="warning"
                />
                <KpiCard
                    icon="bi-check-circle-fill"
                    label="Resueltas"
                    value={data.totalResueltas}
                    color="success"
                    sub={`Promedio ${data.promedioHorasResolucion.toFixed(1)} hrs`}
                />
                <KpiCard
                    icon="bi-currency-dollar"
                    label="Costo Real Acumulado"
                    value={fmtQ(data.costoRealTotal)}
                    color="info"
                    sub={`Estimado: ${fmtQ(data.costoEstimadoTotal)}`}
                />
            </div>

            {/* ── Gráficas fila 1 ── */}
            <div className="row g-3 mb-4">

                {/* Por categoría */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-bar-chart me-2 text-primary"></i>
                                Incidencias por Categoría
                            </h6>
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={exportCategoriaExcel}
                            >
                                <i className="bi bi-file-excel me-1"></i>Excel
                            </button>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={data.porCategoria}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="categoria" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="abiertas"  name="Abiertas"    fill="#dc3545" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="enProceso" name="En Proceso"  fill="#ffc107" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="resueltas" name="Resueltas"   fill="#28a745" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Distribución por prioridad */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-bar-chart-steps me-2 text-danger"></i>
                                Distribución por Prioridad
                            </h6>
                        </div>
                        <div className="card-body d-flex flex-column justify-content-center">
                            {prioridadData.map((p, i) => (
                                <div key={i} className="mb-4">
                                    <div className="d-flex justify-content-between mb-1">
                                        <span className={`badge bg-${p.color} ${p.color === 'warning' ? 'text-dark' : ''}`}>
                                            {p.name}
                                        </span>
                                        <strong>{p.value} incidencias</strong>
                                    </div>
                                    <div className="progress" style={{ height: 12, borderRadius: 6 }}>
                                        <div
                                            className={`progress-bar bg-${p.color}`}
                                            style={{
                                                width: totalActivas > 0
                                                    ? `${(p.value / totalActivas * 100).toFixed(0)}%`
                                                    : '0%',
                                                borderRadius: 6,
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tendencia mensual ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-graph-up me-2 text-primary"></i>
                        Tendencia Mensual — Últimos 6 Meses
                    </h6>
                </div>
                <div className="card-body">
                    <ResponsiveContainer width="100%" height={200}>
                        <LineChart data={data.tendenciaMensual}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                            <XAxis dataKey="mes" tick={{ fontSize: 11 }} />
                            <YAxis tick={{ fontSize: 11 }} />
                            <Tooltip />
                            <Legend />
                            <Line
                                type="monotone"
                                dataKey="abiertas"
                                name="Abiertas"
                                stroke="#dc3545"
                                strokeWidth={2}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                            <Line
                                type="monotone"
                                dataKey="resueltas"
                                name="Resueltas"
                                stroke="#28a745"
                                strokeWidth={2}
                                dot={{ r: 5 }}
                                activeDot={{ r: 7 }}
                            />
                        </LineChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* ── Tabla incidencias activas ── */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-list-ul me-2 text-warning"></i>
                        Incidencias Activas (ordenadas por prioridad)
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportIncidenciasPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportIncidenciasExcel}
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
                                    <th>Título</th>
                                    <th>Categoría</th>
                                    <th>Prioridad</th>
                                    <th>Estado</th>
                                    <th>Apertura</th>
                                    <th>Propiedad</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.incidenciasRecientes.map((inc, i) => (
                                    <tr key={i}>
                                        <td className="fw-semibold">{inc.titulo}</td>
                                        <td className="text-muted">{inc.categoria}</td>
                                        <td>
                                            <span className={`badge ${
                                                inc.prioridad === 'ALTA'
                                                    ? 'bg-danger'
                                                    : inc.prioridad === 'MEDIA'
                                                        ? 'bg-warning text-dark'
                                                        : 'bg-success'
                                            }`}>
                                                {inc.prioridad}
                                            </span>
                                        </td>
                                        <td>
                                            <span className={`badge ${
                                                inc.estado === 'ABIERTA' ? 'bg-danger' : 'bg-warning text-dark'
                                            }`}>
                                                {inc.estado}
                                            </span>
                                        </td>
                                        <td>{fmtDate(inc.fechaApertura)}</td>
                                        <td>{inc.propiedad}</td>
                                    </tr>
                                ))}
                                {data.incidenciasRecientes.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            <i className="bi bi-check-circle text-success me-2"></i>
                                            Sin incidencias activas pendientes
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