// 1. Cargar la librería de Google Charts
google.charts.load('current', {'packages':['corechart', 'bar']});

// Este es el evento principal: espera a que cargue todo el HTML para ejecutar el código
document.addEventListener('DOMContentLoaded', () => {
    
    // Ejecutamos el calendario inmediatamente
    renderizarCalendario();

    // Llamamos a la API en Laravel
    fetch('http://127.0.0.1:8000/api/dashboard/kpis')
        .then(respuesta => respuesta.json())
        .then(datosAPI => {
            if(datosAPI.exito) {
                // Llenar los KPIs superiores
                document.getElementById('kpi-vacantes').textContent = datosAPI.datos.vacantes_activas;
                document.getElementById('kpi-candidatos').textContent = datosAPI.datos.candidatos_totales;
                document.getElementById('kpi-tiempo').textContent = datosAPI.datos.tiempo_cierre;

                // Ordenar a Google Charts que dibuje la gráfica
                google.charts.setOnLoadCallback(() => dibujarGrafica(datosAPI.datos.grafica_embudo));

                // Llenar la lista de Actividad Reciente
                const listaActividad = document.getElementById('lista-actividad');
                listaActividad.innerHTML = ''; 

                if (datosAPI.datos.actividad_reciente && datosAPI.datos.actividad_reciente.length > 0) {
                    datosAPI.datos.actividad_reciente.forEach((candidato, index) => {
                        const li = document.createElement('li');
                        
                        // Iniciales dinámicas
                        const inicialNombre = candidato.nombre ? candidato.nombre.charAt(0).toUpperCase() : '';
                        const inicialApellido = candidato.ap ? candidato.ap.charAt(0).toUpperCase() : '';
                        const inicialesFinales = inicialNombre + inicialApellido;

                        const puesto = candidato.puestoActual ? candidato.puestoActual : 'Candidato';

                        li.innerHTML = `
                            <div class="activity-initials">${inicialesFinales}</div>
                            <div class="activity-info">
                                <strong>${index + 1}. ${candidato.nombre} ${candidato.ap}</strong>
                                <span>${puesto}</span>
                            </div>
                            <span class="activity-tag">${candidato.test_nombre}</span>
                        `;
                        listaActividad.appendChild(li);
                    });
                } else {
                    listaActividad.innerHTML = '<li><span style="color:#7F8C8D;">No hay actividad reciente.</span></li>';
                }
            }
        })
        .catch(error => console.error("Error conectando con la BD:", error));
});

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================

// Función para pintar la gráfica de Google Charts
function dibujarGrafica(datosEmbudo) {
    var data = google.visualization.arrayToDataTable(datosEmbudo);

    var options = {
        chartArea: {width: '85%', height: '70%'},
        colors: ['#34744C'], 
        legend: { position: 'none' }, 
        vAxis: { minValue: 0, textStyle: { color: '#7F8C8D' } },
        hAxis: { textStyle: { fontWeight: 'bold', color: '#333' } },
        bar: { groupWidth: "45%" }, 
        animation: { startup: true, duration: 1000, easing: 'out' }
    };

    var chart = new google.visualization.ColumnChart(document.getElementById('grafica-estado-general'));
    chart.draw(data, options);
}

// Función para renderizar el Mini Calendario
function renderizarCalendario() {
    const contenedorFechas = document.getElementById('calendar-dates');
    const tituloMes = document.getElementById('month-year');
    
    // Validación por si no encuentra el HTML
    if(!contenedorFechas || !tituloMes) return; 

    const hoy = new Date();
    const mes = hoy.getMonth();
    const anio = hoy.getFullYear();
    
    const nombresMeses = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
    tituloMes.textContent = `${nombresMeses[mes]} ${anio}`;
    
    // Calcular el inicio del mes (Lunes como primer día)
    const primerDia = new Date(anio, mes, 1).getDay(); 
    let espaciosVacios = primerDia === 0 ? 6 : primerDia - 1; 
    
    const diasEnMes = new Date(anio, mes + 1, 0).getDate();
    
    let html = '';
    
    for (let i = 0; i < espaciosVacios; i++) {
        html += `<div class="empty"></div>`;
    }
    
    for (let i = 1; i <= diasEnMes; i++) {
        // Entrevistas simuladas los días 14, 25 y 28
        const tieneEntrevista = (i === 14 || i === 25 || i === 28) ? 'interview-day' : '';
        html += `<div class="${tieneEntrevista}">${i}</div>`;
    }
    
    contenedorFechas.innerHTML = html;
}