import axios from 'axios'

const API_URL = 'https://localhost:44352/Pago'

export const getPagos              = ()      => axios.get(`${API_URL}/get-all`)
export const getPagoById           = (id)    => axios.get(`${API_URL}/get-by-id/${id}`)
export const getPagosByFactura     = (id)    => axios.get(`${API_URL}/get-by-factura/${id}`)
export const getPagosByResidente   = (id)    => axios.get(`${API_URL}/get-by-residente/${id}`)  // ← nuevo
export const createPago = (data)  => axios.post(`${API_URL}/create`, data)
export const updatePago = (data)  => axios.put(`${API_URL}/update`, data)
export const deletePago = (id)    => axios.delete(`${API_URL}/delete/${id}`)