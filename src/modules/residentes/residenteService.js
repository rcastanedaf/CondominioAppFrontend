import axios from 'axios'
const API_URL = 'https://localhost:44352/Residente'
export const getResidentes  = ()         => axios.get(`${API_URL}/get-all-residente`)
export const createResidente = (data)    => axios.post(`${API_URL}/create-residente`, data)
export const updateResidente = (id, data)=> axios.put(`${API_URL}/update-residente/${id}`, data)
export const deleteResidente = (id) => axios.delete(`${API_URL}/delete-residente/${id}`)