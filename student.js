// student.js
document.addEventListener('DOMContentLoaded', () => {
    const tituloCalendario = document.getElementById("tituloCalendario");
    const calendarioDiv = document.getElementById("calendario");
    const eventLegendDiv = document.getElementById("eventLegend");

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
        { nombre: "Día Corriente", color: "#d4edda", textColor: "black" } // Este es solo para la lógica de visualización, no para eventos
    ];

    let eventos = [];
    const LOCAL_STORAGE_KEY = 'eventsData'; // Clave para localStorage, debe ser la misma que en admin.js

    // Función para verificar si un color es oscuro para decidir el color del texto
    function isColorDark(hexColor) {
        const r = parseInt(hexColor.substring(1, 3), 16);
        const g = parseInt(hexColor.substring(3, 5), 16);
        const b = parseInt(hexColor.substring(5, 7), 16);
        // Fórmula para luminosidad: (0.299*R + 0.587*G + 0.114*B)
        const luminosity = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
        return luminosity < 0.5; // Retorna true si es oscuro
    }

    async function loadEventsFromStorageOrJson() {
        const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
        if (storedEvents) {
            try {
                eventos = JSON.parse(storedEvents);
            } catch (e) {
                console.error("Error al parsear eventos desde localStorage, cargando desde JSON inicial:", e);
                await loadInitialEventsFromJson();
            }
        } else {
            // Si no hay nada en localStorage, cargamos los eventos iniciales del JSON
            await loadInitialEventsFromJson();
        }
        // Ordenar eventos por fecha para visualización
        eventos.sort((a, b) => new Date(a.fecha) - new Date(b.fecha));
    }

    async function loadInitialEventsFromJson() {
        try {
            const response = await fetch('events.json');
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            if (Array.isArray(data)) {
                eventos = data;
                // Guardar los eventos iniciales en localStorage para futuras cargas
                // Esto es crucial para que el alumno vea lo mismo que el admin ha "subido" inicialmente
                localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(eventos));
            } else {
                console.error("El archivo events.json no tiene el formato esperado (debe ser un array de objetos).");
                eventos = []; // Asegura que 'eventos' sea un array vacío
            }
        } catch (error) {
            console.error("Error al cargar el archivo events.json:", error);
            eventos = []; // Asegura que 'eventos' sea un array vacío
        }
    }


    function cargarCalendario() {
        const hoy = new Date();
        const year = hoy.getFullYear();
        const month = hoy.getMonth(); // 0-indexed

        // Ajustar el título del calendario
        const monthNames = ["Enero", "Febrero", "Marzo", "Abril", "Mayo", "Junio", "Julio", "Agosto", "Septiembre", "Octubre", "Noviembre", "Diciembre"];
        tituloCalendario.textContent = `Avisos de ${monthNames[month]} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1);
        const lastDayOfMonth = new Date(year, month + 1, 0); // Day 0 of next month is last day of current month
        const daysInMonth = lastDayOfMonth.getDate();

        // Determinar el día de la semana del primer día del mes (0 = Domingo, 1 = Lunes, etc.)
        // Ajustamos para que Lunes sea el primer día de la semana (0 en nuestra lógica)
        let startDayOfWeek = firstDayOfMonth.getDay();
        startDayOfWeek = (startDayOfWeek === 0) ? 6 : startDayOfWeek - 1; // Ajusta para que Lunes sea 0, Domingo 6

        // *** CAMBIO CLAVE AQUÍ: Crear un contenedor para la cuadrícula del calendario ***
        const calendarGrid = document.createElement('div');
        calendarGrid.classList.add('calendario-grid'); // Aplicará las propiedades de grid del CSS

        // Añadir nombres de los días de la semana
        const dayNames = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];
        dayNames.forEach(dayName => {
            const dayNameCell = document.createElement('div');
            dayNameCell.classList.add('day-name-cell');
            dayNameCell.textContent = dayName;
            calendarGrid.appendChild(dayNameCell);
        });

        // Añadir celdas vacías para los días antes del 1ro del mes
        for (let i = 0; i < startDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-day-cell', 'empty');
            calendarGrid.appendChild(emptyCell);
        }

        // Añadir celdas para cada día del mes
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-day-cell');

            const dayNumber = document.createElement('div');
            dayNumber.classList.add('day-number');
            dayNumber.textContent = day;
            cell.appendChild(dayNumber);

            const currentDate = new Date(year, month, day);
            const formattedCurrentDate = currentDate.toISOString().split('T')[0]; //YYYY-MM-DD

            let contentAdded = false;

            // Filtrar eventos para el día actual
            const eventsForDay = eventos.filter(event => event.fecha === formattedCurrentDate);

            eventsForDay.forEach(event => {
                const eventType = tiposEventos.find(tipo => tipo.nombre === event.tipoEvento);
                if (eventType) {
                    const eventItem = document.createElement('div');
                    eventItem.classList.add('event-item');
                    // Mostrar detalle si existe, o solo materia y tipo si no
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

            // Marcar el día corriente
            const isToday = hoy.getDate() === day && hoy.getMonth() === month && hoy.getFullYear() === year;
            if (isToday) {
                 if (!contentAdded || eventsForDay.length === 0) { // Mostrar "Día corriente" si no hay eventos o si lo prefieres siempre
                    cell.classList.add('today'); // Agrega una clase para estilizar el día actual si es necesario
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
        cargarCalendario();
    });
});