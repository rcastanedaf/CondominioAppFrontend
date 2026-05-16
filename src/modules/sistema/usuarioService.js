import axios from 'axios'

const BASE = 'https://localhost:44352/Usuario'

export const getUsuarios   = ()           => axios.get(`${BASE}/get-all`)
export const createUsuario = (data)       => axios.post(`${BASE}/create`, data)
export const updateUsuario = (id, data)   => axios.put(`${BASE}/update/${id}`, data)
export const deleteUsuario = (id)         => axios.delete(`${BASE}/delete/${id}`)
export const desbloquear   = (id)         => axios.patch(`${BASE}/desbloquear/${id}`)
export const toggleActivo  = (id, activo) => axios.patch(`${BASE}/toggle-activo/${id}?activo=${activo}`)