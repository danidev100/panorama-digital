/**
 * @file motion.js
 * @description Utilidades del sistema de movimiento de Panorama Digital.
 *  - transicion(): anima cambios dentro de la página (filtros, paginación, CRUD)
 *    con la View Transitions API, de modo que las tarjetas se reacomodan en lugar de saltar.
 *  - animar(): reinicia una animación CSS de un solo uso (pop, rebote, sacudir…).
 *  - iniciarMovimiento(): activa la revelación de secciones al hacer scroll y la
 *    imagen compartida entre la tarjeta y la vista de detalle.
 * Todo respeta la preferencia del sistema "reducir movimiento".
 */
import { guardar } from './services/storage.service.js';

/** Clave de sessionStorage con la imagen de la tarjeta pulsada (para la transición al detalle). */
export const CLAVE_IMAGEN = 'imagen_transicion';

const consultaReducir = window.matchMedia('(prefers-reduced-motion: reduce)');

/**
 * Indica si el usuario pidió reducir el movimiento en su sistema operativo.
 * @returns {boolean}
 */
export function reduceMovimiento() {
  return consultaReducir.matches;
}

/** Asigna un nombre de transición único a cada tarjeta visible para que se animen individualmente. */
function nombrarTarjetas() {
  document.querySelectorAll('.card-noticia[data-id]').forEach((card) => {
    card.style.viewTransitionName = `card-${card.dataset.id}`;
  });
}

/** Retira los nombres temporales para que no interfieran con la navegación entre páginas. */
function limpiarTarjetas() {
  document.querySelectorAll('.card-noticia[data-id]').forEach((card) => {
    card.style.viewTransitionName = '';
  });
}

/**
 * Ejecuta una actualización del DOM animada con una transición de vista.
 * Las tarjetas que permanecen se desplazan a su nueva posición, las que salen se
 * desvanecen y las nuevas aparecen. Si el navegador no soporta la API o el usuario
 * prefiere reducir el movimiento, la actualización se aplica directamente.
 * @param {Function} actualizar - Función (puede ser async) que modifica el DOM.
 * @returns {Promise<void>} Se resuelve cuando la animación termina.
 */
export async function transicion(actualizar) {
  if (!document.startViewTransition || reduceMovimiento()) {
    await actualizar();
    return;
  }

  const raiz = document.documentElement;
  raiz.classList.add('vt-local');
  nombrarTarjetas();

  const vt = document.startViewTransition(async () => {
    await actualizar();
    nombrarTarjetas(); // Las tarjetas nuevas también reciben su nombre.
  });

  try {
    await vt.finished;
  } catch {
    // Una transición interrumpida por otra no es un error: el DOM ya quedó actualizado.
  } finally {
    raiz.classList.remove('vt-local');
    limpiarTarjetas();
  }
}

/**
 * Reproduce una animación CSS de un solo uso sobre un elemento, aunque ya se hubiera ejecutado antes.
 * @param {Element|null} elemento - Elemento a animar.
 * @param {string} clase - Clase CSS que contiene la animación (ej. "pop").
 */
export function animar(elemento, clase) {
  if (!elemento) return;
  elemento.classList.remove(clase);
  void elemento.offsetWidth; // Fuerza un reflow para que el navegador reinicie la animación.
  elemento.classList.add(clase);
  elemento.addEventListener('animationend', () => elemento.classList.remove(clase), { once: true });
}

/** Quita el nombre de imagen compartida de cualquier tarjeta (solo puede existir uno por página). */
function limpiarImagenCompartida() {
  document.querySelectorAll('.card-img-top').forEach((img) => { img.style.viewTransitionName = ''; });
}

/**
 * Al pulsar una tarjeta, marca su imagen como "compartida" y guarda su ruta en sessionStorage.
 * La página de detalle usa esa ruta para mostrar la imagen desde el primer cuadro, y el
 * navegador anima la imagen desde la posición de la tarjeta hasta la cabecera del detalle.
 * @param {MouseEvent} evento
 */
function prepararImagenCompartida(evento) {
  const enlace = evento.target.closest('a[href*="detalle.html?id="]');
  const card = enlace?.closest('.card-noticia');
  const imagen = card?.querySelector('.card-img-top');
  if (!imagen) return;

  limpiarImagenCompartida();
  imagen.style.viewTransitionName = 'noticia-imagen';
  guardar(CLAVE_IMAGEN, { id: Number(card.dataset.id), src: imagen.getAttribute('src') }, sessionStorage);
}

/** Muestra con una transición suave las secciones marcadas con data-revelar al entrar en pantalla. */
function revelarAlDesplazar() {
  const secciones = document.querySelectorAll('[data-revelar]');
  if (!('IntersectionObserver' in window)) {
    secciones.forEach((s) => s.classList.add('visible'));
    return;
  }

  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('visible');
        observador.unobserve(entrada.target); // Se revela una sola vez.
      }
    });
  }, { rootMargin: '0px 0px -10% 0px' });

  secciones.forEach((s) => observador.observe(s));
}

/**
 * Activa el sistema de movimiento en la página actual. Lo invoca el layout en todas las páginas.
 */
export function iniciarMovimiento() {
  document.documentElement.classList.add('js-movimiento');
  revelarAlDesplazar();
  document.addEventListener('click', prepararImagenCompartida);
  // Al volver con el botón "Atrás" la página puede restaurarse desde caché con el nombre asignado.
  window.addEventListener('pageshow', limpiarImagenCompartida);
}
