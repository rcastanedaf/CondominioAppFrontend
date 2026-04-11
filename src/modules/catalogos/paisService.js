import axios from 'axios'
const API_URL = 'https://localhost:44352/Pais'

export const getPaises    = async ()         => await axios.get(`${API_URL}/get-all`)
export const createPais   = async (data)     => await axios.post(`${API_URL}/create`, data)
export const updatePais   = async (id, data) => await axios.put(`${API_URL}/update/${id}`, data)
export const deletePais   = async (id)       => await axios.delete(`${API_URL}/delete/${id}`)