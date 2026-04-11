import axios from 'axios'

const BASE = 'https://localhost:44352/CuentaPorCobrar'

export const getCuentasCobrar      = ()     => axios.get(`${BASE}/get-all`)
export const getCuentaById         = (id)   => axios.get(`${BASE}/get-by-id/${id}`)
export const getCuentasByResidente = (id)   => axios.get(`${BASE}/get-by-residente/${id}`)
export const createCuentaCobrar    = (data) => axios.post(`${BASE}/create`, data)
export const updateCuentaCobrar    = (data) => axios.put(`${BASE}/update`, data)   // id va dentro del body
export const deleteCuentaCobrar    = (id)   => axios.delete(`${BASE}/delete/${id}`)
