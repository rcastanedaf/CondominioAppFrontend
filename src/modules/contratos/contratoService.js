import axios from 'axios'
const API_URL = 'https://localhost:44352/api/contrato'
export const getContratos  = ()         => axios.get(`${API_URL}/get-all`)
export const createContrato = (data)    => axios.post(`${API_URL}/create`, data)
export const updateContrato = (id, data)=> axios.put(`${API_URL}/update/${id}`, data)
export const deleteContrato = (id)      => axios.delete(`${API_URL}/delete/${id}`)