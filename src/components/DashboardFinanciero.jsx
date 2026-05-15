import { useEffect, useState } from 'react';
import {
    AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardFinanciero } from '../services/dashboardService';
import { exportExcel, exportPDF, fmtQ } from '../utils/exportUtils';

const COLORS = ['#1e50a0','#28a745','#ffc107','#dc3545','#17a2b8','#6f42c1'];

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

export default function DashboardFinanciero() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getDashboardFinanciero()
            .then(r => setData(r.data.data))
            .catch(console.error)
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <div className="spinner-border text-primary" role="status" />
            <span className="ms-3 text-muted">Cargando dashboard financiero…</span>
        </div>
    );
    if (!data) return <div className="alert alert-danger">Error al cargar datos.</div>;

    // ── Exportar morosos a Excel
    const exportMorososExcel = () => exportExcel(
        data.topMorosos.map(m => ({ Residente: m.residente, 'Monto Pendiente': m.montoPendiente, 'Días Atraso': m.diasAtraso })),
        'Top Morosos', 'Morosos_Financiero'
    );

    // ── Exportar morosos a PDF
    const exportMorososPDF = () => exportPDF(
        ['Residente', 'Monto Pendiente', 'Días Atraso'],
        data.topMorosos.map(m => [m.residente, fmtQ(m.montoPendiente), m.diasAtraso]),
        'Reporte Financiero — Top Morosos', 'Morosos_Financiero'
    );

    // ── Exportar cartera a Excel
    const exportCarteraExcel = () => exportExcel(
        data.distribucionCartera.map(c => ({ Estado: c.estado, Cantidad: c.cantidad, Monto: c.monto })),
        'Distribución Cartera', 'Cartera_Financiero'
    );

    // ── Exportar ingresos mensuales a PDF
    const exportIngresosPDF = () => exportPDF(
        ['Mes', 'Total Ingresos', 'Núm. Pagos'],
        data.ingresosPorMes.map(i => [i.mes, fmtQ(i.totalIngresos), i.numPagos]),
        'Reporte Financiero — Ingresos Mensuales', 'Ingresos_Mensuales'
    );

    return (
        <div className="container-fluid py-3">
            {/* Encabezado */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-cash-stack me-2 text-primary"></i>Dashboard Financiero
                    </h4>
                    <small className="text-muted">Resumen de ingresos, cartera y morosidad</small>
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* KPIs */}
            <div className="row g-3 mb-4">
                <KpiCard icon="bi-arrow-down-circle-fill" label="Cobrado este mes"
                    value={fmtQ(data.totalCobradoMes)} color="success" sub={`Anual: ${fmtQ(data.totalCobradoAnio)}`} />
                <KpiCard icon="bi-hourglass-split" label="Total Pendiente"
                    value={fmtQ(data.totalPendiente)} color="warning" sub={`${data.facturasPendientes} facturas pendientes`} />
                <KpiCard icon="bi-exclamation-triangle-fill" label="Total en Mora"
                    value={fmtQ(data.totalMora)} color="danger" sub={`Promedio: ${data.promedioMoraDias} días`} />
                <KpiCard icon="bi-piggy-bank-fill" label="Saldos a Favor"
                    value={fmtQ(data.totalSaldosAFavor)} color="info" sub={`${data.acuerdosPagoActivos} acuerdos activos`} />
            </div>

            {/* Gráficas fila 1 */}
            <div className="row g-3 mb-4">
                {/* Ingresos mensuales */}
                <div className="col-lg-8">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-semibold"><i className="bi bi-graph-up me-2 text-success"></i>Ingresos Mensuales (12 meses)</h6>
                            <div className="d-flex gap-2">
                                <button className="btn btn-sm btn-outline-success" onClick={exportIngresosPDF}>
                                    <i className="bi bi-file-pdf me-1"></i>PDF
                                </button>
                                <button className="btn btn-sm btn-outline-primary" onClick={() => exportExcel(data.ingresosPorMes, 'Ingresos', 'Ingresos_Mes')}>
                                    <i className="bi bi-file-excel me-1"></i>Excel
                                </button>
                            </div>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={260}>
                                <AreaChart data={data.ingresosPorMes}>
                                    <defs>
                                        <linearGradient id="colIngreso" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#1e50a0" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#1e50a0" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                    <XAxis dataKey="mes" tick={{ fontSize: 11 }}/>
                                    <YAxis tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} tick={{ fontSize: 11 }}/>
                                    <Tooltip formatter={v => fmtQ(v)} labelStyle={{ fontWeight: 'bold' }}/>
                                    <Area type="monotone" dataKey="totalIngresos" name="Ingresos" stroke="#1e50a0" fill="url(#colIngreso)" strokeWidth={2}/>
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Distribución cartera */}
                <div className="col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                            <h6 className="mb-0 fw-semibold"><i className="bi bi-pie-chart me-2 text-warning"></i>Distribución Cartera</h6>
                            <button className="btn btn-sm btn-outline-primary" onClick={exportCarteraExcel}>
                                <i className="bi bi-file-excel me-1"></i>Excel
                            </button>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie data={data.distribucionCartera} dataKey="monto" nameKey="estado" cx="50%" cy="50%" outerRadius={75} label={({ estado, percent }) => `${estado} ${(percent*100).toFixed(0)}%`}>
                                        {data.distribucionCartera.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                                    </Pie>
                                    <Tooltip formatter={v => fmtQ(v)}/>
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Gráficas fila 2 */}
            <div className="row g-3 mb-4">
                {/* Pagos por método */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold"><i className="bi bi-credit-card me-2 text-info"></i>Pagos por Método (últimos 3 meses)</h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.pagosPorMetodo} layout="vertical">
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                    <XAxis type="number" tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }}/>
                                    <YAxis type="category" dataKey="metodo" tick={{ fontSize: 10 }} width={90}/>
                                    <Tooltip formatter={v => fmtQ(v)}/>
                                    <Bar dataKey="total" name="Total" radius={[0,4,4,0]}>
                                        {data.pagosPorMetodo.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]}/>)}
                                    </Bar>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Ingresos por servicio */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold"><i className="bi bi-list-ul me-2 text-primary"></i>Ingresos por Servicio (mes actual)</h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={220}>
                                <BarChart data={data.ingresosPorServicio}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0"/>
                                    <XAxis dataKey="servicio" tick={{ fontSize: 10 }}/>
                                    <YAxis tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} tick={{ fontSize: 10 }}/>
                                    <Tooltip formatter={v => fmtQ(v)}/>
                                    <Bar dataKey="total" name="Total" fill="#1e50a0" radius={[4,4,0,0]}/>
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabla Top Morosos */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold"><i className="bi bi-people-fill me-2 text-danger"></i>Top 10 Morosos</h6>
                    <div className="d-flex gap-2">
                        <button className="btn btn-sm btn-outline-danger" onClick={exportMorososPDF}>
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button className="btn btn-sm btn-outline-success" onClick={exportMorososExcel}>
                            <i className="bi bi-file-excel me-1"></i>Excel
                        </button>
                    </div>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>#</th>
                                    <th>Residente</th>
                                    <th>Monto Pendiente</th>
                                    <th>Días en Mora</th>
                                    <th>Riesgo</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.topMorosos.map((m, i) => (
                                    <tr key={i}>
                                        <td><span className="badge bg-secondary">{i+1}</span></td>
                                        <td className="fw-semibold">{m.residente}</td>
                                        <td className="text-danger fw-bold">{fmtQ(m.montoPendiente)}</td>
                                        <td>{m.diasAtraso} días</td>
                                        <td>
                                            <span className={`badge ${m.diasAtraso > 60 ? 'bg-danger' : m.diasAtraso > 30 ? 'bg-warning text-dark' : 'bg-info'}`}>
                                                {m.diasAtraso > 60 ? 'Alto' : m.diasAtraso > 30 ? 'Medio' : 'Bajo'}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.topMorosos.length === 0 && (
                                    <tr><td colSpan={5} className="text-center text-muted py-4">Sin morosos registrados 🎉</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}