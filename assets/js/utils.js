/**
 * @file utils.js
 * @description Funciones utilitarias compartidas por todas las páginas de Panorama Digital.
 * Se agrupan aquí para no repetir lógica (principio DRY) y facilitar su migración
 * a pipes y servicios de Angular en la entrega final.
 */

/**
 * Escapa caracteres especiales de HTML para evitar inyección de código (XSS)
 * cuando se insertan textos escritos por el usuario (por ejemplo, noticias creadas
 * desde el Mini CRUD) mediante innerHTML.
 * @param {string} texto - Texto sin procesar.
 * @returns {string} Texto seguro para insertar en HTML.
 */
export function escaparHTML(texto = '') {
  return String(texto)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Convierte una fecha ISO (AAAA-MM-DD) a un formato legible en español.
 * @param {string} fechaISO - Fecha en formato ISO.
 * @param {boolean} [corta=false] - true para el formato abreviado de las tarjetas ("22 sept 2026").
 * @returns {string} Fecha formateada, por ejemplo "22 de septiembre de 2026".
 */
export function formatearFecha(fechaISO, corta = false) {
  // Se agrega la hora para evitar el desfase de zona horaria al interpretar la fecha.
  const fecha = new Date(`${fechaISO}T12:00:00`);
  return fecha.toLocaleDateString('es-CO', { day: 'numeric', month: corta ? 'short' : 'long', year: 'numeric' });
}

/**
 * Genera un identificador de texto sin tildes ni espacios a partir de un nombre.
 * Se usa para construir clases CSS por categoría (ej. "Educación" → "educacion").
 * @param {string} texto - Texto original.
 * @returns {string} Texto normalizado en minúsculas.
 */
export function slug(texto = '') {
  return texto
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, '-');
}

/**
 * Lee un parámetro de la URL actual (query string).
 * @param {string} nombre - Nombre del parámetro, por ejemplo "id".
 * @returns {string|null} Valor del parámetro o null si no existe.
 */
export function obtenerParametro(nombre) {
  return new URLSearchParams(window.location.search).get(nombre);
}

/**
 * Muestra una notificación temporal (toast de Bootstrap) en la esquina inferior.
 * @param {string} mensaje - Texto a mostrar.
 * @param {'success'|'danger'|'info'} [tipo='success'] - Estilo visual del mensaje.
 */
export function mostrarToast(mensaje, tipo = 'success') {
  let contenedor = document.getElementById('toast-container');
  if (!contenedor) {
    contenedor = document.createElement('div');
    contenedor.id = 'toast-container';
    contenedor.className = 'toast-container position-fixed bottom-0 end-0 p-3';
    document.body.appendChild(contenedor);
  }

  const toast = document.createElement('div');
  toast.className = `toast align-items-center text-bg-${tipo} border-0`;
  toast.setAttribute('role', 'status');
  toast.setAttribute('aria-live', 'polite');
  toast.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${escaparHTML(mensaje)}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Cerrar"></button>
    </div>`;
  contenedor.appendChild(toast);

  // "bootstrap" es el objeto global que expone el bundle de Bootstrap cargado por CDN.
  const instancia = new bootstrap.Toast(toast, { delay: 2500 });
  instancia.show();
  toast.addEventListener('hidden.bs.toast', () => toast.remove());
}
