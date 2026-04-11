import axios from 'axios'
const API_URL = 'https://localhost:44352/TipoMoneda'

export const getTipoMonedas    = async ()       => await axios.get(`${API_URL}/get-all-tipo-moneda`)
export const createTipoMoneda  = async (data)   => await axios.post(`${API_URL}/create-tipo-moneda`, data)
export const updateTipoMoneda  = async (id, data) => await axios.put(`${API_URL}/update-tipo-moneda/${id}`, data)
export const deleteTipoMoneda  = async (id)     => await axios.delete(`${API_URL}/delete-tipo-moneda/${id}`)
