import { useEffect, useState, useCallback } from 'react'
import { getDashboard } from './dashboardService'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts'
import * as XLSX from 'xlsx'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

const COLORS = ['#0d6efd','#198754','#dc3545','#fd7e14','#6f42c1','#0dcaf0']

const fmt = (n) =>
  new Intl.NumberFormat('es-GT', { style: 'currency', currency: 'GTQ' }).format(n ?? 0)

// ── Tarjeta KPI ────────────────────────────────────────────────────────────────
function KpiCard({ title, value, sub, icon, color, prefix = '' }) {
  return (
    <div className="col-6 col-md-4 col-xl-3">
      <div className="card border-0 shadow-sm h-100">
        <div className="card-body d-flex align-items-center gap-3">
          <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
            style={{ width: 52, height: 52, background: color + '20' }}>
            <i className={`bi ${icon} fs-4`} style={{ color }} />
          </div>
          <div className="overflow-hidden">
            <p className="mb-0 text-muted small text-truncate">{title}</p>
            <h4 className="mb-0 fw-bold">{prefix}{value}</h4>
            {sub && <small className="text-muted">{sub}</small>}
          </div>
        </div>
      </div>
    </div>
  )
}

// ── Botones de exportación ─────────────────────────────────────────────────────
function ExportButtons({ onExcelAll, onPdfAll }) {
  return (
    <div className="d-flex gap-2">
      <button className="btn btn-sm btn-success d-flex align-items-center gap-1" onClick={onExcelAll}>
        <i className="bi bi-file-earmark-excel" /> Excel
      </button>
      <button className="btn btn-sm btn-danger d-flex align-items-center gap-1" onClick={onPdfAll}>
        <i className="bi bi-file-earmark-pdf" /> PDF
      </button>
    </div>
  )
}

// ── Dashboard principal ────────────────────────────────────────────────────────
export default function Dashboard() {
  const [data, setData]       = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState(null)
  const [lastUpdate, setLastUpdate] = useState(null)

  const cargar = useCallback(() => {
    setLoading(true)
    setError(null)
    getDashboard()
      .then(res => {
        setData(res.data)
        setLastUpdate(new Date())
      })
      .catch(() => setError('No se pudo conectar con el servidor.'))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => { cargar() }, [cargar])

  // ── Exportar a Excel ─────────────────────────────────────────────────────────
  const exportarExcel = () => {
    if (!data) return
    const wb = XLSX.utils.book_new()

    // Hoja 1: KPIs generales
    const kpis = [
      ['Indicador', 'Valor'],
      ['Total Residentes',        data.totalResidentes],
      ['Residentes Activos',      data.residentesActivos],
      ['Residentes Inactivos',    data.residentesInactivos],
      ['Cobrado este Mes (GTQ)',   data.totalCobradoMes],
      ['Pendiente de Cobro (GTQ)',data.totalPendienteCobro],
      ['Mora Total (GTQ)',         data.totalMora],
      ['Facturas Pendientes',     data.facturasPendientes],
      ['Facturas Vencidas',       data.facturasVencidas],
      ['Incidencias Abiertas',    data.incidenciasAbiertas],
      ['Incidencias En Proceso',  data.incidenciasEnProceso],
      ['Incidencias Cerradas (mes)', data.incidenciasCerradasMes],
      ['Accesos Hoy',             data.accesosHoy],
      ['Visitas Hoy',             data.visitasHoy],
      ['Reservas Hoy',            data.reservasHoy],
      ['Espacios Disponibles',    data.espaciosDisponibles],
      ['Total Empleados',         data.totalEmpleados],
      ['Empleados Activos',       data.empleadosActivos],
      ['Multas Pendientes',       data.multasPendientes],
      ['Monto Multas Pendientes (GTQ)', data.montoMultasPendientes],
    ]
    XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(kpis), 'Resumen KPIs')

    // Hoja 2: Pagos por mes
    if (data.pagosPorMes?.length) {
      const pagoRows = [['Mes', 'Total (GTQ)'],
        ...data.pagosPorMes.map(p => [p.mes, p.total])]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(pagoRows), 'Pagos por Mes')
    }

    // Hoja 3: Incidencias por categoría
    if (data.incidenciasPorCategoria?.length) {
      const incRows = [['Categoría', 'Total'],
        ...data.incidenciasPorCategoria.map(i => [i.categoria, i.total])]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(incRows), 'Incidencias')
    }

    // Hoja 4: Top morosos
    if (data.topMorosos?.length) {
      const morRows = [['Residente', 'Monto Pendiente (GTQ)', 'Días de Atraso'],
        ...data.topMorosos.map(m => [m.residente, m.montoPendiente, m.diasAtraso])]
      XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(morRows), 'Top Morosos')
    }

    XLSX.writeFile(wb, `Dashboard_${new Date().toISOString().slice(0,10)}.xlsx`)
  }

  // ── Exportar a PDF ───────────────────────────────────────────────────────────
  const exportarPdf = () => {
    if (!data) return
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

    doc.setFontSize(16)
    doc.setTextColor(40)
    doc.text('Dashboard — Sistema de Administración de Condominios', 14, 18)
    doc.setFontSize(9)
    doc.setTextColor(120)
    doc.text(`Generado: ${new Date().toLocaleString('es-GT')}`, 14, 25)

    // KPIs
    autoTable(doc, {
      startY: 30,
      head: [['Indicador', 'Valor']],
      body: [
        ['Total Residentes',           data.totalResidentes],
        ['Residentes Activos',         data.residentesActivos],
        ['Cobrado este Mes',           fmt(data.totalCobradoMes)],
        ['Pendiente de Cobro',         fmt(data.totalPendienteCobro)],
        ['Mora Total',                 fmt(data.totalMora)],
        ['Facturas Pendientes',        data.facturasPendientes],
        ['Facturas Vencidas',          data.facturasVencidas],
        ['Incidencias Abiertas',       data.incidenciasAbiertas],
        ['Multas Pendientes',          data.multasPendientes],
        ['Monto Multas Pendientes',    fmt(data.montoMultasPendientes)],
        ['Accesos Hoy',                data.accesosHoy],
        ['Reservas Hoy',               data.reservasHoy],
        ['Empleados Activos',          data.empleadosActivos],
      ],
      styles: { fontSize: 9 },
      headStyles: { fillColor: [13, 110, 253] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
    })

    // Top morosos
    if (data.topMorosos?.length) {
      doc.addPage()
      doc.setFontSize(13)
      doc.setTextColor(40)
      doc.text('Top Morosos', 14, 18)
      autoTable(doc, {
        startY: 24,
        head: [['Residente', 'Monto Pendiente', 'Días de Atraso']],
        body: data.topMorosos.map(m => [m.residente, fmt(m.montoPendiente), m.diasAtraso]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [220, 53, 69] },
      })
    }

    // Pagos por mes
    if (data.pagosPorMes?.length) {
      doc.addPage()
      doc.setFontSize(13)
      doc.setTextColor(40)
      doc.text('Pagos por Mes (últimos 6 meses)', 14, 18)
      autoTable(doc, {
        startY: 24,
        head: [['Mes', 'Total Cobrado']],
        body: data.pagosPorMes.map(p => [p.mes, fmt(p.total)]),
        styles: { fontSize: 9 },
        headStyles: { fillColor: [25, 135, 84] },
      })
    }

    doc.save(`Dashboard_${new Date().toISOString().slice(0,10)}.pdf`)
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  if (loading) return (
    <div className="d-flex align-items-center justify-content-center" style={{ minHeight: 300 }}>
      <div className="spinner-border text-primary" />
      <span className="ms-3 text-muted">Cargando datos del dashboard...</span>
    </div>
  )

  if (error) return (
    <div className="alert alert-danger m-4 d-flex align-items-center gap-2">
      <i className="bi bi-exclamation-triangle-fill fs-5" />
      {error}
      <button className="btn btn-sm btn-outline-danger ms-auto" onClick={cargar}>Reintentar</button>
    </div>
  )

  return (
    <div className="p-3 p-md-4">

      {/* Encabezado */}
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-2 mb-4">
        <div>
          <h4 className="mb-0 fw-bold">Dashboard</h4>
          {lastUpdate && (
            <small className="text-muted">
              Actualizado: {lastUpdate.toLocaleTimeString('es-GT')}
            </small>
          )}
        </div>
        <div className="d-flex gap-2">
          <button className="btn btn-sm btn-outline-secondary d-flex align-items-center gap-1" onClick={cargar}>
            <i className="bi bi-arrow-clockwise" /> Actualizar
          </button>
          <ExportButtons onExcelAll={exportarExcel} onPdfAll={exportarPdf} />
        </div>
      </div>

      {/* KPIs Financieros */}
      <h6 className="text-muted text-uppercase fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: 1 }}>
        Financiero
      </h6>
      <div className="row g-3 mb-4">
        <KpiCard title="Cobrado este Mes"      value={fmt(data.totalCobradoMes)}      icon="bi-cash-stack"          color="#198754" />
        <KpiCard title="Pendiente de Cobro"    value={fmt(data.totalPendienteCobro)}   icon="bi-hourglass-split"     color="#fd7e14" />
        <KpiCard title="Mora Total"            value={fmt(data.totalMora)}             icon="bi-exclamation-circle"  color="#dc3545" />
        <KpiCard title="Facturas Pendientes"   value={data.facturasPendientes}         icon="bi-receipt"             color="#0d6efd" />
        <KpiCard title="Facturas Vencidas"     value={data.facturasVencidas}           icon="bi-receipt-cutoff"      color="#dc3545" />
        <KpiCard title="Multas Pendientes"     value={data.multasPendientes}           icon="bi-shield-x"            color="#6f42c1"
          sub={fmt(data.montoMultasPendientes)} />
      </div>

      {/* KPIs Operativos */}
      <h6 className="text-muted text-uppercase fw-semibold mb-2" style={{ fontSize: 11, letterSpacing: 1 }}>
        Operativo
      </h6>
      <div className="row g-3 mb-4">
        <KpiCard title="Residentes Activos"    value={data.residentesActivos}          icon="bi-people-fill"         color="#198754"
          sub={`${data.residentesInactivos} inactivos`} />
        <KpiCard title="Incidencias Abiertas"  value={data.incidenciasAbiertas}        icon="bi-exclamation-triangle" color="#fd7e14" />
        <KpiCard title="En Proceso"            value={data.incidenciasEnProceso}       icon="bi-gear-wide-connected"  color="#0dcaf0" />
        <KpiCard title="Accesos Hoy"           value={data.accesosHoy}                icon="bi-door-open"            color="#6f42c1" />
        <KpiCard title="Visitas Hoy"           value={data.visitasHoy}                icon="bi-person-check"         color="#0d6efd" />
        <KpiCard title="Reservas Hoy"          value={data.reservasHoy}               icon="bi-calendar-check"       color="#198754" />
        <KpiCard title="Espacios Disponibles"  value={data.espaciosDisponibles}        icon="bi-building"             color="#20c997" />
        <KpiCard title="Empleados Activos"     value={data.empleadosActivos}           icon="bi-person-badge"         color="#fd7e14"
          sub={`de ${data.totalEmpleados} totales`} />
      </div>

      {/* Gráficas */}
      <div className="row g-3 mb-4">

        {/* Pagos por mes */}
        <div className="col-12 col-lg-7">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-semibold">Pagos Cobrados — Últimos 6 Meses</h6>
                <button className="btn btn-sm btn-outline-success" onClick={() => exportarTablaExcel(
                  [['Mes','Total (GTQ)'], ...data.pagosPorMes.map(p=>[p.mes,p.total])],
                  'Pagos_por_Mes'
                )}>
                  <i className="bi bi-file-earmark-excel" />
                </button>
              </div>
              {data.pagosPorMes?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.pagosPorMes} margin={{ top: 0, right: 10, left: 10, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="mes"   tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={v => `Q${(v/1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => fmt(v)} />
                    <Bar dataKey="total" name="Total" fill="#198754" radius={[4,4,0,0]} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">Sin pagos registrados</div>
              )}
            </div>
          </div>
        </div>

        {/* Incidencias por categoría */}
        <div className="col-12 col-lg-5">
          <div className="card border-0 shadow-sm h-100">
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h6 className="mb-0 fw-semibold">Incidencias Activas por Categoría</h6>
                <button className="btn btn-sm btn-outline-success" onClick={() => exportarTablaExcel(
                  [['Categoría','Total'], ...data.incidenciasPorCategoria.map(i=>[i.categoria,i.total])],
                  'Incidencias_Categoria'
                )}>
                  <i className="bi bi-file-earmark-excel" />
                </button>
              </div>
              {data.incidenciasPorCategoria?.length ? (
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={data.incidenciasPorCategoria} dataKey="total" nameKey="categoria"
                      cx="50%" cy="50%" outerRadius={80} label={({ categoria, percent }) =>
                        `${categoria} ${(percent * 100).toFixed(0)}%`}>
                      {data.incidenciasPorCategoria.map((_, i) => (
                        <Cell key={i} fill={COLORS[i % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="text-center text-muted py-5">Sin incidencias activas</div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Top Morosos */}
      <div className="card border-0 shadow-sm mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <h6 className="mb-0 fw-semibold">
              <i className="bi bi-exclamation-triangle-fill text-danger me-2" />
              Top 5 Morosos
            </h6>
            <button className="btn btn-sm btn-outline-danger" onClick={() => exportarTablaExcel(
              [['Residente','Monto Pendiente (GTQ)','Días Atraso'],
               ...data.topMorosos.map(m=>[m.residente, m.montoPendiente, m.diasAtraso])],
              'Top_Morosos'
            )}>
              <i className="bi bi-file-earmark-excel" /> Exportar
            </button>
          </div>
          {data.topMorosos?.length ? (
            <div className="table-responsive">
              <table className="table table-sm table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>#</th>
                    <th>Residente</th>
                    <th className="text-end">Monto Pendiente</th>
                    <th className="text-end">Días de Atraso</th>
                  </tr>
                </thead>
                <tbody>
                  {data.topMorosos.map((m, i) => (
                    <tr key={i}>
                      <td><span className="badge bg-danger">{i + 1}</span></td>
                      <td>{m.residente}</td>
                      <td className="text-end fw-semibold text-danger">{fmt(m.montoPendiente)}</td>
                      <td className="text-end">
                        <span className={`badge ${m.diasAtraso > 30 ? 'bg-danger' : m.diasAtraso > 15 ? 'bg-warning text-dark' : 'bg-secondary'}`}>
                          {m.diasAtraso} días
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center text-muted py-3">
              <i className="bi bi-check-circle-fill text-success fs-4 d-block mb-1" />
              No hay morosos registrados
            </div>
          )}
        </div>
      </div>

    </div>
  )
}

// Helper exportar tabla individual a Excel
function exportarTablaExcel(rows, nombre) {
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet(rows), nombre)
  XLSX.writeFile(wb, `${nombre}_${new Date().toISOString().slice(0,10)}.xlsx`)
}