/**
 * @file contacto.js
 * @description Formulario de contacto con validaciones:
 *  - Campos obligatorios: nombre, correo y mensaje.
 *  - Formato válido de correo electrónico (expresión regular).
 *  - Longitudes mínimas y contador de caracteres del mensaje.
 *  - Validación en tiempo real al salir de cada campo y al enviar.
 * Al enviar correctamente, el mensaje se guarda en sessionStorage (simulando el envío)
 * y se muestra un mensaje de confirmación.
 */
import { iniciarLayout } from '../components/layout.js';
import { leer, guardar } from '../services/storage.service.js';
import { obtenerParametro } from '../utils.js';

iniciarLayout('contacto');

const form = document.getElementById('form-contacto');
const confirmacion = document.getElementById('confirmacion');
const contador = document.getElementById('contador-mensaje');

/** Expresión regular para validar el formato usuario@dominio.ext */
const REGEX_CORREO = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Reglas de validación por campo. Cada regla recibe el valor y devuelve
 * un mensaje de error, o una cadena vacía si el valor es válido.
 */
const REGLAS = {
  nombre: (v) => {
    if (!v) return 'El nombre es obligatorio.';
    if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
    if (!/^[\p{L}\s'.-]+$/u.test(v)) return 'El nombre solo puede contener letras y espacios.';
    return '';
  },
  correo: (v) => {
    if (!v) return 'El correo electrónico es obligatorio.';
    if (!REGEX_CORREO.test(v)) return 'Ingresa un correo válido, por ejemplo nombre@correo.com.';
    return '';
  },
  mensaje: (v) => {
    if (!v) return 'El mensaje es obligatorio.';
    if (v.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
    return '';
  },
};

/**
 * Valida un campo, pinta su estado (válido/inválido) y muestra el mensaje de error.
 * @param {string} nombre - Nombre del campo (clave de REGLAS).
 * @returns {boolean} true si el campo es válido.
 */
function validarCampo(nombre) {
  const input = form.elements[nombre];
  const error = REGLAS[nombre](input.value.trim());

  input.classList.toggle('is-invalid', Boolean(error));
  input.classList.toggle('is-valid', !error);
  input.setAttribute('aria-invalid', Boolean(error));
  document.getElementById(`error-${nombre}`).textContent = error;
  return !error;
}

// Validación en tiempo real: al salir del campo y mientras se corrige un error.
Object.keys(REGLAS).forEach((nombre) => {
  const input = form.elements[nombre];
  input.addEventListener('blur', () => validarCampo(nombre));
  input.addEventListener('input', () => {
    if (input.classList.contains('is-invalid')) validarCampo(nombre);
  });
});

// Contador de caracteres del mensaje.
form.elements.mensaje.addEventListener('input', (e) => {
  contador.textContent = `${e.target.value.length} / 500`;
});

// Si se llega desde el detalle de una noticia, se prellena el asunto.
const asuntoURL = obtenerParametro('asunto');
if (asuntoURL) form.elements.asunto.value = asuntoURL;

form.addEventListener('submit', (e) => {
  e.preventDefault();

  // Se validan todos los campos (sin cortocircuito) para mostrar todos los errores a la vez.
  const resultados = Object.keys(REGLAS).map(validarCampo);
  if (resultados.includes(false)) {
    form.querySelector('.is-invalid')?.focus();
    return;
  }

  const datos = Object.fromEntries(new FormData(form));
  datos.fecha = new Date().toISOString();

  // Simulación de envío: se guarda el mensaje en sessionStorage (dura mientras la pestaña esté abierta).
  guardar('mensajes_contacto', [...leer('mensajes_contacto', [], sessionStorage), datos], sessionStorage);

  // Mensaje de confirmación personalizado.
  document.getElementById('texto-confirmacion').textContent =
    `Gracias, ${datos.nombre.trim()}. Recibimos tu mensaje y te responderemos a ${datos.correo.trim()}.`;
  confirmacion.classList.remove('d-none');
  confirmacion.focus();

  // Se limpia el formulario y los estilos de validación.
  form.reset();
  contador.textContent = '0 / 500';
  form.querySelectorAll('.is-valid, .is-invalid').forEach((el) => el.classList.remove('is-valid', 'is-invalid'));
});
