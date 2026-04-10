import axios from 'axios'

const API_URL = 'https://localhost:44352/ConceptoDescuento'

export const getConceptosDescuento = async () => {
    return await axios.get(`${API_URL}/get-all-ConceptoDesc`)
}

export const createConceptoDescuento = async (data) => {
    return await axios.post(`${API_URL}/create-ConceptoDesc`, data)
}

export const updateConceptoDescuento = async (id, data) => {
    return await axios.put(`${API_URL}/update-ConceptoDesc/${id}`, data)
}

export const deleteConceptoDescuento = async (id) => {
    return await axios.delete(`${API_URL}/delete-ConceptoDesc/${id}`)
}
