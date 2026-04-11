import axios from 'axios'
const API_URL = 'https://localhost:44352/MetodoPago'

export const getMetodosPago   = async ()         => await axios.get(`${API_URL}/get-all-metodo-pago`)
export const createMetodoPago = async (data)     => await axios.post(`${API_URL}/create-metodo-pago`, data)
export const updateMetodoPago = async (id, data) => await axios.put(`${API_URL}/update-metodo-pago/${id}`, data)
export const deleteMetodoPago = async (id)       => await axios.delete(`${API_URL}/delete-metodo-pago/${id}`)
