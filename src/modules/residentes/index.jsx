import { useState } from 'react'
import ModuleLayout          from '../../shared/components/ModuleLayout'
import PersonaTable          from './PersonaTable'
import ResidenteTable        from './ResidenteTable'
import FamiliarTable         from './FamiliarTable'
import ArrendatarioTable     from './ArrendatarioTable'
import PropiedadResidenteTable from './PropiedadResidenteTable'

const CRUD_CARDS = [
  { id: 'personas',      label: 'Personas',              emoji: '🙋',    desc: 'Gestión de personas del condominio',  color: '#198754' },
  { id: 'residentes',    label: 'Residentes',            emoji: '🏠',    desc: 'Asignación residente-propiedad',      color: '#0d6efd' },
  { id: 'arrendatarios', label: 'Arrendatarios',         emoji: '🔑',    desc: 'Residentes tipo inquilino',           color: '#fd7e14' },
  { id: 'familiares',    label: 'Familiares/Dependientes', emoji: '👨‍👩‍👦', desc: 'Dependientes y familiares',           color: '#6f42c1' },
  { id: 'propiedades',   label: 'Propiedades',           emoji: '🏡',    desc: 'Unidades habitacionales',             color: '#20c997' },
]

const SUB_VIEWS = {
  personas:      (color) => <PersonaTable            moduleColor={color} />,
  residentes:    (color) => <ResidenteTable          moduleColor={color} />,
  arrendatarios: (color) => <ArrendatarioTable       moduleColor={color} />,
  familiares:    (color) => <FamiliarTable            moduleColor={color} />,
  propiedades:   (color) => <PropiedadResidenteTable moduleColor={color} />,
}

export default function ResidentesModule({ mod, activeSubModule, setActiveSubModule }) {
  const renderSub = SUB_VIEWS[activeSubModule]
  return (
    <ModuleLayout mod={mod} activeSubModule={activeSubModule} setActiveSubModule={setActiveSubModule} onNew={() => {}}>
      {!activeSubModule && (
        <div className="row g-3 mt-1">
          {CRUD_CARDS.map(card => (
            <div key={card.id} className="col-12 col-sm-6 col-lg-4">
              <div className="card h-100 border-0 shadow-sm" style={{ cursor: 'pointer' }}
                onClick={() => setActiveSubModule(card.id)}>
                <div className="card-body d-flex align-items-start gap-3">
                  <div className="rounded-3 d-flex align-items-center justify-content-center flex-shrink-0"
                    style={{ width: 46, height: 46, background: card.color + '18' }}>
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
      {activeSubModule && (renderSub ? renderSub(mod?.color) : (
        <div className="text-center py-5 text-muted">
          <span style={{ fontSize: 32 }}>🚧</span>
          <p className="mt-2">Módulo en construcción.</p>
        </div>
      ))}
    </ModuleLayout>
  )
}