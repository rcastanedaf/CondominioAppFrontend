import { useState, useEffect } from 'react'
import { createTipoMoneda, updateTipoMoneda } from './tipoMonedaService'

export default function TipoMonedaModal({ show, onClose, onSaved, tipoMoneda }) {
  const [codigo,        setCodigo]        = useState('')
  const [nombre,        setNombre]        = useState('')
  const [simbolo,       setSimbolo]       = useState('')
  const [tipoCambioGtq, setTipoCambioGtq] = useState('')
  const [activo,        setActivo]        = useState(1)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState(null)

  useEffect(() => {
    if (tipoMoneda) {
      setCodigo(tipoMoneda.codigo)
      setNombre(tipoMoneda.nombre)
      setSimbolo(tipoMoneda.simbolo)
      setTipoCambioGtq(tipoMoneda.tipo_cambio_gtq)
      setActivo(tipoMoneda.activo)
    } else {
      setCodigo(''); setNombre(''); setSimbolo('')
      setTipoCambioGtq(''); setActivo(1)
    }
    setError(null)
  }, [tipoMoneda, show])

  const handleSubmit = async () => {
    if (!codigo.trim()) return setError('El código es requerido')
    if (!nombre.trim()) return setError('El nombre es requerido')
    if (!/^[A-Z]{3}$/.test(codigo.trim()))
      return setError('El código debe ser exactamente 3 letras mayúsculas (ej: USD, GTQ)')
    if (!tipoCambioGtq || Number(tipoCambioGtq) <= 0)
      return setError('El tipo de cambio debe ser mayor a 0')

    setLoading(true); setError(null)
    try {
      const payload = {
        id: tipoMoneda ? tipoMoneda.id : 0,
        codigo, nombre, simbolo,
        tipo_cambio_gtq: Number(tipoCambioGtq),
        activo: Number(activo)
      }
      tipoMoneda
        ? await updateTipoMoneda(tipoMoneda.id, payload)
        : await createTipoMoneda(payload)
      onSaved()
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  if (!show) return null
  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{tipoMoneda ? '✏️ Editar Tipo Moneda' : '🪙 Nuevo Tipo Moneda'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="mb-3">
                <label className="form-label fw-semibold">Código</label>
                <input type="text" className="form-control" placeholder="Ej. USD" value={codigo} onChange={e => setCodigo(e.target.value)} autoFocus />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Nombre</label>
                <input type="text" className="form-control" placeholder="Ej. Dólar estadounidense" value={nombre} onChange={e => setNombre(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Símbolo</label>
                <input type="text" className="form-control" placeholder="Ej. $" value={simbolo} onChange={e => setSimbolo(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Tipo de Cambio (GTQ)</label>
                <input type="number" className="form-control" placeholder="0.0000" step="0.0001" value={tipoCambioGtq} onChange={e => setTipoCambioGtq(e.target.value)} />
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Estado</label>
                <select className="form-select" value={activo} onChange={e => setActivo(e.target.value)}>
                  <option value={1}>Activo</option>
                  <option value={0}>Inactivo</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : tipoMoneda ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

