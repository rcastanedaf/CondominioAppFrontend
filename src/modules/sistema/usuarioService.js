import axios from 'axios'
const BASE = 'https://localhost:44352/Usuario'
export const getUsuarios      = ()           => axios.get(`${BASE}/get-all`)
export const updateUsuario    = (id, data)   => axios.put(`${BASE}/update/${id}`, data)
export const desbloquear      = (id)         => axios.patch(`${BASE}/desbloquear/${id}`)