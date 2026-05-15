import axios from 'axios'
const BASE = 'https://localhost:44352/Multa'

export const getMultas   = ()         => axios.get(`${BASE}/get-all-multa`)
export const createMulta = (data)     => axios.post(`${BASE}/create-multa`, data)
export const updateMulta = (id, data) => axios.put(`${BASE}/update-multa/${id}`, data)
export const deleteMulta = (id) => axios.delete(`${BASE}/delete-multa/${id}`)