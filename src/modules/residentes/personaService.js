import axios from 'axios'
const API_URL = 'https://localhost:44352/Persona'
export const getPersonas  = ()         => axios.get(`${API_URL}/get-all-persona`)
export const createPersona = (data)    => axios.post(`${API_URL}/create-persona`, data)
export const updatePersona = (id, data)=> axios.put(`${API_URL}/update-persona/${id}`, data)
export const deletePersona = (id)      => axios.delete(`${API_URL}/delete-persona/${id}`)