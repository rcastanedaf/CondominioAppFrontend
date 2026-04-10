import axios from 'axios'
const API_URL = 'https://localhost:44352/Pago'
export const getPagos  = ()         => axios.get(`${API_URL}/get-all-pago`)
export const createPago = (data)    => axios.post(`${API_URL}/create-pago`, data)
export const updatePago = (id, data)=> axios.put(`${API_URL}/update-pago/${id}`, data)
export const deletePago = (id)      => axios.delete(`${API_URL}/delete-pago/${id}`)