import axios from 'axios'
const BASE = 'https://localhost:44352/api/Propiedad'
export const getAllPropiedades = () => axios.get(`${BASE}/get-all`).then(r => r.data)