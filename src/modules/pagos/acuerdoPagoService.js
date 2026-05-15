import axios from 'axios'
const BASE = 'https://localhost:44352/AcuerdoPago'  // ← sin api/

export const getAllAcuerdos = ()        => axios.get(`${BASE}/get-all`)
export const getAcuerdoById = (id)     => axios.get(`${BASE}/get-by-id/${id}`)
export const getCuotas      = (id)     => axios.get(`${BASE}/get-cuotas/${id}`)
export const createAcuerdo  = (data)   => axios.post(`${BASE}/create`, data)
export const updateAcuerdo  = (id, d)  => axios.put(`${BASE}/update/${id}`, d)
export const pagarCuota     = (idC)    => axios.patch(`${BASE}/pagar-cuota/${idC}`)
export const deleteAcuerdo  = (id)     => axios.delete(`${BASE}/delete/${id}`)