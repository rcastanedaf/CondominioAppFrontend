import axios from 'axios'

const BASE = 'https://localhost:44352'

export const getSeguimientoByIncidencia = (idIncidencia) =>
  axios.get(`${BASE}/SeguimientoIncidencia/get-by-incidencia-seguimiento/${idIncidencia}`)

export const createSeguimiento = (data)     => axios.post(`${BASE}/SeguimientoIncidencia/create-seguimiento`, data)
export const updateSeguimiento = (id, data) => axios.put(`${BASE}/SeguimientoIncidencia/update-seguimiento/${id}`, data)
export const deleteSeguimiento = (id)       => axios.delete(`${BASE}/SeguimientoIncidencia/delete-seguimiento/${id}`)