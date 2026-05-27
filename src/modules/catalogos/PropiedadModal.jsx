import { useState, useEffect } from 'react'
import { createPropiedad, updatePropiedad } from './propiedadService'
import FkSelector from '../../components/FkSelector'
import { getTipoPropiedades } from '../catalogos/tipoPropiedadService'

const ESTADOS = ['DISPONIBLE','ALQUILADA','VENDIDA','EN_MANTENIMIENTO']

export default function PropiedadModal({ show, onClose, onSaved, propiedad }) {
  const [idTipoPropiedad,  setIdTipo]      = useState('')
  const [codigo,           setCodigo]      = useState('')
  const [nivel,            setNivel]       = useState('')
  const [areaM2,           setAreaM2]      = useState('')
  const [numHabitaciones,  setNumHab]      = useState('')
  const [numParqueos,      setNumParq]     = useState('')
  const [estado,           setEstado]      = useState('DISPONIBLE')
  //const [descripcion,      setDescripcion] = useState('')
  const [loading,          setLoading]     = useState(false)
  const [error,            setError]       = useState(null)
  const [labelTipo, setLabelTipo] = useState('')


  useEffect(() => {
    if (propiedad) {
      setIdTipo(propiedad.id_tipo_propiedad ?? '')
      setCodigo(propiedad.codigo ?? '')
      setNivel(propiedad.nivel ?? '')
      setAreaM2(propiedad.area_m2 ?? '')
      setNumHab(propiedad.num_habitaciones ?? '')
      setNumParq(propiedad.num_parqueos ?? '')
      setEstado(propiedad.estado ?? 'DISPONIBLE')
      //setDescripcion(propiedad.descripcion ?? '')
      setLabelTipo('')
    } else {
      setIdTipo(''); 
      setCodigo(''); 
      setNivel(''); 
      setAreaM2('')
      setNumHab(''); 
      setNumParq(''); 
      setEstado('DISPONIBLE'); 
      //setDescripcion('')
      setLabelTipo('')
    }
    setError(null)
  }, [propiedad, show])

  const handleSubmit = async () => {
    if (!codigo.trim()) return setError('El código es requerido')
    if (!estado)        return setError('El estado es requerido')
    if (!areaM2)        return setError('El area es requerida')
    if (!numParqueos)   return setError('El numero de parqueos es requerido')
    setLoading(true); setError(null)

    try {
      const payload = {
        id: propiedad ? propiedad.id_propiedad : 0,
        id_tipo_propiedad: Number(idTipoPropiedad),
        codigo, nivel: Number(nivel),
        area_m2: Number(areaM2),
        num_habitaciones: Number(numHabitaciones),
        num_parqueos: Number(numParqueos),
        estado
      }
      console.log(payload);
      propiedad ? await updatePropiedad(propiedad.id_propiedad, payload) : await createPropiedad(payload)
      onSaved()
    } catch (err) { 
      setError(err.message) 
    }
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
              <h5 className="modal-title">{propiedad ? '✏️ Editar Propiedad' : '🏡 Nueva Propiedad'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-6">
                  <FkSelector
                    label="Tipo Propiedad"
                    fetchFn={getTipoPropiedades}
                    getId={t => t.id_tipo_propiedad ?? t.id}
                    getLabel={t => t.nombre ?? t.descripcion ?? `#${t.id_tipo_propiedad ?? t.id}`}
                    value={idTipoPropiedad}
                    displayValue={labelTipo}
                    onChange={(id, lbl) => { setIdTipo(id); setLabelTipo(lbl) }}
                    placeholder="Selecciona tipo..."
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Código <span className="text-danger">*</span></label>
                  <input 
                    className="form-control" 
                    placeholder="Ej. APT-101" 
                    value={codigo} 
                    onChange={e => {
                      const valor = e.target.value;

                      if(/^[a-zA-Z0-9-]*$/.test(valor)){
                        setCodigo(e.target.value);
                      }
                    }} 
                    autoFocus 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Nivel</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="1" 
                    value={nivel} 
                    onChange={e => {
                      const valor = e.target.value;
                      
                      if(valor > 0){
                        setNivel(e.target.value);
                      }
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Área (m²)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    className="form-control" 
                    placeholder="1.00" 
                    value={areaM2} 
                    onChange={e => {
                      const valor = e.target.value;
                      
                      if(Number(valor) > 0){
                        setAreaM2(e.target.value);
                      }
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado <span className="text-danger">*</span></label>
                  <select className="form-select" value={estado} onChange={e => setEstado(e.target.value)}>
                    {ESTADOS.map(e => <option key={e} value={e}>{e}</option>)}
                  </select>
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Núm. Habitaciones</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="1" 
                    value={numHabitaciones} 
                    onChange={e => {
                      const valor = e.target.value;
                      
                      if(valor > 0){
                        setNumHab(e.target.value);
                      }
                    }} 
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Núm. Parqueos</label>
                  <input 
                    type="number" 
                    className="form-control" 
                    placeholder="0" 
                    value={numParqueos} 
                    onChange={e => {
                      const valor = e.target.value;
                      
                      if(valor >= 0){
                        setNumParq(e.target.value);
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-danger" onClick={onClose} disabled={loading}>X</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : propiedad ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}