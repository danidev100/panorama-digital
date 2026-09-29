/**
 * @file favoritos.js
 * @description Página de Favoritos: muestra la lista personalizada del usuario,
 * leída desde localStorage, y permite quitar noticias o vaciar la lista.
 */
import { iniciarLayout } from '../components/layout.js';
import { renderizarCards } from '../components/card.js';
import { obtenerNoticias } from '../services/noticias.service.js';
import { obtenerFavoritos, quitarFavorito } from '../services/favoritos.service.js';
import { mostrarToast } from '../utils.js';
import { transicion } from '../motion.js';

iniciarLayout('favoritos');

const elLista = document.getElementById('lista-favoritos');
const btnVaciar = document.getElementById('btn-vaciar');
let catalogo = [];
let primeraCarga = true;

/** Muestra las tarjetas de favoritos o un estado vacío con llamado a la acción. */
function renderizar() {
  const ids = obtenerFavoritos();
  // Se respeta el orden en que el usuario los agregó (el más reciente primero).
  const favoritas = ids
    .map((id) => catalogo.find((n) => n.id === id))
    .filter(Boolean)
    .reverse();

  btnVaciar.classList.toggle('d-none', favoritas.length === 0);

  if (favoritas.length === 0) {
    elLista.innerHTML = `
      <div class="col-12">
        <div class="estado-vacio entrada">
          <i class="bi bi-star" aria-hidden="true"></i>
          <h2 class="h4 mt-3">Aún no tienes favoritos</h2>
          <p>Abre una noticia y pulsa <strong>“Agregar a favoritos”</strong> para guardarla aquí.</p>
          <a href="noticias.html" class="btn btn-primary">Explorar noticias</a>
        </div>
      </div>`;
    return;
  }

  renderizarCards(elLista, favoritas, { quitarFavorito: true, animar: primeraCarga });
  primeraCarga = false;
}

// Delegación de eventos para los botones "Quitar" de cada tarjeta.
elLista.addEventListener('click', (e) => {
  const boton = e.target.closest('[data-accion="quitar-favorito"]');
  if (!boton) return;
  quitarFavorito(Number(boton.dataset.id));
  transicion(renderizar); // La tarjeta retirada se desvanece y las demás se reacomodan.
  mostrarToast('Noticia retirada de favoritos.', 'info');
});

btnVaciar.addEventListener('click', () => {
  obtenerFavoritos().forEach((id) => quitarFavorito(id));
  transicion(renderizar);
  mostrarToast('Se vació tu lista de favoritos.', 'info');
});

async function iniciar() {
  try {
    catalogo = await obtenerNoticias();
    renderizar();
  } catch (error) {
    console.error(error);
    elLista.innerHTML = '<div class="col-12"><div class="alert alert-danger">No fue posible cargar tus favoritos.</div></div>';
  }
}

iniciar();
