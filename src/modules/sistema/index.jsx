import ModuleLayout from '../../shared/components/ModuleLayout'
import DataTable from '../../shared/components/DataTable'
import { sistemaRows } from './data'

export default function SistemaModule({ mod, activeSubModule, setActiveSubModule }) {
  return (
    <ModuleLayout mod={mod} activeSubModule={activeSubModule} setActiveSubModule={setActiveSubModule} onNew={() => console.log('Nuevo usuario')}>
      <DataTable rows={sistemaRows} moduleColor={mod?.color} />
    </ModuleLayout>
  )
}
