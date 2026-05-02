import axios from 'axios'
const BASE = 'https://localhost:44352/LogAuditoria'
export const getLogs         = (top = 500) => axios.get(`${BASE}/get-all?top=${top}`)
export const registrarLog    = (data)      => axios.post(`${BASE}/registrar`, data)