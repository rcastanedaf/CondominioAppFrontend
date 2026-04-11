import axios from 'axios'
const API_URL = 'https://localhost:44352/api/Propiedad'
export const getPropiedades  = ()         => axios.get(`${API_URL}/get-all`)
export const createPropiedad = (data)     => axios.post(`${API_URL}/create`, data)
export const updatePropiedad = (id, data) => axios.put(`${API_URL}/update-/${id}`, data)
export const deletePropiedad = (id)       => axios.delete(`${API_URL}/delete/${id}`)