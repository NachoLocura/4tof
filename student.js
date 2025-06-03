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
        { nombre: "Día Corriente", color: "#d4edda", textColor: "black" }
    ];

    let eventos = [];
    const LOCAL_STORAGE_KEY = 'eventsData'; // Clave para localStorage, debe ser la misma que en admin.js

    function formatFecha(date) {
        const d = new Date(date);
        const year = d.getFullYear();
        const month = (d.getMonth() + 1).toString().padStart(2, '0');
        const day = d.getDate().toString().padStart(2, '0');
        return `${year}-${month}-${day}`;
    }

    function isColorDark(hexColor) {
        const r = parseInt(hexColor.substring(1, 3), 16);
        const g = parseInt(hexColor.substring(3, 5), 16);
        const b = parseInt(hexColor.substring(5, 7), 16);
        const brightness = (r * 299 + g * 587 + b * 114) / 1000;
        return brightness < 128;
    }

    function cargarEventosDesdeLocalStorage() {
        const storedEvents = localStorage.getItem(LOCAL_STORAGE_KEY);
        eventos = storedEvents ? JSON.parse(storedEvents) : [];
        console.log("Eventos cargados desde localStorage para student.js:", eventos); // Para depuración
    }

    function cargarCalendario() {
        calendarioDiv.innerHTML = '<p class="loading-message">Cargando eventos...</p>';
        cargarEventosDesdeLocalStorage(); // Cargar los eventos al inicio

        const now = new Date();
        const currentYear = now.getFullYear();
        const currentMonth = now.getMonth(); // 0-indexed

        const firstDayOfMonth = new Date(currentYear, currentMonth, 1);
        const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0);
        const daysInMonth = lastDayOfMonth.getDate();

        const monthName = firstDayOfMonth.toLocaleString('es-ES', { month: 'long', year: 'numeric' });
        tituloCalendario.textContent = `Avisos del mes - ${monthName.charAt(0).toUpperCase() + monthName.slice(1)}`;

        const calendarGrid = document.createElement('div');
        calendarGrid.classList.add('calendar-grid'); // Asegura que esta clase se añada

        // Add day names
        const dayNames = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        dayNames.forEach(dayName => {
            const dayNameHeader = document.createElement('div');
            dayNameHeader.classList.add('day-name'); // Asegura que esta clase se añada
            dayNameHeader.textContent = dayName;
            calendarGrid.appendChild(dayNameHeader);
        });

        // Fill in leading empty days
        const firstDayOfWeek = firstDayOfMonth.getDay(); // 0 for Sunday, 1 for Monday, etc.
        for (let i = 0; i < firstDayOfWeek; i++) {
            const emptyCell = document.createElement('div');
            emptyCell.classList.add('calendar-cell', 'empty'); // Asegura que estas clases se añadan
            calendarGrid.appendChild(emptyCell);
        }

        // Fill in days of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const cell = document.createElement('div');
            cell.classList.add('calendar-cell'); // Asegura que esta clase se añada

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
                        // Asegúrate de que la materia solo se muestre si existe
                        eventDiv.textContent = `${event.materia ? event.materia + ' - ' : ''}${event.tipoEvento}`;
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

        calendarioDiv.innerHTML = ''; // Clear loading message
        calendarioDiv.appendChild(calendarGrid);
        populateEventLegend();
    }

    function populateEventLegend() {
        eventLegendDiv.innerHTML = ''; // Clear existing legend
        tiposEventos.forEach(tipo => {
            if (tipo.nombre === "Día Corriente") return; // No need to show 'Día Corriente' in legend explicitly

            const legendItem = document.createElement('div');
            legendItem.classList.add('legend-item');

            const colorBox = document.createElement('span');
            colorBox.classList.add('legend-color-box');
            colorBox.style.backgroundColor = tipo.color;
            colorBox.style.borderColor = isColorDark(tipo.color) ? 'white' : 'black'; // Add border for contrast

            const legendText = document.createElement('span');
            legendText.textContent = tipo.nombre;

            legendItem.appendChild(colorBox);
            legendItem.appendChild(legendText);
            eventLegendDiv.appendChild(legendItem);
        });
    }

    // Cargar y mostrar el calendario al inicio
    cargarCalendario();
});