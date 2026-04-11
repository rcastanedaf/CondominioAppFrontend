import axios from 'axios'
const BASE = 'https://localhost:44352/CategoriaIncidencia'

export const getCategorias   = ()     => axios.get(`${BASE}/get-all`)
export const createCategoria = (data) => axios.post(`${BASE}/create`, data)
export const updateCategoria = (data) => axios.put(`${BASE}/update`, data)   // id va dentro del body
export const deleteCategoria = (id)   => axios.delete(`${BASE}/delete/${id}`)
