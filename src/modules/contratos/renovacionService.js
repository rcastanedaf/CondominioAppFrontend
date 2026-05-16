import axios from 'axios'
const API_URL = 'https://localhost:44352/api/renovacionContrato'
export const getRenovaciones   = ()         => axios.get(`${API_URL}/get-all`)
export const createRenovacion  = (data)     => axios.post(`${API_URL}/create`, data)
export const updateRenovacion  = (id, data) => axios.put(`${API_URL}/update/${id}`, data)
export const deleteRenovacion  = (id)       => axios.delete(`${API_URL}/delete/${id}`)