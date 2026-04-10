import axios from 'axios'
const API_URL = 'https://localhost:44352/CobroMora'
export const getCobrosMora  = ()         => axios.get(`${API_URL}/get-all-cobro-mora`)
export const createCobroMora = (data)    => axios.post(`${API_URL}/create-cobro-mora`, data)
export const updateCobroMora = (id, data)=> axios.put(`${API_URL}/update-cobro-mora/${id}`, data)
export const deleteCobroMora = (id)      => axios.delete(`${API_URL}/delete-cobro-mora/${id}`)