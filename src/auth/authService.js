import axios from 'axios';

const BASE_URL = 'https://localhost:44352';

/**
 * Intenta hacer login con las credenciales dadas.
 * Devuelve { success, data, message }.
 */
export const login = async (username, password) => {
    const response = await axios.post(`${BASE_URL}/Usuario/login`, {
        username,
        password,
    });
    return response.data;
};

/**
 * Cierra sesión eliminando los datos del localStorage.
 */
export const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('usuario');
};

/**
 * Devuelve true si hay un token guardado.
 */
export const isAuthenticated = () => !!localStorage.getItem('token');

/**
 * Devuelve el objeto usuario guardado en localStorage.
 */
export const getUsuario = () => {
    try {
        return JSON.parse(localStorage.getItem('usuario') ?? '{}');
    } catch {
        return {};
    }
};