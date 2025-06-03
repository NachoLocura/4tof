// student.js
document.addEventListener('DOMContentLoaded', () => {
    const tituloCalendario = document.getElementById("tituloCalendario");
    const calendarioDiv = document.getElementById("calendario");
    const eventLegendDiv = document.getElementById("eventLegend");

    // Definición de tipos de eventos y sus colores (¡Consistente con admin.js!)
    const tiposEventos = [
        { nombre: "Lección", color: "#82cfff", textColor: "black" },
        { nombre: "Evaluación", color: "#ff4d4d", textColor: "white" },
        { nombre: "Trabajo Práctico", color: "#fff66b", textColor: "black" },
        { nombre: "Carpeta", color: "#f9c0d1", textColor: "black" },
        { nombre: "Feriado", color: "#d3b9ff", textColor: "black" },
        { nombre: "!!!No hay clases!!!", color: "#ff4d4d", textColor: "white" },
        { nombre: "Ingreso Especial", color: "#ADD8E6", textColor: "black" },
        { nombre: "Salida Especial", color: "#90EE90", textColor: "black" },
        { nombre: "Traer Materiales", color: "#FFA500", textColor: "black" }, // Nuevo tipo de evento
        { nombre: "Día Corriente", color: "#d4edda", textColor: "black" } // Este es solo para la lógica de visualización, no para eventos
    ];

    let eventos = [];
    const LOCAL_STORAGE_KEY = 'eventsData'; // Clave para localStorage, consistente con admin.js

    // Función para verificar si un color es oscuro para decidir el color del texto
    function isColorDark(hexColor) {
        const r = parseInt(hexColor.substring(1, 3), 16);
        const g = parseInt(hexColor.substring(3, 5), 16);
        const b = parseInt(hexColor.substring(5, 7), 16);
        const luminosity = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminosity < 0.5;
    }

    async function loadEventsFromStorageOrJson() {
        const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedEvents) {
            try {
                eventos = JSON.parse(storedEvents);
                console.log("Eventos cargados desde localStorage.");
            } catch (e) {
                console.error("Error al parsear eventos desde localStorage, intentando cargar de events.json:", e);
                localStorage.removeItem(LOCAL_STORAGE_KEY); // Limpiar localStorage corrupto
                await fetchAndLoadJsonEvents();
            }
        } else {
            console.log("No hay eventos en localStorage, cargando desde events.json...");
            await fetchAndLoadJsonEvents();
        }
    }

    async function fetchAndLoadJsonEvents() {
        try {
            const response = await fetch('events.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                eventos = data;
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventos)); // Guardar en localStorage para futuras cargas
                console.log("Eventos cargados desde events.json.");
            } else {
                console.error("El archivo events.json no tiene el formato esperado (debe ser un array de objetos).");
                eventos = [];
            }
        } catch (error) {
            console.error("No se pudo cargar events.json:", error);
            // Si falla la carga del JSON, dejar eventos como un array vacío
            eventos = [];
        }
    }


    function cargarCalendario(monthOffset = 0) {
        const hoy = new Date();
        const targetDate = new Date(hoy.getFullYear(), hoy.getMonth() + monthOffset, 1);
        const year = targetDate.getFullYear();
        const month = targetDate.getMonth(); // 0-indexed

        tituloCalendario.textContent = `Avisos del mes de ${targetDate.toLocaleString('es-ES', { month: 'long', year: 'numeric' })}`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        let startDayOfWeek = firstDayOfMonth.getDay();
        startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1; // Convertir Domingo (0) a Lunes (6) para un inicio de semana en Lunes

        const calendarGrid = document.createElement('div');
        calendarGrid.classList.add('calendario-grid');

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
                    // Si el detalle existe y no hay horas de entrada/salida, usar el detalle
                    if (event.detalle && !event.horaEntrada && !event.horaSalida) {
                         // Para "Traer Materiales", el detalle puede ser el principal
                        if (event.tipoEvento === "Traer Materiales") {
                            eventText = `${event.materia} - Traer Materiales`;
                            if (event.detalle && event.detalle !== `Ingreso: ${event.horaEntrada}` && event.detalle !== `Salida: ${event.horaSalida}`) {
                                eventText = `${event.materia} - Traer Materiales: ${event.detalle}`;
                            }
                        } else {
                            // Para otros eventos sin horas, mostrar el detalle
                            eventText = event.detalle;
                        }
                    }

                    eventItem.textContent = eventText;
                    eventItem.style.backgroundColor = eventType.color;
                    eventItem.style.color = eventType.textColor;
                    cell.appendChild(eventItem);
                    contentAdded = true;
                }
            });

            const isToday = hoy.getDate() === day && hoy.getMonth() === month && hoy.getFullYear() === year && monthOffset === 0;
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

        calendarioDiv.innerHTML = ''; // Limpiar mensaje de carga o contenido previo
        calendarioDiv.appendChild(calendarGrid); // *** AÑADIR EL GRID AL CONTENEDOR PRINCIPAL ***
        populateEventLegend();
    }

    function populateEventLegend() {
        eventLegendDiv.innerHTML = ''; // Limpiar leyenda existente
        tiposEventos.forEach(tipo => {
            if (tipo.nombre === "Día Corriente") return; // No es necesario mostrar 'Día Corriente' en la leyenda

            const legendItem = document.createElement('div');
            legendItem.classList.add('legend-item');

            const colorBox = document.createElement('span');
            colorBox.classList.add('legend-color-box');
            colorBox.style.backgroundColor = tipo.color;
            colorBox.style.borderColor = isColorDark(tipo.color) ? 'white' : 'black'; // Añadir borde para contraste

            const legendText = document.createElement('span');
            legendText.textContent = tipo.nombre;

            legendItem.appendChild(colorBox);
            legendItem.appendChild(legendText);
            eventLegendDiv.appendChild(legendItem);
        });
    }

    // Cargar y mostrar el calendario al inicio
    loadEventsFromStorageOrJson().then(() => {
        cargarCalendario(); // Carga el calendario para el mes actual por defecto
    });
});