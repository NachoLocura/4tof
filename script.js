// URL de tu hoja de Google Sheets (PUBLICADA EN WEB)
const SHEET_URL = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSZHOx9FpzP9PlipwbdMmd1ernsJZwQyZXOXwsYvaoFg_pYmNGIGs787gzoz3at2_TLZogHqKy6d92V/pub?output=csv";

async function cargarEventos() {
    try {
        const response = await fetch(SHEET_URL);
        const data = await response.text();
        const eventos = parsearCSV(data);
        mostrarEventos(eventos);
    } catch (error) {
        console.error("Error al cargar eventos:", error);
    }
}

function parsearCSV(csv) {
    const lineas = csv.split("\n");
    const eventos = [];
    for (let i = 1; i < lineas.length; i++) {
        const [fecha, nombre, tipo, descripcion] = lineas[i].split(",");
        if (fecha && nombre) {
            eventos.push({ 
                fecha: fecha.trim(),
                nombre: nombre.trim(),
                tipo: tipo ? tipo.trim() : "",
                descripcion: descripcion ? descripcion.trim() : ""
            });
        }
    }
    return eventos;
}

function mostrarEventos(eventos) {
    const contenedor = document.getElementById("eventos");
    contenedor.innerHTML = "";
    eventos.forEach(evento => {
        const div = document.createElement("div");
        div.className = `evento ${evento.tipo.toLowerCase()}`;
        div.innerHTML = `
            <h3>${evento.nombre}</h3>
            <p><strong>📅 Fecha:</strong> ${evento.fecha}</p>
            <p>${evento.descripcion || ""}</p>
        `;
        contenedor.appendChild(div);
    });
}

// Cargar eventos cuando se abra la página
window.onload = cargarEventos;