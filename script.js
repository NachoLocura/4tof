// Configuración completa del horario
const HORARIO = {
    "Lunes": {
        "Mañana": [
            { materia: "Laboratorio de Software II", inicio: "07:00", fin: "08:20" },
            { materia: "Laboratorio de Hardware II", inicio: "08:30", fin: "11:15" }
        ],
        "Tarde": [
            { materia: "Química", inicio: "14:00", fin: "16:10" },
            { materia: "Técnicas Digitales I", inicio: "16:10", fin: "18:20" }
        ]
    },
    "Martes": {
        "Mañana": [
            { materia: "Redes", inicio: "09:10", fin: "11:15" }
        ],
        "Tarde": [
            { materia: "Ética", inicio: "14:00", fin: "16:10" },
            { materia: "Análisis Matemático", inicio: "16:10", fin: "18:20" }
        ]
    },
    "Miércoles": {
        "Tarde": [
            { materia: "Lengua", inicio: "14:00", fin: "16:10" },
            { materia: "Inglés", inicio: "16:10", fin: "18:20" }
        ],
        "Noche": [
            { materia: "Base de Datos I", inicio: "18:20", fin: "20:40" }
        ]
    },
    "Jueves": {
        "Mañana": [
            { materia: "Sistema Operativo II", inicio: "07:00", fin: "09:00" },
            { materia: "Laboratorio de Software II", inicio: "09:00", fin: "11:20" }
        ],
        "Tarde": [
            { materia: "Programación I", inicio: "14:00", fin: "15:20" },
            { materia: "Gestión de Organizaciones", inicio: "15:20", fin: "16:50" },
            { materia: "Análisis Matemático", inicio: "17:00", fin: "18:20" }
        ]
    },
    "Viernes": {
        "Tarde": [
            { materia: "Programación I", inicio: "14:00", fin: "15:20" },
            { materia: "Gestión de Organizaciones", inicio: "15:20", fin: "16:50" }
        ]
    }
};

// Función para generar el calendario
function generarCalendario() {
    const calendario = document.getElementById("calendario");
    
    Object.entries(HORARIO).forEach(([dia, turnos]) => {
        const divDia = document.createElement("div");
        divDia.className = "dia";
        
        const divHeader = document.createElement("div");
        divHeader.className = "dia-header";
        divHeader.textContent = dia;
        divDia.appendChild(divHeader);
        
        Object.entries(turnos).forEach(([turno, materias]) => {
            const divTurno = document.createElement("div");
            divTurno.className = "turno";
            
            // Calcular horario total del turno
            const inicioTurno = materias[0].inicio;
            const finTurno = materias[materias.length - 1].fin;
            
            const divTurnoHeader = document.createElement("div");
            divTurnoHeader.className = "turno-header";
            divTurnoHeader.innerHTML = `
                <span>Turno ${turno}</span>
                <span class="horario">${inicioTurno} - ${finTurno}</span>
            `;
            divTurno.appendChild(divTurnoHeader);
            
            materias.forEach(materia => {
                const divMateria = document.createElement("div");
                divMateria.className = "materia";
                divMateria.innerHTML = `
                    <span>${materia.materia}</span>
                    <span class="horario">${materia.inicio}-${materia.fin}</span>
                    <span class="evento dia-corriente">Día corriente</span>
                `;
                divTurno.appendChild(divMateria);
            });
            
            divDia.appendChild(divTurno);
        });
        
        calendario.appendChild(divDia);
    });
}

// Iniciar
window.onload = generarCalendario;