// URL base de la API Express
const API = 'http://localhost:3000/api';

// ── Utilidad: mostrar alertas ────────────────────────────────────────
function showAlert(elementId, message, type) {
  const el = document.getElementById(elementId);
  el.textContent = message;
  el.className = `alert ${type}`;
  // Oculta el mensaje automáticamente después de 4 segundos
  setTimeout(() => el.className = 'alert', 4000);
}

// ── CREATE ───────────────────────────────────────────────────────────
document.getElementById('car-form').addEventListener('submit', async (e) => {
  e.preventDefault(); // evita que el formulario recargue la página

  const data = {
    plate:              document.getElementById('plate').value,
    brand:              document.getElementById('brand').value,
    color:              document.getElementById('color').value,
    kilometers:         document.getElementById('kilometers').value,
    car_state:          document.getElementById('car_state').value,
    operational_status: document.getElementById('operational_status').value,
  };

  try {
    const response = await fetch(`${API}/cars`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    const result = await response.json();

    if (response.ok) {
      showAlert('form-alert', 'Vehículo registrado exitosamente', 'success');
      document.getElementById('car-form').reset();
      loadCars(); // recarga la tabla para mostrar el nuevo registro
    } else {
      showAlert('form-alert', ` ${result.message}`, 'error');
    }
  } catch (error) {
    showAlert('form-alert', ' No se pudo conectar con el servidor', 'error');
  }
});

// ── READ ─────────────────────────────────────────────────────────────
async function loadCars() {
  try {
    const response = await fetch(`${API}/cars`);
    const cars = await response.json();
    const tbody = document.getElementById('cars-table-body');

    if (cars.length === 0) {
      tbody.innerHTML = '<tr><td colspan="8" style="text-align:center;color:#999">No hay vehículos registrados</td></tr>';
      return;
    }

    // Generamos filas con data-* para evitar que caracteres especiales
    // rompan el HTML cuando los valores se usan en atributos
    tbody.innerHTML = cars.map(car => `
      <tr>
        <td>${car.id_car}</td>
        <td><strong>${car.plate}</strong></td>
        <td>${car.brand}</td>
        <td>${car.color}</td>
        <td>${car.kilometers}</td>
        <td>${car.car_state}</td>
        <td>${car.operational_status}</td>
        <td class="actions">
          <button class="btn btn-warning btn-edit"
            data-id="${car.id_car}"
            data-brand="${car.brand}"
            data-color="${car.color}"
            data-kilometers="${car.kilometers}"
            data-car_state="${car.car_state}"
            data-operational_status="${car.operational_status}">
            ✏️ Editar
          </button>
          <button class="btn btn-danger btn-delete"
            data-id="${car.id_car}">
            🗑️ Eliminar
          </button>
        </td>
      </tr>
    `).join('');

    // Asignamos eventos DESPUÉS de que las filas existen en el DOM
    document.querySelectorAll('.btn-edit').forEach(btn => {
      btn.addEventListener('click', () => {
        openModal(
          btn.dataset.id,
          btn.dataset.brand,
          btn.dataset.color,
          btn.dataset.kilometers,
          btn.dataset.car_state,
          btn.dataset.operational_status
        );
      });
    });

    document.querySelectorAll('.btn-delete').forEach(btn => {
      btn.addEventListener('click', () => {
        deleteCar(btn.dataset.id);
      });
    });

  } catch (error) {
    console.error('Error al cargar los autos:', error);
  }
}

// ── UPDATE: abrir modal con datos del auto seleccionado ──────────────
function openModal(id, brand, color, kilometers, car_state, operational_status) {
  // Llena los campos del modal con los valores actuales del auto
  document.getElementById('edit-id').value                 = id;
  document.getElementById('edit-brand').value              = brand;
  document.getElementById('edit-color').value              = color;
  document.getElementById('edit-kilometers').value         = kilometers;
  document.getElementById('edit-car_state').value          = car_state;
  document.getElementById('edit-operational_status').value = operational_status;
  // Muestra el modal agregando la clase active
  document.getElementById('modal').classList.add('active');
}

function closeModal() {
  // Oculta el modal removiendo la clase active
  document.getElementById('modal').classList.remove('active');
}

async function updateCar() {
  // Lee el id guardado en el campo oculto del modal
  const id = document.getElementById('edit-id').value;

  const data = {
    brand:              document.getElementById('edit-brand').value,
    color:              document.getElementById('edit-color').value,
    kilometers:         document.getElementById('edit-kilometers').value,
    car_state:          document.getElementById('edit-car_state').value,
    operational_status: document.getElementById('edit-operational_status').value,
  };

  try {
    // PUT /api/cars/:id actualiza el auto con ese id
    const response = await fetch(`${API}/cars/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });

    if (response.ok) {
      closeModal();
      loadCars(); // recarga la tabla con el dato actualizado
    } else {
      const result = await response.json();
      alert(` ${result.message}`);
    }
  } catch (error) {
    console.error('Error al actualizar:', error);
  }
}

// ── DELETE ───────────────────────────────────────────────────────────
async function deleteCar(id) {
  // Pide confirmación antes de eliminar
  if (!confirm('¿Estás seguro de que deseas eliminar este vehículo?')) return;

  try {
    const response = await fetch(`${API}/cars/${id}`, { method: 'DELETE' });
    const result = await response.json();

    if (response.ok) {
      loadCars(); // recarga la tabla sin el auto eliminado
    } else {
      // Muestra el error del servidor (ej: tiene transacciones activas)
      alert(` ${result.message}`);
    }
  } catch (error) {
    console.error('Error al eliminar:', error);
  }
}

// ── IMPORT CSV ───────────────────────────────────────────────────────
async function importCSV() {
  const fileInput = document.getElementById('csv-file');

  if (!fileInput.files[0]) {
    showAlert('csv-alert', ' Selecciona un archivo CSV primero', 'error');
    return;
  }

  // FormData construye el multipart/form-data que Multer espera
  const formData = new FormData();
  // 'file' debe coincidir con upload.single('file') en el servidor
  formData.append('file', fileInput.files[0]);

  try {
    const response = await fetch(`${API}/import/cars`, {
      method: 'POST',
      body: formData
      // No se define Content-Type: el navegador lo setea automáticamente
      // con el boundary correcto para multipart/form-data
    });
    const result = await response.json();

    if (response.ok) {
      showAlert('csv-alert',
        ` ${result.filasExitosas} vehículos importados de ${result.totalEnArchivo}`,
        'success');
      loadCars(); // recarga la tabla con los nuevos registros
      fileInput.value = ''; // limpia el selector de archivo
    } else {
      showAlert('csv-alert', ` ${result.message}`, 'error');
    }
  } catch (error) {
    showAlert('csv-alert', ' Error al importar el archivo', 'error');
  }
}

// Asignamos los eventos de los botones del modal desde JS
// en lugar de usar onclick en el HTML
document.getElementById('modal')
  .querySelector('.btn-warning')
  .addEventListener('click', closeModal);

document.getElementById('modal')
  .querySelector('.btn-primary')
  .addEventListener('click', updateCar);

// Cierra el modal si el usuario hace click fuera del cuadro
document.getElementById('modal').addEventListener('click', (e) => {
  // e.target es el elemento que recibió el click
  // Si el click fue directo en el overlay (fondo oscuro) y no en el modal,
  // cerramos el modal
  if (e.target === document.getElementById('modal')) {
    closeModal();
  }
});

// Carga la tabla automáticamente al abrir la página
window.onload = loadCars;

