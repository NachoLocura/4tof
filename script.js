// Datos de ejemplo (simulando una respuesta de Google Sheets)
const eventos = [
    { fecha: "10-Jun-2024", nombre: "Matemáticas", tipo: "evaluacion", descripcion: "Examen de álgebra" },
    { fecha: "12-Jun-2024", nombre: "Feriado Nacional", tipo: "feriado", descripcion: "Día de la independencia" },
    { fecha: "15-Jun-2024", nombre: "Historia", tipo: "trabajo", descripcion: "Entrega de ensayo" },
    { fecha: "18-Jun-2024", nombre: "Biología", tipo: "evaluacion", descripcion: "Práctica de laboratorio" }
];

function mostrarEventos() {
    const contenedor = document.getElementById("eventos-container");
    eventos.forEach(evento => {
        const divEvento = document.createElement("div");
        divEvento.className = `evento ${evento.tipo}`;
        divEvento.innerHTML = `
            <h3>${evento.nombre}</h3>
            <p><strong>📅 Fecha:</strong> ${evento.fecha}</p>
            <p>${evento.descripcion}</p>
        `;
        contenedor.appendChild(divEvento);
    });
}

// Cargar eventos al iniciar
window.onload = mostrarEventos;