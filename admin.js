// Contraseña fija para el panel de administración. ¡Cámbiala por una más segura!
const ADMIN_PASSWORD = "543";

// --- Elementos de la Interfaz de Usuario (UI) ---
const loginScreen = document.getElementById("loginScreen");
const mainAdminContent = document.getElementById("mainAdminContent");
const passwordInput = document.getElementById("passwordInput");
const btnLogin = document.getElementById("btnLogin");
const loginError = document.getElementById("loginError");

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
const LOCAL_STORAGE_KEY = 'eventsData';

const tiposEventos = [
    { nombre: "Lección", color: "#82cfff", textColor: "black" },
    { nombre: "Evaluación", color: "#ff4d4d", textColor: "white" },
    { nombre: "Trabajo Práctico", color: "#fff66b", textColor: "black" },
    { nombre: "Carpeta", color: "#f9c0d1", textColor: "black" },
    { nombre: "Feriado", color: "#d3b9ff", textColor: "black" },
    { nombre: "Ausencia 16:10", color: "#7df27d", textColor: "black" },
    { nombre: "!!!No hay clases!!!", color: "#ff4d4d", textColor: "white" },
    { nombre: "Ingreso Especial", color: "#ADD8E6", textColor: "black" },
    { nombre: "Salida Especial", color: "#90EE90", textColor: "black" },
    { nombre: "Día Corriente", color: "#d4edda", textColor: "black" }
];

const materias = [
    "Química",
    "Software 2",
    "Hardware 2",
    "Redes",
    "Ética",
    "Análisis Matemático",
    "Lengua",
    "Inglés",
    "Base de Datos",
    "Sistema Operativo",
    "Gestión de las Organizaciones",
    "Programación"
];

// --- Funciones de Utilidad ---

function saveEventsToLocalStorage() {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventos));
}

function loadEventsFromLocalStorage() {
    const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
    eventos = storedEvents ? JSON.parse(storedEvents) : [];
}

function formatFecha(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function getDayOfWeek(dateString) {
    const date = new Date(dateString);
    const days = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];
    return days[date.getDay()];
}

function isColorDark(hexColor) {
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const brightness = (r * 299 + g * 587 + b * 114) / 1000;
    return brightness < 128;
}

// --- Funciones de Inicialización de UI ---

function populateSelectDia() {
    const today = new Date();
    selectDia.value = formatFecha(today);
}

function populateSelectMateria() {
    selectMateria.innerHTML = '<option value="">-- Seleccione una materia --</option>';
    materias.forEach(materia => {
        const option = document.createElement('option');
        option.value = materia;
        option.textContent = materia;
        selectMateria.appendChild(option);
    });
}

function populateSelectTipoEvento() {
    selectTipoEvento.innerHTML = '<option value="">-- Seleccione un tipo --</option>';
    tiposEventos.forEach(tipo => {
        const option = document.createElement('option');
        option.value = tipo.nombre;
        option.textContent = tipo.nombre;
        selectTipoEvento.appendChild(option);
    });
}

function populateSelectHoras(selectElement, startHour, endHour) {
    selectElement.innerHTML = '';
    for (let h = startHour; h <= endHour; h++) {
        for (let m = 0; m < 60; m += 10) {
            const hour = h.toString().padStart(2, '0');
            const minute = m.toString().padStart(2, '0');
            const option = document.createElement('option');
            option.value = `${hour}:${minute}`;
            option.textContent = `${hour}:${minute}`;
            selectElement.appendChild(option);
        }
    }
}

// --- Lógica del Panel de Administración ---

function handleLogin() {
    if (passwordInput.value === ADMIN_PASSWORD) {
        loginScreen.classList.remove("active");
        loginScreen.style.display = "none";
        mainAdminContent.style.display = "block";
        loginError.textContent = "";
        inicializarAdmin();
    } else {
        loginError.textContent = "Contraseña incorrecta. Intenta de nuevo.";
    }
}

function mostrarEventosActivos() {
    tablaEventosActivosBody.innerHTML = ''; // Limpiar la tabla

    // Filtrar eventos futuros y ordenarlos por fecha
    const now = new Date();
    const eventosFuturos = eventos.filter(event => new Date(event.fecha) >= now).sort((a, b) => new Date(a.fecha) - new Date(b.fecha));

    eventosFuturos.forEach(event => {
        const row = tablaEventosActivosBody.insertRow();
        row.insertCell().textContent = event.fecha;
        row.insertCell().textContent = event.materia || '-'; // Muestra '-' si no hay materia
        row.insertCell().textContent = event.tipoEvento;
        
        let detalleText = '';
        if (event.tipoEvento === "Ingreso Especial" && event.horaEntrada) {
            detalleText = `Entrada: ${event.horaEntrada}`;
        } else if (event.tipoEvento === "Salida Especial" && event.horaSalida) {
            detalleText = `Salida: ${event.horaSalida}`;
        } else if (event.tipoEvento === "Ausencia 16:10") {
            detalleText = "Horario: 16:10";
        }
        row.insertCell().textContent = detalleText;

        const actionCell = row.insertCell();
        const btnEliminar = document.createElement('button');
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.classList.add('btn-delete');
        btnEliminar.onclick = () => {
            if (confirm(`¿Estás seguro de que quieres eliminar el evento del ${event.fecha} (${event.materia || 'Sin Materia'}) - ${event.tipoEvento}?`)) {
                eventos = eventos.filter(e => !(e.fecha === event.fecha && e.materia === event.materia && e.tipoEvento === event.tipoEvento));
                saveEventsToLocalStorage();
                mostrarEventosActivos();
                cargarCalendarioPreview();
            }
        };
        actionCell.appendChild(btnEliminar);
    });
}

function cargarEvento() {
    const fecha = selectDia.value;
    const materia = selectMateria.value;
    const tipoEvento = selectTipoEvento.value;
    const horaEntrada = selectHoraEntrada.value;
    const horaSalida = selectHoraSalida.value;

    if (!fecha || !tipoEvento) {
        alert("Por favor, selecciona una fecha y un tipo de evento.");
        return;
    }

    if (tipoEvento !== "Día Corriente" && !materia) {
        alert("Por favor, selecciona una materia para este tipo de evento.");
        return;
    }

    let newEvent = { fecha, tipoEvento };

    if (materia) { // Añadir materia solo si está seleccionada
        newEvent.materia = materia;
    }

    if (tipoEvento === "Ingreso Especial") {
        newEvent.horaEntrada = horaEntrada;
    } else if (tipoEvento === "Salida Especial") {
        newEvent.horaSalida = horaSalida;
    } else if (tipoEvento === "Ausencia 16:10") {
        newEvent.horaSalida = "16:10"; // Valor fijo para Ausencia 16:10
    }

    // Eliminar eventos del mismo tipo y materia en la misma fecha si no son "Día Corriente"
    if (tipoEvento !== "Día Corriente") {
        eventos = eventos.filter(e => !(e.fecha === fecha && e.materia === materia && e.tipoEvento === tipoEvento));
    }
    
    // Si el nuevo evento es "Día Corriente", eliminar cualquier otro evento para esa fecha
    if (tipoEvento === "Día Corriente") {
        eventos = eventos.filter(e => e.fecha !== fecha);
    } else {
        // Si el nuevo evento NO es "Día Corriente", y hay un "Día Corriente" antiguo para esa fecha, eliminarlo
        const indexToRemove = eventos.findIndex(e => e.fecha === newEvent.fecha && e.tipoEvento === "Día Corriente");
        if (indexToRemove !== -1) {
            eventos.splice(indexToRemove, 1);
        }
    }

    eventos.push(newEvent);
    saveEventsToLocalStorage();
    mostrarEventosActivos();
    cargarCalendarioPreview();

    // Limpiar el formulario excepto la fecha
    selectMateria.value = "";
    selectTipoEvento.value = "";
    rowHoraEntrada.style.display = 'none';
    rowHoraSalida.style.display = 'none';
    selectHoraEntrada.value = '';
    selectHoraSalida.value = '';
}

function cargarCalendarioPreview() {
    calendarioPreviewDiv.innerHTML = '<p class="loading-message">Cargando vista previa del calendario...</p>';
    const now = new Date();
    const currentYear = now.getFullYear();
    const currentMonth = now.getMonth(); // 0-indexed

    const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
    const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();

    const monthName = firstDayOfMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
    tituloCalendarioPreview.textContent = `Vista Previa del Calendario - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;

    const calendarGrid = document.createElement('div');
    calendarGrid.classList.add('calendar-grid');

    // Add day names
    const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
    dayNames.forEach(dayName => {
        const dayNameHeader = document.createElement('div');
        dayNameHeader.classList.add('day-name');
        dayNameHeader.textContent = dayName;
        calendarGrid.appendChild(dayNameHeader);
    });

    // Fill in leading empty days
    const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
    for (let i = 0; i < firstDayOfWeek; i++) {
        const emptyCell = document.createElement('div');
        emptyCell.classList.add('calendar-cell', 'empty');
        calendarGrid.appendChild(emptyCell);
    }

    // Fill in days of the month
    for (let day = 1; day <= daysInMonth; day++) {
        const cell = document.createElement('div');
        cell.classList.add('calendar-cell');

        const date = new Date(currentYear, currentMonth, day);
        const formattedDate = formatFecha(date);

        const dayNumber = document.createElement('div');
        dayNumber.classList.add('day-number');
        dayNumber.textContent = day;
        cell.appendChild(dayNumber);

        // Filter events for the current day
        const eventsForDay = eventos.filter(event => event.fecha === formattedDate);
        let contentAdded = false;

        // PRIORIDAD 1: Feriados y No hay clases
        const specialDayEvent = eventsForDay.find(e => e.tipoEvento === "Feriado" || e.tipoEvento === "!!!No hay clases!!!");
        if (specialDayEvent) {
            const tipoConfig = tiposEventos.find(t => t.nombre === specialDayEvent.tipoEvento);
            if (tipoConfig) {
                cell.style.backgroundColor = tipoConfig.color;
                cell.style.color = tipoConfig.textColor;
            }
            const messageDiv = document.createElement('div');
            messageDiv.classList.add('event-item');
            messageDiv.style.fontWeight = 'bold';
            messageDiv.textContent = specialDayEvent.tipoEvento;
            cell.appendChild(messageDiv);
            contentAdded = true;
        }

        // PRIORIDAD 2: Ingreso Especial, Salida Especial, Ausencia 16:10
        if (!contentAdded) {
            const specialScheduleEvents = eventsForDay.filter(e =>
                e.tipoEvento === "Ingreso Especial" ||
                e.tipoEvento === "Salida Especial" ||
                e.tipoEvento === "Ausencia 16:10"
            ).sort((a, b) => a.tipoEvento.localeCompare(b.tipoEvento)); // Sort to ensure consistent order
            
            if (specialScheduleEvents.length > 0) {
                specialScheduleEvents.forEach(event => {
                    const tipoConfig = tiposEventos.find(t => t.nombre === event.tipoEvento);
                    const backgroundColor = tipoConfig ? tipoConfig.color : '#ccc';
                    const textColor = (tipoConfig && isColorDark(tipoConfig.color)) ? 'white' : 'black';

                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event-item');
                    eventDiv.style.backgroundColor = backgroundColor;
                    eventDiv.style.color = textColor;
                    let detailText = event.tipoEvento;
                    if (event.tipoEvento === "Ingreso Especial" && event.horaEntrada) {
                        detailText = `Entrada: ${event.horaEntrada}`;
                    } else if (event.tipoEvento === "Salida Especial" && event.horaSalida) {
                        detailText = `Salida: ${event.horaSalida}`;
                    } else if (event.tipoEvento === "Ausencia 16:10") {
                        detailText = `Ausencia: 16:10`;
                    }
                    eventDiv.textContent = detailText;
                    cell.appendChild(eventDiv);
                });
                contentAdded = true;
            }
        }

        // PRIORIDAD 3: Lección, Evaluación, Trabajo Práctico, Carpeta (eventos de materia)
        if (!contentAdded) {
            const materiaEvents = eventsForDay.filter(e =>
                e.tipoEvento === "Lección" ||
                e.tipoEvento === "Evaluación" ||
                e.tipoEvento === "Trabajo Práctico" ||
                e.tipoEvento === "Carpeta"
            ).sort((a, b) => {
                // Ordenar por materia y luego por tipo de evento
                if (a.materia < b.materia) return -1;
                if (a.materia > b.materia) return 1;
                return a.tipoEvento.localeCompare(b.tipoEvento);
            });

            if (materiaEvents.length > 0) {
                materiaEvents.forEach(event => {
                    const eventDiv = document.createElement('div');
                    eventDiv.classList.add('event-item');
                    const tipoConfig = tiposEventos.find(t => t.nombre === event.tipoEvento);
                    const backgroundColor = tipoConfig ? tipoConfig.color : '#ccc';
                    const textColor = (tipoConfig && isColorDark(tipoConfig.color)) ? 'white' : 'black';

                    eventDiv.style.backgroundColor = backgroundColor;
                    eventDiv.style.color = textColor;
                    eventDiv.textContent = `${event.materia} - ${event.tipoEvento}`;
                    cell.appendChild(eventDiv);
                });
                contentAdded = true;
            }
        }

        // PRIORIDAD 4: Día Corriente (si no hay nada más)
        if (!contentAdded) {
            const diaCorrienteEvent = eventsForDay.find(e => e.tipoEvento === "Día Corriente");
            if (diaCorrienteEvent) {
                cell.classList.add('dia-corriente-cell');
                const messageDiv = document.createElement('div');
                messageDiv.classList.add('dia-corriente-message');
                messageDiv.textContent = 'Día corriente';
                cell.appendChild(messageDiv);
                contentAdded = true;
            }
        }
        calendarGrid.appendChild(cell);
    }

    calendarioPreviewDiv.innerHTML = ''; // Clear loading message
    calendarioPreviewDiv.appendChild(calendarGrid);
}


// --- Event Listeners ---
btnLogin.addEventListener('click', handleLogin);
passwordInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleLogin();
    }
});

selectTipoEvento.addEventListener('change', () => {
    const selectedTipo = selectTipoEvento.value;
    rowHoraEntrada.style.display = 'none';
    rowHoraSalida.style.display = 'none';

    if (selectedTipo === 'Ingreso Especial') {
        rowHoraEntrada.style.display = 'table-row';
        populateSelectHoras(selectHoraEntrada, 14, 21); // Horas de 14:00 a 21:00
        selectHoraEntrada.value = '14:00'; // Default
    } else if (selectedTipo === 'Salida Especial') {
        rowHoraSalida.style.display = 'table-row';
        populateSelectHoras(selectHoraSalida, 14, 21); // Horas de 14:00 a 21:00

        const today = new Date(selectDia.value);
        const dayOfWeek = today.getDay(); // 0 = Domingo, 1 = Lunes, ..., 5 = Viernes, 6 = Sábado

        let defaultTime = '17:00'; // Default for Friday
        if (dayOfWeek === 1 || dayOfWeek === 2 || dayOfWeek === 4) { // Lunes, Martes, Jueves
            defaultTime = '18:20';
        } else if (dayOfWeek === 3) { // Miércoles
            defaultTime = '20:40';
        }
        selectHoraSalida.value = defaultTime;
    }
    // NOTA: Se eliminó la línea que reseteaba selectMateria.value
});

btnCargarEvento.addEventListener('click', cargarEvento);

btnDownloadEvents.addEventListener('click', () => {
    const dataStr = JSON.stringify(eventos, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'events.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
});

loadEventsFileInput.addEventListener('change', (event) => {
    const file = event.target.files[0];
    if (!file) {
        return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
        try {
            const parsedData = JSON.parse(e.target.result);
            if (Array.isArray(parsedData)) {
                // Opcional: preguntar al usuario si quiere sobrescribir o añadir
                const overwrite = confirm("¿Deseas sobrescribir los eventos existentes con los del archivo JSON? (Cancelar para añadir)");
                if (overwrite) {
                    eventos = parsedData;
                } else {
                    // Añadir nuevos eventos, evitando duplicados en la misma fecha/materia/tipo
                    parsedData.forEach(newEvent => {
                        const existingIndex = eventos.findIndex(e =>
                            e.fecha === newEvent.fecha &&
                            e.materia === newEvent.materia &&
                            e.tipoEvento === newEvent.tipoEvento
                        );
                        if (existingIndex === -1) {
                            // Si el nuevo evento es "Día Corriente", eliminar cualquier otro evento para esa fecha
                            if (newEvent.tipoEvento === "Día Corriente") {
                                eventos = eventos.filter(e => e.fecha !== newEvent.fecha);
                            }
                            // Si el nuevo evento NO es "Día Corriente", y hay un "Día Corriente" antiguo para esa fecha, eliminarlo
                            if (newEvent.tipoEvento !== "Día Corriente") {
                                const indexToRemove = eventos.findIndex(e => e.fecha === newEvent.fecha && e.tipoEvento === "Día Corriente");
                                if (indexToRemove !== -1) {
                                    eventos.splice(indexToRemove, 1);
                                }
                            }
                            eventos.push(newEvent);
                        }
                    });
                }
                saveEventsToLocalStorage();
                mostrarEventosActivos();
                cargarCalendarioPreview();
                alert("Eventos cargados desde JSON con éxito.");
            } else {
                alert("El archivo JSON no tiene el formato esperado (debe ser un array de objetos).");
            }
        } catch (error) {
            alert("Error al leer o parsear el archivo JSON: " + error.message);
            console.error("Error al parsear JSON:", error);
        } finally {
            loadEventsFileInput.value = "";
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
    populateSelectDia();
    populateSelectMateria();
    populateSelectTipoEvento();
    loadEventsFromLocalStorage();
    mostrarEventosActivos();
    cargarCalendarioPreview();
}

document.addEventListener('DOMContentLoaded', () => {
    // Si ya estamos logueados (para desarrollo), inicializar directamente
    if (mainAdminContent.style.display === "block") {
        inicializarAdmin();
    }
});