import axios from 'axios'
const BASE = 'https://localhost:44352/CicloFacturacion'

export const getCiclos            = ()    => axios.get(`${BASE}/get-all`)
export const getCicloById         = (id)  => axios.get(`${BASE}/get-by-id/${id}`)
export const getCiclosByPropiedad = (id)  => axios.get(`${BASE}/get-by-propiedad/${id}`)
export const createCiclo          = (data)=> axios.post(`${BASE}/create`, data)
export const updateCiclo          = (data)=> axios.put(`${BASE}/update`, data)   // id va dentro del body
export const deleteCiclo          = (id)  => axios.delete(`${BASE}/delete/${id}`)
