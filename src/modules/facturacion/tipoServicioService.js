import axios from 'axios'
const API_URL = 'https://localhost:44352/TipoServicio'
export const getTipoServicios  = ()         => axios.get(`${API_URL}/get-all-tipo-servicio`)
export const createTipoServicio = (data)    => axios.post(`${API_URL}/create-tipo-servicio`, data)
export const updateTipoServicio = (id, data)=> axios.put(`${API_URL}/update-tipo-servicio/${id}`, data)
export const deleteTipoServicio = (id)      => axios.delete(`${API_URL}/delete-tipo-servicio/${id}`)