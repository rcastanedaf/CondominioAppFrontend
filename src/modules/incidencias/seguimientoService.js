import axios from 'axios'
const BASE = 'https://localhost:44352/SeguimientoIncidencia'

// No existe get-by-incidencia en el backend — se filtra en el componente
export const getallSeguimientos   = ()     => axios.get(`${BASE}/get-by-incidencia`)
export const createSeguimiento = (data) => axios.post(`${BASE}/create`, data)
export const updateSeguimiento = (id, data) => axios.put(`${BASE}/update/${id}`, data)   // id va dentro del body
export const deleteSeguimiento = (id)   => axios.delete(`${BASE}/delete/${id}`)
export const getSeguimientos = (idIncidencia) => axios.get(`${BASE}/get-by-incidencia`, { params: { idIncidencia } })