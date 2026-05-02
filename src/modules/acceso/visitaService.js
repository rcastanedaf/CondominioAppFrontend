import axios from 'axios'
const BASE = 'https://localhost:44352/VisitaAutorizada'
export const getVisitas      = ()       => axios.get(`${BASE}/get-all`)
export const getVisitasActivas = ()     => axios.get(`${BASE}/get-activas`)
export const createVisita    = (data)   => axios.post(`${BASE}/create`, data)
export const updateVisita    = (id, d)  => axios.put(`${BASE}/update/${id}`, d)
export const cambiarEstadoVisita = (id, estado) => axios.patch(`${BASE}/estado/${id}`, JSON.stringify(estado), { headers: { 'Content-Type': 'application/json' } })