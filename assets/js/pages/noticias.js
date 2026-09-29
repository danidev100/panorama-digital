/**
 * @file noticias.js
 * @description Lógica del Listado de noticias:
 *  - Renderizado dinámico de tarjetas desde el JSON.
 *  - Filtro por categoría (también desde la URL: noticias.html?categoria=Turismo).
 *  - Búsqueda por texto en título y resumen.
 *  - Paginación de resultados.
 *  - Mini CRUD: crear y eliminar noticias.
 */
import { iniciarLayout } from '../components/layout.js';
import { renderizarCards } from '../components/card.js';
import {
  CATEGORIAS, obtenerNoticias, crearNoticia, eliminarNoticia, restablecerCatalogo,
} from '../services/noticias.service.js';
import { quitarFavorito } from '../services/favoritos.service.js';
import { obtenerParametro, mostrarToast, escaparHTML } from '../utils.js';
import { transicion, animar } from '../motion.js';

iniciarLayout('noticias');

/** Cantidad de tarjetas por página. */
const POR_PAGINA = 6;

/** Estado de la vista: se modifica con los filtros y se vuelve a renderizar. */
const estado = {
  noticias: [],
  categoria: CATEGORIAS.includes(obtenerParametro('categoria')) ? obtenerParametro('categoria') : 'Todas',
  busqueda: '',
  pagina: 1,
  idPorEliminar: null,
  primeraCarga: true, // Solo la primera carga muestra las tarjetas en cascada.
};

// Referencias a elementos del DOM
const elLista = document.getElementById('lista-noticias');
const elFiltros = document.getElementById('filtros-categoria');
const elBuscador = document.getElementById('buscador');
const elPaginacion = document.getElementById('paginacion');
const elResumen = document.getElementById('resumen-resultados');
const formPublicar = document.getElementById('form-publicar');
const modalPublicar = bootstrap.Modal.getOrCreateInstance('#modal-publicar');
const modalEliminar = bootstrap.Modal.getOrCreateInstance('#modal-eliminar');

/**
 * Cierra un modal y espera a que termine su animación de salida, para que la
 * transición de las tarjetas no se superponga con el cierre del modal.
 * @param {string} idModal - id del elemento del modal.
 * @returns {Promise<void>}
 */
function cerrarModal(idModal) {
  const elemento = document.getElementById(idModal);
  return new Promise((resolver) => {
    elemento.addEventListener('hidden.bs.modal', () => resolver(), { once: true });
    bootstrap.Modal.getOrCreateInstance(elemento).hide();
  });
}

/* ---------------------------------------------------------------------------
 * Filtrado y renderizado
 * ------------------------------------------------------------------------- */

/**
 * Aplica el filtro de categoría y la búsqueda sobre el catálogo completo.
 * @returns {Array<Object>} Noticias que cumplen los criterios.
 */
function filtrarNoticias() {
  const texto = estado.busqueda.trim().toLowerCase();
  return estado.noticias.filter((n) => {
    const coincideCategoria = estado.categoria === 'Todas' || n.categoria === estado.categoria;
    const coincideTexto = !texto
      || n.titulo.toLowerCase().includes(texto)
      || n.resumen.toLowerCase().includes(texto);
    return coincideCategoria && coincideTexto;
  });
}

/** Dibuja los botones de filtro por categoría y marca el activo. */
function renderizarFiltros() {
  elFiltros.innerHTML = ['Todas', ...CATEGORIAS].map((cat) => `
    <button type="button" class="btn-filtro ${cat === estado.categoria ? 'activo' : ''}"
            data-categoria="${cat}" aria-pressed="${cat === estado.categoria}">${cat}</button>`).join('');
}

/**
 * Dibuja los controles de paginación.
 * @param {number} totalPaginas
 */
function renderizarPaginacion(totalPaginas) {
  if (totalPaginas <= 1) {
    elPaginacion.innerHTML = '';
    return;
  }

  const item = (pagina, contenido, { deshabilitado = false, activo = false, etiqueta = '' } = {}) => `
    <li class="page-item ${deshabilitado ? 'disabled' : ''} ${activo ? 'active' : ''}">
      <button type="button" class="page-link" data-pagina="${pagina}" ${etiqueta ? `aria-label="${etiqueta}"` : ''}
              ${activo ? 'aria-current="page"' : ''}>${contenido}</button>
    </li>`;

  let html = item(estado.pagina - 1, '&laquo;', { deshabilitado: estado.pagina === 1, etiqueta: 'Página anterior' });
  for (let p = 1; p <= totalPaginas; p++) {
    html += item(p, p, { activo: p === estado.pagina });
  }
  html += item(estado.pagina + 1, '&raquo;', { deshabilitado: estado.pagina === totalPaginas, etiqueta: 'Página siguiente' });
  elPaginacion.innerHTML = html;
}

/** Renderiza la vista completa según el estado actual. */
function renderizar() {
  const filtradas = filtrarNoticias();
  const totalPaginas = Math.max(1, Math.ceil(filtradas.length / POR_PAGINA));
  estado.pagina = Math.min(estado.pagina, totalPaginas);

  const inicio = (estado.pagina - 1) * POR_PAGINA;
  const visibles = filtradas.slice(inicio, inicio + POR_PAGINA);

  renderizarFiltros();

  if (visibles.length === 0) {
    elLista.innerHTML = `
      <div class="col-12">
        <div class="estado-vacio entrada">
          <i class="bi bi-search" aria-hidden="true"></i>
          <p class="mt-3 mb-0">No encontramos noticias con esos criterios.</p>
        </div>
      </div>`;
  } else {
    renderizarCards(elLista, visibles, { eliminable: true, animar: estado.primeraCarga });
  }
  estado.primeraCarga = false;

  elResumen.textContent = `Mostrando ${visibles.length} de ${filtradas.length} noticia(s)`
    + (estado.categoria !== 'Todas' ? ` en ${estado.categoria}` : '');
  renderizarPaginacion(totalPaginas);
}

/** Vuelve a leer el catálogo (después de crear o eliminar) y actualiza la vista. */
async function recargar() {
  estado.noticias = await obtenerNoticias();
  renderizar();
}

/* ---------------------------------------------------------------------------
 * Eventos de filtros, búsqueda y paginación
 * ------------------------------------------------------------------------- */

elFiltros.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-categoria]');
  if (!boton) return;
  estado.categoria = boton.dataset.categoria;
  estado.pagina = 1;

  // Se refleja el filtro en la URL para poder compartir el enlace.
  const url = new URL(window.location);
  if (estado.categoria === 'Todas') url.searchParams.delete('categoria');
  else url.searchParams.set('categoria', estado.categoria);
  history.replaceState(null, '', url);

  // Las tarjetas que siguen visibles se deslizan a su nueva posición; las demás se desvanecen.
  transicion(renderizar);
});

// La búsqueda se actualiza sin animación: al escribir rápido, animar cada tecla resultaría molesto.
elBuscador.addEventListener('input', () => {
  estado.busqueda = elBuscador.value;
  estado.pagina = 1;
  renderizar();
});

elPaginacion.addEventListener('click', async (e) => {
  const boton = e.target.closest('[data-pagina]');
  if (!boton || boton.closest('.disabled')) return;
  estado.pagina = Number(boton.dataset.pagina);
  // Primero se reemplazan las tarjetas con su transición y luego se lleva la vista al inicio del listado.
  await transicion(renderizar);
  elResumen.scrollIntoView({ behavior: 'smooth', block: 'center' });
});

/* ---------------------------------------------------------------------------
 * Mini CRUD — Eliminar
 * ------------------------------------------------------------------------- */

// Delegación de eventos: un solo listener para los botones de todas las tarjetas.
elLista.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion="eliminar"]');
  if (!boton) return;

  estado.idPorEliminar = Number(boton.dataset.id);
  const noticia = estado.noticias.find((n) => n.id === estado.idPorEliminar);
  document.getElementById('eliminar-titulo').textContent = `“${noticia.titulo}”`;
  modalEliminar.show();
});

document.getElementById('btn-confirmar-eliminar').addEventListener('click', async () => {
  eliminarNoticia(estado.idPorEliminar);
  quitarFavorito(estado.idPorEliminar); // Una noticia eliminada no debe seguir en favoritos.
  await cerrarModal('modal-eliminar');
  // La tarjeta eliminada se desvanece y las siguientes ocupan su lugar.
  await transicion(recargar);
  mostrarToast('Noticia eliminada del catálogo.', 'danger');
});

document.getElementById('btn-restablecer').addEventListener('click', async () => {
  restablecerCatalogo();
  await transicion(recargar);
  mostrarToast('Se restableció el catálogo de ejemplo.', 'info');
});

/* ---------------------------------------------------------------------------
 * Mini CRUD — Crear (formulario con validaciones)
 * ------------------------------------------------------------------------- */

// Se llenan las opciones de categoría desde la constante del servicio.
document.getElementById('pub-categoria').insertAdjacentHTML(
  'beforeend',
  CATEGORIAS.map((c) => `<option value="${c}">${c}</option>`).join(''),
);

/**
 * Valida la URL opcional de la imagen: solo se aceptan http o https.
 * @param {HTMLInputElement} input
 */
function validarUrlImagen(input) {
  const valor = input.value.trim();
  const valida = !valor || /^https?:\/\/\S+$/i.test(valor);
  input.setCustomValidity(valida ? '' : 'URL inválida');
}

formPublicar.addEventListener('submit', async (e) => {
  e.preventDefault();
  validarUrlImagen(formPublicar.imagen);

  // Validación nativa de HTML5 (required, minlength, maxlength) + estilos de Bootstrap.
  if (!formPublicar.checkValidity()) {
    formPublicar.classList.add('was-validated');
    // Cada campo con error se sacude una vez para señalarlo.
    formPublicar.querySelectorAll(':invalid').forEach((campo) => animar(campo, 'sacudir'));
    formPublicar.querySelector(':invalid')?.focus();
    return;
  }

  const datos = Object.fromEntries(new FormData(formPublicar));
  const noticia = await crearNoticia(datos);

  formPublicar.reset();
  formPublicar.classList.remove('was-validated');
  await cerrarModal('modal-publicar');

  // Se muestra la nueva noticia al inicio del listado; las demás se desplazan para hacerle espacio.
  estado.categoria = 'Todas';
  estado.busqueda = '';
  estado.pagina = 1;
  elBuscador.value = '';
  await transicion(recargar);
  mostrarToast(`Noticia publicada: ${noticia.titulo}`);
});

/* ---------------------------------------------------------------------------
 * Inicio
 * ------------------------------------------------------------------------- */

async function iniciar() {
  try {
    await recargar();
    // Permite abrir el formulario directamente desde el Home (noticias.html#publicar).
    if (window.location.hash === '#publicar') modalPublicar.show();
  } catch (error) {
    console.error(error);
    elLista.innerHTML = `<div class="col-12"><div class="alert alert-danger">
      No fue posible cargar las noticias (${escaparHTML(error.message)}).</div></div>`;
    elResumen.textContent = '';
  }
}

iniciar();
