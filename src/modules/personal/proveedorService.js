import axios from 'axios'
const BASE = 'https://localhost:44352/Proveedor'
export const getProveedores     = ()         => axios.get(`${BASE}/get-all`)
export const createProveedor    = (data)     => axios.post(`${BASE}/create`, data)
export const updateProveedor    = (id, data) => axios.put(`${BASE}/update/${id}`, data)
export const deleteProveedor    = (id)       => axios.delete(`${BASE}/delete/${id}`)