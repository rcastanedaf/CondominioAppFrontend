import axios from 'axios'
const BASE = 'https://localhost:44352/SeguimientoIncidencia'

export const getAllSeguimientos    = ()             => axios.get(`${BASE}/get-all`)
export const getSeguimientos      = (idIncidencia) => axios.get(`${BASE}/get-by-incidencia`, { params: { idIncidencia } })
export const createSeguimiento    = (data)         => axios.post(`${BASE}/create`, data)
export const updateSeguimiento    = (id, data)     => axios.put(`${BASE}/update/${id}`, data)
export const deleteSeguimiento    = (id)           => axios.delete(`${BASE}/delete/${id}`)