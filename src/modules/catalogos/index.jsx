import { useState, useEffect } from 'react'
import ModuleLayout from '../../shared/components/ModuleLayout'
import DataTable from '../../shared/components/DataTable'
import { getBancos, createBanco, updateBanco, deleteBanco } from './bancoService'
import BancoModal from './BancoModal'
import ConceptoDescuentoTable from './ConceptoDescTable'
import MetodoPagoTable from './MetodoPagoTable'
import MotivoVisitaTable from './MotivoVisitaTable'
import PaisTable from './PaisTable'
import ParentescoTable from './ParentescoTable'
import TipoContratoTable from './TipoContratoTable'
import TipoMonedaTable from './TipoMonedaTable'
import TipoPropiedadTable from './TipoPropiedadTable'
import PropiedadTable from './PropiedadTable'
import { usePaginacion }  from '../../shared/hooks/usePaginacion'
import PaginacionFooter   from '../../shared/components/PaginacionFooter'

const CRUD_CARDS = [
  { id: 'banco',               label: 'Banco',               emoji: '🏦', desc: 'Gestión de Bancos',               color: '#0d6efd' },
  { id: 'concepto-descuento',  label: 'Concepto Descuento',  emoji: '📉', desc: 'Gestión de Concepto Descuento',   color: '#198754' },
  { id: 'metodo-pago',         label: 'Metodo de Pago',      emoji: '💰', desc: 'Gestión de Metodo de Pago',       color: '#fd7e14' },
  { id: 'motivo-visita',       label: 'Motivo de Visita',    emoji: '🫂', desc: 'Gestión de Motivo de Visita',     color: '#dc3545' },
  { id: 'pais',                label: 'País',                emoji: '🗺️', desc: 'Gestión de Paises',               color: '#6f42c1' },
  { id: 'parentesco',          label: 'Parentesco',          emoji: '👨‍👩‍👦', desc: 'Gestión de Parentescos',         color: '#20c997' },
  { id: 'persona',             label: 'Persona',             emoji: '🙋', desc: 'Gestión de Personas',             color: '#0d6efd' },
  { id: 'tipo-propiedad',      label: 'Tipo de Propiedad',   emoji: '🏘️', desc: 'Gestión de Tipo de Propiedad',   color: '#198754' },
  { id: 'tipo-contrato',       label: 'Tipo de Contrato',    emoji: '🧾', desc: 'Gestión de Tipo de Contrato',     color: '#fd7e14' },
  { id: 'tipo-moneda',         label: 'Tipo de Moneda',      emoji: '🪙', desc: 'Gestión de Tipo de Moneda',       color: '#dc3545' },
  { id: 'propiedad',           label: 'Propiedad',           emoji: '🏡', desc: 'Gestión de Propiedades',          color: '#6f42c1' },
]

// Componente de tabla para Banco conectado al backend
function BancoTable({ moduleColor }) {
  const [rows,    setRows]    = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState(null)
  const [showModal,  setShowModal]  = useState(false)
  const [selected,   setSelected]   = useState(null)
  const [confirmId,  setConfirmId]  = useState(null)

    // Carga la tabla
  const fetchData = () => {
    setLoading(true)
    getBancos()
      .then(res => setRows(res.data))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }

  // ── hook — filtra + pagina ────────────────────────────────
  const {
    datosPagina, datosFiltrados,
    filtro, setFiltro,
    paginaSegura, totalPaginas, porPagina, setPorPagina, irA, paginas,
  } = usePaginacion(rows)

  useEffect(() => { fetchData() }, [])

  // Abrir modal Nuevo
  const handleNuevo = () => {
    setSelected(null)
    setShowModal(true)
  }

  // Abrir modal Editar
  const handleEditar = (row) => {
    setSelected(row)
    setShowModal(true)
  }

  // Confirmar y ejecutar eliminación
  const handleEliminar = async (id) => {
    try {
      await deleteBanco(id)
      setConfirmId(null)
      fetchData()
    } catch (err) {
      alert('Error al eliminar: ' + err.message)
    }
  }

  if (loading) return (
    <div className="text-center py-5 text-muted">
      <div className="spinner-border spinner-border-sm me-2" />
      Cargando bancos...
    </div>
  )

  if (error) return (
    <div className="alert alert-danger py-2">
      <i className="bi bi-exclamation-circle me-2" />
      {error}
    </div>
  )

  return (
    <>
      {/* Header + buscador + selector — reemplaza el antiguo d-flex justify-content-between */}
      <PaginacionFooter
        titulo="Bancos"
        icono="bi-receipt-cutoff"
        labelBoton="Nuevo Banco"
        onNuevo={() => { setSelected(null); setShowModal(true) }}
        moduleColor={moduleColor}
        filtro={filtro}
        setFiltro={setFiltro}
        placeholder="Filtrar bancos..."
        paginaSegura={paginaSegura}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        setPorPagina={setPorPagina}
        irA={irA}
        paginas={paginas}
        totalDatos={datosFiltrados.length}
        label="bancos"
      />

      {/* Tabla */}
      <div className="cms-table-wrap">
        <table className="table table-hover cms-table">
          <thead>
            <tr>
              <th>#</th>
              <th>Nombre</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {datosPagina.map((row, i) => (
              <tr key={row.id ?? i}>
                <td className="text-muted">{row.id}</td>
                <td>{row.nombre}</td>
                <td>
                  <span className={`badge ${row.activo === 1 ? 'text-bg-warning' : 'text-bg-secondary'}`}>
                    {row.activo === 1 ? 'Activo.' : 'No Activo.'}
                  </span>
                </td>
                <td>
                  <div className="d-flex gap-1">
                    {/* Editar */}
                    <button
                      className="btn btn-sm btn-outline-primary py-0 px-2"
                      onClick={() => handleEditar(row)}
                    >
                      <i className="bi bi-pencil me-1" style={{ fontSize: 11 }} />
                      Editar
                    </button>

                    {/* Eliminar — muestra confirmación inline */}
                    {confirmId === row.id ? (
                      <>
                        <span className="text-danger small align-self-center">¿Confirmar?</span>
                        <button
                          className="btn btn-sm btn-danger py-0 px-2"
                          onClick={() => handleEliminar(row.id)}
                        >
                          Sí
                        </button>
                        <button
                          className="btn btn-sm btn-outline-secondary py-0 px-2"
                          onClick={() => setConfirmId(null)}
                        >
                          No
                        </button>
                      </>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger py-0 px-2"
                        onClick={() => setConfirmId(row.id)}
                      >
                        <i className="bi bi-trash me-1" style={{ fontSize: 11 }} />
                        Eliminar
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Footer paginación — segundo uso del mismo componente */}
      <PaginacionFooter
        paginaSegura={paginaSegura}
        totalPaginas={totalPaginas}
        porPagina={porPagina}
        setPorPagina={setPorPagina}
        irA={irA}
        paginas={paginas}
        totalDatos={datosFiltrados.length}
        label="bancos"
        moduleColor={moduleColor}
      />

      {/* Modal crear/editar */}
      <BancoModal
        show={showModal}
        banco={selected}
        onClose={() => setShowModal(false)}
        onSaved={() => { setShowModal(false); fetchData() }}
      />
    </>
  )
}

// Mapa: id de tarjeta → componente de tabla
// Agrega aquí cada nuevo CRUD cuando lo conectes al backend
const SUB_MODULE_VIEWS = {
  'banco': (moduleColor) => <BancoTable moduleColor={moduleColor} />,
  'concepto-descuento': (color) => <ConceptoDescuentoTable moduleColor={color} />,
  'tipo-moneda':        (color) => <TipoMonedaTable moduleColor={color} />,
  'metodo-pago':        (color) => <MetodoPagoTable moduleColor={color} />,
  'pais':               (color) => <PaisTable moduleColor={color} />,
  'parentesco':         (color) => <ParentescoTable moduleColor={color} />,
  'motivo-visita':      (color) => <MotivoVisitaTable moduleColor={color} />,
  'tipo-contrato':      (color) => <TipoContratoTable moduleColor={color} />,
  'tipo-propiedad':     (color) => <TipoPropiedadTable moduleColor={color} />,
  'propiedad':          (color) => <PropiedadTable moduleColor={color} />,
}

export default function CatalogosModule({ mod, activeSubModule, setActiveSubModule }) {
  const renderSubModule = SUB_MODULE_VIEWS[activeSubModule]

  return (
    <ModuleLayout
      mod={mod}
      activeSubModule={activeSubModule}
      setActiveSubModule={setActiveSubModule}
      onNew={() => console.log('Nuevo catálogo')}
    >
      {/* Pestaña General → tarjetas */}
      {!activeSubModule && (
        <div className="row g-3 mt-1">
          {CRUD_CARDS.map(card => (
            <div key={card.id} className="col-12 col-sm-6 col-lg-4">
              <div
                className="card h-100 border-0 shadow-sm"
                style={{ cursor: 'pointer' }}
                onClick={() => setActiveSubModule(card.id)}
              >
                <div className="card-body d-flex align-items-start gap-3">
                  <div
                    className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 46, height: 46, background: card.color + '18' }}
                  >
                    <span style={{ fontSize: 22 }}>{card.emoji}</span>
                  </div>
                  <div>
                    <h6 className="mb-1 fw-semibold">{card.label}</h6>
                    <p className="mb-2 text-muted" style={{ fontSize: 12 }}>{card.desc}</p>
                    <span className="badge" style={{ background: card.color + '18', color: card.color, fontSize: 11 }}>
                      Ver registros →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Sub-módulo activo → vista correspondiente */}
      {activeSubModule && (
        renderSubModule
          ? renderSubModule(mod?.color)
          : (
            <div className="text-center py-5 text-muted">
              <span style={{ fontSize: 32 }}>🚧</span>
              <p className="mt-2">Este módulo aún no está conectado al backend.</p>
            </div>
          )
      )}
    </ModuleLayout>
  )
}
