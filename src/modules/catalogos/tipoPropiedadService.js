import axios from 'axios'
const API_URL = 'https://localhost:44352/TipoPropiedad'
export const getTipoPropiedades  = ()        => axios.get(`${API_URL}/get-all-tipo-propiedad`)
export const createTipoPropiedad = (data)    => axios.post(`${API_URL}/create-tipo-propiedad`, data)
export const updateTipoPropiedad = (id, data)=> axios.put(`${API_URL}/update-tipo-propiedad/${id}`, data)
export const deleteTipoPropiedad = (id)      => axios.delete(`${API_URL}/delete-tipo-propiedad/${id}`)