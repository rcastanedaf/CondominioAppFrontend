import axios from 'axios'
const BASE = 'https://localhost:44352/Empleado'
export const getEmpleados     = ()         => axios.get(`${BASE}/get-all`)
export const createEmpleado   = (data)     => axios.post(`${BASE}/create`, data)
export const updateEmpleado   = (id, data) => axios.put(`${BASE}/update/${id}`, data)
export const deleteEmpleado   = (id)       => axios.delete(`${BASE}/delete/${id}`)