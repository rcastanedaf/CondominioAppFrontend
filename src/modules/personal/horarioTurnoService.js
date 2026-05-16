import axios from 'axios'
const BASE = 'https://localhost:44352/api/HorarioTurno'
export const getAllHorarios  = ()       => axios.get(`${BASE}/get-all`)
export const createHorario   = (data)   => axios.post(`${BASE}/create`, data).then(r => r.data)
export const updateHorario   = (id, d)  => axios.put(`${BASE}/update/${id}`, d).then(r => r.data)
export const deleteHorario   = (id)     => axios.delete(`${BASE}/delete/${id}`).then(r => r.data)
export const toggleHorario   = (id, v)  => axios.patch(`${BASE}/toggle-activo/${id}?activo=${v}`).then(r => r.data)