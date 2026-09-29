/**
 * @file detalle.js
 * @description Vista de detalle: lee el id de la URL (detalle.html?id=3), muestra la
 * información completa de la noticia, permite agregarla o quitarla de favoritos y
 * lista noticias relacionadas de la misma categoría.
 */
import { iniciarLayout } from '../components/layout.js';
import { renderizarCards } from '../components/card.js';
import { obtenerNoticiaPorId, obtenerRelacionadas } from '../services/noticias.service.js';
import { esFavorito, alternarFavorito } from '../services/favoritos.service.js';
import { obtenerParametro, escaparHTML, formatearFecha, slug, mostrarToast } from '../utils.js';

iniciarLayout('');

const elDetalle = document.getElementById('detalle-noticia');

/**
 * Devuelve el HTML del botón de favoritos según el estado actual.
 * @param {boolean} activo - true si la noticia ya está en favoritos.
 * @returns {string}
 */
function botonFavorito(activo) {
  return activo
    ? '<i class="bi bi-star-fill me-2"></i>Quitar de favoritos'
    : '<i class="bi bi-star me-2"></i>Agregar a favoritos';
}

/** Muestra un mensaje cuando el id no existe o fue eliminado. */
function mostrarNoEncontrada() {
  document.title = 'Noticia no encontrada | Panorama Digital';
  elDetalle.innerHTML = `
    <div class="estado-vacio">
      <i class="bi bi-exclamation-circle" aria-hidden="true"></i>
      <h1 class="h3 mt-3">Noticia no encontrada</h1>
      <p>Es posible que haya sido eliminada o que el enlace no sea correcto.</p>
      <a href="noticias.html" class="btn btn-primary">Volver al listado</a>
    </div>`;
}

/**
 * Renderiza la noticia completa.
 * @param {Object} n - Noticia a mostrar.
 */
function renderizarNoticia(n) {
  document.title = `${n.titulo} | Panorama Digital`;
  const parrafos = n.contenido.map((p) => `<p>${escaparHTML(p)}</p>`).join('');
  // Se prellena el asunto del formulario de contacto con el título de la noticia.
  const enlaceContacto = `contacto.html?asunto=${encodeURIComponent(`Consulta sobre: ${n.titulo}`)}`;

  elDetalle.innerHTML = `
    <!-- Migas de pan (breadcrumb) -->
    <nav aria-label="Ruta de navegación" class="migas mb-3">
      <ol class="breadcrumb mb-0">
        <li class="breadcrumb-item"><a href="index.html">Inicio</a></li>
        <li class="breadcrumb-item"><a href="noticias.html">Noticias</a></li>
        <li class="breadcrumb-item active text-truncate" aria-current="page" style="max-width: 50ch">${escaparHTML(n.titulo)}</li>
      </ol>
    </nav>

    <img src="${escaparHTML(n.imagen)}" alt="Imagen de la noticia: ${escaparHTML(n.titulo)}" class="detalle-imagen mb-4">

    <div class="row justify-content-center">
      <div class="col-lg-9">
        <span class="badge badge-categoria cat-${slug(n.categoria)} mb-3">${escaparHTML(n.categoria)}</span>
        <h1 class="detalle-titulo">${escaparHTML(n.titulo)}</h1>
        <p class="detalle-meta d-flex flex-wrap gap-3 mb-4">
          <span><i class="bi bi-calendar3 me-1"></i>${formatearFecha(n.fecha)}</span>
          <span><i class="bi bi-person me-1"></i>${escaparHTML(n.autor)}</span>
        </p>
        <p class="lead fw-semibold">${escaparHTML(n.resumen)}</p>
        <div class="detalle-cuerpo">${parrafos}</div>

        <!-- Botones de interacción -->
        <div class="d-flex flex-wrap gap-2 mt-4 pt-3 border-top">
          <button type="button" id="btn-favorito" class="btn ${esFavorito(n.id) ? 'btn-acento' : 'btn-outline-primary'}"
                  aria-pressed="${esFavorito(n.id)}">${botonFavorito(esFavorito(n.id))}</button>
          <a href="${enlaceContacto}" class="btn btn-outline-secondary"><i class="bi bi-envelope me-2"></i>Contactar sobre esto</a>
          <a href="noticias.html" class="btn btn-link ms-auto"><i class="bi bi-arrow-left me-1"></i>Volver al listado</a>
        </div>
      </div>
    </div>`;

  // Evento del botón de favoritos: guarda/quita en localStorage y actualiza el botón.
  const boton = document.getElementById('btn-favorito');
  boton.addEventListener('click', () => {
    const agregada = alternarFavorito(n.id);
    boton.innerHTML = botonFavorito(agregada);
    boton.className = `btn ${agregada ? 'btn-acento' : 'btn-outline-primary'}`;
    boton.setAttribute('aria-pressed', agregada);
    mostrarToast(agregada ? 'Noticia agregada a favoritos.' : 'Noticia retirada de favoritos.', agregada ? 'success' : 'info');
  });
}

async function iniciar() {
  const id = Number(obtenerParametro('id'));

  try {
    const noticia = Number.isInteger(id) && id > 0 ? await obtenerNoticiaPorId(id) : undefined;
    if (!noticia) {
      mostrarNoEncontrada();
      return;
    }

    renderizarNoticia(noticia);

    const relacionadas = await obtenerRelacionadas(noticia, 3);
    if (relacionadas.length) {
      renderizarCards(document.getElementById('lista-relacionadas'), relacionadas);
      document.getElementById('seccion-relacionadas').classList.remove('d-none');
    }
  } catch (error) {
    console.error(error);
    elDetalle.innerHTML = '<div class="alert alert-danger">No fue posible cargar la noticia.</div>';
  }
}

iniciar();
