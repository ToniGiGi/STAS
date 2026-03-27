let radarChartInstance = null;
let datosGlobalesCandidatos = {}; // Guardaremos los datos que lleguen de la BD aquí

document.addEventListener('DOMContentLoaded', () => {

    const selectorVacante = document.getElementById('selector-vacante');

    // 1. CARGAR VACANTES AL INICIO
    fetch('http://127.0.0.1:8000/api/vacantes/activas')
        .then(respuesta => respuesta.json())
        .then(dataAPI => {
            if(dataAPI.exito && dataAPI.datos.length > 0) {
                selectorVacante.innerHTML = ''; 
                dataAPI.datos.forEach(vacante => {
                    const opcion = document.createElement('option');
                    opcion.value = vacante.id;
                    opcion.textContent = vacante.titulo;
                    selectorVacante.appendChild(opcion);
                });
                
                // Disparamos la carga de candidatos para la primera vacante de la lista
                cargarCandidatos(selectorVacante.value);
            }
        })
        .catch(error => console.error("Error al traer vacantes:", error));

    // 2. EVENTO AL CAMBIAR DE VACANTE
    selectorVacante.addEventListener('change', function() {
        const idVacanteSeleccionada = this.value;
        const nombreVacante = this.options[this.selectedIndex].text;
        
        Swal.fire({
            title: 'Analizando perfiles...',
            html: `Corriendo algoritmo STAS para <b>${nombreVacante}</b>`,
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        cargarCandidatos(idVacanteSeleccionada);
    });

    // 3. FUNCIONES DE LOS BOTONES DEL MODAL (Se mantienen igual)
    const modalVacante = document.getElementById('modal-vacante');
    document.getElementById('btn-nueva-vacante').addEventListener('click', () => modalVacante.classList.add('active'));
    const cerrarModal = () => modalVacante.classList.remove('active');
    document.getElementById('btn-cerrar-modal').addEventListener('click', cerrarModal);
    document.getElementById('btn-cancelar-modal').addEventListener('click', cerrarModal);
    document.getElementById('btn-guardar-vacante').addEventListener('click', () => {
        const form = document.getElementById('form-nueva-vacante');
        if(!form.checkValidity()) { form.reportValidity(); return; }
        cerrarModal();
        Swal.fire({ title: '¡Vacante Publicada!', text: 'El algoritmo STAS comenzará a buscar candidatos.', icon: 'success', confirmButtonColor: '#34744C' });
    });

    // 4. EVENTOS DE BOTONES INSPECCIÓN
    document.getElementById('btn-entrevista').addEventListener('click', () => {
        const nombre = document.getElementById('inspect-name').textContent;
        if(nombre === 'Selecciona un candidato') return;
        Swal.fire({ title: '¿Programar Entrevista?', text: `Avanzarás a ${nombre} a la siguiente fase.`, icon: 'question', showCancelButton: true, confirmButtonColor: '#34744C', cancelButtonColor: '#7F8C8D', confirmButtonText: 'Sí, agendar', cancelButtonText: 'Cancelar' })
        .then((result) => { if (result.isConfirmed) Swal.fire('¡Programada!', `Se envió la invitación a ${nombre}.`, 'success'); });
    });

    document.getElementById('btn-descartar').addEventListener('click', () => {
        const nombre = document.getElementById('inspect-name').textContent;
        if(nombre === 'Selecciona un candidato') return;
        Swal.fire({ title: '¿Estás seguro?', text: `Descartarás a ${nombre}. Esta acción no se puede deshacer.`, icon: 'warning', showCancelButton: true, confirmButtonColor: '#d33', cancelButtonColor: '#7F8C8D', confirmButtonText: 'Sí, descartar', cancelButtonText: 'Cancelar' })
        .then((result) => { if (result.isConfirmed) Swal.fire('Descartado', `El candidato ${nombre} ha sido retirado.`, 'error'); });
    });
});

// ============================================================
// FUNCIONES PRINCIPALES PARA LA BASE DE DATOS
// ============================================================

function cargarCandidatos(idVacante) {
    fetch(`http://127.0.0.1:8000/api/vacantes/${idVacante}/candidatos`)
        .then(respuesta => respuesta.json())
        .then(dataAPI => {
            Swal.close(); // Cerramos la alerta de carga

            const contenedor = document.getElementById('contenedor-candidatos');
            contenedor.innerHTML = ''; // Limpiamos la lista actual
            datosGlobalesCandidatos = {}; // Reiniciamos nuestro diccionario global

            if(dataAPI.exito && dataAPI.datos.length > 0) {
                
                dataAPI.datos.forEach((candidato, index) => {
                    const idCand = `cand-${candidato.id}`;
                    const nombreCompleto = `${candidato.nombre} ${candidato.ap}`;
                    const compatibilidad = parseFloat(candidato.compatibilidad).toFixed(2);
                    const puesto = candidato.puestoActual || 'Ingeniero';
                    
                    // Calculamos iniciales (como en el dashboard)
                    const iniciales = (candidato.nombre.charAt(0) + candidato.ap.charAt(0)).toUpperCase();

                    // Guardamos los datos para poder dibujarlos en el radar al dar clic
                    datosGlobalesCandidatos[idCand] = {
                        nombre: nombreCompleto,
                        estadisiticas: { 
                            exp: candidato.exp ? `${candidato.exp} años` : 'Sin dato', 
                            certs: candidato.certs || 'Ninguna', 
                            soft: `${candidato.score_blandas}%` 
                        },
                        labelsRadar: ['Técnica', 'Blandas', 'Exp', 'Certificados', 'Cultura', 'Liderazgo'],
                        valoresRadar: [candidato.score_tecnica, candidato.score_blandas, candidato.score_exp, candidato.score_certs, candidato.score_cultura, candidato.score_liderazgo]
                    };

                    // Creamos el HTML de la tarjeta
                    const claseActiva = (index === 0) ? 'active-card' : 'inactive-card';
                    const claseBtn = (index === 0) ? 'btn-outline' : 'btn-light';

                    const htmlTarjeta = `
                        <div class="candidato-card ${claseActiva}" id="${idCand}" style="cursor:pointer;">
                            <div class="activity-initials">${iniciales}</div>
                            <div class="candidato-info">
                                <h3>${index + 1}. ${nombreCompleto}</h3>
                                <p>${puesto}</p>
                            </div>
                            <div class="candidato-score">
                                <div class="score-percent green-text">${compatibilidad}%</div>
                                <div class="score-label">Compatibilidad</div>
                                <button class="${claseBtn} btn-detalles">Ver Detalles</button>
                            </div>
                        </div>
                    `;
                    contenedor.insertAdjacentHTML('beforeend', htmlTarjeta);
                });

                // Inyectar funcionalidad a las nuevas tarjetas que acabamos de crear
                asignarEventosTarjetas();
                
                // Pintar automáticamente el primer candidato en el radar
                const primerId = `cand-${dataAPI.datos[0].id}`;
                actualizarPanelYGrafica(primerId);

            } else {
                // Si la vacante no tiene candidatos postulados aún
                contenedor.innerHTML = '<p style="color:#7F8C8D; text-align:center; padding: 20px;">Aún no hay candidatos postulados para esta vacante.</p>';
                document.getElementById('inspect-name').textContent = 'N/A';
                if(radarChartInstance) radarChartInstance.destroy();
            }
        })
        .catch(error => {
            console.error("Error API Candidatos:", error);
            Swal.fire('Error', 'No se pudieron cargar los candidatos', 'error');
        });
}

function asignarEventosTarjetas() {
    const tarjetas = document.querySelectorAll('.candidato-card');
    tarjetas.forEach(tarjeta => {
        tarjeta.addEventListener('click', function() {
            tarjetas.forEach(t => {
                t.classList.remove('active-card'); t.classList.add('inactive-card');
                const btn = t.querySelector('.btn-detalles'); if(btn) btn.classList.replace('btn-outline', 'btn-light');
            });
            this.classList.remove('inactive-card'); this.classList.add('active-card');
            const btnClickeado = this.querySelector('.btn-detalles'); if(btnClickeado) btnClickeado.classList.replace('btn-light', 'btn-outline');
            
            actualizarPanelYGrafica(this.id);
        });
    });
}

function actualizarPanelYGrafica(idCandidato) {
    const datos = datosGlobalesCandidatos[idCandidato];
    if(!datos) return;
    document.getElementById('inspect-name').textContent = datos.nombre;
    document.getElementById('inspect-exp').textContent = datos.estadisiticas.exp;
    document.getElementById('inspect-certs').textContent = datos.estadisiticas.certs;
    document.getElementById('inspect-soft').textContent = datos.estadisiticas.soft;
    dibujarGraficaRadar(datos.labelsRadar, datos.valoresRadar);
}

function dibujarGraficaRadar(labels, valores) {
    const ctx = document.getElementById('radarChart').getContext('2d');
    if (radarChartInstance) radarChartInstance.destroy();
    radarChartInstance = new Chart(ctx, {
        type: 'radar',
        data: { labels: labels, datasets: [{ label: `Puntuación`, data: valores, backgroundColor: 'rgba(52, 116, 76, 0.2)', borderColor: '#34744C', pointBackgroundColor: '#34744C', borderWidth: 2 }] },
        options: { responsive: true, maintainAspectRatio: false, layout: { padding: 40 }, scales: { r: { min: 0, max: 100, ticks: { display: false, stepSize: 20 }, pointLabels: { display: true, font: { size: 12, weight: 'bold' }, color: '#333' }, grid: { color: 'rgba(0,0,0,0.05)' }, angleLines: { color: 'rgba(0,0,0,0.1)' } } }, plugins: { legend: { display: false } } }
    });
}