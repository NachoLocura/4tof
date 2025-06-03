// admin.js
// Contraseña fija para el panel de administración. ¡Cámbiala por una más segura!
const ADMIN_PASSWORD = "543"; // Considera usar una variable de entorno en un entorno de producción real

// --- Elementos de la Interfaz de Usuario (UI) ---
const loginScreen = document.getElementById("loginScreen");
const mainAdminContent = document.getElementById("mainAdminContent");
const passwordInput = document.getElementById("passwordInput");
const btnLogin = document.getElementById("btnLogin");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout");

const tituloCalendarioPreview = document.getElementById("tituloCalendarioPreview");
const calendarioPreviewDiv = document.getElementById("calendarioPreview");
const eventLegendPreviewDiv = document.getElementById("eventLegendPreview"); // Nueva referencia para la leyenda de preview

const selectDia = document.getElementById("selectDia");
const selectMateria = document.getElementById("selectMateria");
const selectTipoEvento = document.getElementById("selectTipoEvento");
const btnCargarEvento = document.getElementById("btnCargarEvento");
const tablaEventosActivosBody = document.querySelector("#tablaEventosActivos tbody");
const inputDetalle = document.getElementById("inputDetalle");

const btnDownloadEvents = document.getElementById("btnDownloadEvents");

const rowHoraEntrada = document.getElementById("rowHoraEntrada");
const selectHoraEntrada = document.getElementById("selectHoraEntrada");
const rowHoraSalida = document.getElementById("rowHoraSalida");
const selectHoraSalida = document.getElementById("selectHoraSalida");

// --- Variables de estado ---
let currentMonthPreview, currentYearPreview;
let allEvents = []; // Almacena todos los eventos cargados desde events.json

// --- Funciones auxiliares ---

// Función para determinar si un color es oscuro para elegir el color de texto
function isColorDark(hexColor) {
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance < 0.5; // Umbral de luminosidad para considerar oscuro
}

// *** Nueva función para cargar eventos desde events.json ***
async function fetchEventsData() {
    try {
        const response = await fetch('events.json?timestamp=' + new Date().getTime()); // Añadir timestamp para evitar caché
        if (!response.ok) {
            // Si el archivo no existe, asumir que está vacío o hubo un error de red
            if (response.status === 404) {
                console.warn('events.json no encontrado, se inicializa con un array vacío.');
                return [];
            }
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error("Error al cargar events.json:", error);
        alert("Error al cargar los eventos. Intenta recargar la página.");
        return []; // Retorna un array vacío en caso de error
    }
}

// *** Función para guardar eventos en events.json (requiere backend) ***
async function saveEventsToJson(events) {
    try {
        const response = await fetch('save_events.php', { // Reemplaza 'save_events.php' con la URL de tu script de backend
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(events),
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (result.success) {
            console.log('Eventos guardados en events.json exitosamente.');
        } else {
            console.error('Error al guardar eventos en el servidor:', result.message);
            alert('Error al guardar eventos en el servidor: ' + result.message);
        }
    } catch (error) {
        console.error("Error al enviar eventos al servidor:", error);
        alert("Error de conexión al servidor al guardar eventos. Los cambios no se persistirán.");
        // Si no hay un backend, este error es esperado y los cambios no se guardarán permanentemente.
    }
}


// --- Lógica del Calendario y Eventos ---

// Definición de tipos de eventos y sus colores (¡Consistente con student.js!)
const tiposEventosColores = [
    { nombre: "Lección", color: "#82cfff", textColor: "black" },
    { nombre: "Evaluación", color: "#ff4d4d", textColor: "white" },
    { nombre: "Trabajo Práctico", color: "#fff66b", textColor: "black" },
    { nombre: "Carpeta", color: "#f9c0d1", textColor: "black" },
    { nombre: "Feriado", color: "#d3b9ff", textColor: "black" },
    { nombre: "!!!No hay clases!!!", color: "#ff4d4d", textColor: "white" },
    { nombre: "Ingreso Especial", color: "#ADD8E6", textColor: "black" },
    { nombre: "Salida Especial", color: "#90EE90", textColor: "black" },
    { nombre: "Traer Materiales", color: "#FFA500", textColor: "black" },
    { nombre: "Recuperatorio", color: "#FF6347", textColor: "white" }, // <-- Nuevo evento
    { nombre: "Día Corriente", color: "#d4edda", textColor: "black" } // Solo para visualización, no cargable
];

const materiasPorDia = {
    "Lunes": ["Química", "Hardware 2", "Software 2", "Administración"],
    "Martes": ["Matemática", "Base de Datos", "Redes", "Lengua"],
    "Miércoles": ["Gestión de las Organizaciones", "Programación 2", "Sistemas de Información", "Inglés"],
    "Jueves": ["Química", "Hardware 2", "Software 2", "Administración"],
    "Viernes": ["Matemática", "Base de Datos", "Redes", "Inglés"],
    "Sábado": ["---"], // No hay materias en sábado
    "Domingo": ["---"]  // No hay materias en domingo
};

function populateSelectDia() {
    const today = new Date();
    selectDia.value = today.toISOString().split('T')[0]; // Establece la fecha actual por defecto
    selectDia.dispatchEvent(new Event('change')); // Dispara el evento para actualizar materias
}

function updateMateriasForSelectedDay() {
    const selectedDate = new Date(selectDia.value + "T00:00:00"); // Asegura que la fecha sea UTC medianoche
    const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const days = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const currentDayName = days[dayOfWeek];

    const materias = materiasPorDia[currentDayName] || ["---"];
    selectMateria.innerHTML = "";
    materias.forEach(materia => {
        const option = document.createElement("option");
        option.value = materia;
        option.textContent = materia;
        selectMateria.appendChild(option);
    });
}

function populateSelectTipoEvento() {
    // Los tipos de eventos cargables son los que tienen un nombre y no son "Día Corriente"
    const tiposCargables = tiposEventosColores.filter(tipo => tipo.nombre !== "Día Corriente");

    selectTipoEvento.innerHTML = "";
    tiposCargables.forEach(tipo => {
        const option = document.createElement("option");
        option.value = tipo.nombre;
        option.textContent = tipo.nombre;
        selectTipoEvento.appendChild(option);
    });
}

function populateSelectHora(selectElement, startHour, endHour) {
    selectElement.innerHTML = "";
    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += 10) { // Incrementos de 10 minutos
            const hour = String(h).padStart(2, '0');
            const minute = String(m).padStart(2, '0');
            const time = `${hour}:${minute}`;
            const option = document.createElement("option");
            option.value = time;
            option.textContent = time;
            selectElement.appendChild(option);
        }
    }
}

function toggleHoraFields() {
    const selectedType = selectTipoEvento.value;
    if (selectedType === "Ingreso Especial") {
        rowHoraEntrada.style.display = "table-row";
        rowHoraSalida.style.display = "none";
        populateSelectHora(selectHoraEntrada, 0, 23); // Horas completas
        selectHoraEntrada.value = "14:00"; // Hora por defecto
    } else if (selectedType === "Salida Especial") {
        rowHoraEntrada.style.display = "none";
        rowHoraSalida.style.display = "table-row";
        populateSelectHora(selectHoraSalida, 0, 23); // Horas completas
        const selectedDate = new Date(selectDia.value + "T00:00:00");
        const dayOfWeek = selectedDate.getDay();
        // Default de salida según el día
        switch (dayOfWeek) {
            case 1: // Lunes
            case 2: // Martes
            case 4: // Jueves
                selectHoraSalida.value = "18:20";
                break;
            case 3: // Miércoles
                selectHoraSalida.value = "20:40";
                break;
            case 5: // Viernes
                selectHoraSalida.value = "17:00";
                break;
            default:
                selectHoraSalida.value = "17:00"; // Valor por defecto para otros días
                break;
        }
    } else {
        rowHoraEntrada.style.display = "none";
        rowHoraSalida.style.display = "none";
    }
}

async function cargarEvento() {
    const fecha = selectDia.value;
    const materia = selectMateria.value;
    const tipoEvento = selectTipoEvento.value;
    const detalle = inputDetalle.value.trim();
    const horaEntrada = selectHoraEntrada.value;
    const horaSalida = selectHoraSalida.value;

    if (!fecha || !materia || !tipoEvento) {
        alert("Por favor, completa todos los campos obligatorios.");
        return;
    }

    // Validar y ajustar si el tipo de evento es "---" para la materia
    if (materia === "---" && tipoEvento !== "Feriado" && tipoEvento !== "!!!No hay clases!!!") {
        alert("No se pueden cargar eventos para el día seleccionado, ya que no hay materias disponibles. Solo se permiten 'Feriado' o '!!!No hay clases!!!'.");
        return;
    }

    let nuevoEvento = {
        fecha: fecha,
        materia: materia,
        tipoEvento: tipoEvento
    };

    if (detalle) {
        nuevoEvento.detalle = detalle;
    }
    if (tipoEvento === "Ingreso Especial") {
        nuevoEvento.horaEntrada = horaEntrada;
    }
    if (tipoEvento === "Salida Especial") {
        nuevoEvento.horaSalida = horaSalida;
    }

    allEvents.push(nuevoEvento);
    // Guarda los eventos en el JSON (requiere backend para persistencia)
    await saveEventsToJson(allEvents);

    // Limpiar campos después de cargar
    inputDetalle.value = "";
    selectTipoEvento.value = tiposEventosColores.find(t => t.nombre === "Lección").nombre; // Reiniciar a un valor por defecto
    toggleHoraFields(); // Ocultar campos de hora si ya no son relevantes

    mostrarEventosActivos();
    cargarCalendarioPreview();
}

function mostrarEventosActivos() {
    tablaEventosActivosBody.innerHTML = ""; // Limpiar la tabla

    // Filtrar eventos futuros o del día actual
    const today = new Date();
    today.setHours(0, 0, 0, 0); // Establecer la hora a medianoche para comparación

    const eventosFiltrados = allEvents.filter(evento => {
        const eventDate = new Date(evento.fecha + "T00:00:00");
        return eventDate >= today;
    }).sort((a, b) => {
        // Ordenar por fecha y luego por materia y tipo de evento
        const dateA = new Date(a.fecha);
        const dateB = new Date(b.fecha);
        if (dateA.getTime() !== dateB.getTime()) {
            return dateA.getTime() - dateB.getTime();
        }
        if (a.materia < b.materia) return -1;
        if (a.materia > b.materia) return 1;
        if (a.tipoEvento < b.tipoEvento) return -1;
        if (a.tipoEvento > b.tipoEvento) return 1;
        return 0;
    });


    eventosFiltrados.forEach((evento, index) => {
        const row = tablaEventosActivosBody.insertRow();
        row.insertCell().textContent = evento.fecha;
        row.insertCell().textContent = evento.materia;
        row.insertCell().textContent = evento.tipoEvento;
        row.insertCell().textContent = evento.detalle || ""; // Mostrar detalle si existe

        const actionCell = row.insertCell();
        const btnEliminar = document.createElement("button");
        btnEliminar.textContent = "Eliminar";
        btnEliminar.classList.add("btn-danger");
        // Usar el índice del evento original en `allEvents` para eliminar correctamente
        const originalIndex = allEvents.indexOf(evento);
        btnEliminar.onclick = () => eliminarEvento(originalIndex);
        actionCell.appendChild(btnEliminar);
    });
}

async function eliminarEvento(index) {
    if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
        allEvents.splice(index, 1);
        // Guarda los eventos en el JSON después de eliminar (requiere backend)
        await saveEventsToJson(allEvents);
        mostrarEventosActivos();
        cargarCalendarioPreview();
    }
}

// --- Funciones para la vista previa del calendario (duplicado parcial de student.js para independencia) ---

function cargarCalendarioPreview(year = currentYearPreview, month = currentMonthPreview) {
    const today = new Date();
    if (year === undefined || month === undefined) {
        currentMonthPreview = today.getMonth();
        currentYearPreview = today.getFullYear();
    } else {
        currentMonthPreview = month;
        currentYearPreview = year;
    }

    const firstDayOfMonth = new Date(currentYearPreview, currentMonthPreview, 1);
    const daysInMonth = new Date(currentYearPreview, currentMonthPreview + 1, 0).getDate();
    const startDayIndex = (firstDayOfMonth.getDay() + 6) % 7; // Ajustar para que la semana empiece en Lunes

    const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
    tituloCalendarioPreview.textContent = `${monthNames[currentMonthPreview]} ${currentYearPreview}`;

    calendarioPreviewDiv.innerHTML = "";
    const calendarGrid = document.createElement('div');
    calendarGrid.classList.add('calendario-grid');

    const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    dayNames.forEach(dayName => {
        const dayNameCell = document.createElement('div');
        dayNameCell.classList.add('day-name-cell');
        dayNameCell.textContent = dayName;
        calendarGrid.appendChild(dayNameCell);
    });

    for (let i = 0; i < startDayIndex; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day-cell', 'empty');
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.classList.add('calendar-day-cell');

        const dayNumber = document.createElement('span');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        const fullDate = `${currentYearPreview}-${String(currentMonthPreview + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;

        // Obtener eventos para este día
        const eventsForDay = allEvents.filter(event => event.fecha === fullDate);

        if (eventsForDay.length > 0) {
            // Ordenar eventos para que los feriados y no-clases vayan primero
            eventsForDay.sort((a, b) => {
                const order = ["Feriado", "!!!No hay clases!!!"];
                const indexA = order.indexOf(a.tipoEvento);
                const indexB = order.indexOf(b.tipoEvento);
                if (indexA !== -1 && indexB === -1) return -1;
                if (indexA === -1 && indexB !== -1) return 1;
                return 0; // Mantener el orden si ambos o ninguno son de alta prioridad
            });

            eventsForDay.forEach(event => {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item');

                const eventTypeInfo = tiposEventosColores.find(t => t.nombre === event.tipoEvento);
                if (eventTypeInfo) {
                    eventItem.style.backgroundColor = eventTypeInfo.color;
                    eventItem.style.color = eventTypeInfo.textColor;
                    // Añadir un borde si el color de fondo es muy claro y el texto es oscuro
                    if (!isColorDark(eventTypeInfo.color) && eventTypeInfo.textColor === 'black') {
                        eventItem.style.border = '1px solid #ccc';
                    }
                }

                let eventText = event.tipoEvento;
                if (event.materia && event.materia !== "General" && event.materia !== "---") {
                    eventText += ` (${event.materia})`;
                }
                if (event.detalle) {
                    eventText += `: ${event.detalle}`;
                }
                if (event.horaEntrada) {
                    eventText += ` Entrada: ${event.horaEntrada}`;
                }
                if (event.horaSalida) {
                    eventText += ` Salida: ${event.horaSalida}`;
                }

                eventItem.textContent = eventText;
                cell.appendChild(eventItem);
            });
        } else {
            // Si no hay eventos, colorear como "Día Corriente"
            const diaCorrienteInfo = tiposEventosColores.find(t => t.nombre === "Día Corriente");
            if (diaCorrienteInfo) {
                cell.style.backgroundColor = diaCorrienteInfo.color;
                cell.style.color = diaCorrienteInfo.textColor;
            }
        }
        // Marcar el día actual
        if (day === today.getDate() && currentMonthPreview === today.getMonth() && currentYearPreview === today.getFullYear()) {
            cell.classList.add('current-day');
        }
        calendarGrid.appendChild(cell);
    }

    calendarioPreviewDiv.appendChild(calendarGrid);
    populateEventLegendPreview();
}

function populateEventLegendPreview() {
    eventLegendPreviewDiv.innerHTML = '';
    tiposEventosColores.forEach(tipo => {
        if (tipo.nombre === "Día Corriente") return; // No es necesario mostrar 'Día Corriente' en la leyenda

        const legendItem = document.createElement('div');
        legendItem.classList.add('legend-item');

        const colorBox = document.createElement('span');
        colorBox.classList.add('legend-color-box');
        colorBox.style.backgroundColor = tipo.color;
        colorBox.style.borderColor = isColorDark(tipo.color) ? 'white' : 'black';

        const legendText = document.createElement('span');
        legendText.textContent = tipo.nombre;

        legendItem.appendChild(colorBox);
        legendItem.appendChild(legendText);
        eventLegendPreviewDiv.appendChild(legendItem);
    });
}

// --- Manejadores de Eventos ---

btnLogin.addEventListener("click", () => {
    if (passwordInput.value === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminLoggedIn', 'true');
        loginScreen.style.display = "none";
        mainAdminContent.style.display = "block";
        inicializarAdmin();
    } else {
        loginError.textContent = "Contraseña incorrecta.";
    }
});

passwordInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
        btnLogin.click();
    }
});

btnLogout.addEventListener("click", () => {
    sessionStorage.removeItem('isAdminLoggedIn');
    window.location.href = "index.html"; // Redirigir a la página de selección de rol
});

selectDia.addEventListener("change", () => {
    updateMateriasForSelectedDay();
    // También actualizar la vista previa si el día actual es visible
    cargarCalendarioPreview();
    toggleHoraFields(); // Actualizar visibilidad de campos de hora al cambiar la fecha
});

selectTipoEvento.addEventListener("change", toggleHoraFields);

btnCargarEvento.addEventListener("click", cargarEvento);

btnDownloadEvents.addEventListener("click", () => {
    const dataStr = JSON.stringify(allEvents, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "events.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

// --- Inicialización ---

async function inicializarAdmin() {
    // Cargar los eventos desde el JSON al iniciar el admin
    allEvents = await fetchEventsData();

    populateSelectDia(); // Esto ahora llama a updateMateriasForSelectedDay()
    populateSelectTipoEvento();
    toggleHoraFields(); // Asegura la visibilidad correcta al cargar
    mostrarEventosActivos();
    cargarCalendarioPreview();
}

document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        loginScreen.style.display = "none";
        mainAdminContent.style.display = "block";
        inicializarAdmin();
    } else {
        loginScreen.style.display = "flex";
        mainAdminContent.style.display = "none";
    }
});