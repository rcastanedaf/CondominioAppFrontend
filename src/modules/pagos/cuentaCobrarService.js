import axios from 'axios'
const API_URL = 'https://localhost:44352/CuentaCobrar'
export const getCuentasCobrar  = ()         => axios.get(`${API_URL}/get-all-cuenta-cobrar`)
export const createCuentaCobrar = (data)    => axios.post(`${API_URL}/create-cuenta-cobrar`, data)
export const updateCuentaCobrar = (id, data)=> axios.put(`${API_URL}/update-cuenta-cobrar/${id}`, data)
export const deleteCuentaCobrar = (id)      => axios.delete(`${API_URL}/delete-cuenta-cobrar/${id}`)