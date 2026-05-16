import axios from 'axios'
const BASE = 'https://localhost:44352/api/Rol'  // ← sin api/

export const getAllRoles      = ()              => axios.get(`${BASE}/get-all`)
export const getAllPermisos   = ()              => axios.get(`${BASE}/get-all-permisos`)
export const getPermisosByRol = (id)           => axios.get(`${BASE}/get-permisos/${id}`)
export const createRol       = (data)          => axios.post(`${BASE}/create`, data)
export const updateRol       = (id, data)      => axios.put(`${BASE}/update/${id}`, data)
export const toggleRol       = (id, v)         => axios.patch(`${BASE}/toggle-activo/${id}?activo=${v}`)
export const deleteRol       = (id)            => axios.delete(`${BASE}/delete/${id}`)
export const asignarPermiso  = (idRol, idPerm) => axios.post(`${BASE}/asignar-permiso/${idRol}/${idPerm}`)
export const quitarPermiso   = (idRol, idPerm) => axios.delete(`${BASE}/quitar-permiso/${idRol}/${idPerm}`)