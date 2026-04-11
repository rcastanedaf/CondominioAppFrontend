import axios from 'axios'
const BASE = 'https://localhost:44352/ConceptoDescuento'

export const getConceptosDescuento = () => axios.get(`${BASE}/get-all-ConceptoDesc`)
