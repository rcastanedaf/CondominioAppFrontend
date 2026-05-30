import axios from 'axios'
const BASE = 'http://localhost:5002/EspacioComun'
export const getEspacios      = ()         => axios.get(`${BASE}/get-all`)
export const createEspacio    = (data)     => axios.post(`${BASE}/create`, data)
export const updateEspacio    = (id, data) => axios.put(`${BASE}/update/${id}`, data)
export const cambiarEstado    = (id, est)  => axios.patch(`${BASE}/estado/${id}`, JSON.stringify(est), { headers: { 'Content-Type': 'application/json' } })
export const deleteEspacio    = (id)       => axios.delete(`${BASE}/delete/${id}`)