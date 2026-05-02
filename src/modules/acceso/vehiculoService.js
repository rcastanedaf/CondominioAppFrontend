import axios from 'axios'
const BASE = 'https://localhost:44352/Vehiculo'
export const getVehiculos       = ()           => axios.get(`${BASE}/get-all`)
export const getVehiculosByResidente = (id)    => axios.get(`${BASE}/get-by-residente/${id}`)
export const createVehiculo     = (data)       => axios.post(`${BASE}/create`, data)
export const updateVehiculo     = (id, data)   => axios.put(`${BASE}/update/${id}`, data)
export const deleteVehiculo     = (id)         => axios.delete(`${BASE}/delete/${id}`)