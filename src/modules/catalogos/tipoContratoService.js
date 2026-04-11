import axios from 'axios'
const API_URL = 'https://localhost:44352/TipoContrato'

export const getTiposContrato   = async ()         => await axios.get(`${API_URL}/get-all`)
export const createTipoContrato = async (data)     => await axios.post(`${API_URL}/create`, data)
export const updateTipoContrato = async (id, data) => await axios.put(`${API_URL}/update/${id}`, data)
export const deleteTipoContrato = async (id)       => await axios.delete(`${API_URL}/delete/${id}`)