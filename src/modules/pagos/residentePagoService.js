import axios from 'axios'
const BASE = 'https://localhost:44352'

// Trae todos los residentes
export const getResidentes = () =>
  axios.get(`${BASE}/Residente/get-all-residente`)

export const getPersonas = () =>
  axios.get(`${BASE}/Persona/get-all-persona`)

// Trae todos los pagos (filtramos por factura en frontend)
export const getAllPagos = () =>
  axios.get(`${BASE}/Pago/get-all`)

export const getPagosByResidente = (idResidente) =>
  axios.get(`${BASE}/Pago/get-by-residente/${idResidente}`)

// Trae pagos de una factura específica
export const getPagosByFactura = (idFactura) =>
  axios.get(`${BASE}/Pago/get-by-factura/${idFactura}`)



// Trae todas las facturas (filtramos por residente en frontend)
export const getAllFacturas = () =>
  axios.get(`${BASE}/Factura/get-all`)

// Crear / actualizar / eliminar pago
export const createPagoApi = (data) =>
  axios.post(`${BASE}/Pago/create`, data)

export const updatePagoApi = (data) =>
  axios.put(`${BASE}/Pago/update`, data)

export const deletePagoApi = (id) =>
  axios.delete(`${BASE}/Pago/delete/${id}`)