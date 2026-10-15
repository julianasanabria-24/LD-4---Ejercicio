// 4° Lógica de la interfaz: eventos, formulario y renderizado de la tabla.
const formulario = document.getElementById('formulario');
const campoId = document.getElementById('id');
const campoNombre = document.getElementById('nombre');
const campoDescripcion = document.getElementById('descripcion');
const tituloFormulario = document.getElementById('tituloFormulario');
const btnCancelar = document.getElementById('btnCancelar');
const tablaCuerpo = document.getElementById('tablaCuerpo');
const estado = document.getElementById('estado');

function mostrarEstado(mensaje, esError = false) {
  estado.textContent = mensaje;
  estado.classList.toggle('error', esError);
}

function escapar(texto) {
  const div = document.createElement('div');
  div.textContent = texto ?? '';
  return div.innerHTML;
}

function limpiarFormulario() {
  formulario.reset();
  campoId.value = '';
  tituloFormulario.textContent = 'Nuevo registro';
  btnCancelar.hidden = true;
}

function renderizar(registros) {
  if (!registros.length) {
    tablaCuerpo.innerHTML = '<tr><td colspan="4" class="vacio">Sin registros</td></tr>';
    return;
  }
  tablaCuerpo.innerHTML = registros.map(r => `
    <tr>
      <td>${r.id}</td>
      <td>${escapar(r.nombre)}</td>
      <td>${escapar(r.descripcion)}</td>
      <td class="acciones">
        <button data-accion="editar" data-id="${r.id}">Editar</button>
        <button data-accion="eliminar" data-id="${r.id}" class="peligro">Eliminar</button>
      </td>
    </tr>
  `).join('');
}

async function cargar() {
  try {
    const registros = await Datos.listar();
    renderizar(registros);
    mostrarEstado(`Conectado · ${registros.length} registro(s)`);
  } catch (err) {
    console.error(err);
    mostrarEstado(`Error al cargar: ${err.message}`, true);
  }
}

formulario.addEventListener('submit', async (e) => {
  e.preventDefault();
  const registro = {
    nombre: campoNombre.value.trim(),
    descripcion: campoDescripcion.value.trim()
  };
  try {
    if (campoId.value) {
      await Datos.actualizar(campoId.value, registro);
    } else {
      await Datos.crear(registro);
    }
    limpiarFormulario();
    await cargar();
  } catch (err) {
    console.error(err);
    mostrarEstado(`Error al guardar: ${err.message}`, true);
  }
});

btnCancelar.addEventListener('click', limpiarFormulario);

tablaCuerpo.addEventListener('click', async (e) => {
  const boton = e.target.closest('button[data-accion]');
  if (!boton) return;
  const id = boton.dataset.id;

  try {
    if (boton.dataset.accion === 'editar') {
      const r = await Datos.obtener(id);
      campoId.value = r.id;
      campoNombre.value = r.nombre ?? '';
      campoDescripcion.value = r.descripcion ?? '';
      tituloFormulario.textContent = `Editando #${r.id}`;
      btnCancelar.hidden = false;
      campoNombre.focus();
    } else if (boton.dataset.accion === 'eliminar') {
      if (!confirm('¿Eliminar este registro?')) return;
      await Datos.eliminar(id);
      await cargar();
    }
  } catch (err) {
    console.error(err);
    mostrarEstado(`Error: ${err.message}`, true);
  }
});

document.addEventListener('DOMContentLoaded', cargar);
