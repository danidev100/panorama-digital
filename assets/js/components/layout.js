/**
 * @file layout.js
 * @description Componentes de diseño compartidos: encabezado (header) y pie de página (footer).
 * Se generan desde JavaScript para no duplicar el mismo bloque HTML en las seis páginas;
 * así, un cambio en el menú se hace en un solo lugar. En Angular serán los componentes
 * <app-header> y <app-footer>.
 */
import { obtenerFavoritos, EVENTO_CAMBIO } from '../services/favoritos.service.js';
import { iniciarMovimiento, animar } from '../motion.js';

/** Elementos del menú principal (mínimo 5 páginas, según el requerimiento). */
const MENU = [
  { id: 'inicio', texto: 'Inicio', href: 'index.html', icono: 'bi-house' },
  { id: 'noticias', texto: 'Noticias', href: 'noticias.html', icono: 'bi-newspaper' },
  { id: 'categorias', texto: 'Categorías', href: 'categorias.html', icono: 'bi-grid' },
  { id: 'contacto', texto: 'Contacto', href: 'contacto.html', icono: 'bi-envelope' },
  { id: 'favoritos', texto: 'Favoritos', href: 'favoritos.html', icono: 'bi-star' },
];

/**
 * Inserta el header con el menú de navegación y resalta la página activa.
 * @param {string} paginaActiva - id de la página actual (ver MENU).
 */
export function renderizarHeader(paginaActiva) {
  const header = document.getElementById('app-header');
  if (!header) return;

  const enlaces = MENU.map((item) => {
    const activo = item.id === paginaActiva;
    const contador = item.id === 'favoritos'
      ? `<span class="badge rounded-pill bg-warning text-dark ms-1" id="contador-favoritos">${obtenerFavoritos().length}</span>`
      : '';
    return `
      <li class="nav-item">
        <a class="nav-link ${activo ? 'active' : ''}" href="${item.href}" ${activo ? 'aria-current="page"' : ''}>
          <i class="bi ${item.icono} me-1" aria-hidden="true"></i>${item.texto}${contador}
        </a>
      </li>`;
  }).join('');

  header.innerHTML = `
    <nav class="navbar navbar-expand-lg navbar-dark bg-marca sticky-top shadow-sm" aria-label="Menú principal">
      <div class="container">
        <a class="navbar-brand d-flex align-items-center gap-2" href="index.html">
          <img src="assets/img/logo.svg" alt="" width="36" height="36">
          <span class="fw-bold">Panorama <span class="text-acento">Digital</span></span>
        </a>
        <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#menu-principal"
                aria-controls="menu-principal" aria-expanded="false" aria-label="Abrir menú">
          <span class="navbar-toggler-icon"></span>
        </button>
        <div class="collapse navbar-collapse" id="menu-principal">
          <ul class="navbar-nav ms-auto">${enlaces}</ul>
        </div>
      </div>
    </nav>`;

  // Mantiene sincronizado el contador de favoritos cuando cambia la lista,
  // con un pequeño rebote que confirma visualmente el cambio.
  document.addEventListener(EVENTO_CAMBIO, (evento) => {
    const contador = document.getElementById('contador-favoritos');
    if (!contador) return;
    contador.textContent = evento.detail.length;
    animar(contador, 'rebote');
  });
}

/**
 * Inserta el footer con información general, enlaces, categorías y redes sociales.
 */
export function renderizarFooter() {
  const footer = document.getElementById('app-footer');
  if (!footer) return;

  const anio = new Date().getFullYear();
  footer.innerHTML = `
    <div class="footer-marca pt-5 pb-3 mt-5">
      <div class="container">
        <div class="row g-4">
          <div class="col-md-4">
            <h2 class="h5 text-white">Panorama Digital</h2>
            <p class="small mb-0">Noticias y experiencias de tecnología, turismo, educación y negocios, contadas de forma clara y cercana.</p>
          </div>
          <div class="col-6 col-md-2">
            <h3 class="h6 text-white">Enlaces</h3>
            <ul class="list-unstyled small">
              <li><a href="index.html">Inicio</a></li>
              <li><a href="noticias.html">Noticias</a></li>
              <li><a href="favoritos.html">Favoritos</a></li>
              <li><a href="contacto.html">Contacto</a></li>
            </ul>
          </div>
          <div class="col-6 col-md-3">
            <h3 class="h6 text-white">Categorías</h3>
            <ul class="list-unstyled small">
              <li><a href="noticias.html?categoria=Tecnología">Tecnología</a></li>
              <li><a href="noticias.html?categoria=Turismo">Turismo</a></li>
              <li><a href="noticias.html?categoria=Educación">Educación</a></li>
              <li><a href="noticias.html?categoria=Negocios">Negocios</a></li>
            </ul>
          </div>
          <div class="col-md-3">
            <h3 class="h6 text-white">Síguenos</h3>
            <div class="d-flex gap-3 fs-5">
              <a href="#" aria-label="Facebook"><i class="bi bi-facebook"></i></a>
              <a href="#" aria-label="Instagram"><i class="bi bi-instagram"></i></a>
              <a href="#" aria-label="X"><i class="bi bi-twitter-x"></i></a>
              <a href="#" aria-label="YouTube"><i class="bi bi-youtube"></i></a>
            </div>
            <p class="small mt-3 mb-0"><i class="bi bi-envelope me-1"></i>contacto@panoramadigital.co</p>
          </div>
        </div>
        <hr class="border-secondary">
        <p class="small text-center mb-0">© ${anio} Panorama Digital · Proyecto académico del módulo FRONT-END</p>
      </div>
    </div>`;
}

/**
 * Inicializa el layout común de cualquier página y activa el sistema de movimiento.
 * @param {string} paginaActiva - id de la página actual.
 */
export function iniciarLayout(paginaActiva) {
  renderizarHeader(paginaActiva);
  renderizarFooter();
  iniciarMovimiento();
}
