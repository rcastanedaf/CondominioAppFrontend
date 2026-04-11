import axios from 'axios'
const API_URL = 'https://localhost:44352/Parentesco'

export const getParentescos    = async ()         => await axios.get(`${API_URL}/get-all-parentesco`)
export const createParentesco  = async (data)     => await axios.post(`${API_URL}/create-parentesco`, data)
export const updateParentesco  = async (id, data) => await axios.put(`${API_URL}/update-parentesco/${id}`, data)
export const deleteParentesco  = async (id)       => await axios.delete(`${API_URL}/delete-parentesco/${id}`)
