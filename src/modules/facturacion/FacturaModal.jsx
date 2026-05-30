import { useState, useEffect } from 'react'
import { createFactura, updateFactura, getNextCorrelative } from './facturacionService'
import FkSelector from '../../components/FkSelector'
import { getPropiedades } from '../catalogos/propiedadService'
import { getResidentes } from '../residentes/residenteService'
import { getPersonas } from '../residentes/personaService'
import { getTipoMonedas } from '../catalogos/tipoMonedaService'
import { getCiclos } from './cicloFacturacionService'
import { getContratos } from '../contratos/contratoService'

import { getTipoServicios } from './tipoServicioService'

const ESTADOS = ['BORRADOR', 'PENDIENTE', 'PAGADA', 'PARCIALMENTE_PAGADA', 'ANULADA', 'EN_MORA', 'CASTIGADA']

export default function FacturaModal({ show, onClose, onSaved, factura }) {

  const [idTipoDocFiscal,       setIdTipoDoc]       = useState('')
  const [idCorrelativo,         setIdCorrel]         = useState('')
  const [serie,                 setSerie]            = useState('')
  const [numeroFactura,         setNumFact]          = useState('')
  const [numeroAutorizacionSat, setNumSat]           = useState('')
  const [idPropiedad,           setIdProp]           = useState('')
  const [labelPropiedad,        setLabelProp]        = useState('')
  const [idResidente,           setIdRes]            = useState('')
  const [labelResidente,        setLabelRes]         = useState('')
  const [personaId,             setPersonaId]        = useState('')
  const [residentePropId,       setResidentePropId]  = useState(null)
  const [allResidentes,         setAllResidentes]    = useState([])
  const [receptorNombre,        setRecNombre]        = useState('')
  const [receptorNit,           setRecNit]           = useState('')
  const [receptorDireccion,     setRecDir]           = useState('')
  const [fechaEmision,          setFechaEmis]        = useState('')
  const [fechaVencimiento,      setFechaVenc]        = useState('')
  const [periodoInicio,         setPeriodoIn]        = useState('')
  const [periodoFin,            setPeriodoFin]       = useState('')
  const [idMoneda,              setIdMoneda]         = useState('')
  const [labelMoneda,           setLabelMoneda]      = useState('')
  const [tipoCambio,            setTipoCambio]       = useState('')
  const [subtotal,              setSubtotal]         = useState('')
  const [totalDescuentos,       setTotalDesc]        = useState('0')
  const [baseImponible,         setBaseImp]          = useState('')
  const [totalIva,              setTotalIva]         = useState('')
  const [total,                 setTotal]            = useState('')
  const [totalEnLetras,         setTotalLetras]      = useState('')
  const [saldoPendiente,        setSaldoPend]        = useState('')
  const [estado,                setEstado]           = useState('PENDIENTE')
  const [idCicloOrigen,         setIdCiclo]          = useState('')
  const [labelCiclo,            setLabelCiclo]       = useState('')
  const [idContratoOrigen,      setIdContrato]       = useState('')
  const [labelContrato,         setLabelContrato]    = useState('')
  const [motivoAnulacion,       setMotivo]           = useState('')
  const [observaciones,         setObs]              = useState('')
  const [loading,               setLoading]          = useState(false)
  const [error,                 setError]            = useState(null)

  // Carga todos los residentes enriquecidos una vez (fuente de verdad para persona→residente)
  useEffect(() => {
    Promise.all([getResidentes(), getPersonas()])
      .then(([resRes, perRes]) => {
        const res = resRes.data?.data ?? []
        const per = perRes.data?.data ?? []
        const perMap = new Map(per.map(p => [p.id_Persona, p]))
        setAllResidentes(res
          .filter(r => r.activo === 1 || r.Activo === 1)
          .map(r => ({
            ...r,
            nombres:   perMap.get(r.id_Persona)?.nombres   ?? '',
            apellidos: perMap.get(r.id_Persona)?.apellidos ?? '',
          }))
        )
      })
      .catch(() => {})
  }, [])

  // Al editar, resuelve el personaId desde el idResidente de la factura
  useEffect(() => {
    if (!show || !factura || !allResidentes.length || personaId) return
    const found = allResidentes.find(r => r.id_Residente === Number(factura.idResidente))
    if (found) setPersonaId(found.id_Persona)
  }, [show, factura, allResidentes]) // eslint-disable-line

  useEffect(() => {
    if (!show) return
    if (factura) {
      setIdTipoDoc(factura.idTipoDocFiscal   ?? '')
      setIdCorrel(factura.idCorrelativo      ?? '')
      setSerie(factura.serie                 ?? '')
      setNumFact(factura.numeroFactura       ?? '')
      setNumSat(factura.numeroAutorizacionSat ?? '')
      setIdProp(factura.idPropiedad          ?? ''); setLabelProp('')
      setIdRes(factura.idResidente           ?? ''); setLabelRes('')
      setResidentePropId(factura.idPropiedad ?? null)
      setRecNombre(factura.receptorNombre    ?? '')
      setRecNit(factura.receptorNit          ?? '')
      setRecDir(factura.receptorDireccion    ?? '')
      setFechaEmis(factura.fechaEmision      ? factura.fechaEmision.substring(0, 10) : '')
      setFechaVenc(factura.fechaVencimiento  ? factura.fechaVencimiento.substring(0, 10) : '')
      setPeriodoIn(factura.periodoInicio     ? factura.periodoInicio.substring(0, 10) : '')
      setPeriodoFin(factura.periodoFin       ? factura.periodoFin.substring(0, 10) : '')
      setIdMoneda(factura.idMoneda           ?? ''); setLabelMoneda('')
      setTipoCambio(factura.tipoCambio       ?? '')
      setSubtotal(factura.subtotal           ?? '')
      setTotalDesc(factura.totalDescuentos   ?? '0')
      setBaseImp(factura.baseImponible       ?? '')
      setTotalIva(factura.totalIva           ?? '')
      setTotal(factura.total                 ?? '')
      setTotalLetras(factura.totalEnLetras   ?? '')
      setSaldoPend(factura.saldoPendiente    ?? '')
      setEstado(factura.estado              ?? 'PENDIENTE')
      setIdCiclo(factura.idCicloOrigen      ?? ''); setLabelCiclo('')
      setIdContrato(factura.idContratoOrigen ?? ''); setLabelContrato('')
      setMotivo(factura.motivoAnulacion     ?? '')
      setObs(factura.observaciones          ?? '')
    } else {
      // Nueva factura: obtener el siguiente correlativo
      setIdTipoDoc(''); setSerie(''); setNumFact('')
      setNumSat(''); setIdProp(''); setLabelProp(''); setIdRes(''); setLabelRes(''); setPersonaId(''); setResidentePropId(null)
      setRecNombre(''); setRecNit(''); setRecDir('')
      setFechaEmis(''); setFechaVenc(''); setPeriodoIn(''); setPeriodoFin('')
      setIdMoneda(''); setLabelMoneda(''); setTipoCambio('')
      setSubtotal(''); setTotalDesc('0'); setBaseImp(''); setTotalIva('')
      setTotal(''); setTotalLetras(''); setSaldoPend(''); setEstado('PENDIENTE')
      setIdCiclo(''); setLabelCiclo(''); setIdContrato(''); setLabelContrato('')
      setMotivo(''); setObs('')
      
      // Obtener el siguiente correlativo automáticamente
      getNextCorrelative()
        .then(res => setIdCorrel(res.data?.nextCorrelative ?? ''))
        .catch(() => setIdCorrel(''))
    }
    setError(null)
  }, [show]) // eslint-disable-line

  const camposFaltantes = [
    !personaId                                && 'Residente',
    !idPropiedad                              && 'Propiedad',
    !idCorrelativo                            && 'Correlativo',
    !receptorNombre?.trim()                   && 'Nombre receptor',
    !receptorNit?.trim()                      && 'NIT',
    !fechaEmision                             && 'Fecha emisión',
    !fechaVencimiento                         && 'Fecha vencimiento',
  ].filter(Boolean)

  const handleSubmit = async () => {
    setLoading(true); setError(null)
    try {
      const payload = {
        idFactura:             factura ? (factura.idFactura ?? 0) : 0,
        idTipoDocFiscal:       Number(idTipoDocFiscal) || null,
        idCorrelativo:         Number(idCorrelativo)   || null,
        serie, numeroFactura, numeroAutorizacionSat,
        idPropiedad:           Number(idPropiedad)     || null,
        idResidente:           Number(idResidente)     || null,
        receptorNombre, receptorNit, receptorDireccion,
        fechaEmision, fechaVencimiento,
        periodoInicio:         periodoInicio  || null,
        periodoFin:            periodoFin     || null,
        idMoneda:              Number(idMoneda)        || null,
        tipoCambio:            Number(tipoCambio)      || null,
        subtotal:              Number(subtotal)        || 0,
        totalDescuentos:       Number(totalDescuentos) || 0,
        baseImponible:         Number(baseImponible)   || 0,
        totalIva:              Number(totalIva)        || 0,
        totalOtrosImpuestos:   0,
        total:                 Number(total)           || 0,
        totalEnLetras, saldoPendiente: Number(saldoPendiente) || 0,
        estado,
        idCicloOrigen:         Number(idCicloOrigen)   || null,
        idContratoOrigen:      Number(idContratoOrigen) || null,
        motivoAnulacion, observaciones,
      }
      factura ? await updateFactura(payload) : await createFactura(payload)
      onSaved()
    } catch (err) {
      setError(err.response?.data?.message ?? err.message)
    } finally { setLoading(false) }
  }

  const getDataCicloFactura = async () => {
    try {
      const cicloResponse = await getCiclos();
      const propiedadResponse = await getPropiedades();
      const tipoServResponse = await getTipoServicios();

      // ESTRUCTURAS REALES
      const ciclos = cicloResponse.data ?? [];

      const propiedades = propiedadResponse.data.data ?? [];

      const tiposServicio = tipoServResponse.data ?? [];

      // MAPA PROPIEDADES
      const propiedadesMap = new Map(
        propiedades.map(p => [
          p.id_propiedad,
          p
        ])
      );

      // MAPA SERVICIOS
      const tiposServicioMap = new Map(
        tiposServicio.map(ts => [
          ts.idTipoServicio,
          ts
        ])
      );

      // COMBINAR
      const resultado = ciclos.map(c => {

        const propiedad = propiedadesMap.get(c.idPropiedad);

        const tipoServicio = tiposServicioMap.get(c.idTipoServicio);

        return {
          ...c,

          codigoPropiedad:
            propiedad?.codigo ?? '',

          nombreServicio:
            tipoServicio?.nombre ?? '',

          label:
            `${propiedad?.codigo ?? 'SIN-PROP'} - ${tipoServicio?.nombre ?? 'SIN-SERVICIO'}`
        };
      });

      return {
        data: {
          data: resultado
        }
      };

    } catch (error) {

      console.error(error);

      return {
        data: {
          data: []
        }
      };
    }
  };

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-xl">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">
                {factura ? '✏️ Editar Factura' : '🧾 Nueva Factura'}
              </h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {camposFaltantes.length > 0 && (
                <div className="alert alert-danger py-2 mb-3 d-flex align-items-start gap-2">
                  <i className="bi bi-exclamation-circle-fill mt-1" style={{ flexShrink: 0 }} />
                  <div><strong>Campos requeridos:</strong> {camposFaltantes.join(', ')}</div>
                </div>
              )}
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />{error}
                </div>
              )}

              {/* ── Datos fiscales ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-file-earmark-text me-1" />DATOS FISCALES
              </p>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>ID Tipo Doc. Fiscal</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idTipoDocFiscal} onChange={e => setIdTipoDoc(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>ID Correlativo</label>
                  <input type="number" className="form-control form-control-sm"
                    value={idCorrelativo} onChange={e => setIdCorrel(e.target.value)} />
                </div>
                <div className="col-md-2">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Serie</label>
                  <input className="form-control form-control-sm" placeholder="Ej. A"
                    value={serie} onChange={e => setSerie(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Número Factura</label>
                  <input className="form-control form-control-sm" placeholder="Ej. 00000001"
                    value={numeroFactura} onChange={e => setNumFact(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>No. Autorización SAT</label>
                  <input className="form-control form-control-sm"
                    value={numeroAutorizacionSat} onChange={e => setNumSat(e.target.value)} />
                </div>
              </div>

              {/* ── Receptor ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-person me-1" />DATOS DEL RECEPTOR
              </p>
              <div className="row g-3 mb-4">
                {/* ✅ FK Residente — personas únicas que son residentes activos */}
                <div className="col-md-4">
                  <FkSelector
                    key={`res-${allResidentes.length}`}
                    label="Residente"
                    required
                    invalid={!personaId}
                    fetchFn={() => {
                      const seen = new Set()
                      const unique = allResidentes.filter(r => {
                        if (seen.has(r.id_Persona)) return false
                        seen.add(r.id_Persona)
                        return true
                      })
                      return Promise.resolve({ data: unique })
                    }}
                    getId={r => r.id_Persona}
                    getLabel={r => `${r.nombres} ${r.apellidos ?? ''}`.trim() || `Persona #${r.id_Persona}`}
                    value={personaId}
                    displayValue={labelResidente}
                    onChange={(id, lbl) => {
                      setPersonaId(id)
                      setLabelRes(lbl)
                      setIdRes('')
                      setResidentePropId(null)
                      setIdProp(''); setLabelProp('')
                      setIdContrato(''); setLabelContrato('')
                    }}
                    placeholder="Selecciona residente..."
                  />
                </div>
                {/* ✅ FK Propiedad — solo las propiedades del residente seleccionado */}
                <div className="col-md-4">
                  <FkSelector
                    key={`prop-${personaId ?? 'all'}`}
                    label="Propiedad"
                    required
                    invalid={!idPropiedad}
                    disabled={!personaId}
                    fetchFn={() =>
                      getPropiedades().then(res => {
                        const all = res.data?.data ?? res.data ?? []
                        const propIds = allResidentes
                          .filter(r => r.id_Persona === Number(personaId))
                          .map(r => r.id_Propiedad)
                        return { data: all.filter(p => propIds.includes(p.id_propiedad ?? p.idPropiedad)) }
                      })
                    }
                    getId={p => p.id_propiedad ?? p.idPropiedad ?? p.id}
                    getLabel={p => p.codigo ?? p.nombre ?? p.descripcion ?? `#${p.id_propiedad ?? p.idPropiedad ?? p.id}`}
                    value={idPropiedad}
                    displayValue={labelPropiedad}
                    onChange={(id, lbl) => {
                      setIdProp(id)
                      setLabelProp(lbl)
                      setResidentePropId(id)
                      const res = allResidentes.find(r =>
                        r.id_Persona === Number(personaId) &&
                        r.id_Propiedad === Number(id)
                      )
                      setIdRes(res?.id_Residente ?? '')
                      setIdContrato(''); setLabelContrato('')
                    }}
                    placeholder="Selecciona propiedad..."
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Nombre Receptor <span className="text-danger">*</span>
                  </label>
                  <input
                    className={`form-control form-control-sm${!receptorNombre?.trim() ? ' is-invalid' : ''}`}
                    placeholder="Nombre completo"
                    value={receptorNombre} onChange={e => setRecNombre(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    NIT <span className="text-danger">*</span>
                  </label>
                  <input
                    className={`form-control form-control-sm${!receptorNit?.trim() ? ' is-invalid' : ''}`}
                    placeholder="CF o NIT"
                    value={receptorNit} onChange={e => setRecNit(e.target.value)} />
                </div>
                <div className="col-md-8">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Dirección</label>
                  <input className="form-control form-control-sm" placeholder="Ciudad, Zona"
                    value={receptorDireccion} onChange={e => setRecDir(e.target.value)} />
                </div>
              </div>

              {/* ── Fechas ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-calendar me-1" />FECHAS Y PERÍODO
              </p>
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Fecha Emisión <span className="text-danger">*</span>
                  </label>
                  <input type="date"
                    className={`form-control form-control-sm${!fechaEmision ? ' is-invalid' : ''}`}
                    value={fechaEmision} onChange={e => setFechaEmis(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>
                    Fecha Vencimiento <span className="text-danger">*</span>
                  </label>
                  <input type="date"
                    className={`form-control form-control-sm${!fechaVencimiento ? ' is-invalid' : ''}`}
                    value={fechaVencimiento} onChange={e => setFechaVenc(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Período Inicio</label>
                  <input type="date" className="form-control form-control-sm"
                    value={periodoInicio} onChange={e => setPeriodoIn(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Período Fin</label>
                  <input type="date" className="form-control form-control-sm"
                    value={periodoFin} onChange={e => setPeriodoFin(e.target.value)} />
                </div>
              </div>

              {/* ── Montos ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-cash-stack me-1" />MONEDA Y MONTOS
              </p>
              <div className="row g-3 mb-4">
                {/* ✅ FK Moneda */}
                <div className="col-md-3">
                  <FkSelector
                    label="Moneda"
                    fetchFn={getTipoMonedas}
                    getId={m => m.idTipoMoneda ?? m.id}
                    getLabel={m => m.nombre ?? m.descripcion ?? m.codigo ?? `#${m.idTipoMoneda ?? m.id}`}
                    value={idMoneda}
                    displayValue={labelMoneda}
                    onChange={(id, lbl) => { setIdMoneda(id); setLabelMoneda(lbl) }}
                    placeholder="Selecciona moneda..."
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Tipo Cambio</label>
                  <input type="number" step="0.000001" className="form-control form-control-sm"
                    placeholder="1.000000" value={tipoCambio}
                    onChange={e => setTipoCambio(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Subtotal</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={subtotal} onChange={e => setSubtotal(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Total Descuentos</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={totalDescuentos} onChange={e => setTotalDesc(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Base Imponible</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={baseImponible} onChange={e => setBaseImp(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Total IVA</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={totalIva} onChange={e => setTotalIva(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Total</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={total} onChange={e => setTotal(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Saldo Pendiente</label>
                  <div className="input-group input-group-sm">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control"
                      value={saldoPendiente} onChange={e => setSaldoPend(e.target.value)} />
                  </div>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Total en Letras</label>
                  <input className="form-control form-control-sm"
                    value={totalEnLetras} onChange={e => setTotalLetras(e.target.value)} />
                </div>
              </div>

              {/* ── Estado y origen ── */}
              <p className="fw-semibold text-muted mb-2" style={{ fontSize: 12 }}>
                <i className="bi bi-gear me-1" />ESTADO Y ORIGEN
              </p>
              <div className="row g-3">
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Estado</label>
                  <select className="form-select form-select-sm"
                    value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                {/* ✅ FK Ciclo */}
                <div className="col-md-3">
                  <FkSelector
                    label="Ciclo de Facturación"
                    fetchFn={getDataCicloFactura}
                    getId={c => c.idCiclo ?? c.id}
                    getLabel={c =>
                      c.label ??
                      `${c.codigoPropiedad ?? ''} - ${c.nombreServicio ?? ''}`
                    }
                    value={idCicloOrigen}
                    displayValue={labelCiclo}
                    onChange={(id, lbl) => {
                      setIdCiclo(id);
                      setLabelCiclo(lbl);
                    }}
                    placeholder="Selecciona ciclo..."
                  />
                </div>
                {/* ✅ FK Contrato */}
                <div className="col-md-3">
                  <FkSelector
                    key={`contrato-${idResidente}-${idPropiedad}`}
                    label="Contrato Origen"
                    disabled={!idResidente || !idPropiedad}
                    fetchFn={() =>
                      getContratos().then(res => {
                        const all = Array.isArray(res.data) ? res.data : res.data?.data ?? []
                        return {
                          data: all.filter(c =>
                            c.id_propiedad === Number(idPropiedad) &&
                            c.id_residente === Number(idResidente)
                          )
                        }
                      })
                    }
                    getId={c => c.id_contrato}
                    getLabel={c =>
                      `${c.tipo_contrato ?? 'Contrato'} — ${c.fecha_inicio?.substring(0, 10) ?? ''} / ${c.fecha_fin?.substring(0, 10) ?? ''}`
                    }
                    value={idContratoOrigen}
                    displayValue={labelContrato}
                    onChange={(id, lbl) => { setIdContrato(id); setLabelContrato(lbl) }}
                    placeholder="Selecciona contrato..."
                  />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Motivo Anulación</label>
                  <input className="form-control form-control-sm" placeholder="Solo si aplica"
                    value={motivoAnulacion} onChange={e => setMotivo(e.target.value)} />
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold" style={{ fontSize: 13 }}>Observaciones</label>
                  <textarea className="form-control form-control-sm" rows={2}
                    value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading || camposFaltantes.length > 0}>
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : factura ? 'Guardar cambios' : 'Crear Factura'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}