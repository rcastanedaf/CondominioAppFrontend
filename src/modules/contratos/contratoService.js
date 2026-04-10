import axios from 'axios'
const API_URL = 'https://localhost:44352/Contrato'
export const getContratos  = ()         => axios.get(`${API_URL}/get-all-contrato`)
export const createContrato = (data)    => axios.post(`${API_URL}/create-contrato`, data)
export const updateContrato = (id, data)=> axios.put(`${API_URL}/update-contrato/${id}`, data)
export const deleteContrato = (id)      => axios.delete(`${API_URL}/delete-contrato/${id}`)