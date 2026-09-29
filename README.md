# Panorama Digital — Plataforma Web de Noticias

Prototipo funcional (Entrega 2) del módulo **FRONT-END** del Politécnico Grancolombiano.
Periódico digital donde los usuarios exploran noticias de **Tecnología, Turismo, Educación y Negocios**,
consultan su detalle, las guardan en favoritos, gestionan el catálogo (Mini CRUD) y contactan al equipo editorial.

**Autor:** Daniel Jaramillo Bustamante · **Tutor:** John Olarte Ramos

- **Sitio publicado:** https://danidev100.github.io/panorama-digital/
- **Repositorio:** https://github.com/danidev100/panorama-digital

## Funcionalidades

| Requerimiento | Implementación |
|---|---|
| Home con header, bienvenida, destacadas, CTA y footer | `index.html` + `home.js` |
| Catálogo de noticias en tarjetas (imagen, nombre, descripción, "Ver más") | `noticias.html` + `components/card.js` |
| Renderizado dinámico desde JSON | `data/noticias.json` cargado con `fetch()` en `noticias.service.js` |
| Filtros por categoría, búsqueda y paginación | `pages/noticias.js` |
| Vista de detalle con botón de interacción | `detalle.html?id=N` + `pages/detalle.js` |
| Favoritos persistentes | `localStorage` mediante `services/favoritos.service.js` |
| Formulario de contacto con validaciones y confirmación | `contacto.html` + `pages/contacto.js` (mensajes en `sessionStorage`) |
| Mini CRUD: crear y eliminar noticias | Modal en `noticias.html`; cambios persistidos en `localStorage` |
| Menú con mínimo 5 páginas | Inicio, Noticias, Categorías, Contacto, Favoritos (+ Detalle) |

## Tecnologías

- HTML5 semántico, CSS3 (variables, grid, flexbox) y JavaScript ES6+ con módulos (`import`/`export`)
- Bootstrap 5.3 y Bootstrap Icons (CDN)
- Google Fonts: Merriweather e Inter
- Web Storage API: `localStorage` y `sessionStorage`
- Ilustraciones SVG propias (sin derechos de terceros)

## Estructura del proyecto

```
panorama-digital/
├── index.html            Inicio (Home)
├── noticias.html         Listado + Mini CRUD
├── detalle.html          Detalle de una noticia (?id=N)
├── categorias.html       Categorías
├── favoritos.html        Lista personalizada de favoritos
├── contacto.html         Formulario de contacto
├── data/
│   └── noticias.json     Catálogo base de noticias
└── assets/
    ├── css/styles.css    Estilos propios sobre Bootstrap
    ├── img/              Logo e ilustraciones SVG
    └── js/
        ├── utils.js      Utilidades (escape HTML, fechas, toasts)
        ├── services/     Datos y almacenamiento (storage, noticias, favoritos)
        ├── components/   Piezas reutilizables (header/footer, tarjeta)
        └── pages/        Lógica de cada página
```

La separación en `services`, `components` y `pages` anticipa la migración a Angular de la entrega final:
cada servicio se convertirá en un `@Injectable` y cada componente en un componente de Angular.

## Cómo ejecutarlo localmente

El proyecto carga el JSON con `fetch()`, por lo que debe abrirse desde un servidor HTTP
(los navegadores bloquean `fetch()` sobre archivos abiertos con doble clic, `file://`).

- **VS Code:** extensión *Live Server* → clic derecho en `index.html` → *Open with Live Server*.
- **Python:** `python -m http.server 8080` y abrir `http://localhost:8080`.
- **Node:** `npx serve .`

## Nota sobre el Mini CRUD

El navegador no puede modificar `data/noticias.json`. Por eso las noticias creadas se guardan en
`localStorage` (`pd_noticias_creadas`) y las eliminadas se registran como IDs ocultos (`pd_noticias_eliminadas`).
El botón **"Restablecer catálogo de ejemplo"** del listado devuelve el catálogo a su estado original.
