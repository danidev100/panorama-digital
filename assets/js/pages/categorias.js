/**
 * @file categorias.js
 * @description Página de Categorías: muestra una tarjeta por categoría con la cantidad
 * de noticias y el titular más reciente; cada tarjeta enlaza al listado filtrado.
 */
import { iniciarLayout } from '../components/layout.js';
import { CATEGORIAS, obtenerNoticias } from '../services/noticias.service.js';
import { escaparHTML, slug } from '../utils.js';

iniciarLayout('categorias');

/** Descripción corta de cada categoría. */
const DESCRIPCIONES = {
  'Tecnología': 'Innovación, herramientas digitales, ciberseguridad y desarrollo web.',
  'Turismo': 'Destinos, rutas, guías de viaje y experiencias de naturaleza.',
  'Educación': 'Formación, técnicas de estudio y oportunidades de aprendizaje.',
  'Negocios': 'Emprendimiento, finanzas personales y nuevas formas de trabajo.',
};

async function iniciar() {
  const contenedor = document.getElementById('lista-categorias');

  try {
    const noticias = await obtenerNoticias();

    contenedor.innerHTML = CATEGORIAS.map((categoria) => {
      const deCategoria = noticias.filter((n) => n.categoria === categoria);
      const reciente = deCategoria[0]; // Ya vienen ordenadas de la más reciente a la más antigua.
      const enlace = `noticias.html?categoria=${encodeURIComponent(categoria)}`;

      return `
        <div class="col">
          <article class="card card-categoria h-100">
            <img src="assets/img/noticias/default-${slug(categoria)}.svg" class="card-img-top" alt="">
            <div class="card-body">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <h2 class="h4 mb-0">${categoria}</h2>
                <span class="badge badge-categoria cat-${slug(categoria)}">${deCategoria.length} noticia(s)</span>
              </div>
              <p class="text-secondary">${DESCRIPCIONES[categoria]}</p>
              ${reciente ? `<p class="small mb-3"><strong>Lo más reciente:</strong>
                <a href="detalle.html?id=${reciente.id}">${escaparHTML(reciente.titulo)}</a></p>` : ''}
              <a href="${enlace}" class="btn btn-primary">Ver noticias de ${categoria} <i class="bi bi-arrow-right"></i></a>
            </div>
          </article>
        </div>`;
    }).join('');
  } catch (error) {
    console.error(error);
    contenedor.innerHTML = '<div class="col-12"><div class="alert alert-danger">No fue posible cargar las categorías.</div></div>';
  }
}

iniciar();
