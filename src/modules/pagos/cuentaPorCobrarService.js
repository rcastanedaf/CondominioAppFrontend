import axios from 'axios'
const BASE = 'https://localhost:44352/CuentaPorCobrar'
export const getCuentas          = ()    => axios.get(`${BASE}/get-all`)
export const getCuentaById       = (id)  => axios.get(`${BASE}/get-by-id/${id}`)
export const getCuentasByRes     = (id)  => axios.get(`${BASE}/get-by-residente/${id}`)
export const createCuenta        = (d)   => axios.post(`${BASE}/create`, d)
export const updateCuenta        = (d)   => axios.put(`${BASE}/update`, d)
export const deleteCuenta        = (id)  => axios.delete(`${BASE}/delete/${id}`)