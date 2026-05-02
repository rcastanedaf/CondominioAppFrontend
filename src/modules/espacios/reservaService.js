import axios from 'axios'
const BASE = 'https://localhost:44352/ReservaEspacio'
export const getReservas         = ()           => axios.get(`${BASE}/get-all`)
export const getReservasByEspacio = (id)        => axios.get(`${BASE}/get-by-espacio/${id}`)
export const createReserva       = (data)       => axios.post(`${BASE}/create`, data)
export const updateReserva       = (id, data)   => axios.put(`${BASE}/update/${id}`, data)
export const cambiarEstadoReserva = (id, est, aprobadoPor) =>
  axios.patch(`${BASE}/estado/${id}?estado=${est}${aprobadoPor ? `&aprobadoPor=${aprobadoPor}` : ''}`)