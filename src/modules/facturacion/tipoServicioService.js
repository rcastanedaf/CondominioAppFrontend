import axios from 'axios'
const BASE = 'https://localhost:44352/TipoServicio'

export const getTipoServicios   = ()     => axios.get(`${BASE}/get-all`)
export const createTipoServicio = (data) => axios.post(`${BASE}/create`, data)
export const updateTipoServicio = (data) => axios.put(`${BASE}/update`, data)   // id va dentro del body
export const deleteTipoServicio = (id)   => axios.delete(`${BASE}/delete/${id}`)
