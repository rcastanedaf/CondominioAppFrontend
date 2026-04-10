import { useState, useEffect } from 'react'
import { createPersona, updatePersona } from './personaService'

const TIPOS = ['PROPIETARIO', 'RESIDENTE', 'ARRENDATARIO', 'FAMILIAR', 'EMPLEADO', 'OTRO']

export default function PersonaModal({ show, onClose, onSaved, persona }) {
  const [tipo,        setTipo]        = useState('RESIDENTE')
  const [nombres,     setNombres]     = useState('')
  const [apellidos,   setApellidos]   = useState('')
  const [dpi,         setDpi]         = useState('')
  const [pasaporte,   setPasaporte]   = useState('')
  const [fechaNac,    setFechaNac]    = useState('')
  const [telefPpal,   setTelefPpal]   = useState('')
  const [telefSec,    setTelefSec]    = useState('')
  const [email,       setEmail]       = useState('')
  const [nit,         setNit]         = useState('')
  const [activo,      setActivo]      = useState(1)
  const [observaciones, setObs]       = useState('')
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState(null)

  useEffect(() => {
    if (persona) {
      setTipo(persona.tipo ?? 'RESIDENTE')
      setNombres(persona.nombres ?? '')
      setApellidos(persona.apellidos ?? '')
      setDpi(persona.dpi ?? '')
      setPasaporte(persona.pasaporte ?? '')
      setFechaNac(persona.fechaNacimiento ? persona.fechaNacimiento.substring(0, 10) : '')
      setTelefPpal(persona.telefonoPrincipal ?? '')
      setTelefSec(persona.telefonoSecundario ?? '')
      setEmail(persona.email ?? '')
      setNit(persona.nit ?? '')
      setActivo(persona.activo ?? 1)
      setObs(persona.observaciones ?? '')
    } else {
      setTipo('RESIDENTE'); setNombres(''); setApellidos(''); setDpi('')
      setPasaporte(''); setFechaNac(''); setTelefPpal(''); setTelefSec('')
      setEmail(''); setNit(''); setActivo(1); setObs('')
    }
    setError(null)
  }, [persona, show])

  const handleSubmit = async () => {
    if (!nombres.trim())   return setError('El nombre es requerido')
    if (!apellidos.trim()) return setError('Los apellidos son requeridos')
    if (!tipo)             return setError('El tipo es requerido')
    setLoading(true); setError(null)
    try {
      const payload = {
        id: persona ? persona.id : 0,
        tipo, nombres, apellidos, dpi, pasaporte,
        fechaNacimiento: fechaNac || null,
        telefonoPrincipal: telefPpal, telefonoSecundario: telefSec,
        email, nit, activo: Number(activo), observaciones,
      }
      persona ? await updatePersona(persona.id, payload) : await createPersona(payload)
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
              <h5 className="modal-title">{persona ? '✏️ Editar Persona' : '🙋 Nueva Persona'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && <div className="alert alert-danger py-2 mb-3"><i className="bi bi-exclamation-circle me-2" />{error}</div>}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tipo <span className="text-danger">*</span></label>
                  <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                    {TIPOS.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Nombres <span className="text-danger">*</span></label>
                  <input className="form-control" value={nombres} onChange={e => setNombres(e.target.value)} autoFocus />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Apellidos <span className="text-danger">*</span></label>
                  <input className="form-control" value={apellidos} onChange={e => setApellidos(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">DPI</label>
                  <input className="form-control" placeholder="0000 00000 0000" value={dpi} onChange={e => setDpi(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Pasaporte</label>
                  <input className="form-control" value={pasaporte} onChange={e => setPasaporte(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Nacimiento</label>
                  <input type="date" className="form-control" value={fechaNac} onChange={e => setFechaNac(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Teléfono Principal</label>
                  <input className="form-control" value={telefPpal} onChange={e => setTelefPpal(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Teléfono Secundario</label>
                  <input className="form-control" value={telefSec} onChange={e => setTelefSec(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Email</label>
                  <input type="email" className="form-control" value={email} onChange={e => setEmail(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">NIT</label>
                  <input className="form-control" value={nit} onChange={e => setNit(e.target.value)} />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Estado</label>
                  <select className="form-select" value={activo} onChange={e => setActivo(e.target.value)}>
                    <option value={1}>Activo</option>
                    <option value={0}>Inactivo</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea className="form-control" rows={2} value={observaciones} onChange={e => setObs(e.target.value)} />
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>Cancelar</button>
              <button className="btn btn-primary" onClick={handleSubmit} disabled={loading}>
                {loading ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</> : persona ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}