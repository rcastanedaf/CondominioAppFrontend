import { useState, useEffect } from 'react'
import { createTipoServicio, updateTipoServicio } from './tipoServicioService'

export default function TipoServicioModal({ show, onClose, onSaved, tipoServicio }) {
  const [nombre,           setNombre]      = useState('')
  const [descripcion,      setDesc]        = useState('')
  const [idUnidadMedida,   setUnidad]      = useState('')
  const [periodicidad,     setPeriod]      = useState('')
  const [montoBase,        setMonto]       = useState('')
  const [aplicaIva,        setIva]         = useState(0)
  const [aplicaMora,       setMora]        = useState(0)
  const [porcentajeMora,   setPctMora]     = useState('')
  const [diasGracia,       setDias]        = useState('')
  const [cuentaContable,   setCuenta]      = useState('')
  const [activo,           setActivo]      = useState(1)
  const [loading,          setLoading]     = useState(false)
  const [error,            setError]       = useState(null)

  useEffect(() => {
    if (tipoServicio) {
      setNombre(tipoServicio.nombre ?? '')
      setDesc(tipoServicio.descripcion ?? '')
      setUnidad(tipoServicio.idUnidadMedida ?? '')
      setPeriod(tipoServicio.periodicidad ?? '')
      setMonto(tipoServicio.montoBase ?? '')
      setIva(tipoServicio.aplicaIva ?? 0)
      setMora(tipoServicio.aplicaMora ?? 0)
      setPctMora(tipoServicio.porcentajeMora ?? '')
      setDias(tipoServicio.diasGracia ?? '')
      setCuenta(tipoServicio.cuentaContable ?? '')
      setActivo(tipoServicio.activo ?? 1)
    } else {
      setNombre(''); setDesc(''); setUnidad(''); setPeriod(''); setMonto('')
      setIva(0); setMora(0); setPctMora(''); setDias(''); setCuenta(''); setActivo(1)
    }
    setError(null)
  }, [tipoServicio, show])

  const handleSubmit = async () => {
    if (!nombre.trim()) return setError('El nombre es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        idTipoServicio: tipoServicio ? tipoServicio.idTipoServicio : 0,
        nombre, descripcion, idUnidadMedida: Number(idUnidadMedida) || null,
        periodicidad, montoBase: Number(montoBase) || null,
        aplicaIva: Number(aplicaIva), aplicaMora: Number(aplicaMora),
        porcentajeMora: Number(porcentajeMora) || null,
        diasGracia: Number(diasGracia) || null, cuentaContable, activo: Number(activo),
      }
      tipoServicio ? await updateTipoServicio(payload) : await createTipoServicio(payload)
      onSaved()
    } catch (err) { setError(err.message) }
    finally { setLoading(false) }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{tipoServicio ? '✏️ Editar Tipo Servicio' : '🛠️ Nuevo Tipo Servicio'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-8">
                  <label className="form-label fw-semibold">Nombre <span className="text-danger">*</span></label>
                  <input className="form-control" value={nombre} onChange={e => setNombre(e.target.value)} autoFocus />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Periodicidad</label>
                  <select className="form-select" value={periodicidad} onChange={e => setPeriod(e.target.value)}>
                    <option value="">Seleccionar...</option>
                    {['MENSUAL','BIMESTRAL','TRIMESTRAL','SEMESTRAL','ANUAL','UNICO'].map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Monto Base</label>
                  <div className="input-group">
                    <span className="input-group-text">Q</span>
                    <input type="number" step="0.01" className="form-control" value={montoBase} onChange={e => setMonto(e.target.value)} />
                  </div>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Días Gracia</label>
                  <input type="number" className="form-control" value={diasGracia} onChange={e => setDias(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Cuenta Contable</label>
                  <input className="form-control" value={cuentaContable} onChange={e => setCuenta(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Aplica IVA</label>
                  <select className="form-select" value={aplicaIva} onChange={e => setIva(e.target.value)}>
                    <option value={1}>Sí</option><option value={0}>No</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Aplica Mora</label>
                  <select className="form-select" value={aplicaMora} onChange={e => setMora(e.target.value)}>
                    <option value={1}>Sí</option><option value={0}>No</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">% Mora</label>
                  <input type="number" step="0.01" className="form-control" value={porcentajeMora} onChange={e => setPctMora(e.target.value)} />
                </div>
                <div className="col-md-3">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={activo} onChange={e => setActivo(e.target.value)}>
                    <option value={1}>Activo</option><option value={0}>Inactivo</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Descripción</label>
                  <textarea className="form-control" rows={2} value={descripcion} onChange={e => setDesc(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : tipoServicio ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}