import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Layout from './components/Layout';
import Home from './pages/Home';
import DashboardGeneral from './modules/DashBoard/Dashboard';

import DashboardFinanciero  from './components/DashboardFinanciero';
import DashboardResidentes  from './components/DashboardResidentes';
import DashboardAcceso      from './components/DashboardAcceso';
import DashboardIncidencias from './components/DashboardIncidencias';
import DashboardEspacios    from './components/DashboardEspacios';
import DashboardContratos   from './components/DashboardContratos';
import DashboardMultas      from './components/DashboardMultas';

import CatalogosModule   from './modules/catalogos/index';
import ResidentesModule  from './modules/residentes/index';
import ContratosModule   from './modules/contratos/index';
import AccesoModule      from './modules/acceso/index';
import FacturacionModule from './modules/facturacion/index';
import PagosModule       from './modules/pagos/index';
import EspaciosModule    from './modules/espacios/index';
import PersonalModule    from './modules/personal/index';
import IncidenciasModule from './modules/incidencias/index';
import SistemaModule     from './modules/sistema/index';


import Facturas from './modules/facturacion/FacturaDetalle'
import Ciclo from './modules/facturacion/CicloFacturacionTable'
import TipoServicio from './modules/facturacion/TipoServicioTable'
import PagosResidente from './modules/pagos/PagosResidente'
import CuentasPorCobrar from './modules/pagos/CuentaCobrarResidente'
import CobroMora from './modules/pagos/CobroMoraTable'
import AcuerdosPago from './modules/pagos/AcuerdoPagoTable'
import Multas from './modules/pagos/MultaTable'
import MetodoPago from './modules/catalogos/MetodoPagoTable'
import Banco from './modules/catalogos/BancoTable'
import MotivoVisita from './modules/catalogos/MotivoVisitaTable'
import Pais from './modules/catalogos/PaisTable'
import Parentesco from './modules/catalogos/ParentescoTable'
import Propiedades from './modules/catalogos/PropiedadTable'
import TipoContrato from './modules/catalogos/TipoContratoTable'
import TipoModena from './modules/catalogos/TipoMonedaTable'
import TipoPropiedad from './modules/catalogos/TipoPropiedadTable'
import Arrendatario from './modules/residentes/ArrendatarioTable'
import Familiar from './modules/residentes/FamiliarTable'
import Persona from './modules/residentes/PersonaTable'
import PropiedadResidente from './modules/residentes/PropiedadResidenteTable'
import Residente from './modules/residentes/ResidenteTable'
import Vehiculos from './modules/acceso/VehiculoTable'
import RegistroAcceso from './modules/acceso/RegistroAccesoTable'
import VisitaAutorizada from './modules/acceso/VisitaAutorizadaTable'
import ListaNegra from './modules/acceso/ListaNegraTable'
import CategoriaIncidencia from './modules/incidencias/CategoriaIncidenciaTable'
import IncidenciaDetalle from './modules/incidencias/IncidenciaDetalle'
import EspacioComun from './modules/espacios/EspacioComunTable'
import Reserva from './modules/espacios/ReservaTable'
import CobroReserva from './modules/espacios/CobroReservaTable'
import Asistencia from './modules/personal/AsistenciaView'
import Cargo from './modules/personal/CargoTable'
import Empleado from './modules/personal/EmpleadoTable'
import HorarioTurno from './modules/personal/HorarioTurnoTable'
import Proveedor from './modules/personal/ProveedorTable'
import Contratos from './modules/contratos/ContratoTable'
import ContratosVigentes from './modules/contratos/ContratoFiltradoTable'
import ContratosVencidos from './modules/contratos/ContratoFiltradoTable'
import Renovacion from './modules/contratos/RenovacionTable'
import Usuarios from './modules/sistema/UsuarioTable'
import Roles from './modules/sistema/RolPermisosTable'
import LogAuditoria from './modules/sistema/LogAuditoriaTable'

import ConceptoDescuentoTable from './modules/catalogos/ConceptoDescTable';

export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>

                    <Route index        element={<Home />} />
                    <Route path="/"     element={<Home />} />
                    <Route path="/home" element={<Home />} />

                    <Route path="/dashboard"             element={<DashboardGeneral />} />
                    <Route path="/dashboard/financiero"  element={<DashboardFinanciero />} />
                    <Route path="/dashboard/residentes"  element={<DashboardResidentes />} />
                    <Route path="/dashboard/acceso"      element={<DashboardAcceso />} />
                    <Route path="/dashboard/incidencias" element={<DashboardIncidencias />} />
                    <Route path="/dashboard/espacios"    element={<DashboardEspacios />} />
                    <Route path="/dashboard/contratos"   element={<DashboardContratos />} />
                    <Route path="/dashboard/multas"      element={<DashboardMultas />} />

                    <Route path="/catalogos"          element={<CatalogosModule />} />
                    <Route path="/bancos"             element={<Banco />} />
                    <Route path="/metodos-pago"       element={<MetodoPago />} />
                    <Route path="/tipo-propiedad"     element={<TipoPropiedad />} />
                    <Route path="/pais"      element={<Pais />} />
                    <Route path="/parentesco"      element={<Parentesco />} />
                    <Route path="/propiedades"      element={<Propiedades />} />
                    <Route path="/tipocontrato"      element={<TipoContrato />} />
                    <Route path="/tipomodena"      element={<TipoModena />} />
                    <Route path="/motivovisita"      element={<MotivoVisita />} />
                    <Route path="/concepto-descuento" element={<ConceptoDescuentoTable />} />

                    <Route path="/residentes"  element={<Residente />} />
                    <Route path="/propiedadesresidente" element={<PropiedadResidente />} />
                    <Route path="/familiares"  element={<Familiar />} />
                    <Route path="/arrendatario"  element={<Arrendatario />} />
                    <Route path="/persona"  element={<Persona />} />
                    <Route path="/vehiculos"   element={<Vehiculos />} />

                    <Route path="/acceso"              element={<AccesoModule />} />
                    <Route path="/registro-acceso"     element={<RegistroAcceso />} />
                    <Route path="/visitas-autorizadas" element={<VisitaAutorizada />} />
                    <Route path="/lista-negra"         element={<ListaNegra />} />

                    <Route path="/incidencias"            element={<IncidenciasModule />} />
                    <Route path="/incidenciadetalle" element={<IncidenciaDetalle />} />
                    <Route path="/categorias-incidencia"  element={<CategoriaIncidencia />} />

                    <Route path="/espacios"         element={<EspaciosModule />} />
                    <Route path="/espacios-comunes" element={<EspacioComun />} />
                    <Route path="/reservas"         element={<Reserva />} />
                    <Route path="/cobroreservas"         element={<CobroReserva />} />

                    <Route path="/facturacion" element={<FacturacionModule />} />
                    <Route path="/facturas"    element={<Facturas />} />
                    <Route path="/ciclofacturacion"    element={<Ciclo />} />
                    <Route path="/tiposervicio"    element={<TipoServicio />} />

                    <Route path="/pagos"              element={<PagosResidente />} />
                    <Route path="/cuentas-por-cobrar" element={<CuentasPorCobrar />} />
                    <Route path="/cobro-mora"         element={<CobroMora />} />
                    <Route path="/acuerdos-pago"      element={<AcuerdosPago />} />
                    <Route path="/multas"             element={<Multas />} />
                    <Route path="/saldo-a-favor"      element={<PagosModule />} />

                    <Route path="/personal"       element={<PersonalModule />} />
                    <Route path="/empleados"      element={<Empleado />} />
                    <Route path="/asistencia"     element={<Asistencia />} />
                    <Route path="/cargos"         element={<Cargo />} />
                    <Route path="/horarios-turno" element={<HorarioTurno />} />
                    <Route path="/proveedores"    element={<Proveedor />} />

                    <Route path="/contratos"    element={<Contratos />} />
                    <Route path="/contratosvigentes"    element={<ContratosVigentes />} />
                    <Route path="/contratosvencidos"    element={<ContratosVencidos />} />
                    <Route path="/renovaciones" element={<Renovacion />} />

                    <Route path="/sistema"       element={<SistemaModule />} />
                    <Route path="/usuarios"      element={<Usuarios />} />
                    <Route path="/roles"         element={<Roles />} />
                    <Route path="/log-auditoria" element={<LogAuditoria />} />

                </Route>

                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </BrowserRouter>
    );
}