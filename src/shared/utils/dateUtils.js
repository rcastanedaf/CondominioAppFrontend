/**
 * Formatea una fecha al estilo guatemalteco dd/mm/yyyy
 * @param {Date|string} date
 * @returns {string}
 */
export function formatDateGT(date) {
  return new Date(date).toLocaleDateString('es-GT')
}

/**
 * Devuelve la fecha actual formateada
 * @returns {string}
 */
export function todayGT() {
  return new Date().toLocaleDateString('es-GT')
}
