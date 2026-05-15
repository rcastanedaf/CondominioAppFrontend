import axios from 'axios'
const BASE = 'https://localhost:44352/Banco'

export const getBancos   = ()         => axios.get(`${BASE}/get-all-banco`)
export const createBanco = (data)     => axios.post(`${BASE}/create-banco`, data)
export const updateBanco = (id, data) => axios.put(`${BASE}/update-banco/${id}`, data)
export const deleteBanco = (id) => axios.delete(`${BASE}/delete-banco/${id}`)