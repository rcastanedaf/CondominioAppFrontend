import axios from 'axios'
const BASE = 'https://localhost:44352/CobroMora'

export const getCobrosMora   = ()     => axios.get(`${BASE}/get-all`)
export const createCobroMora = (data) => axios.post(`${BASE}/create`, data)
export const updateCobroMora = (data) => axios.put(`${BASE}/update`, data)   // id va dentro del body
export const deleteCobroMora = (id)   => axios.delete(`${BASE}/delete/${id}`)