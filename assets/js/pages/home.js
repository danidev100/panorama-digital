/**
 * @file home.js
 * @description Lógica de la página de Inicio: renderiza las noticias destacadas
 * desde el JSON y actualiza los datos de la sección informativa.
 */
import { iniciarLayout } from '../components/layout.js';
import { renderizarCards } from '../components/card.js';
import { obtenerDestacadas, obtenerNoticias } from '../services/noticias.service.js';
import { obtenerFavoritos } from '../services/favoritos.service.js';

iniciarLayout('inicio');

/**
 * Carga y muestra las noticias destacadas y las cifras de la sección informativa.
 */
async function iniciar() {
  const contenedor = document.getElementById('lista-destacadas');

  try {
    const [destacadas, todas] = await Promise.all([obtenerDestacadas(3), obtenerNoticias()]);
    renderizarCards(contenedor, destacadas);

    document.getElementById('dato-noticias').textContent = todas.length;
    document.getElementById('dato-favoritos').textContent = obtenerFavoritos().length;
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = `
      <div class="col-12">
        <div class="alert alert-danger">No fue posible cargar las noticias. Intenta de nuevo más tarde.</div>
      </div>`;
  }
}

iniciar();
