import axios from 'axios'
const BASE = 'https://localhost:44352/Usuario'

export const login  = (data) => axios.post(`${BASE}/login`, data)
export const logout = ()     => { localStorage.removeItem('condo_user') }
export const getUser = ()    => {
  const raw = localStorage.getItem('condo_user')
  return raw ? JSON.parse(raw) : null
}
export const saveUser = (u)  => localStorage.setItem('condo_user', JSON.stringify(u))
export const isAuthenticated = () => !!getUser()