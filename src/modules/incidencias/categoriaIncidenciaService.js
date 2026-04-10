import axios from 'axios'

const BASE = 'https://localhost:44352'

export const getCategorias   = ()         => axios.get(`${BASE}/CategoriaIncidencia/get-all-categoria-incidencia`)
export const createCategoria = (data)     => axios.post(`${BASE}/CategoriaIncidencia/create-categoria-incidencia`, data)
export const updateCategoria = (id, data) => axios.put(`${BASE}/CategoriaIncidencia/update-categoria-incidencia/${id}`, data)
export const deleteCategoria = (id)       => axios.delete(`${BASE}/CategoriaIncidencia/delete-categoria-incidencia/${id}`)