import axios from 'axios'
const API_URL = 'https://localhost:44352/api/tipoPropiedad'
export const getTipoPropiedades  = ()        => axios.get(`${API_URL}/get-all`)
export const createTipoPropiedad = (data)    => axios.post(`${API_URL}/create`, data)
export const updateTipoPropiedad = (id, data)=> axios.put(`${API_URL}/update/${id}`, data)
export const deleteTipoPropiedad = (id)      => axios.delete(`${API_URL}/delete/${id}`)