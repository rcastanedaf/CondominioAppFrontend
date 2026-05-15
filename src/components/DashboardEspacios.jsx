import { useEffect, useState } from 'react';
import {
    BarChart, Bar, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardEspacios } from '../services/dashboardService';
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

export default function DashboardEspacios() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    useEffect(() => {
        getDashboardEspacios()
            .then(r => setData(r.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <div className="spinner-border text-info" role="status" />
            <span className="ms-3 text-muted">Cargando datos de espacios comunes…</span>
        </div>
    );
    if (error || !data) return (
        <div className="alert alert-danger m-4">
            <i className="bi bi-exclamation-triangle me-2"></i>Error al cargar el dashboard de espacios.
        </div>
    );

    // ── Exportaciones ────────────────────────────────────────
    const exportProximasExcel = () => exportExcel(
        data.proximasReservas.map(r => ({
            Espacio:   r.espacio,
            Residente: r.residente,
            Propiedad: r.propiedad,
            Fecha:     fmtDate(r.fechaReserva),
            'Hora Inicio': r.horaInicio,
            'Hora Fin':    r.horaFin,
            Estado:    r.estado,
        })),
        'Próximas Reservas',
        'Proximas_Reservas'
    );

    const exportProximasPDF = () => exportPDF(
        ['Espacio', 'Residente', 'Propiedad', 'Fecha', 'Hora Inicio', 'Hora Fin', 'Estado'],
        data.proximasReservas.map(r => [
            r.espacio,
            r.residente,
            r.propiedad,
            fmtDate(r.fechaReserva),
            r.horaInicio,
            r.horaFin,
            r.estado,
        ]),
        'Próximas Reservas de Espacios Comunes',
        'Proximas_Reservas'
    );

    const exportEspaciosResumenExcel = () => exportExcel(
        data.reservasPorEspacio.map(e => ({
            Espacio:         e.espacio,
            'Total Reservas': e.totalReservas,
            Aprobadas:       e.aprobadas,
            Pendientes:      e.pendientes,
            'Ingresos Mes':  e.ingresos,
        })),
        'Resumen por Espacio',
        'Espacios_Resumen'
    );

    return (
        <div className="container-fluid py-3">

            {/* ── Encabezado ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-building me-2 text-info"></i>
                        Dashboard Espacios Comunes
                    </h4>
                    <small className="text-muted">
                        Reservas, disponibilidad e ingresos por espacio
                    </small>
                </div>
                <span className="badge bg-info bg-opacity-20 text-info px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* ── KPIs ── */}
            <div className="row g-3 mb-4">
                <KpiCard
                    icon="bi-buildings-fill"
                    label="Total Espacios"
                    value={data.totalEspacios}
                    color="primary"
                    sub={`${data.espaciosDisponibles} disponibles · ${data.espaciosMantenimiento} en mantenimiento`}
                />
                <KpiCard
                    icon="bi-calendar-check"
                    label="Reservas Hoy"
                    value={data.reservasHoy}
                    color="success"
                    sub={`${data.reservasMes} reservas en el mes`}
                />
                <KpiCard
                    icon="bi-cash"
                    label="Ingresos por Reservas"
                    value={fmtQ(data.ingresosReservasMes)}
                    color="info"
                    sub="Mes actual"
                />
                <KpiCard
                    icon="bi-wallet2"
                    label="Depósitos por Devolver"
                    value={fmtQ(data.depositosPendientesDevolucion)}
                    color="warning"
                />
            </div>

            {/* ── Gráficas fila 1 ── */}
            <div className="row g-3 mb-4">

                {/* Reservas por espacio */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-bar-chart me-2 text-info"></i>
                                Reservas por Espacio (total)
                            </h6>
                            <button
                                className="btn btn-sm btn-outline-success"
                                onClick={exportEspaciosResumenExcel}
                            >
                                <i className="bi bi-file-excel me-1"></i>Excel
                            </button>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart data={data.reservasPorEspacio}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="espacio" tick={{ fontSize: 10 }} />
                                    <YAxis tick={{ fontSize: 10 }} />
                                    <Tooltip />
                                    <Legend />
                                    <Bar dataKey="aprobadas"  name="Aprobadas"  fill="#28a745" radius={[3, 3, 0, 0]} />
                                    <Bar dataKey="pendientes" name="Pendientes" fill="#ffc107" radius={[3, 3, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Tendencia mensual */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-graph-up me-2 text-primary"></i>
                                Tendencia de Reservas e Ingresos
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <LineChart data={data.tendenciaMensual}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                                    <YAxis yAxisId="left"  tick={{ fontSize: 10 }} />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={v => `Q${(v / 1000).toFixed(0)}k`}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Tooltip formatter={(v, n) => n === 'Ingresos' ? fmtQ(v) : v} />
                                    <Legend />
                                    <Line yAxisId="left"  type="monotone" dataKey="totalReservas" name="Reservas" stroke="#17a2b8" strokeWidth={2} dot={{ r: 4 }} />
                                    <Line yAxisId="right" type="monotone" dataKey="ingresos"      name="Ingresos" stroke="#1e50a0" strokeWidth={2} dot={{ r: 4 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabla próximas reservas ── */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-calendar-event me-2 text-success"></i>
                        Próximas Reservas Confirmadas
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportProximasPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportProximasExcel}
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
                                    <th>Espacio</th>
                                    <th>Residente</th>
                                    <th>Propiedad</th>
                                    <th>Fecha</th>
                                    <th>Horario</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.proximasReservas.map((r, i) => (
                                    <tr key={i}>
                                        <td className="fw-semibold">{r.espacio}</td>
                                        <td>{r.residente}</td>
                                        <td>
                                            <span className="badge bg-primary bg-opacity-10 text-primary">
                                                {r.propiedad}
                                            </span>
                                        </td>
                                        <td>{fmtDate(r.fechaReserva)}</td>
                                        <td>{r.horaInicio} — {r.horaFin}</td>
                                        <td>
                                            <span className={`badge ${r.estado === 'APROBADA' ? 'bg-success' : 'bg-warning text-dark'}`}>
                                                {r.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.proximasReservas.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            <i className="bi bi-calendar-x me-2"></i>
                                            Sin reservas próximas registradas
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