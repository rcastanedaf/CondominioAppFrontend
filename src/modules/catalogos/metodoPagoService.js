import axios from 'axios'
const API_URL = 'https://localhost:44352/MetodoPago'

export const getMetodosPago   = async ()         => await axios.get(`${API_URL}/get`)
export const createMetodoPago = async (data)     => await axios.post(`${API_URL}/create`, data)
export const updateMetodoPago = async (id, data) => await axios.put(`${API_URL}/update/${id}`, data)
export const deleteMetodoPago = async (id)       => await axios.delete(`${API_URL}/delete/${id}`)