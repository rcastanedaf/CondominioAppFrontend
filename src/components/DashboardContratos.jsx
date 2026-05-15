import { useEffect, useState } from 'react';
import {
    PieChart, Pie, Cell,
    XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';
import { getDashboardContratos } from '../services/dashboardService';
import { exportExcel, exportPDF, fmtDate, fmtQ } from '../utils/exportUtils';

const COLORS = ['#1e50a0', '#28a745', '#ffc107', '#dc3545'];

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

export default function DashboardContratos() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    useEffect(() => {
        getDashboardContratos()
            .then(r => setData(r.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <div className="spinner-border text-primary" role="status" />
            <span className="ms-3 text-muted">Cargando datos de contratos…</span>
        </div>
    );
    if (error || !data) return (
        <div className="alert alert-danger m-4">
            <i className="bi bi-exclamation-triangle me-2"></i>Error al cargar el dashboard de contratos.
        </div>
    );

    // ── Exportaciones ────────────────────────────────────────
    const exportContratosExcel = () => exportExcel(
        data.contratosProximos.map(c => ({
            Propiedad:        c.propiedad,
            Residente:        c.residente,
            Tipo:             c.tipoContrato,
            'Fecha Fin':      fmtDate(c.fechaFin),
            'Días p/Vencer':  c.diasParaVencer === -1 ? 'Sin vencimiento' : c.diasParaVencer,
            Monto:            c.monto,
            Estado:           c.estado,
        })),
        'Contratos Activos',
        'Contratos_Activos'
    );

    const exportContratosPDF = () => exportPDF(
        ['Propiedad', 'Residente', 'Tipo', 'Vence', 'Días', 'Monto', 'Estado'],
        data.contratosProximos.map(c => [
            c.propiedad,
            c.residente,
            c.tipoContrato,
            fmtDate(c.fechaFin),
            c.diasParaVencer === -1 ? '—' : c.diasParaVencer,
            fmtQ(c.monto),
            c.estado,
        ]),
        'Contratos Activos — Próximos a Vencer',
        'Contratos'
    );

    const exportRenovacionesExcel = () => exportExcel(
        data.renovacionesMes.map(r => ({
            Propiedad:       r.propiedad,
            Residente:       r.residente,
            'Monto Nuevo':   r.montoNuevo,
            'Fecha Inicio':  fmtDate(r.fechaInicio),
            Estado:          r.estado,
        })),
        'Renovaciones',
        'Renovaciones_Mes'
    );

    // Contratos que vencen en ≤60 días
    const alertasVencimiento = data.contratosProximos.filter(
        c => c.diasParaVencer !== -1 && c.diasParaVencer <= 60
    );

    return (
        <div className="container-fluid py-3">

            {/* ── Encabezado ── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-file-earmark-text me-2 text-primary"></i>
                        Dashboard Contratos
                    </h4>
                    <small className="text-muted">
                        Arrendamientos, ventas, vencimientos y renovaciones
                    </small>
                </div>
                <span className="badge bg-primary bg-opacity-10 text-primary px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* ── KPIs ── */}
            <div className="row g-3 mb-4">
                <KpiCard
                    icon="bi-file-earmark-check"
                    label="Contratos Activos"
                    value={data.contratosActivos}
                    color="success"
                    sub={`${data.contratosArrendamiento} arrendamiento · ${data.contratosVenta} venta`}
                />
                <KpiCard
                    icon="bi-clock-history"
                    label="Vencen en 30 días"
                    value={data.contratosVencen30Dias}
                    color="danger"
                />
                <KpiCard
                    icon="bi-calendar-range"
                    label="Vencen en 31–60 días"
                    value={data.contratosVencen60Dias}
                    color="warning"
                />
                <KpiCard
                    icon="bi-currency-dollar"
                    label="Monto Total Activos"
                    value={fmtQ(data.montoTotalContratos)}
                    color="primary"
                    sub={`${data.contratosEnMora} contrato(s) en mora`}
                />
            </div>

            {/* ── Gráficas + Alertas ── */}
            <div className="row g-3 mb-4">

                {/* Distribución por tipo (pie) */}
                <div className="col-lg-5">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-pie-chart me-2 text-primary"></i>
                                Distribución por Tipo de Contrato
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={200}>
                                <PieChart>
                                    <Pie
                                        data={data.distribucionPorTipo}
                                        dataKey="total"
                                        nameKey="tipo"
                                        cx="50%"
                                        cy="50%"
                                        outerRadius={80}
                                        label={({ tipo, percent }) =>
                                            `${tipo} ${(percent * 100).toFixed(0)}%`
                                        }
                                    >
                                        {data.distribucionPorTipo.map((_, i) => (
                                            <Cell key={i} fill={COLORS[i % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>

                            {/* Resumen montos */}
                            <div className="mt-3">
                                {data.distribucionPorTipo.map((t, i) => (
                                    <div key={i} className="d-flex justify-content-between border-bottom py-2">
                                        <span className="fw-semibold">{t.tipo}</span>
                                        <span className="text-primary fw-bold">{fmtQ(t.montoTotal)}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Alertas de vencimiento */}
                <div className="col-lg-7">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-alarm me-2 text-danger"></i>
                                Alertas de Vencimiento (próximos 60 días)
                            </h6>
                        </div>
                        <div className="card-body" style={{ overflowY: 'auto', maxHeight: 320 }}>
                            {alertasVencimiento.length === 0 ? (
                                <div className="text-center text-muted py-5">
                                    <i className="bi bi-check-circle text-success fs-1 d-block mb-2"></i>
                                    Sin contratos próximos a vencer
                                </div>
                            ) : (
                                alertasVencimiento.map((c, i) => (
                                    <div
                                        key={i}
                                        className={`alert alert-${
                                            c.diasParaVencer <= 15
                                                ? 'danger'
                                                : c.diasParaVencer <= 30
                                                    ? 'warning'
                                                    : 'info'
                                        } py-2 mb-2`}
                                    >
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <strong>{c.propiedad}</strong>
                                                <span className="mx-2">—</span>
                                                {c.residente}
                                                <small className="d-block text-muted mt-1">
                                                    {c.tipoContrato} · {fmtQ(c.monto)} · vence {fmtDate(c.fechaFin)}
                                                </small>
                                            </div>
                                            <span className="badge bg-white text-dark shadow-sm">
                                                {c.diasParaVencer} días
                                            </span>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabla contratos activos ── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-table me-2 text-primary"></i>
                        Contratos Activos
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportContratosPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportContratosExcel}
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
                                    <th>Propiedad</th>
                                    <th>Residente</th>
                                    <th>Tipo</th>
                                    <th>Vence</th>
                                    <th>Días restantes</th>
                                    <th>Monto</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.contratosProximos.map((c, i) => (
                                    <tr
                                        key={i}
                                        className={
                                            c.diasParaVencer !== -1 && c.diasParaVencer <= 15
                                                ? 'table-danger'
                                                : c.diasParaVencer !== -1 && c.diasParaVencer <= 30
                                                    ? 'table-warning'
                                                    : ''
                                        }
                                    >
                                        <td className="fw-semibold">{c.propiedad}</td>
                                        <td>{c.residente}</td>
                                        <td>
                                            <span className="badge bg-secondary">{c.tipoContrato}</span>
                                        </td>
                                        <td>
                                            {c.fechaFin
                                                ? fmtDate(c.fechaFin)
                                                : <span className="badge bg-info">Indefinido</span>
                                            }
                                        </td>
                                        <td>
                                            {c.diasParaVencer === -1
                                                ? '—'
                                                : `${c.diasParaVencer} días`
                                            }
                                        </td>
                                        <td className="fw-semibold">{fmtQ(c.monto)}</td>
                                        <td>
                                            <span className={`badge ${c.estado === 'ACTIVO' ? 'bg-success' : 'bg-danger'}`}>
                                                {c.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.contratosProximos.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center text-muted py-4">
                                            Sin contratos activos
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Tabla renovaciones del mes ── */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-arrow-repeat me-2 text-success"></i>
                        Renovaciones del Mes Actual
                    </h6>
                    <button
                        className="btn btn-sm btn-outline-success"
                        onClick={exportRenovacionesExcel}
                    >
                        <i className="bi bi-file-excel me-1"></i>Excel
                    </button>
                </div>
                <div className="card-body p-0">
                    <div className="table-responsive">
                        <table className="table table-hover align-middle mb-0">
                            <thead className="table-light">
                                <tr>
                                    <th>Propiedad</th>
                                    <th>Residente</th>
                                    <th>Monto Nuevo</th>
                                    <th>Fecha Inicio</th>
                                    <th>Estado</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.renovacionesMes.map((r, i) => (
                                    <tr key={i}>
                                        <td className="fw-semibold">{r.propiedad}</td>
                                        <td>{r.residente}</td>
                                        <td className="text-success fw-semibold">{fmtQ(r.montoNuevo)}</td>
                                        <td>{fmtDate(r.fechaInicio)}</td>
                                        <td>
                                            <span className={`badge ${r.estado === 'ACTIVO' ? 'bg-success' : r.estado === 'CANCELADO' ? 'bg-danger' : 'bg-secondary'}`}>
                                                {r.estado}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.renovacionesMes.length === 0 && (
                                    <tr>
                                        <td colSpan={5} className="text-center text-muted py-4">
                                            Sin renovaciones en el mes actual
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