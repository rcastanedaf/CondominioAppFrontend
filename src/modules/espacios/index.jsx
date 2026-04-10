import ModuleLayout from '../../shared/components/ModuleLayout'
import DataTable from '../../shared/components/DataTable'
import { espaciosRows } from './data'

export default function EspaciosModule({ mod, activeSubModule, setActiveSubModule }) {
  return (
    <ModuleLayout mod={mod} activeSubModule={activeSubModule} setActiveSubModule={setActiveSubModule} onNew={() => console.log('Nuevo espacio')}>
      <DataTable rows={espaciosRows} moduleColor={mod?.color} />
    </ModuleLayout>
  )
}
