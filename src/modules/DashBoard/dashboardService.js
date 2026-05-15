import axios from 'axios'

const BASE_URL = 'https://localhost:44352/api/Dashboard'

export const getDashboard = () =>
  axios.get(`${BASE_URL}/get-resumen`).then(r => r.data)