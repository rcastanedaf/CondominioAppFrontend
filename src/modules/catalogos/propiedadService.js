import axios from 'axios'
const API_URL = 'https://localhost:44352/Propiedad'
export const getPropiedades  = ()         => axios.get(`${API_URL}/get-all-propiedad`)
export const createPropiedad = (data)     => axios.post(`${API_URL}/create-propiedad`, data)
export const updatePropiedad = (id, data) => axios.put(`${API_URL}/update-propiedad/${id}`, data)
export const deletePropiedad = (id)       => axios.delete(`${API_URL}/delete-propiedad/${id}`)