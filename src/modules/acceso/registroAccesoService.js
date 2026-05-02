import axios from 'axios'
const BASE = 'https://localhost:44352/RegistroAcceso'
export const getRegistros    = (top = 200)         => axios.get(`${BASE}/get-all?top=${top}`)
export const getByFecha      = (desde, hasta)       => axios.get(`${BASE}/get-by-fecha?desde=${desde}&hasta=${hasta}`)
export const createRegistro  = (data)               => axios.post(`${BASE}/create`, data)