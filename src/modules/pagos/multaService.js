import axios from 'axios'
const API_URL = 'https://localhost:44352/Multa'
export const getMultas  = ()         => axios.get(`${API_URL}/get-all-multa`)
export const createMulta = (data)    => axios.post(`${API_URL}/create-multa`, data)
export const updateMulta = (id, data)=> axios.put(`${API_URL}/update-multa/${id}`, data)
export const deleteMulta = (id)      => axios.delete(`${API_URL}/delete-multa/${id}`)