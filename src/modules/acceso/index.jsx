import ModuleLayout from '../../shared/components/ModuleLayout'
import DataTable from '../../shared/components/DataTable'
import { accesoRows } from './data'

export default function AccesoModule({ mod, activeSubModule, setActiveSubModule }) {
  return (
    <ModuleLayout mod={mod} activeSubModule={activeSubModule} setActiveSubModule={setActiveSubModule} onNew={() => console.log('Registrar ingreso')}>
      <DataTable rows={accesoRows} statusCols={[]} moduleColor={mod?.color} />
    </ModuleLayout>
  )
}
