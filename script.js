// Configuración básica
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

// Función principal
async function generarCalendario() {
    const calendario = document.getElementById("calendario");
    
    // Obtener datos del Google Sheets
    const eventos = await obtenerEventos();
    const ausencias = await obtenerAusencias();
    
    // Generar calendario para 2 semanas
    for (let semana = 0; semana < 2; semana++) {
        const divSemana = document.createElement("div");
        divSemana.className = "semana";
        divSemana.innerHTML = `<h2>Semana ${semana + 1}</h2>`;
        
        // Generar días de la semana
        ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes"].forEach(dia => {
            const divDia = document.createElement("div");
            divDia.className = "dia";
            divDia.innerHTML = `<h3>${dia}</h3>`;
            
            // Generar turnos
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
                            contenido += `<span class="evento ausencia">Ausente: ${ausencia.hora}</span>`;
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
            
            // Manejar días especiales
            if (config.diasEspeciales[dia]) {
                const especial = config.diasEspeciales[dia];
                divDia.innerHTML += `<p>Horario extendido - Salida: ${especial.horaSalida}</p>`;
            }
            
            divSemana.appendChild(divDia);
        });
        
        calendario.appendChild(divSemana);
    }
}

// Funciones para obtener datos
async function obtenerEventos() {
    // Implementar conexión a Google Sheets
    return []; // Ejemplo: { dia: "Lunes", materia: "Química", hora: "14:00-14:40", tipo: "evaluacion" }
}

async function obtenerAusencias() {
    // Implementar conexión a Google Sheets
    return []; // Ejemplo: { dia: "Lunes", materia: "Química", hora: "16:10" }
}

// Manejar encuesta
document.getElementById("formEncuesta").addEventListener("submit", function(e) {
    e.preventDefault();
    const opcion = document.querySelector('input[name="opcion"]:checked').value;
    document.getElementById("resultados").innerHTML = `
        <p>Resultado: ${opcion}</p>
        <p>Gracias por participar en el Paro de Alumnos</p>
    `;
    
    // Aquí podrías guardar los resultados en Google Sheets
});

// Iniciar
window.onload = generarCalendario;