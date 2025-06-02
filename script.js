// URL de tu Google Sheets (pública en formato CSV)
const SHEET_EVENTOS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZHOx9FpzP9PlipwbdMmd1ernsJZwQyZXOXwsYvaoFg_pYmNGIGs787gzoz3at2_TLZogHqKy6d92V/pub?output=csv';
const SHEET_AUSENCIAS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZHOx9FpzP9PlipwbdMmd1ernsJZwQyZXOXwsYvaoFg_pYmNGIGs787gzoz3at2_TLZogHqKy6d92V/pub?output=csv';
const SHEET_ENCUESTAS = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZHOx9FpzP9PlipwbdMmd1ernsJZwQyZXOXwsYvaoFg_pYmNGIGs787gzoz3at2_TLZogHqKy6d92V/pub?output=csv';

// Configuración de horarios
const config = {
    turnos: {
        "Mañana": [
            { hora: "07:00-08:20", materias: ["Laboratorio de Software II"] },
            { hora: "08:30-11:15", materias: ["Laboratorio de Hardware II"] }
        ],
        "Tarde": [
            { hora: "14:00-14:40", materias: ["Química"] },
            { hora: "14:40-15:20", materias: ["Química"] },
            { hora: "15:30-16:10", materias: ["Química"] }
        ],
        "Noche": [
            { hora: "18:30-19:10", materias: ["Base de Datos I"] },
            { hora: "19:10-19:50", materias: ["Base de Datos I"] },
            { hora: "20:00-20:40", materias: ["Base de Datos I"] }
        ]
    },
    diasEspeciales: {
        "Miércoles": { horarioExtendido: true, horaSalida: "20:40" }
    }
};

// Función para obtener datos de Google Sheets
async function obtenerDatos(url) {
    try {
        const response = await fetch(url);
        const csv = await response.text();
        const lineas = csv.split('\n').slice(1); // Saltar encabezado
        return lineas.map(linea => {
            const [dia, materia, hora, tipo] = linea.split(',');
            return { dia: dia?.trim(), materia: materia?.trim(), hora: hora?.trim(), tipo: tipo?.trim() };
        }).filter(item => item.dia); // Filtrar líneas vacías
    } catch (error) {
        console.error("Error al obtener datos:", error);
        return [];
    }
}

// Función principal
async function generarCalendario() {
    const calendario = document.getElementById("calendario");
    const [eventos, ausencias] = await Promise.all([
        obtenerDatos(SHEET_EVENTOS),
        obtenerDatos(SHEET_AUSENCIAS)
    ]);
    
    // Generar 2 semanas
    for (let semana = 0; semana < 2; semana++) {
        const divSemana = document.createElement("div");
        divSemana.className = "semana";
        divSemana.innerHTML = `<h2>Semana ${semana + 1}</h2>`;
        
        ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].forEach(dia => {
            const divDia = document.createElement("div");
            divDia.className = "dia";
            divDia.innerHTML = `<h3>${dia}</h3>`;
            
            for (const [turno, bloques] of Object.entries(config.turnos)) {
                const divTurno = document.createElement("div");
                divTurno.className = "turno";
                divTurno.innerHTML = `<h4>Turno ${turno}</h4>`;
                
                bloques.forEach(bloque => {
                    bloque.materias.forEach(materia => {
                        const evento = eventos.find(e => 
                            e.dia === dia && e.materia === materia && e.hora === bloque.hora
                        );
                        
                        const ausencia = ausencias.find(a => 
                            a.dia === dia && a.materia === materia
                        );
                        
                        const divMateria = document.createElement("div");
                        divMateria.className = "materia";
                        
                        let contenido = `
                            <span>${materia}</span>
                            <span class="horario">${bloque.hora}</span>
                        `;
                        
                        if (ausencia) {
                            contenido += `<span class="evento ausencia">Ausente: ${ausencia.hora || 'Todo el día'}</span>`;
                        } else if (evento) {
                            contenido += `<span class="evento ${evento.tipo}">${evento.tipo}</span>`;
                        } else {
                            contenido += `<span class="evento">Día corriente</span>`;
                        }
                        
                        divMateria.innerHTML = contenido;
                        divTurno.appendChild(divMateria);
                    });
                });
                
                divDia.appendChild(divTurno);
            }
            
            if (config.diasEspeciales[dia]) {
                const especial = config.diasEspeciales[dia];
                divDia.innerHTML += `<p class="especial">Horario extendido - Salida: ${especial.horaSalida}</p>`;
            }
            
            divSemana.appendChild(divDia);
        });
        
        calendario.appendChild(divSemana);
    }
}

// Manejar encuesta
document.getElementById("formEncuesta").addEventListener("submit", async function(e) {
    e.preventDefault();
    const opcion = document.querySelector('input[name="opcion"]:checked')?.value;
    
    if (!opcion) {
        alert("Por favor selecciona una opción");
        return;
    }
    
    // Guardar en Google Sheets (simulado)
    try {
        // Aquí iría el código para enviar a tu Sheet de encuestas
        console.log("Respuesta guardada:", opcion);
        document.getElementById("resultados").innerHTML = `
            <p>Resultado: ${opcion}</p>
            <p>Gracias por participar</p>
        `;
    } catch (error) {
        console.error("Error al guardar encuesta:", error);
    }
});

// Iniciar
window.onload = generarCalendario;