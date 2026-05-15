import { useEffect, useState } from 'react';
import {
    BarChart, Bar, PieChart, Pie, Cell, LineChart, Line,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardMultas } from '../services/dashboardService';
import { exportExcel, exportPDF, fmtDate, fmtQ } from '../utils/exportUtils';

const COLORS = ['#ffc107', '#28a745', '#17a2b8', '#6c757d', '#dc3545'];

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

export default function DashboardMultas() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    useEffect(() => {
        getDashboardMultas()
            .then(r => setData(r.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <div className="spinner-border text-danger" role="status" />
            <span className="ms-3 text-muted">Cargando datos de multas…</span>
        </div>
    );
    if (error || !data) return (
        <div className="alert alert-danger m-4">
            <i className="bi bi-exclamation-triangle me-2"></i>Error al cargar el dashboard de multas.
        </div>
    );

    // ── Exportaciones ────────────────────────────────────────
    const exportMultasRecientesExcel = () => exportExcel(
        data.multasRecientes.map(m => ({
            Residente:  m.residente,
            Propiedad:  m.propiedad,
            Monto:      m.monto,
            Fecha:      fmtDate(m.fechaInfraccion),
            Estado:     m.estado,
        })),
        'Multas Recientes',
        'Multas_Recientes'
    );

    const exportMultasRecientesPDF = () => exportPDF(
        ['Residente', 'Propiedad', 'Monto', 'Fecha Infracción', 'Estado'],
        data.multasRecientes.map(m => [
            m.residente,
            m.propiedad,
            fmtQ(m.monto),
            fmtDate(m.fechaInfraccion),
            m.estado,
        ]),
        'Reporte de Multas',
        'Multas_Recientes'
    );

    const exportInfractoresExcel = () => exportExcel(
        data.topInfractores.map(t => ({
            Residente:      t.residente,
            Propiedad:      t.propiedad,
            'Total Multas': t.totalMultas,
            'Monto Total':  t.montoTotal,
        })),
        'Top Infractores',
        'Top_Infractores'
    );

    const exportInfractoresPDF = () => exportPDF(
        ['#', 'Residente', 'Propiedad', 'Total Multas', 'Monto Total'],
        data.topInfractores.map((t, i) => [
            i + 1,
            t.residente,
            t.propiedad,
            t.totalMultas,
            fmtQ(t.montoTotal),
        ]),
        'Top 10 Infractores',
        'Top_Infractores'
    );

    return (
        <div className="container-fluid py-3">

            {/* ── Encabezado ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-file-earmark-x me-2 text-danger"></i>
                        Dashboard Multas
                    </h4>
                    <small className="text-muted">
                        Infracciones, montos pendientes y tendencia de multas
                    </small>
                </div>
                <span className="badge bg-danger bg-opacity-20 text-danger px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* ── KPIs ── */}
            <div className="row g-3 mb-4">
                <KpiCard
                    icon="bi-exclamation-circle"
                    label="Multas Pendientes"
                    value={data.multasPendientes}
                    color="danger"
                    sub={`Monto: ${fmtQ(data.montoPendiente)}`}
                />
                <KpiCard
                    icon="bi-check-circle"
                    label="Cobrado este Mes"
                    value={fmtQ(data.montoCobradoMes)}
                    color="success"
                    sub={`${data.multasPagadas} multas pagadas en total`}
                />
                <KpiCard
                    icon="bi-shield-exclamation"
                    label="En Mora"
                    value={data.multasEnMora}
                    color="warning"
                />
                <KpiCard
                    icon="bi-arrow-repeat"
                    label="Apeladas / Anuladas"
                    value={`${data.multasApeladas} / ${data.multasAnuladas}`}
                    color="info"
                />
            </div>

            {/* ── Gráficas fila 1 ── */}
            <div className="row g-3 mb-4">

                {/* Tendencia mensual */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-graph-up me-2 text-danger"></i>
                                Tendencia de Multas — Últimos 6 Meses
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={data.tendenciaMensual}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis dataKey="mes" tick={{ fontSize: 10 }} />
                                    <YAxis yAxisId="left"  tick={{ fontSize: 10 }} />
                                    <YAxis
                                        yAxisId="right"
                                        orientation="right"
                                        tickFormatter={v => `Q${(v / 1000).toFixed(0)}k`}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Tooltip
                                        formatter={(v, n) => n === 'Monto' ? fmtQ(v) : v}
                                    />
                                    <Legend />
                                    <Bar yAxisId="left"  dataKey="cantidad" name="Cantidad" fill="#dc3545" radius={[4, 4, 0, 0]} />
                                    <Bar yAxisId="right" dataKey="monto"    name="Monto"    fill="#ffc107" radius={[4, 4, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Distribución por estado */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-pie-chart me-2 text-warning"></i>
                                Distribución por Estado
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={data.distribucionEstado}
                                        dataKey="cantidad"
                                        nameKey="estado"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={75}
                                        label={({ estado, percent }) =>
                                            `${estado} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {data.distribucionEstado.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Detalle monto por estado */}
                            <div className="mt-2">
                                {data.distribucionEstado.map((e, i) => (
                                    <div key={i} className="d-flex justify-content-between border-bottom py-1 small">
                                        <span style={{ color: COLORS[i % COLORS.length] }} className="fw-semibold">
                                            {e.estado}
                                        </span>
                                        <span>{fmtQ(e.monto)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabla Top Infractores ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-person-exclamation me-2 text-danger"></i>
                        Top 10 Infractores
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportInfractoresPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportInfractoresExcel}
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
                                    <th>#</th>
                                    <th>Residente</th>
                                    <th>Propiedad</th>
                                    <th className="text-center">Total Multas</th>
                                    <th>Monto Total</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topInfractores.map((t, i) => (
                                    <tr key={i}>
                                        <td>
                                            <span className={`badge ${i === 0 ? 'bg-danger' : i === 1 ? 'bg-warning text-dark' : i === 2 ? 'bg-secondary' : 'bg-light text-dark'}`}>
                                                {i + 1}
                                            </span>
                                        </td>
                                        <td className="fw-semibold">{t.residente}</td>
                                        <td>
                                            <span className="badge bg-secondary">{t.propiedad}</span>
                                        </td>
                                        <td className="text-center">{t.totalMultas}</td>
                                        <td className="text-danger fw-bold">{fmtQ(t.montoTotal)}</td>
                                    </tr>
                                ))}
                                {data.topInfractores.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">
                                            <i className="bi bi-check-circle text-success me-2"></i>
                                            Sin infractores registrados
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Tabla multas recientes ── */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-list-ul me-2 text-warning"></i>
                        Multas Recientes
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportMultasRecientesPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportMultasRecientesExcel}
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
                                    <th>Residente</th>
                                    <th>Propiedad</th>
                                    <th>Monto</th>
                                    <th>Fecha Infracción</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.multasRecientes.map((m, i) => (
                                    <tr key={i}>
                                        <td className="fw-semibold">{m.residente}</td>
                                        <td>
                                            <span className="badge bg-secondary">{m.propiedad}</span>
                                        </td>
                                        <td className="text-danger fw-semibold">{fmtQ(m.monto)}</td>
                                        <td>{fmtDate(m.fechaInfraccion)}</td>
                                        <td>
                                            <span className={`badge ${
                                                m.estado === 'PENDIENTE'
                                                    ? 'bg-warning text-dark'
                                                    : m.estado === 'PAGADA'
                                                        ? 'bg-success'
                                                        : m.estado === 'EN_MORA'
                                                            ? 'bg-danger'
                                                            : m.estado === 'APELADA'
                                                                ? 'bg-info'
                                                                : 'bg-secondary'
                                            }`}>
                                                {m.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.multasRecientes.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">
                                            <i className="bi bi-check-circle text-success me-2"></i>
                                            Sin multas registradas recientemente
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