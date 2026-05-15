import { useEffect, useState } from 'react';
import {
    BarChart, Bar,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import { getDashboardPersonal } from '../services/dashboardService';
import { exportExcel, exportPDF, fmtDate, fmtQ } from '../utils/exportUtils';

// ── KPI Card reutilizable ─────────────────────────────────────
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
                        {sub && (
                            <div className="text-muted" style={{ fontSize: '0.75rem' }}>{sub}</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

// ── Componente principal ──────────────────────────────────────
export default function DashboardPersonal() {
    const [data, setData]       = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError]     = useState(false);

    useEffect(() => {
        getDashboardPersonal()
            .then(r => setData(r.data.data))
            .catch(() => setError(true))
            .finally(() => setLoading(false));
    }, []);

    // ── Estados de carga / error ──────────────────────────────
    if (loading) return (
        <div className="d-flex justify-content-center align-items-center" style={{ height: 300 }}>
            <div className="spinner-border text-success" role="status" />
            <span className="ms-3 text-muted">Cargando datos del personal…</span>
        </div>
    );

    if (error || !data) return (
        <div className="alert alert-danger m-4">
            <i className="bi bi-exclamation-triangle me-2"></i>
            Error al cargar el dashboard de personal.
        </div>
    );

    // ── Funciones de exportación ──────────────────────────────
    const exportDirectorioPDF = () => exportPDF(
        ['Nombre', 'Cargo', 'Estado', 'Salario', 'Fecha Ingreso', 'Jornada'],
        data.empleadosDetalle.map(e => [
            e.nombre,
            e.cargo,
            e.estado,
            fmtQ(e.salario),
            fmtDate(e.fechaIngreso),
            e.tipoJornada,
        ]),
        'Directorio de Personal',
        'Personal'
    );

    const exportDirectorioExcel = () => exportExcel(
        data.empleadosDetalle.map(e => ({
            Nombre:          e.nombre,
            Cargo:           e.cargo,
            Estado:          e.estado,
            'Salario':       e.salario,
            'Fecha Ingreso': fmtDate(e.fechaIngreso),
            'Jornada':       e.tipoJornada,
        })),
        'Empleados',
        'Personal'
    );

    const exportAsistenciaPDF = () => exportPDF(
        ['Empleado', 'Cargo', 'Presentes', 'Tardanzas', 'Ausentes', 'Permisos', 'Min. Extra'],
        data.asistenciaMes.map(a => [
            a.empleado,
            a.cargo,
            a.presentes,
            a.tardanzas,
            a.ausentes,
            a.permisos,
            a.minutosExtra,
        ]),
        'Reporte de Asistencia — Mes Actual',
        'Asistencia_Mes'
    );

    const exportAsistenciaExcel = () => exportExcel(
        data.asistenciaMes.map(a => ({
            'Empleado':    a.empleado,
            'Cargo':       a.cargo,
            'Presentes':   a.presentes,
            'Tardanzas':   a.tardanzas,
            'Ausentes':    a.ausentes,
            'Permisos':    a.permisos,
            'Min. Extra':  a.minutosExtra,
        })),
        'Asistencia',
        'Asistencia_Mes'
    );

    // ── Datos para gráfica de asistencia hoy ─────────────────
    const asistenciaHoyData = [
        { name: 'Presentes',  value: data.presentesHoy, fill: '#28a745' },
        { name: 'Tardanzas',  value: data.tardesHoy,    fill: '#ffc107' },
        { name: 'Ausentes',   value: data.ausentesHoy,  fill: '#dc3545' },
    ];

    return (
        <div className="container-fluid py-3">

            {/* ── Encabezado ─────────────────────────────────── */}
            <div className="d-flex justify-content-between align-items-center mb-4">
                <div>
                    <h4 className="mb-0 fw-bold text-dark">
                        <i className="bi bi-person-workspace me-2 text-success"></i>
                        Dashboard Personal
                    </h4>
                    <small className="text-muted">
                        Empleados activos, asistencia mensual y distribución por cargo
                    </small>
                </div>
                <span className="badge bg-success bg-opacity-20 text-success px-3 py-2 rounded-pill">
                    {new Date().toLocaleDateString('es-GT', { month: 'long', year: 'numeric' })}
                </span>
            </div>

            {/* ── KPIs ───────────────────────────────────────── */}
            <div className="row g-3 mb-4">
                <KpiCard
                    icon="bi-person-fill-check"
                    label="Empleados Activos"
                    value={data.empleadosActivos}
                    color="success"
                    sub={`${data.totalEmpleados} total · ${data.empleadosSuspendidos} suspendidos`}
                />
                <KpiCard
                    icon="bi-cash-coin"
                    label="Nómina Mensual"
                    value={fmtQ(data.totalNominaActual)}
                    color="primary"
                    sub="Empleados activos"
                />
                <KpiCard
                    icon="bi-clock-history"
                    label="Presentes Hoy"
                    value={data.presentesHoy}
                    color="info"
                    sub={`${data.tardesHoy} tardanzas · ${data.ausentesHoy} ausencias`}
                />
                <KpiCard
                    icon="bi-person-dash-fill"
                    label="Empleados de Baja"
                    value={data.empleadosBaja}
                    color="danger"
                    sub="Estado: BAJA"
                />
            </div>

            {/* ── Gráficas fila 1 ────────────────────────────── */}
            <div className="row g-3 mb-4">

                {/* Empleados por cargo */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-bar-chart me-2 text-success"></i>
                                Empleados por Cargo
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={data.distribucionPorCargo}
                                    layout="vertical"
                                    margin={{ left: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis type="number" tick={{ fontSize: 10 }} />
                                    <YAxis
                                        type="category"
                                        dataKey="cargo"
                                        width={130}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Tooltip />
                                    <Bar
                                        dataKey="total"
                                        name="Empleados"
                                        fill="#28a745"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Salario promedio por cargo */}
                <div className="col-lg-6">
                    <div className="card border-0 shadow-sm h-100">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-currency-dollar me-2 text-primary"></i>
                                Salario Promedio por Cargo
                            </h6>
                        </div>
                        <div className="card-body">
                            <ResponsiveContainer width="100%" height={250}>
                                <BarChart
                                    data={data.distribucionPorCargo}
                                    layout="vertical"
                                    margin={{ left: 10 }}
                                >
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                                    <XAxis
                                        type="number"
                                        tickFormatter={v => `Q${(v / 1000).toFixed(1)}k`}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <YAxis
                                        type="category"
                                        dataKey="cargo"
                                        width={130}
                                        tick={{ fontSize: 10 }}
                                    />
                                    <Tooltip formatter={v => fmtQ(v)} />
                                    <Bar
                                        dataKey="salarioPromedio"
                                        name="Salario Promedio"
                                        fill="#1e50a0"
                                        radius={[0, 4, 4, 0]}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Asistencia de Hoy ──────────────────────────── */}
            <div className="row g-3 mb-4">
                <div className="col-12">
                    <div className="card border-0 shadow-sm">
                        <div className="card-header bg-white border-0">
                            <h6 className="mb-0 fw-semibold">
                                <i className="bi bi-calendar-day me-2 text-info"></i>
                                Resumen de Asistencia — Hoy
                            </h6>
                        </div>
                        <div className="card-body">
                            <div className="row g-3">
                                {asistenciaHoyData.map((item, i) => {
                                    const total = data.empleadosActivos || 1;
                                    const pct   = ((item.value / total) * 100).toFixed(0);
                                    return (
                                        <div key={i} className="col-md-4">
                                            <div className="d-flex justify-content-between mb-1">
                                                <span className="fw-semibold" style={{ color: item.fill }}>
                                                    {item.name}
                                                </span>
                                                <strong>{item.value}</strong>
                                            </div>
                                            <div className="progress" style={{ height: 10, borderRadius: 6 }}>
                                                <div
                                                    className="progress-bar"
                                                    style={{
                                                        width:        `${pct}%`,
                                                        background:   item.fill,
                                                        borderRadius: 6,
                                                    }}
                                                />
                                            </div>
                                            <small className="text-muted">{pct}% del personal activo</small>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* ── Tabla asistencia mes actual ────────────────── */}
            <div className="card border-0 shadow-sm mb-4">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-calendar-check me-2 text-info"></i>
                        Resumen de Asistencia — Mes Actual
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportAsistenciaPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportAsistenciaExcel}
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
                                    <th>Empleado</th>
                                    <th>Cargo</th>
                                    <th className="text-center text-success">Presentes</th>
                                    <th className="text-center text-warning">Tardanzas</th>
                                    <th className="text-center text-danger">Ausentes</th>
                                    <th className="text-center">Permisos</th>
                                    <th className="text-center">Min. Extra</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.asistenciaMes.map((a, i) => (
                                    <tr key={i}>
                                        <td className="fw-semibold">{a.empleado}</td>
                                        <td className="text-muted">{a.cargo}</td>
                                        <td className="text-center text-success fw-semibold">
                                            {a.presentes}
                                        </td>
                                        <td className="text-center text-warning fw-semibold">
                                            {a.tardanzas}
                                        </td>
                                        <td className="text-center text-danger fw-semibold">
                                            {a.ausentes}
                                        </td>
                                        <td className="text-center">{a.permisos}</td>
                                        <td className="text-center">{a.minutosExtra}</td>
                                    </tr>
                                ))}
                                {data.asistenciaMes.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="text-center text-muted py-4">
                                            Sin registros de asistencia este mes
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* ── Tabla directorio de empleados ──────────────── */}
            <div className="card border-0 shadow-sm">
                <div className="card-header bg-white border-0 d-flex justify-content-between align-items-center">
                    <h6 className="mb-0 fw-semibold">
                        <i className="bi bi-person-lines-fill me-2 text-primary"></i>
                        Directorio de Empleados
                    </h6>
                    <div className="d-flex gap-2">
                        <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={exportDirectorioPDF}
                        >
                            <i className="bi bi-file-pdf me-1"></i>PDF
                        </button>
                        <button
                            className="btn btn-sm btn-outline-success"
                            onClick={exportDirectorioExcel}
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
                                    <th>Cargo</th>
                                    <th>Estado</th>
                                    <th>Salario</th>
                                    <th>Fecha Ingreso</th>
                                    <th>Jornada</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.empleadosDetalle.map((e, i) => (
                                    <tr key={i}>
                                        <td className="fw-semibold">{e.nombre}</td>
                                        <td>{e.cargo}</td>
                                        <td>
                                            <span className={`badge ${
                                                e.estado === 'ACTIVO'
                                                    ? 'bg-success'
                                                    : e.estado === 'SUSPENDIDO'
                                                        ? 'bg-warning text-dark'
                                                        : 'bg-danger'
                                            }`}>
                                                {e.estado}
                                            </span>
                                        </td>
                                        <td className="fw-semibold">{fmtQ(e.salario)}</td>
                                        <td>{fmtDate(e.fechaIngreso)}</td>
                                        <td>
                                            <span className="badge bg-secondary">
                                                {e.tipoJornada}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                                {data.empleadosDetalle.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            Sin empleados registrados
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