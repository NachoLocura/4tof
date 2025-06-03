<?php
header('Content-Type: application/json');

// Permitir solicitudes de cualquier origen. En producción, especifica tus dominios.
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Methods: POST, GET, OPTIONS");
header("Access-Control-Allow-Headers: Content-Type");

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    // Es una pre-solicitud CORS
    exit(0);
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $events = json_decode($input, true);

    if (json_last_error() !== JSON_ERROR_NONE) {
        echo json_encode(['success' => false, 'message' => 'JSON inválido']);
        exit;
    }

    // Ruta al archivo events.json (asumiendo que está en el mismo directorio)
    $eventsFile = 'events.json';

    if (file_put_contents($eventsFile, json_encode($events, JSON_PRETTY_PRINT)) !== false) {
        echo json_encode(['success' => true, 'message' => 'Eventos guardados.']);
    } else {
        echo json_encode(['success' => false, 'message' => 'Error al escribir en el archivo. Verifica permisos.']);
    }
} else {
    echo json_encode(['success' => false, 'message' => 'Método no permitido.']);
}
?>