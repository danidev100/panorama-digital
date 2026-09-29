/**
 * @file favoritos.service.js
 * @description Gestión de noticias favoritas del usuario.
 * Los favoritos se guardan en localStorage como un arreglo de IDs, de modo que
 * la lista se conserva aunque el usuario cierre el navegador.
 * Cada cambio emite el evento "favoritos:cambio" para que otras partes de la
 * interfaz (por ejemplo, el contador del menú) se actualicen automáticamente.
 */
import { leer, guardar } from './storage.service.js';

const CLAVE = 'favoritos';
export const EVENTO_CAMBIO = 'favoritos:cambio';

/**
 * Obtiene la lista de IDs marcados como favoritos.
 * @returns {number[]}
 */
export function obtenerFavoritos() {
  return leer(CLAVE, []);
}

/**
 * Indica si una noticia está en favoritos.
 * @param {number} id - Identificador de la noticia.
 * @returns {boolean}
 */
export function esFavorito(id) {
  return obtenerFavoritos().includes(id);
}

/**
 * Agrega o quita una noticia de favoritos.
 * @param {number} id - Identificador de la noticia.
 * @returns {boolean} true si quedó agregada, false si fue retirada.
 */
export function alternarFavorito(id) {
  const favoritos = obtenerFavoritos();
  const agregar = !favoritos.includes(id);
  const actualizados = agregar ? [...favoritos, id] : favoritos.filter((f) => f !== id);

  guardar(CLAVE, actualizados);
  notificarCambio(actualizados);
  return agregar;
}

/**
 * Quita un ID de favoritos (por ejemplo, cuando la noticia es eliminada del catálogo).
 * @param {number} id - Identificador de la noticia.
 */
export function quitarFavorito(id) {
  const actualizados = obtenerFavoritos().filter((f) => f !== id);
  guardar(CLAVE, actualizados);
  notificarCambio(actualizados);
}

/**
 * Emite un evento global con la lista actualizada de favoritos.
 * @param {number[]} favoritos
 */
function notificarCambio(favoritos) {
  document.dispatchEvent(new CustomEvent(EVENTO_CAMBIO, { detail: favoritos }));
}
