import axios from 'axios'
const BASE = 'https://localhost:44352/Cargo'
export const getCargos      = ()         => axios.get(`${BASE}/get-all`)
export const createCargo    = (data)     => axios.post(`${BASE}/create`, data)
export const updateCargo    = (id, data) => axios.put(`${BASE}/update/${id}`, data)
export const deleteCargo    = (id)       => axios.delete(`${BASE}/delete/${id}`)