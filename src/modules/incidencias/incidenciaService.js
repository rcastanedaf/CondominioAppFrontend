import axios from 'axios'

const BASE = 'https://localhost:44352/Incidencia'

export const getIncidencias   = ()         => axios.get(`${BASE}/get-all`)
export const createIncidencia = (data)     => axios.post(`${BASE}/create`, data)
export const updateIncidencia = (id, data) => axios.put(`${BASE}/update`, data)   // id va en body
export const deleteIncidencia = (id)       => axios.delete(`${BASE}/delete/${id}`)