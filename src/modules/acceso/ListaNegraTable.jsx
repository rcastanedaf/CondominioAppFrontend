import { useState, useEffect } from 'react'
import { getListaNegra, createListaNegra, updateListaNegra, desactivarListaNegra } from './listaNegraService'
import { getPersonas }    from '../residentes/personaService'
import FkSelector         from '../../components/FkSelector'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

export default function ListaNegraTable({ moduleColor }) {
  const [rows,      setRows]      = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [showModal, setShowModal] = useState(false)
  const [selected,  setSelected]  = useState(null)
  const [confirmId, setConfirmId] = useState(null)

  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  const fetchData = () => {
    setLoading(true)
    Promise.all([getListaNegra(), getPersonas()])
      .then(([lRes, perRes]) => {
        const lista   = Array.isArray(lRes.data.data)   ? lRes.data.data   : lRes.data?.data   ?? []
        const personas = Array.isArray(perRes.data.data) ? perRes.data.data : perRes.data?.data ?? []

        const enriched = lista.map(l => {
          const persona = personas.find(p =>
            (p.id_Persona ?? p.idPersona) === (l.id_Persona ?? l.idPersona))
          const nombrePersona = persona
            ? `${persona.nombres ?? ''} ${persona.apellidos ?? ''}`.trim()
            : null

          return { ...l, _nombrePersona: nombrePersona }
        })

        setRows(enriched)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  useEffect(() => { fetchData() }, [])

  const handleDesactivar = async (id) => {
    try { 
      await desactivarListaNegra(id)
      setConfirmId(null)
      fetchData()
    } catch (err) { 
      alert('Error: ' + err.message)
    }
  }

  if (loading) return <div className="text-center py-5 text-muted"><div className="spinner-border spinner-border-sm me-2" />Cargando lista negra...</div>
  if (error)   return <div className="alert alert-danger py-2"><i className="bi bi-exclamation-circle me-2" />{error}</div>

  return (
    <>
      <PaginacionFooter
        titulo="Lista Negra" icono="bi-slash-circle" labelBoton="Agregar a Lista Negra"
        onNuevo={() => { setSelected(null); setShowModal(true) }} moduleColor={moduleColor}
        filtro={filtro} setFiltro={setFiltro} placeholder="Filtrar por nombre, DPI, placa..."
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="registros"
      />
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Tipo</th>
              <th>Nombre</th>
              <th>Persona vinculada</th>
              <th>DPI</th>
              <th>Placa</th>
              <th>Motivo</th>
              <th>Válido hasta</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.length === 0 ? (
              <tr><td colSpan={10} className="text-center text-muted py-4"><i className="bi bi-inbox me-2" />Lista negra vacía</td></tr>
            ) : datosPagina.map((r, i) => (
              <tr key={r.id_Lista ?? i}>
                <td className="text-muted">{r.id_Lista}</td>
                <td><span className="badge text-bg-danger">{r.tipo}</span></td>
                <td className="fw-semibold">{r.nombres ?? '—'}</td>
                <td className="text-muted small">{r._nombrePersona ?? '—'}</td>
                <td className="text-muted small">{r.dpi ?? '—'}</td>
                <td className="text-muted small">{r.placa ?? '—'}</td>
                <td className="text-muted small" style={{ maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {r.motivo}
                </td>
                <td className="text-muted small">{r.fecha_Fin ?? r.fechaFin ?? 'Sin límite'}</td>
                <td>
                  <span className={`badge ${r.activo === 1 ? 'text-bg-danger' : 'text-bg-secondary'}`}>
                    {r.activo === 1 ? 'Bloqueado' : 'Desactivado'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    <button className="btn btn-sm btn-outline-primary py-0 px-2" onClick={() => { setSelected(r); setShowModal(true) }}>
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />Editar
                    </button>
                    {confirmId === r.id_Lista ? (
                      <>
                        <span className="text-warning small align-self-center">¿Desactivar?</span>
                        <button className="btn btn-sm btn-warning py-0 px-2" onClick={() => handleDesactivar(r.id_Lista)}>Sí</button>
                        <button className="btn btn-sm btn-outline-secondary py-0 px-2" onClick={() => setConfirmId(null)}>No</button>
                      </>
                    ) : (
                      <button className="btn btn-sm btn-outline-warning py-0 px-2" onClick={() => setConfirmId(r.id_Lista)}>
                        <i className="bi bi-x-circle me-1" style={{ fontSize: 11 }} />Desactivar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <PaginacionFooter
        paginaSegura={paginaSegura} totalPaginas={totalPaginas}
        porPagina={porPagina} setPorPagina={setPorPagina} irA={irA} paginas={paginas}
        totalDatos={datosFiltrados.length} label="registros" moduleColor={moduleColor}
      />
      {showModal && (
        <ListaNegraModal
          item={selected}
          onClose={() => setShowModal(false)}
          onSaved={() => { setShowModal(false); fetchData() }}
        />
      )}
    </>
  )
}

function ListaNegraModal({ item, onClose, onSaved }) {
  const [tipo,          setTipo]    = useState(item?.tipo ?? 'PERSONA')
  const [idPersona,     setIdPer]   = useState(item?.id_Persona ?? item?.idPersona ?? '')
  const [labelPersona,  setLabelPer]= useState('')
  const [placa,         setPlaca]   = useState(item?.placa ?? '')
  const [nombres,       setNombres] = useState(item?.nombres ?? '')
  const [dpi,           setDpi]     = useState(item?.dpi ?? '')
  const [motivo,        setMotivo]  = useState(item?.motivo ?? '')
  const [activo,        setActivo]  = useState(item?.activo ?? 1)
  const [fechaInicio,   setFechaIn] = useState(item?.fecha_Inicio ?? item?.fechaInicio ?? '')
  const [fechaFin,      setFechaFin]= useState(item?.fecha_Fin ?? item?.fechaFin ?? '')
  const [observaciones, setObs]     = useState(item?.observaciones ?? '')
  const [loading,       setLoading] = useState(false)
  const [error,         setError]   = useState(null)

  // Estados para validaciones
  const [nombresError, setNombresError] = useState('')
  const [dpiError, setDpiError] = useState('')
  const [placaError, setPlacaError] = useState('')
  const [motivoError, setMotivoError] = useState('')
  const [fechasError, setFechasError] = useState('')

  // Funciones de validación
  const validarNombres = (valor) => {
    if (!valor.trim()) {
      setNombresError('')
      return true // Opcional
    }
    // Solo letras, espacios, tildes y ñ
    const regexNombres = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]{3,}$/
    if (!regexNombres.test(valor)) {
      setNombresError('Solo letras, mínimo 3 caracteres')
      return false
    }
    setNombresError('')
    return true
  }

  const validarDPI = (valor) => {
    if (!valor) {
      setDpiError('')
      return true // Opcional
    }
    const regexDPI = /^\d{13}$/
    if (!regexDPI.test(valor)) {
      setDpiError('Debe tener 13 dígitos numéricos')
      return false
    }
    setDpiError('')
    return true
  }

  const validarPlaca = (valor) => {
    if (!valor) {
      setPlacaError('')
      return true // Opcional
    }
    // Formato guatemalteco: letra-guion-3 o 4 caracteres alfanuméricos
    const regexPlaca = /^[A-Za-z]-[A-Za-z0-9]{3,4}$/
    if (!regexPlaca.test(valor.toUpperCase())) {
      setPlacaError('Formato inválido (ej: P-123A, M-4567)')
      return false
    }
    setPlacaError('')
    return true
  }

  const validarMotivo = (valor) => {
    if (!valor.trim()) {
      setMotivoError('El motivo es requerido')
      return false
    }
    if (valor.length < 5) {
      setMotivoError('Mínimo 5 caracteres')
      return false
    }
    setMotivoError('')
    return true
  }

  const validarFechas = () => {
    if (fechaInicio && fechaFin) {
      if (new Date(fechaFin) < new Date(fechaInicio)) {
        setFechasError('La fecha fin no puede ser anterior a la fecha inicio')
        return false
      }
    }
    setFechasError('')
    return true
  }

  // Handlers con restricción de caracteres y validación
  const handleNombresChange = (e) => {
    let valor = e.target.value
    // Permitir solo letras, espacios, tildes, ñ y backspace
    valor = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')
    setNombres(valor)
    validarNombres(valor)
  }

  const handleDpiChange = (e) => {
    let valor = e.target.value
    // Solo permitir números, máximo 13
    valor = valor.replace(/\D/g, '').slice(0, 13)
    setDpi(valor)
    validarDPI(valor)
  }

  const handlePlacaChange = (e) => {
    let valor = e.target.value.toUpperCase()
    // Formato automático: primera letra, luego guión, luego alfanumérico
    if (valor.length === 1 && /[A-Z]/.test(valor)) {
      valor = valor + '-'
    }
    // Solo permitir letras, números y guión
    valor = valor.replace(/[^A-Z0-9-]/g, '')
    // Limitar longitud máxima
    if (valor.length > 7) valor = valor.slice(0, 7)
    setPlaca(valor)
    validarPlaca(valor)
  }

  const handleMotivoChange = (e) => {
    let valor = e.target.value
    // Permitir letras, números, espacios y puntuación básica
    valor = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ0-9\s,.;:]/g, '')
    setMotivo(valor)
    validarMotivo(valor)
  }

  const handlePegarNombres = (e) => {
    // Validar al pegar contenido
    setTimeout(() => {
      let valor = e.target.value
      valor = valor.replace(/[^A-Za-zÁÉÍÓÚáéíóúÑñ\s]/g, '')
      setNombres(valor)
      validarNombres(valor)
    }, 0)
  }

  const handlePegarDpi = (e) => {
    setTimeout(() => {
      let valor = e.target.value
      valor = valor.replace(/\D/g, '').slice(0, 13)
      setDpi(valor)
      validarDPI(valor)
    }, 0)
  }

  const handleFechaInicioChange = (e) => {
    setFechaIn(e.target.value)
    validarFechas()
  }

  const handleFechaFinChange = (e) => {
    setFechaFin(e.target.value)
    validarFechas()
  }

  const formatFecha = (fecha) => {
    if (!fecha) return null
    if (fecha.includes('-')) return fecha
    const date = new Date(fecha)
    return date.toISOString().split('T')[0]
  }

  const handleSubmit = async () => {
    // Validar todos los campos
    const isNombresValid = validarNombres(nombres)
    const isDpiValid = validarDPI(dpi)
    const isPlacaValid = validarPlaca(placa)
    const isMotivoValid = validarMotivo(motivo)
    const isFechasValid = validarFechas()

    if (!isMotivoValid) return
    if (!isNombresValid || !isDpiValid || !isPlacaValid || !isFechasValid) {
      setError('Por favor corrige los campos marcados')
      return
    }

    const fechaInicioFormateada = formatFecha(fechaInicio)
    const fechaFinFormateada = formatFecha(fechaFin)
    
    setLoading(true)
    setError(null)
    
    try {
      const payload = {
        Tipo: tipo,
        Id_Persona: idPersona ? Number(idPersona) : null,
        Placa: placa || null,
        Nombres: nombres.trim() || null,
        Dpi: dpi || null,
        Motivo: motivo.trim(),
        Activo: Number(activo),
        Registrado_Por: 1,
        Fecha_Inicio: fechaInicioFormateada,
        Fecha_Fin: fechaFinFormateada,
        Observaciones: observaciones || null,
      }
      
      if (item) {
        const updatePayload = {
          ...payload,
          Id_Lista: Number(item.id_Lista)
        }
        await updateListaNegra(item.id_Lista, updatePayload)
      } else {
        await createListaNegra(payload)
      }
      onSaved()
    } catch (e) { 
      console.error('Error al guardar:', e.response?.data)
      setError(e.response?.data?.message || e.message || 'Error al guardar el registro')
    } finally { 
      setLoading(false) 
    }
  }

  return (
    <>
      <div className="modal-backdrop fade show" onClick={onClose} />
      <div className="modal fade show d-block" tabIndex="-1">
        <div className="modal-dialog modal-dialog-centered modal-lg">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title">{item ? '✏️ Editar Registro' : '🚫 Agregar a Lista Negra'}</h5>
              <button className="btn-close" onClick={onClose} />
            </div>
            <div className="modal-body">
              {error && (
                <div className="alert alert-danger py-2 mb-3">
                  <i className="bi bi-exclamation-circle me-2" />{error}
                </div>
              )}
              {fechasError && (
                <div className="alert alert-warning py-2 mb-3">
                  <i className="bi bi-exclamation-triangle me-2" />{fechasError}
                </div>
              )}
              <div className="row g-3">
                <div className="col-md-4">
                  <label className="form-label fw-semibold">Tipo</label>
                  <select className="form-select" value={tipo} onChange={e => setTipo(e.target.value)}>
                    <option value="PERSONA">PERSONA</option>
                    <option value="VEHICULO">VEHÍCULO</option>
                  </select>
                </div>
                
                <div className="col-md-8">
                  <FkSelector
                    label="Persona del Sistema (opcional)"
                    fetchFn={getPersonas}
                    getId={p => p.id_Persona ?? p.idPersona ?? p.id}
                    getLabel={p => `${p.nombres ?? ''} ${p.apellidos ?? ''}`.trim() || `#${p.id_Persona ?? p.id}`}
                    value={idPersona}
                    displayValue={labelPersona}
                    onChange={(id, lbl) => { setIdPer(id); setLabelPer(lbl) }}
                    placeholder="Vincular con persona registrada..."
                  />
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">Nombre(s) en lista</label>
                  <input 
                    className={`form-control ${nombresError ? 'is-invalid' : ''}`}
                    value={nombres} 
                    onChange={handleNombresChange}
                    onPaste={handlePegarNombres}
                    onBlur={() => validarNombres(nombres)}
                    placeholder="Ej: Juan Pérez"
                    maxLength={200}
                  />
                  {nombresError && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-triangle-fill me-1" />{nombresError}
                    </div>
                  )}
                  <small className="text-muted">Solo letras, mínimo 3 caracteres</small>
                </div>

                <div className="col-md-6">
                  <label className="form-label fw-semibold">DPI</label>
                  <input 
                    className={`form-control ${dpiError ? 'is-invalid' : ''}`}
                    value={dpi} 
                    onChange={handleDpiChange}
                    onPaste={handlePegarDpi}
                    onBlur={() => validarDPI(dpi)}
                    placeholder="1234567890123"
                    maxLength={13}
                    inputMode="numeric"
                  />
                  {dpiError && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-triangle-fill me-1" />{dpiError}
                    </div>
                  )}
                  <small className="text-muted">Opcional - Solo 13 dígitos numéricos</small>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Placa (si aplica)</label>
                  <input 
                    className={`form-control ${placaError ? 'is-invalid' : ''}`}
                    value={placa} 
                    onChange={handlePlacaChange}
                    onBlur={() => validarPlaca(placa)}
                    placeholder="P-123A"
                    maxLength={7}
                  />
                  {placaError && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-triangle-fill me-1" />{placaError}
                    </div>
                  )}
                  <small className="text-muted">Opcional - Formato: Letra-Guion-3 o 4 caracteres (Ej: P-123A)</small>
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Inicio</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={fechaInicio} 
                    onChange={handleFechaInicioChange}
                  />
                </div>

                <div className="col-md-4">
                  <label className="form-label fw-semibold">Fecha Fin</label>
                  <input 
                    type="date" 
                    className="form-control" 
                    value={fechaFin} 
                    onChange={handleFechaFinChange}
                  />
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">
                    Motivo <span className="text-danger">*</span>
                  </label>
                  <textarea 
                    className={`form-control ${motivoError ? 'is-invalid' : ''}`}
                    rows={2} 
                    value={motivo} 
                    onChange={handleMotivoChange}
                    onBlur={() => validarMotivo(motivo)}
                    placeholder="Razón por la que se agrega a lista negra"
                    maxLength={500}
                  />
                  {motivoError && (
                    <div className="invalid-feedback d-block">
                      <i className="bi bi-exclamation-triangle-fill me-1" />{motivoError}
                    </div>
                  )}
                  <small className="text-muted">Mínimo 5 caracteres, máximo 500</small>
                </div>

                <div className="col-12">
                  <label className="form-label fw-semibold">Observaciones</label>
                  <textarea 
                    className="form-control" 
                    rows={2} 
                    value={observaciones} 
                    onChange={e => setObs(e.target.value)}
                    placeholder="Información adicional (opcional)"
                    maxLength={500}
                  />
                  <small className="text-muted">Máximo 500 caracteres</small>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-outline-secondary" onClick={onClose} disabled={loading}>
                Cancelar
              </button>
              <button className="btn btn-danger" onClick={handleSubmit} disabled={loading}>
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" />
                    Guardando...
                  </>
                ) : (
                  item ? 'Guardar cambios' : 'Agregar a lista negra'
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}