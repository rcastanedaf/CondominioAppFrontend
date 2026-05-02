import axios from 'axios'
const BASE = 'https://localhost:44352/ListaNegra'
export const getListaNegra      = ()         => axios.get(`${BASE}/get-all`)
export const createListaNegra   = (data)     => axios.post(`${BASE}/create`, data)
export const updateListaNegra   = (id, data) => axios.put(`${BASE}/update/${id}`, data)
export const desactivarListaNegra = (id)     => axios.delete(`${BASE}/desactivar/${id}`)