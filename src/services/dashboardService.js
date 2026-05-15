import axios from 'axios';

const BASE = 'https://localhost:44352/api/Dashboard'; // ajusta el puerto según tu appsettings

export const getDashboardResumen      = () => axios.get(`${BASE}/get-resumen`);
export const getDashboardFinanciero   = () => axios.get(`${BASE}/get-financiero`);
export const getDashboardResidentes   = () => axios.get(`${BASE}/get-residentes`);
export const getDashboardAcceso       = () => axios.get(`${BASE}/get-acceso`);
export const getDashboardIncidencias  = () => axios.get(`${BASE}/get-incidencias`);
export const getDashboardEspacios     = () => axios.get(`${BASE}/get-espacios`);
export const getDashboardPersonal     = () => axios.get(`${BASE}/get-personal`);
export const getDashboardContratos    = () => axios.get(`${BASE}/get-contratos`);
export const getDashboardMultas       = () => axios.get(`${BASE}/get-multas`);