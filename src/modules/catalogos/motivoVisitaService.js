import axios from 'axios'
const API_URL = 'https://localhost:44352/MotivoVisita'

export const getMotivosVisita   = async ()         => await axios.get(`${API_URL}/get-all-motivo-visita`)
export const createMotivoVisita = async (data)     => await axios.post(`${API_URL}/create-motivo-visita`, data)
export const updateMotivoVisita = async (id, data) => await axios.put(`${API_URL}/update-motivo-visita/${id}`, data)
export const deleteMotivoVisita = async (id)       => await axios.delete(`${API_URL}/delete-motivo-visita/${id}`)