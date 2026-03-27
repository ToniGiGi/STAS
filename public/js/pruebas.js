// Base de datos simulada para los escenarios de la Demo
const escenariosDemo = {
    'LTA': {
        titulo: 'Liderazgo Transformacional (LTA)',
        texto: 'Durante un lanzamiento (SOP), la línea de ensamble se detiene porque Ingeniería no liberó a tiempo un plano actualizado. El Supervisor de Producción está alterado y exige arrancar con el plano anterior para no afectar sus KPIs. Como líder del equipo, ¿qué haces?',
        opciones: [
            'Autorizo usar el plano anterior temporalmente para evitar el paro de línea y reporto la desviación.',
            'Detengo la línea, reúno de emergencia a Ingeniería y Calidad en piso, y no arranco hasta firmar una desviación oficial validada.',
            'Dejo que el Supervisor de Producción tome la decisión bajo su responsabilidad y lo documento en un correo.'
        ]
    },
    'NCP': {
        titulo: 'Negociación y Conflicto (NCP)',
        texto: 'El departamento de Calidad ha segregado (puesto en cuarentena) 5,000 piezas por un defecto visual menor. Producción argumenta que el defecto es aceptable bajo el PPAP y que la segregación causará un retraso al cliente (OEM).',
        opciones: [
            'Escalo el problema inmediatamente al Gerente de Planta para que él decida.',
            'Busco el master sample (muestra límite) aprobado por el cliente y evalúo junto con Calidad y Producción basándonos en hechos y datos.',
            'Libero las piezas para evitar el paro de línea del cliente, asumiendo el riesgo del defecto visual.'
        ]
    },
    'APO': { titulo: 'Adaptabilidad bajo Presión (APO)', texto: 'Faltan 2 horas para el cierre de turno y un proveedor clave te avisa que su camión se averió. Te quedarás sin material en 45 minutos. ¿Cuál es tu primera acción?', opciones: ['Llamo al proveedor para exigir explicaciones y aplicar la penalización del contrato.', 'Aviso al cliente OEM que habrá un retraso en nuestra entrega.', 'Convoco a Logística para revisar inventarios de seguridad y evalúo rutas alternas o fletes expeditados (taxi aéreo/terrestre).'] },
    'CAM': { titulo: 'Comunicación Asertiva (CAM)', texto: 'Debes explicarle al Gerente de Finanzas (que no es ingeniero) por qué necesitas $50,000 USD de presupuesto no planeado para cambiar un troquel dañado.', opciones: ['Uso terminología técnica detallando el desgaste micrométrico del acero D2 del troquel.', 'Le explico que el troquel se rompió y sin dinero no podemos trabajar.', 'Traduzco el problema a impacto financiero: calculo el costo del paro de línea por hora vs la inversión del troquel, justificando el ROI.'] },
    'IEM': { titulo: 'Inteligencia Emocional (IEM)', texto: 'En una junta de resultados, el Gerente de Calidad te culpa directamente y en voz alta frente al Director por el incremento del scrap en la línea 4.', opciones: ['Me defiendo inmediatamente mostrando correos donde Calidad autorizó el proceso.', 'Mantengo la calma, acepto revisar los datos terminando la junta y propongo enfocarnos en la contención del problema.', 'Me quedo callado para no generar más conflicto frente al Director General.'] },
    'PET': { titulo: 'Pensamiento Estratégico (PET)', texto: 'Tienes presupuesto para automatizar una sola estación. La Estación A genera cuellos de botella diarios. La Estación B tiene un alto riesgo ergonómico y de seguridad para los operadores.', opciones: ['Automatizo la Estación A para aumentar la productividad y cumplir las cuotas.', 'Automatizo la Estación B porque la seguridad del personal es prioridad cero (Core Value).', 'Divido el presupuesto e intento hacer arreglos parciales en ambas estaciones.'] }
};

// Variables globales para la asignación
let listaCandidatos = [];
let listaVacantes = [];

document.addEventListener('DOMContentLoaded', () => {
    // Precargamos los datos desde tus APIs de Laravel para cuando el usuario presione "Asignar"
    fetch('http://127.0.0.1:8000/api/candidatos')
        .then(res => res.json())
        .then(data => { if(data.exito) listaCandidatos = data.datos; });

    fetch('http://127.0.0.1:8000/api/vacantes/activas')
        .then(res => res.json())
        .then(data => { if(data.exito) listaVacantes = data.datos; });

    // Escuchador de los Radio Buttons en el Modal de Asignación
    const radiosAsignacion = document.querySelectorAll('input[name="tipo_asignacion"]');
    radiosAsignacion.forEach(radio => {
        radio.addEventListener('change', actualizarSelectAsignacion);
    });

    // Acción del botón Final "Enviar Prueba"
    document.getElementById('btn-confirmar-asignacion').addEventListener('click', () => {
        const select = document.getElementById('select-destino');
        if(select.value === "") {
            Swal.fire('Error', 'Debes seleccionar un destino válido.', 'error');
            return;
        }
        
        cerrarModal('modal-asignar');
        Swal.fire({
            title: '¡Prueba Asignada!',
            text: `Se ha enviado la notificación de evaluación a través de STAS a: ${select.options[select.selectedIndex].text}`,
            icon: 'success',
            confirmButtonColor: '#34744C'
        });
    });
});

// ==========================================
// FUNCIONES DE LOS MODALES
// ==========================================

function abrirDemo(idPrueba) {
    const data = escenariosDemo[idPrueba];
    
    document.getElementById('demo-titulo').textContent = data.titulo;
    document.getElementById('demo-texto').textContent = data.texto;
    
    // Inyectar las opciones de respuesta múltiple
    const contenedorOpciones = document.getElementById('demo-opciones');
    contenedorOpciones.innerHTML = '';
    
    data.opciones.forEach((opcion, index) => {
        const label = document.createElement('label');
        label.className = 'demo-option';
        label.innerHTML = `<input type="radio" name="demo_radio"> ${opcion}`;
        contenedorOpciones.appendChild(label);
    });

    document.getElementById('modal-demo').classList.add('active');
}

function abrirAsignacion(idPrueba, nombrePrueba) {
    document.getElementById('asignar-nombre-prueba').textContent = nombrePrueba;
    
    // Forzamos a que el radio de "Candidato" esté seleccionado por defecto y llenamos la lista
    document.querySelector('input[value="candidato"]').checked = true;
    actualizarSelectAsignacion();

    document.getElementById('modal-asignar').classList.add('active');
}

function actualizarSelectAsignacion() {
    const tipo = document.querySelector('input[name="tipo_asignacion"]:checked').value;
    const select = document.getElementById('select-destino');
    select.innerHTML = '<option value="">Selecciona una opción...</option>';

    if (tipo === 'candidato') {
        listaCandidatos.forEach(cand => {
            const opt = document.createElement('option');
            opt.value = cand.id;
            opt.textContent = `${cand.nombre} - ${cand.puesto}`;
            select.appendChild(opt);
        });
    } else if (tipo === 'vacante') {
        listaVacantes.forEach(vac => {
            const opt = document.createElement('option');
            opt.value = vac.id;
            opt.textContent = `Todos los postulantes de: ${vac.titulo}`;
            select.appendChild(opt);
        });
    }
}

function cerrarModal(idModal) {
    document.getElementById(idModal).classList.remove('active');
}