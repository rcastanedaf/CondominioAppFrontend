import axios from 'axios'

const BASE = 'https://localhost:44352'

export const getIncidencias   = ()         => axios.get(`${BASE}/Incidencia/get-all`)
export const createIncidencia = (data)     => axios.post(`${BASE}/Incidencia/create-incidencia`, data)
export const updateIncidencia = (id, data) => axios.put(`${BASE}/Incidencia/update-incidencia/${id}`, data)
export const deleteIncidencia = (id)       => axios.delete(`${BASE}/Incidencia/delete-incidencia/${id}`)