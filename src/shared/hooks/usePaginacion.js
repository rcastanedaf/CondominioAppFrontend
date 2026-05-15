import { useState, useEffect } from 'react'

export const PAGE_SIZE_OPTIONS = [5, 10, 20, 50]

export function usePaginacion(datos, porPaginaInicial = 10) {
  const [paginaActual, setPaginaActual] = useState(1)
  const [porPagina,    setPorPagina]    = useState(porPaginaInicial)
  const [filtro,       setFiltro]       = useState('')

  const lista = Array.isArray(datos) ? datos : []

  const datosFiltrados = lista.filter(row =>   // <-- cambia "datos" por "lista"
    Object.values(row).some(val =>
      String(val).toLowerCase().includes(filtro.toLowerCase())
    )
  )

  // Resetear a página 1 cuando cambian los datos, el tamaño o el filtro
  useEffect(() => { setPaginaActual(1) }, [datosFiltrados.length, porPagina])

  const totalPaginas = Math.max(1, Math.ceil(datosFiltrados.length / porPagina))
  const paginaSegura = Math.min(paginaActual, totalPaginas)

  const datosPagina = datosFiltrados.slice(
    (paginaSegura - 1) * porPagina,
    paginaSegura * porPagina
  )

  const irA = (p) => setPaginaActual(Math.max(1, Math.min(p, totalPaginas)))

  const paginas = () => {
    const pages = [], delta = 1
    for (let i = 1; i <= totalPaginas; i++) {
      if (i === 1 || i === totalPaginas || (i >= paginaSegura - delta && i <= paginaSegura + delta))
        pages.push(i)
      else if (pages[pages.length - 1] !== '...')
        pages.push('...')
    }
    return pages
  }

  return {
    // datos
    datosPagina,
    datosFiltrados,
    // filtro
    filtro,
    setFiltro,
    // paginación
    paginaSegura,
    totalPaginas,
    porPagina,
    setPorPagina,
    irA,
    paginas,
  }
}