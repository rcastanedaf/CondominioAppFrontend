import axios from 'axios'

// ✅ Este controller SÍ tiene /api/ en su Route
const BASE = 'https://localhost:44352/FamiliarResidente'

export const getAllFamiliares   = ()      => axios.get(`${BASE}/get-all`)
export const getFamiliaresByRes = (id)    => axios.get(`${BASE}/get-by-residente/${id}`)
export const getById            = (id)    => axios.get(`${BASE}/get-by-id/${id}`)
export const createFamiliar     = (data)  => axios.post(`${BASE}/create`, data)
export const updateFamiliar     = (id, d) => axios.put(`${BASE}/update/${id}`, d)
export const deleteFamiliar     = (id)    => axios.delete(`${BASE}/delete/${id}`)
export const toggleFamiliar     = (id, v) => axios.patch(`${BASE}/toggle-activo/${id}?activo=${v}`)