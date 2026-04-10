import ModuleLayout from '../../shared/components/ModuleLayout'
import DataTable from '../../shared/components/DataTable'
import { personalRows } from './data'

export default function PersonalModule({ mod, activeSubModule, setActiveSubModule }) {
  return (
    <ModuleLayout mod={mod} activeSubModule={activeSubModule} setActiveSubModule={setActiveSubModule} onNew={() => console.log('Nuevo empleado')}>
      <DataTable rows={personalRows} moduleColor={mod?.color} />
    </ModuleLayout>
  )
}
