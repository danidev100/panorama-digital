/**
 * @file card.js
 * @description Componente reutilizable que genera la tarjeta (card) de una noticia.
 * Es la misma tarjeta que aparece en el Home, el Listado, Favoritos y las
 * noticias relacionadas del Detalle, tal como se definió en los wireframes.
 * En la entrega final se convertirá en un componente de Angular (<app-noticia-card>).
 */
import { escaparHTML, formatearFecha, slug } from '../utils.js';
import { esFavorito } from '../services/favoritos.service.js';

/**
 * Crea el HTML de una tarjeta de noticia.
 * @param {Object} noticia - Datos de la noticia.
 * @param {Object} [opciones]
 * @param {boolean} [opciones.eliminable=false] - Muestra el botón de eliminar (Mini CRUD).
 * @param {boolean} [opciones.quitarFavorito=false] - Muestra el botón "Quitar" (página Favoritos).
 * @param {boolean} [opciones.animar=true] - Aplica la animación de entrada en cascada.
 * @param {number} [indice=0] - Posición de la tarjeta; define el retraso de su entrada.
 * @returns {string} HTML de la columna con la tarjeta.
 */
export function crearCard(noticia, { eliminable = false, quitarFavorito = false, animar = true } = {}, indice = 0) {
  const favorito = esFavorito(noticia.id);
  const enlace = `detalle.html?id=${noticia.id}`;

  return `
    <div class="col">
      <article class="card card-noticia h-100 ${animar ? 'entrada' : ''}" data-id="${noticia.id}" style="--i: ${indice}">
        <a href="${enlace}" class="card-img-wrap" tabindex="-1" aria-hidden="true">
          <img src="${escaparHTML(noticia.imagen)}" class="card-img-top" alt="" loading="lazy">
        </a>
        <!-- Indicador visual de favorito sobre la imagen -->
        ${favorito ? '<span class="badge-favorito" title="En favoritos"><i class="bi bi-star-fill"></i></span>' : ''}
        <div class="card-body d-flex flex-column">
          <span class="badge badge-categoria cat-${slug(noticia.categoria)} align-self-start mb-2">
            ${escaparHTML(noticia.categoria)}
          </span>
          <h3 class="card-title h5">
            <a href="${enlace}" class="stretched-link-title">${escaparHTML(noticia.titulo)}</a>
          </h3>
          <p class="card-text text-secondary">${escaparHTML(noticia.resumen)}</p>
          <div class="mt-auto d-flex align-items-center justify-content-between gap-2">
            <small class="text-secondary text-nowrap"><i class="bi bi-calendar3 me-1"></i>${formatearFecha(noticia.fecha, true)}</small>
            <div class="d-flex gap-2 flex-shrink-0">
              ${quitarFavorito ? `
                <button type="button" class="btn btn-sm btn-outline-danger text-nowrap" data-accion="quitar-favorito"
                        data-id="${noticia.id}" aria-label="Quitar de favoritos">
                  <i class="bi bi-star-fill"></i> Quitar
                </button>` : ''}
              ${eliminable ? `
                <button type="button" class="btn btn-sm btn-outline-danger" data-accion="eliminar"
                        data-id="${noticia.id}" aria-label="Eliminar noticia">
                  <i class="bi bi-trash3"></i>
                </button>` : ''}
              <a href="${enlace}" class="btn btn-sm btn-primary text-nowrap">Ver más</a>
            </div>
          </div>
        </div>
      </article>
    </div>`;
}

/**
 * Renderiza una lista de noticias dentro de un contenedor.
 * @param {HTMLElement} contenedor - Elemento donde se insertan las tarjetas.
 * @param {Array<Object>} noticias - Noticias a mostrar.
 * @param {Object} [opciones] - Mismas opciones de crearCard.
 */
export function renderizarCards(contenedor, noticias, opciones) {
  contenedor.innerHTML = noticias.map((n, i) => crearCard(n, opciones, i)).join('');
}
