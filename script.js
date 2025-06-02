// URL de tu Google Sheets (formato CSV)
const SHEET_URL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSZHOx9FpzP9PlipwbdMmd1ernsJZwQyZXOXwsYvaoFg_pYmNGIGs787gzoz3at2_TLZogHqKy6d92V/pub?output=csv';

// Horario exacto según lo especificado
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
            { materia: "Inglés", inicio: "16:10", fin: "18:20" },
            { materia: "Base de Datos I", inicio: "18:20", fin: "20:40", especial: true }
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
            { materia: "Programacion I", inicio: "14:00", fin: "15:20" },
            { materia: "Gestion de Organizaciones", inicio: "15:20", fin: "16:50" }
        ]
    }
};

// Tipos de eventos permitidos
const TIPOS_EVENTOS = {
    "evaluacion": "Evaluación",
    "leccion": "Lección",
    "recuperatorio": "Recuperatorio",
    "correccion-de-carpetas": "Corrección de Carpetas",
    "repaso": "Repaso",
    "ausencia": "Ausencia"
};

// Función para cargar datos desde Google Sheets
async function cargarDatos() {
    try {
        const response = await fetch(SHEET_URL);
        const csv = await response.text();
        
        const lineas = csv.split('\n').slice(1); // Saltar encabezado
        const eventos = [];
        const ausencias = [];
        
        lineas.forEach(linea => {
            const [dia, materia, tipo, hora] = linea.split(',').map(item => item?.trim());
            
            if (!dia) return; // Saltar líneas vacías
            
            const tipoNormalizado = tipo?.toLowerCase().trim();
            
            if (tipoNormalizado === 'ausencia') {
                ausencias.push({ dia, materia, hora });
            } else if (tipoNormalizado && Object.values(TIPOS_EVENTOS).map(v => v.toLowerCase()).includes(tipoNormalizado)) {
                eventos.push({ dia, materia, tipo });
            } else if (tipo) {
                console.warn(`Tipo de evento no reconocido: "${tipo}" en ${dia} para ${materia}`);
            }
        });
        
        return { eventos, ausencias };
    } catch (error) {
        console.error("Error al cargar datos:", error);
        return { eventos: [], ausencias: [] };
    }
}

// Función para aplicar eventos y ausencias específicas por día
function aplicarDatos(eventos, ausencias) {
    // Aplicar eventos verificando el día exacto
    eventos.forEach(evento => {
        // Buscar el contenedor del día específico
        const diaElement = Array.from(document.querySelectorAll('.dia-header'))
            .find(header => header.textContent.trim() === evento.dia)
            ?.closest('.dia');
        
        if (!diaElement) {
            console.warn(`No se encontró el día: ${evento.dia}`);
            return;
        }
        
        // Buscar la materia exacta dentro de ese día
        diaElement.querySelectorAll('.materia').forEach(divMateria => {
            const nombreMateria = divMateria.querySelector('.nombre-materia')?.textContent.trim();
            if (nombreMateria === evento.materia.trim()) {
                const eventoEl = divMateria.querySelector('.evento');
                if (eventoEl) {
                    eventoEl.textContent = evento.tipo;
                    const tipoClase = evento.tipo.toLowerCase().replace(/\s+/g, '-').replace('ó', 'o');
                    eventoEl.className = `evento ${tipoClase}`;
                }
            }
        });
    });
    
    // Aplicar ausencias verificando el día exacto
    ausencias.forEach(ausencia => {
        // Buscar el contenedor del día específico
        const diaElement = Array.from(document.querySelectorAll('.dia-header'))
            .find(header => header.textContent.trim() === ausencia.dia)
            ?.closest('.dia');
        
        if (!diaElement) {
            console.warn(`No se encontró el día: ${ausencia.dia}`);
            return;
        }
        
        // Buscar la materia exacta dentro de ese día
        diaElement.querySelectorAll('.materia').forEach(divMateria => {
            const nombreMateria = divMateria.querySelector('.nombre-materia')?.textContent.trim();
            if (nombreMateria === ausencia.materia.trim()) {
                divMateria.classList.add('ausencia');
                const horarioEl = divMateria.querySelector('.horario');
                if (horarioEl) {
                    horarioEl.textContent += ausencia.hora ? ` (Ausente desde ${ausencia.hora})` : ' (Ausente)';
                }
            }
        });
    });
}

// Función para generar el calendario
function generarCalendario() {
    const calendario = document.getElementById("calendario");
    calendario.innerHTML = ''; // Limpiar calendario antes de generar
    
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
            
            const divTurnoHeader = document.createElement("div");
            divTurnoHeader.className = "turno-header";
            
            const inicioTurno = materias[0].inicio;
            const finTurno = materias[materias.length - 1].fin;
            
            divTurnoHeader.innerHTML = `
                <span>Turno ${turno}</span>
                <span class="horario">${inicioTurno} - ${finTurno}</span>
            `;
            divTurno.appendChild(divTurnoHeader);
            
            const divMaterias = document.createElement("div");
            divMaterias.className = "materias-container";
            
            materias.forEach(materia => {
                const divMateria = document.createElement("div");
                divMateria.className = `materia ${materia.especial ? 'especial' : ''}`;
                
                divMateria.innerHTML = `
                    <span class="nombre-materia">${materia.materia}</span>
                    <span class="horario">${materia.inicio}-${materia.fin}</span>
                    <span class="evento dia-corriente">Día corriente</span>
                `;
                divMaterias.appendChild(divMateria);
            });
            
            divTurno.appendChild(divMaterias);
            divDia.appendChild(divTurno);
        });
        
        calendario.appendChild(divDia);
    });
}

// Función principal
async function main() {
    generarCalendario();
    const { eventos, ausencias } = await cargarDatos();
    aplicarDatos(eventos, ausencias);
}

// Iniciar
window.onload = main;