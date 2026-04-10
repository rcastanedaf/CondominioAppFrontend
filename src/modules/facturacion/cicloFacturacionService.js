import axios from 'axios'
const API_URL = 'https://localhost:44352/CicloFacturacion'
export const getCiclos  = ()         => axios.get(`${API_URL}/get-all-ciclo-facturacion`)
export const createCiclo = (data)    => axios.post(`${API_URL}/create-ciclo-facturacion`, data)
export const updateCiclo = (id, data)=> axios.put(`${API_URL}/update-ciclo-facturacion/${id}`, data)
export const deleteCiclo = (id)      => axios.delete(`${API_URL}/delete-ciclo-facturacion/${id}`)