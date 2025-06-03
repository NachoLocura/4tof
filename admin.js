// admin.js
// Contraseña fija para el panel de administración. ¡Cámbiala por una más segura!
const ADMIN_PASSWORD = "543"; // Considera usar una variable de entorno en un entorno de producción real

// --- Elementos de la Interfaz de Usuario (UI) ---
const loginScreen = document.getElementById("loginScreen"); // Se mantiene para acceso directo
const mainAdminContent = document.getElementById("mainAdminContent");
const passwordInput = document.getElementById("passwordInput");
const btnLogin = document.getElementById("btnLogin");
const loginError = document.getElementById("loginError");
const btnLogout = document.getElementById("btnLogout"); // Botón de cerrar sesión

const tituloCalendarioPreview = document.getElementById("tituloCalendarioPreview");
const calendarioPreviewDiv = document.getElementById("calendarioPreview");
const selectDia = document.getElementById("selectDia");
const selectMateria = document.getElementById("selectMateria");
const selectTipoEvento = document.getElementById("selectTipoEvento");
const btnCargarEvento = document.getElementById("btnCargarEvento");
const tablaEventosActivosBody = document.querySelector("#tablaEventosActivos tbody");

const btnDownloadEvents = document.getElementById("btnDownloadEvents");
const loadEventsFileInput = document.getElementById("loadEventsFile");

const rowHoraEntrada = document.getElementById("rowHoraEntrada");
const selectHoraEntrada = document.getElementById("selectHoraEntrada");
const rowHoraSalida = document.getElementById("rowHoraSalida");
const selectHoraSalida = document.getElementById("selectHoraSalida");

// --- Datos de Configuración ---
let eventos = []; // Almacenará todos los eventos
const LOCAL_STORAGE_KEY = 'eventsData'; // Clave para localStorage

// Definición de tipos de eventos y sus colores
// ¡Hemos quitado "Ausencia 16:10" y agregado "Traer Materiales"!
const tiposEventos = [
    { nombre: "Lección", color: "#82cfff", textColor: "black" },
    { nombre: "Evaluación", color: "#ff4d4d", textColor: "white" },
    { nombre: "Trabajo Práctico", color: "#fff66b", textColor: "black" },
    { nombre: "Carpeta", color: "#f9c0d1", textColor: "black" },
    { nombre: "Feriado", color: "#d3b9ff", textColor: "black" },
    { nombre: "!!!No hay clases!!!", color: "#ff4d4d", textColor: "white" },
    { nombre: "Ingreso Especial", color: "#ADD8E6", textColor: "black" },
    { nombre: "Salida Especial", color: "#90EE90", textColor: "black" },
    { nombre: "Traer Materiales", color: "#FFA500", textColor: "black" } // Nuevo tipo de evento
];

// --- Horario de Clases (Nuevo Estructura de Datos) ---
// Mapea el nombre del día a un array de materias
const horarioPorDia = {
    "Lunes": ["Química", "Técnicas Digitales 1", "Hardware 2", "Software 2", "Aviso", "General"],
    "Martes": ["Redes", "Ética", "Análisis Matemático", "Aviso", "General"],
    "Miércoles": ["Lengua", "Inglés", "Base de Datos 1", "Aviso", "General"],
    "Jueves": ["Sistema Operativo 2", "Software 2", "Programación", "Gestión de las Organizaciones", "Análisis Matemático", "Aviso", "General"],
    "Viernes": ["Programación", "Gestión de las Organizaciones", "Aviso", "General"],
    "Sábado": ["Aviso", "General"], // Fines de semana pueden tener avisos o generales
    "Domingo": ["Aviso", "General"]
};

// Materias generales que siempre deberían aparecer
const materiasGenerales = ["Aviso", "General"];


// --- Funciones de Utilidad ---

function saveEventsToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventos));
}

function loadEventsFromLocalStorage() {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    if (storedEvents) {
        try {
            eventos = JSON.parse(storedEvents);
        } catch (e) {
            console.error("Error al parsear eventos desde localStorage, se inicializarán vacíos:", e);
            eventos = [];
            // Si el localStorage está corrupto, lo borramos para empezar de cero o cargar el JSON inicial
            localStorage.removeItem(LOCAL_STORAGE_KEY);
        }
    } else {
        eventos = [];
    }
    // Ordenar eventos por fecha para visualización en la tabla y preview
    eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
}

async function loadInitialEventsFromJsonToLocalStorage() {
    try {
        const response = await fetch('events.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const initialData = await response.json();
        if (Array.isArray(initialData)) {
            // Cargar eventos del JSON inicial solo si localStorage está vacío
            if (!localStorage.getItem(LOCAL_STORAGE_KEY)) {
                eventos = initialData;
                saveEventsToLocalStorage();
                console.log("Eventos iniciales cargados desde events.json y guardados en localStorage.");
            } else {
                console.log("LocalStorage ya contiene eventos, no se cargan los iniciales.");
            }
        } else {
            console.error("El archivo events.json no tiene el formato esperado (debe ser un array de objetos).");
        }
    } catch (error) {
        console.error("Error al cargar el archivo events.json:", error);
    }
}

// Función para verificar si un color es oscuro para decidir el color del texto
function isColorDark(hexColor) {
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const luminosity = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminosity < 0.5;
}

// --- Lógica del Calendario y Eventos ---

function populateSelectDia() {
    const today = new Date();
    const formattedToday = today.toISOString().split('T')[0]; //YYYY-MM-DD
    selectDia.value = formattedToday;
    // Llamar a actualizar materias cuando se inicializa el día
    updateMateriasForSelectedDay();
}

function updateMateriasForSelectedDay() {
    const selectedDate = new Date(selectDia.value + 'T00:00:00'); // Asegura la zona horaria neutral
    const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 1 = Lunes, ..., 6 = Sábado
    const dayNames = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const currentDayName = dayNames[dayOfWeek];

    const materiasParaEsteDia = horarioPorDia[currentDayName] || materiasGenerales; // Fallback a generales

    selectMateria.innerHTML = ''; // Limpiar opciones existentes
    materiasParaEsteDia.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia;
        option.textContent = materia;
        selectMateria.appendChild(option);
    });
}


function populateSelectTipoEvento() {
    selectTipoEvento.innerHTML = ''; // Limpiar opciones existentes
    tiposEventos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.nombre;
        option.textContent = tipo.nombre;
        selectTipoEvento.appendChild(option);
    });
    // Escuchar cambios para mostrar/ocultar campos de hora
    selectTipoEvento.addEventListener('change', toggleHoraFields);
    toggleHoraFields(); // Llamar al inicio para el estado por defecto
}

function populateSelectHora(selectElement, startHour, endHour, stepMinutes, defaultTime) {
    selectElement.innerHTML = '';
    let defaultSet = false;

    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += stepMinutes) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            const time = `${hour}:${minute}`;

            const option = document.createElement('option');
            option.value = time;
            option.textContent = time;
            selectElement.appendChild(option);

            // Set default value if it matches and hasn't been set yet
            if (defaultTime && time === defaultTime && !defaultSet) {
                selectElement.value = time;
                defaultSet = true;
            }
        }
    }

    // Fallback if default time wasn't found (e.g., if it's not a step multiple)
    if (defaultTime && !defaultSet && selectElement.querySelector(`option[value="${defaultTime}"]`)) {
        selectElement.value = defaultTime;
    }
}

function toggleHoraFields() {
    const selectedType = selectTipoEvento.value;
    if (selectedType === "Ingreso Especial") {
        rowHoraEntrada.style.display = "table-row";
        rowHoraSalida.style.display = "none";
        populateSelectHora(selectHoraEntrada, 0, 23, 10, "14:00");
    } else if (selectedType === "Salida Especial") {
        rowHoraEntrada.style.display = "none";
        rowHoraSalida.style.display = "table-row";
        // Valores por defecto para Hora de Salida (adaptar según el día)
        // Usar la fecha del input para calcular el día de la semana
        const selectedDate = new Date(selectDia.value + 'T00:00:00'); // Asegura que la fecha sea válida, evita problemas de zona horaria
        const dayOfWeek = selectedDate.getDay(); // 0 = Domingo, 1 = Lunes, etc.
        let defaultSalidaTime = "17:00"; // Default para Viernes y Fin de semana

        if (dayOfWeek === 1 || dayOfWeek === 4) { // Lunes, Jueves
            defaultSalidaTime = "18:20";
        } else if (dayOfWeek === 2) { // Martes
            defaultSalidaTime = "18:20"; // O el horario que corresponda para Martes
        } else if (dayOfWeek === 3) { // Miércoles
            defaultSalidaTime = "20:40";
        }
        // Para Viernes, el default sigue siendo 17:00
        populateSelectHora(selectHoraSalida, 0, 23, 10, defaultSalidaTime);
    } else {
        rowHoraEntrada.style.display = "none";
        rowHoraSalida.style.display = "none";
    }
}

// Actualizar las horas de salida y las materias cuando cambia la fecha
selectDia.addEventListener('change', () => {
    toggleHoraFields();
    updateMateriasForSelectedDay(); // ¡Nuevo!
});


function mostrarEventosActivos() {
    tablaEventosActivosBody.innerHTML = ''; // Limpiar tabla
    // Ordenar eventos por fecha para visualización en la tabla
    const eventosOrdenados = [...eventos].sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    eventosOrdenados.forEach((event, index) => {
        const row = tablaEventosActivosBody.insertRow();
        row.insertCell(0).textContent = event.fecha;
        row.insertCell(1).textContent = event.materia;
        row.insertCell(2).textContent = event.tipoEvento;

        let detailText = '';
        if (event.horaEntrada) {
            detailText = `Entrada: ${event.horaEntrada}`;
        } else if (event.horaSalida) {
            detailText = `Salida: ${event.horaSalida}`;
        } else if (event.detalle) {
            detailText = event.detalle;
        }
        row.insertCell(3).textContent = detailText; // Celda para el detalle/horas

        const actionCell = row.insertCell(4); // Última celda
        const deleteButton = document.createElement('button');
        deleteButton.textContent = 'Eliminar';
        deleteButton.classList.add('btn-eliminar');
        deleteButton.addEventListener('click', () => {
            // Para eliminar, necesitamos el índice original en el array 'eventos'
            // ya que 'eventosOrdenados' es una copia.
            const originalIndex = eventos.findIndex(e =>
                e.fecha === event.fecha &&
                e.materia === event.materia &&
                e.tipoEvento === event.tipoEvento &&
                (e.horaEntrada || '') === (event.horaEntrada || '') &&
                (e.horaSalida || '') === (event.horaSalida || '') &&
                (e.detalle || '') === (event.detalle || '')
            );
            if (originalIndex !== -1) {
                eliminarEvento(originalIndex);
            }
        });
        actionCell.appendChild(deleteButton);
    });
}

function cargarCalendarioPreview() {
    const hoy = new Date();
    const year = hoy.getFullYear();
    const month = hoy.getMonth(); // 0-indexed

    tituloCalendarioPreview.textContent = `Vista Previa del Calendario (Mes Actual)`;

    const firstDayOfMonth = new Date(year, month, 1);
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    let startDayOfWeek = firstDayOfMonth.getDay();
    startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1;

    // *** CAMBIO CLAVE AQUÍ: Crear un contenedor para la cuadrícula del calendario ***
    const calendarGrid = document.createElement('div');
    calendarGrid.classList.add('calendario-grid'); // Aplicará las propiedades de grid del CSS

    const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
    dayNames.forEach(dayName => {
        const dayNameCell = document.createElement('div');
        dayNameCell.classList.add('day-name-cell');
        dayNameCell.textContent = dayName;
        calendarGrid.appendChild(dayNameCell);
    });

    for (let i = 0; i < startDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-day-cell', 'empty');
        calendarGrid.appendChild(emptyCell);
    }

    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.classList.add('calendar-day-cell');

        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        const currentDate = new Date(year, month, day);
        const formattedCurrentDate = currentDate.toISOString().split('T')[0];

        const eventsForDay = eventos.filter(event => event.fecha === formattedCurrentDate);
        let contentAdded = false;

        eventsForDay.forEach(event => {
            const eventType = tiposEventos.find(tipo => tipo.nombre === event.tipoEvento);
            if (eventType) {
                const eventItem = document.createElement('div');
                eventItem.classList.add('event-item');
                let eventText = `${event.materia} - ${event.tipoEvento}`;
                if (event.horaEntrada) eventText += ` (Entrada: ${event.horaEntrada})`;
                if (event.horaSalida) eventText += ` (Salida: ${event.horaSalida})`;
                if (event.detalle && !event.horaEntrada && !event.horaSalida) eventText = event.detalle; // Si hay detalle pero no horas, usar detalle
                eventItem.textContent = eventText;
                eventItem.style.backgroundColor = eventType.color;
                eventItem.style.color = eventType.textColor;
                cell.appendChild(eventItem);
                contentAdded = true;
            }
        });

        const isToday = hoy.getDate() === day && hoy.getMonth() === month && hoy.getFullYear() === year;
        if (isToday) {
            if (!contentAdded || eventsForDay.length === 0) {
                cell.classList.add('today');
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('dia-corriente-message');
                messageDiv.textContent = 'Día corriente';
                cell.appendChild(messageDiv);
                contentAdded = true;
            }
        }
        calendarGrid.appendChild(cell); // Añadir la celda al grid
    }

    calendarioPreviewDiv.innerHTML = ''; // Limpiar contenido previo
    calendarioPreviewDiv.appendChild(calendarGrid); // *** AÑADIR EL GRID AL CONTENEDOR PRINCIPAL ***
}

// --- Manejadores de Eventos ---

btnLogin.addEventListener('click', () => {
    const password = passwordInput.value;
    if (password === ADMIN_PASSWORD) {
        sessionStorage.setItem('isAdminLoggedIn', 'true'); // Marca como logueado en sessionStorage
        loginScreen.style.display = "none";
        mainAdminContent.style.display = "block";
        loginError.textContent = ""; // Limpiar mensaje de error
        inicializarAdmin();
    } else {
        loginError.textContent = "Contraseña incorrecta. Intenta de nuevo.";
    }
});

// Permitir presionar Enter en el campo de contraseña
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        btnLogin.click();
    }
});

btnLogout.addEventListener('click', () => {
    sessionStorage.removeItem('isAdminLoggedIn'); // Eliminar la marca de logueado
    // Al cerrar sesión, redirigimos a la página de selección de rol
    window.location.href = "index.html";
});


btnCargarEvento.addEventListener('click', () => {
    const fecha = selectDia.value;
    const materia = selectMateria.value;
    const tipoEvento = selectTipoEvento.value;

    if (!fecha || !materia || !tipoEvento) {
        alert("Por favor, completa todos los campos para el evento.");
        return;
    }

    let detalle = '';
    let horaEntrada = '';
    let horaSalida = '';

    if (tipoEvento === "Ingreso Especial") {
        horaEntrada = selectHoraEntrada.value;
        detalle = `Ingreso: ${horaEntrada}`;
    } else if (tipoEvento === "Salida Especial") {
        horaSalida = selectHoraSalida.value;
        detalle = `Salida: ${horaSalida}`;
    }

    const newEvent = {
        fecha: fecha,
        materia: materia,
        tipoEvento: tipoEvento
    };
    if (detalle) newEvent.detalle = detalle;
    if (horaEntrada) newEvent.horaEntrada = horaEntrada;
    if (horaSalida) newEvent.horaSalida = horaSalida;


    // Evitar duplicados exactos (fecha, materia, tipoEvento y horas/detalle si aplican)
    const isDuplicate = eventos.some(event =>
        event.fecha === newEvent.fecha &&
        event.materia === newEvent.materia &&
        event.tipoEvento === newEvent.tipoEvento &&
        (event.horaEntrada || '') === (newEvent.horaEntrada || '') && // Comparar con cadena vacía si es null/undefined
        (event.horaSalida || '') === (newEvent.horaSalida || '') &&
        (event.detalle || '') === (newEvent.detalle || '')
    );

    if (isDuplicate) {
        alert("Ya existe un evento idéntico con la misma fecha, materia, tipo de evento y detalles/horas.");
        return;
    }

    eventos.push(newEvent);
    saveEventsToLocalStorage();
    mostrarEventosActivos();
    cargarCalendarioPreview();
    alert("Evento cargado con éxito.");

    // Opcional: limpiar los campos después de cargar el evento
    selectDia.value = new Date().toISOString().split('T')[0];
    // selectMateria y selectTipoEvento pueden mantener su última selección o resetearse
    // selectMateria.selectedIndex = 0;
    // selectTipoEvento.selectedIndex = 0;
    updateMateriasForSelectedDay(); // Actualizar materias de nuevo por si se seleccionó un día diferente
    toggleHoraFields(); // Ocultar campos de hora si no son relevantes
});

function eliminarEvento(index) {
    if (confirm("¿Estás seguro de que quieres eliminar este evento?")) {
        eventos.splice(index, 1);
        saveEventsToLocalStorage();
        mostrarEventosActivos();
        cargarCalendarioPreview();
        alert("Evento eliminado con éxito.");
    }
}

btnDownloadEvents.addEventListener('click', () => {
    const dataStr = JSON.stringify(eventos, null, 2); // Formato legible con indentación de 2 espacios
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url); // Liberar el objeto URL
});

loadEventsFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const loadedData = JSON.parse(e.target.result);
            if (Array.isArray(loadedData)) {
                // Opción para Mergear (añadir nuevos y actualizar existentes)
                loadedData.forEach(newEvent => {
                    const existingIndex = eventos.findIndex(event =>
                        event.fecha === newEvent.fecha &&
                        event.materia === newEvent.materia &&
                        event.tipoEvento === newEvent.tipoEvento &&
                        (event.horaEntrada || '') === (newEvent.horaEntrada || '') &&
                        (event.horaSalida || '') === (newEvent.horaSalida || '') &&
                        (event.detalle || '') === (newEvent.detalle || '')
                    );
                    if (existingIndex !== -1) {
                        // Actualizar evento existente
                        eventos[existingIndex] = newEvent;
                    } else {
                        // Añadir nuevo evento
                        eventos.push(newEvent);
                    }
                });
                saveEventsToLocalStorage();
                mostrarEventosActivos();
                cargarCalendarioPreview();
                alert("Eventos cargados desde JSON con éxito y combinados con los existentes.");
            } else {
                alert("El archivo JSON no tiene el formato esperado (debe ser un array de objetos).");
            }
        } catch (error) {
            alert("Error al leer o parsear el archivo JSON: " + error.message);
            console.error("Error al parsear JSON:", error);
        } finally {
            loadEventsFileInput.value = ""; // Limpiar el input de archivo
        }
    };
    reader.onerror = () => {
        alert("Error al leer el archivo.");
        loadEventsFileInput.value = "";
    };
    reader.readAsText(file);
});

// Inicialización
function inicializarAdmin() {
    populateSelectDia(); // Esto ahora llama a updateMateriasForSelectedDay()
    // populateSelectMateria(); // Ya no se llama directamente, se hace en populateSelectDia
    populateSelectTipoEvento();
    loadEventsFromLocalStorage(); // Cargar eventos del localStorage del administrador
    mostrarEventosActivos();
    cargarCalendarioPreview();
}

document.addEventListener('DOMContentLoaded', async () => {
    // Primero, intenta cargar los eventos iniciales si localStorage está vacío
    // Esto asegura que haya datos al menos del events.json si nunca se ha usado el admin
    await loadInitialEventsFromJsonToLocalStorage();

    // Luego, verifica la sesión de administrador para mostrar la interfaz
    if (sessionStorage.getItem('isAdminLoggedIn') === 'true') {
        loginScreen.style.display = "none";
        mainAdminContent.style.display = "block";
        inicializarAdmin();
    } else {
        loginScreen.style.display = "flex";
        mainAdminContent.style.display = "none";
    }
});