/**
 * @file storage.service.js
 * @description Capa de acceso al almacenamiento del navegador (localStorage y sessionStorage).
 * Centraliza la lectura y escritura en formato JSON y protege la aplicación ante
 * errores (por ejemplo, navegación privada o almacenamiento lleno), de modo que
 * el resto del código no tenga que repetir bloques try/catch.
 */

/** Prefijo común para todas las claves y así evitar colisiones con otros sitios en local. */
const PREFIJO = 'pd_';

/**
 * Lee un valor JSON del almacenamiento indicado.
 * @param {string} clave - Clave sin prefijo.
 * @param {*} valorPorDefecto - Valor devuelto si la clave no existe o hay un error.
 * @param {Storage} [almacen=localStorage] - localStorage o sessionStorage.
 * @returns {*} Valor almacenado o el valor por defecto.
 */
export function leer(clave, valorPorDefecto, almacen = localStorage) {
  try {
    const crudo = almacen.getItem(PREFIJO + clave);
    return crudo === null ? valorPorDefecto : JSON.parse(crudo);
  } catch (error) {
    console.warn(`No fue posible leer "${clave}" del almacenamiento`, error);
    return valorPorDefecto;
  }
}

/**
 * Guarda un valor en formato JSON en el almacenamiento indicado.
 * @param {string} clave - Clave sin prefijo.
 * @param {*} valor - Valor serializable a JSON.
 * @param {Storage} [almacen=localStorage] - localStorage o sessionStorage.
 */
export function guardar(clave, valor, almacen = localStorage) {
  try {
    almacen.setItem(PREFIJO + clave, JSON.stringify(valor));
  } catch (error) {
    console.warn(`No fue posible guardar "${clave}" en el almacenamiento`, error);
  }
}

/**
 * Elimina una clave del almacenamiento indicado.
 * @param {string} clave - Clave sin prefijo.
 * @param {Storage} [almacen=localStorage] - localStorage o sessionStorage.
 */
export function eliminar(clave, almacen = localStorage) {
  try {
    almacen.removeItem(PREFIJO + clave);
  } catch (error) {
    console.warn(`No fue posible eliminar "${clave}" del almacenamiento`, error);
  }
}
