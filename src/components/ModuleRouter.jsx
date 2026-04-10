import { MODULES } from '../data/modules'

// Importación de cada módulo
import CatalogosModule    from '../modules/catalogos/index'
import ResidentesModule   from '../modules/residentes/index'
import ContratosModule    from '../modules/contratos/index'
import AccesoModule       from '../modules/acceso/index'
import FacturacionModule  from '../modules/facturacion/index'
import PagosModule        from '../modules/pagos/index'
import EspaciosModule     from '../modules/espacios/index'
import PersonalModule     from '../modules/personal/index'
import IncidenciasModule  from '../modules/incidencias/index'
import SistemaModule      from '../modules/sistema/index'

// Mapa id → componente
const MODULE_COMPONENTS = {
  catalogos:   CatalogosModule,
  residentes:  ResidentesModule,
  contratos:   ContratosModule,
  acceso:      AccesoModule,
  facturacion: FacturacionModule,
  pagos:       PagosModule,
  espacios:    EspaciosModule,
  personal:    PersonalModule,
  incidencias: IncidenciasModule,
  sistema:     SistemaModule,
}

/**
 * ModuleRouter: renderiza el módulo activo según activeModule.
 * Agrega el módulo como prop para que cada componente pueda
 * leer su color, icono, sub-módulos y tareas.
 */
export default function ModuleRouter({ activeModule, activeSubModule, setActiveSubModule }) {
  const mod = MODULES.find(m => m.id === activeModule)
  const ActiveModule = MODULE_COMPONENTS[activeModule]

  if (!ActiveModule) {
    return (
      <main className="cms-main d-flex align-items-center justify-content-center text-muted">
        <div className="text-center">
          <i className="bi bi-question-circle fs-1 d-block mb-2" />
          Módulo no encontrado
        </div>
      </main>
    )
  }

  return (
    <ActiveModule
      mod={mod}
      activeSubModule={activeSubModule}
      setActiveSubModule={setActiveSubModule}
    />
  )
}
