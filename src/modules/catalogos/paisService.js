import axios from 'axios'
const API_URL = 'https://localhost:44352/Pais'

export const getPaises    = async ()         => await axios.get(`${API_URL}/get-all-pais`)
export const createPais   = async (data)     => await axios.post(`${API_URL}/create-pais`, data)
export const updatePais   = async (id, data) => await axios.put(`${API_URL}/update-pais/${id}`, data)
export const deletePais   = async (id)       => await axios.delete(`${API_URL}/delete-pais/${id}`)