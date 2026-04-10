import axios from 'axios'
const API_URL = 'https://localhost:44352/RenovacionContrato'
export const getRenovaciones   = ()         => axios.get(`${API_URL}/get-all-renovacion-contrato`)
export const createRenovacion  = (data)     => axios.post(`${API_URL}/create-renovacion-contrato`, data)
export const updateRenovacion  = (id, data) => axios.put(`${API_URL}/update-renovacion-contrato/${id}`, data)
export const deleteRenovacion  = (id)       => axios.delete(`${API_URL}/delete-renovacion-contrato/${id}`)