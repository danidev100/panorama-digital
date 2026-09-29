/**
 * @file noticias.service.js
 * @description Servicio de datos de noticias. Carga el catálogo base desde el archivo
 * JSON local y lo combina con los cambios hechos por el usuario en el Mini CRUD.
 *
 * Como el navegador no puede escribir sobre data/noticias.json, el CRUD se resuelve así:
 *  - Las noticias CREADAS se guardan en localStorage y se suman al catálogo.
 *  - Las noticias ELIMINADAS se registran como una lista de IDs ocultos en localStorage.
 * De esta forma el archivo JSON permanece intacto y los cambios persisten entre visitas.
 */
import { leer, guardar, eliminar } from './storage.service.js';
import { slug } from '../utils.js';

/** Ruta del archivo JSON con el catálogo base. */
const RUTA_JSON = 'data/noticias.json';

/** Claves de almacenamiento usadas por el Mini CRUD. */
const CLAVE_CREADAS = 'noticias_creadas';
const CLAVE_ELIMINADAS = 'noticias_eliminadas';

/** Categorías disponibles en la plataforma. */
export const CATEGORIAS = ['Tecnología', 'Turismo', 'Educación', 'Negocios'];

/** Caché en memoria para no descargar el JSON más de una vez por página. */
let catalogoBase = null;

/**
 * Descarga el catálogo base desde el archivo JSON (solo la primera vez).
 * @returns {Promise<Array<Object>>} Lista de noticias del archivo JSON.
 */
async function cargarCatalogoBase() {
  if (catalogoBase) return catalogoBase;

  const respuesta = await fetch(RUTA_JSON);
  if (!respuesta.ok) {
    throw new Error(`No se pudo cargar ${RUTA_JSON} (HTTP ${respuesta.status})`);
  }
  catalogoBase = await respuesta.json();
  return catalogoBase;
}

/**
 * Obtiene todas las noticias visibles: catálogo base + creadas − eliminadas,
 * ordenadas de la más reciente a la más antigua.
 * @returns {Promise<Array<Object>>}
 */
export async function obtenerNoticias() {
  const base = await cargarCatalogoBase();
  const creadas = leer(CLAVE_CREADAS, []);
  const eliminadas = new Set(leer(CLAVE_ELIMINADAS, []));

  return [...base, ...creadas]
    .filter((noticia) => !eliminadas.has(noticia.id))
    .sort((a, b) => b.fecha.localeCompare(a.fecha) || b.id - a.id);
}

/**
 * Busca una noticia por su identificador.
 * @param {number} id - Identificador de la noticia.
 * @returns {Promise<Object|undefined>} La noticia encontrada o undefined.
 */
export async function obtenerNoticiaPorId(id) {
  const noticias = await obtenerNoticias();
  return noticias.find((noticia) => noticia.id === Number(id));
}

/**
 * Devuelve las noticias marcadas como destacadas (para el Home).
 * @param {number} [limite=3] - Cantidad máxima a devolver.
 * @returns {Promise<Array<Object>>}
 */
export async function obtenerDestacadas(limite = 3) {
  const noticias = await obtenerNoticias();
  return noticias.filter((noticia) => noticia.destacada).slice(0, limite);
}

/**
 * Devuelve noticias de la misma categoría, excluyendo la noticia actual.
 * @param {Object} noticia - Noticia de referencia.
 * @param {number} [limite=3] - Cantidad máxima a devolver.
 * @returns {Promise<Array<Object>>}
 */
export async function obtenerRelacionadas(noticia, limite = 3) {
  const noticias = await obtenerNoticias();
  return noticias
    .filter((n) => n.categoria === noticia.categoria && n.id !== noticia.id)
    .slice(0, limite);
}

/**
 * CREATE — Crea una nueva noticia y la persiste en localStorage.
 * @param {{titulo:string, resumen:string, contenido:string, categoria:string, autor?:string, imagen?:string}} datos
 * @returns {Promise<Object>} La noticia creada con su id y fecha asignados.
 */
export async function crearNoticia(datos) {
  const todas = [...(await cargarCatalogoBase()), ...leer(CLAVE_CREADAS, [])];
  // El nuevo id es el mayor existente + 1 para que nunca se repita.
  const nuevoId = Math.max(0, ...todas.map((n) => n.id)) + 1;

  const noticia = {
    id: nuevoId,
    titulo: datos.titulo.trim(),
    resumen: datos.resumen.trim(),
    // El contenido se separa en párrafos por cada salto de línea.
    contenido: datos.contenido.split(/\n+/).map((p) => p.trim()).filter(Boolean),
    categoria: datos.categoria,
    imagen: datos.imagen?.trim() || `assets/img/noticias/default-${slug(datos.categoria)}.svg`,
    fecha: new Date().toISOString().slice(0, 10),
    autor: datos.autor?.trim() || 'Colaborador invitado',
    destacada: false,
    creadaPorUsuario: true,
  };

  guardar(CLAVE_CREADAS, [...leer(CLAVE_CREADAS, []), noticia]);
  return noticia;
}

/**
 * DELETE — Elimina una noticia.
 * Si fue creada por el usuario se borra de localStorage; si pertenece al JSON
 * base, su id se agrega a la lista de noticias ocultas.
 * @param {number} id - Identificador de la noticia.
 */
export function eliminarNoticia(id) {
  const creadas = leer(CLAVE_CREADAS, []);
  const esCreada = creadas.some((n) => n.id === id);

  if (esCreada) {
    guardar(CLAVE_CREADAS, creadas.filter((n) => n.id !== id));
  } else {
    guardar(CLAVE_ELIMINADAS, [...new Set([...leer(CLAVE_ELIMINADAS, []), id])]);
  }
}

/**
 * Restablece el catálogo a su estado original (útil para demostraciones).
 */
export function restablecerCatalogo() {
  eliminar(CLAVE_CREADAS);
  eliminar(CLAVE_ELIMINADAS);
}
