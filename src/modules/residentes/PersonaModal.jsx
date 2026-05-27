import { useState, useEffect } from 'react'
import { createPersona, updatePersona } from './personaService'

const TIPOS = ['PROPIETARIO','INQUILINO','EMPLEADO','VISITANTE','PROVEEDOR_CONTACTO']

export default function PersonaModal({ show, onClose, onSaved, persona }) {
  const [tipo,          setTipo]        = useState('RESIDENTE')
  const [nombres,       setNombres]     = useState('')
  const [apellidos,     setApellidos]   = useState('')
  const [dpi,           setDpi]         = useState('')
  const [pasaporte,     setPasaporte]   = useState('')
  const [fechaNac,      setFechaNac]    = useState('')
  const [telefPpal,     setTelefPpal]   = useState('')
  const [telefSec,      setTelefSec]    = useState('')
  const [email,         setEmail]       = useState('')
  const [nit,           setNit]         = useState('')
  const [activo,        setActivo]      = useState(1)
  const [observaciones, setObs]         = useState('')
  const [loading,       setLoading]     = useState(false)
  const [error,         setError]       = useState(null)

  useEffect(() => {
    if (persona) {
      setTipo(persona.tipo ?? 'RESIDENTE')
      setNombres(persona.nombres ?? '')
      setApellidos(persona.apellidos ?? '')
      setDpi(persona.dpi ?? '')
      setPasaporte(persona.pasaporte ?? '')
      setFechaNac(
        persona.fechaNacimiento
          ? new Date(persona.fechaNacimiento).toISOString().split('T')[0]
          : ''
      )
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
  if (!fechaNac)         return setError('La fecha de nacimiento es requerida')
  if (dpi.length !== 13) {
    return setError('El DPI debe tener exactamente 13 dígitos');
  }

  setLoading(true); setError(null)

  try {
    if (persona) {
      const payload = {
        Id_Persona:          persona.id,  //
        Tipo:                tipo,
        Nombres:             nombres,
        Apellidos:           apellidos,
        DPI:                 dpi || '',
        Pasaporte:           pasaporte || '',
        Fecha_Nacimiento: new Date(fechaNac).toISOString(),
        Id_Estado_Civil:     1,
        Nacionalidad:        1,
        Telefono_Principal:  telefPpal || '',
        Telefono_Secundario: telefSec  || '',
        Email:               email     || '',
        NIT:                 nit       || '',
        Id_Regimen_Fiscal:   1,
        Observaciones:       observaciones || '',
        Activo:              Number(activo),
      }
      console.log(payload);
      await updatePersona(persona.id, payload) 
      } else {
      const payload = {
        Tipo:                tipo,
        Nombres:             nombres,
        Apellidos:           apellidos,
        DPI:                 dpi || '',
        Pasaporte:           pasaporte || '',
        Fecha_Nacimiento: new Date(fechaNac).toISOString(),
        Id_Estado_Civil:     1,
        Nacionalidad:        1,
        Telefono_Principal:  telefPpal || '',
        Telefono_Secundario: telefSec  || '',
        Email:               email     || '',
        NIT:                 nit       || '',
        Id_Regimen_Fiscal:   1,
        Observaciones:       observaciones || '',
        Activo:              Number(activo),
      }
      await createPersona(payload)
    }
    onSaved()
  } catch (err) {
    setError(err.response?.data?.message ?? err.message)
  } finally {
    setLoading(false)
  }
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
                  <input 
                    className="form-control" 
                    value={nombres} 
                    onChange={e => {
                      let valor = e.target.value;

                      valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                      setNombres(valor);
                      //setNombres(e.target.value)
                    }} 
                    autoFocus 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Apellidos <span className="text-danger">*</span></label>
                  <input 
                    className="form-control" 
                    value={apellidos} 
                    onChange={e => {
                      let valor = e.target.value;

                      valor = valor.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑ\s]/g, '');
                      setApellidos(valor);
                      //setApellidos(e.target.value)
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">DPI</label>
                  <input 
                    className="form-control" 
                    placeholder="0000 00000 0000" 
                    value={dpi}
                    maxLength={13}
                    onChange={e => {
                      let valor = e.target.value.replace(/\D/g, '');

                      if (valor.length > 13) valor = valor.slice(0, 13);

                      if (valor.length > 4 && valor.length <= 9) {
                        valor = valor.replace(/^(\d{4})(\d+)/, '$1 $2');
                      } else if (valor.length > 9) {
                        valor = valor.replace(/^(\d{4})(\d{5})(\d+)/, '$1 $2 $3');
                      }

                      setDpi(valor);
                      //setDpi(e.target.value)
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Pasaporte</label>
                  <input 
                    className="form-control" 
                    value={pasaporte} 
                    onChange={e => {
                      let valor = e.target.value;

                      valor = valor.replace(/[^a-zA-Z0-9]/g, '');

                      setPasaporte(valor);
                      //setPasaporte(e.target.value);
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Nacimiento <span className="text-danger">*</span></label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={fechaNac}
                    max={new Date().toISOString().split('T')[0]}
                    onChange={e => {
                      setFechaNac(e.target.value);
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Teléfono Principal</label>
                  <input 
                    className="form-control" 
                    value={telefPpal} 
                    maxLength={8}
                    onChange={e => {
                      let valor = e.target.value;

                      valor = valor.replace(/\D/g, '');

                      setTelefPpal(valor);
                      //setTelefPpal(e.target.value)
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Teléfono Secundario</label>
                  <input 
                    className="form-control" 
                    value={telefSec} 
                    onChange={e => {
                      let valor = e.target.value;

                      valor = valor.replace(/\D/g, '');

                      setTelefSec(valor);
                      //setTelefSec(e.target.value)
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Email</label>
                  <input 
                    type="email" 
                    className="form-control" 
                    value={email} 
                    onChange={e => {
                      let valor = e.target.value;

                      valor = valor.replace(/\s/g, '').toLowerCase();

                      setEmail(valor);
                      //setEmail(e.target.value)
                    }} 
                  />
                </div>
                <div className="col-md-4">
                  <label className="form-label fw-semibold">NIT</label>
                  <input 
                    className="form-control" 
                    maxLength={12}
                    value={nit} 
                    onChange={e => {
                      let valor = e.target.value;

                      valor = valor.replace(/\D/g, '');

                      setNit(valor);
                      //setNit(e.target.value)
                    }} 
                  />
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
                {loading
                  ? <><span className="spinner-border spinner-border-sm me-2" />Guardando...</>
                  : persona ? 'Guardar cambios' : 'Crear'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}