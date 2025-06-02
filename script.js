// URL de tu Google Sheets (¡cámbialas por tus URLs reales!)
const SHEET_EVENTOS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZHOx9FpzP9PlipwbdMmd1ernsJZwQyZXOXwsYvaoFg_pYmNGIGs787gzoz3at2_TLZogHqKy6d92V/pub?output=csv';

// Configuración simplificada
const HORARIO = {
    "Lunes": [
        { materia: "Laboratorio de Software II", inicio: "07:00", fin: "08:20" },
        { materia: "Laboratorio de Hardware II", inicio: "08:30", fin: "11:15" }
    ],
    "Miércoles": [
        { materia: "Base de Datos I", inicio: "18:30", fin: "20:40" }
    ],
    // ... Agrega otros días según tu horario
};

async function cargarEventos() {
    try {
        const response = await fetch(SHEET_EVENTOS);
        const csv = await response.text();
        return csv.split('\n').slice(1).map(linea => {
            const [dia, materia, tipo] = linea.split(',');
            return { dia: dia?.trim(), materia: materia?.trim(), tipo: tipo?.trim() };
        }).filter(e => e.dia);
    } catch (error) {
        console.error("Error al cargar eventos:", error);
        return [];
    }
}

function generarCalendario() {
    const calendario = document.getElementById("calendario");
    
    // Ejemplo para 1 semana (puedes ampliar a 2 semanas)
    Object.entries(HORARIO).forEach(([dia, materias]) => {
        const divDia = document.createElement("div");
        divDia.className = "dia";
        divDia.innerHTML = `<h2>${dia}</h2>`;
        
        materias.forEach(materiaHorario => {
            const divMateria = document.createElement("div");
            divMateria.className = "materia";
            
            // Formato: "Base de Datos I | 18:30-20:40"
            divMateria.innerHTML = `
                <span>${materiaHorario.materia}</span>
                <span class="horario">${materiaHorario.inicio}-${materiaHorario.fin}</span>
                <span class="evento dia-corriente">Día corriente</span>
            `;
            
            divDia.appendChild(divMateria);
        });
        
        calendario.appendChild(divDia);
    });
}

// Iniciar
window.onload = async () => {
    const eventos = await cargarEventos();
    generarCalendario();
    
    // Aquí puedes agregar lógica para mezclar eventos con el horario
    // Ejemplo: buscar si hay eventos para cada materia y reemplazar "Día corriente"
};