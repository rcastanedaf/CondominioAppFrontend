import axios from 'axios'
const BASE = 'https://localhost:44352/Asistencia'
export const getAsistenciaByEmpleado = (id)    => axios.get(`${BASE}/get-by-empleado/${id}`)
export const createAsistencia        = (data)  => axios.post(`${BASE}/create`, data)
export const registrarSalida         = (id)    => axios.patch(`${BASE}/salida/${id}`)