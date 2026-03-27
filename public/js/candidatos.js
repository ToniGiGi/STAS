let talentosSTAS = []; 

document.addEventListener('DOMContentLoaded', () => {
    const inputBuscador = document.getElementById('filtro-nombre');
    const selectArea = document.getElementById('filtro-area');
    const selectExp = document.getElementById('filtro-experiencia');
    const btnLimpiar = document.getElementById('btn-limpiar');

    // 1. OBTENER DATOS DE LA BASE DE DATOS
    function cargarCandidatosBD() {
        fetch('http://127.0.0.1:8000/api/candidatos')
            .then(respuesta => respuesta.json())
            .then(dataAPI => {
                if(dataAPI.exito) {
                    talentosSTAS = dataAPI.datos;
                    aplicarFiltros(); // Usa la función de filtro para dibujar
                }
            })
            .catch(error => {
                console.error("Error al traer candidatos:", error);
                document.getElementById('grid-candidatos').innerHTML = '<p style="color:red; text-align:center; grid-column: 1/-1;">Error de conexión con la base de datos.</p>';
            });
    }

    // Carga inicial
    cargarCandidatosBD();

    // 2. EVENTOS DE FILTRADO
    inputBuscador.addEventListener('keyup', aplicarFiltros);
    selectArea.addEventListener('change', aplicarFiltros);
    selectExp.addEventListener('change', aplicarFiltros);

    btnLimpiar.addEventListener('click', () => {
        inputBuscador.value = '';
        selectArea.value = 'Todos';
        selectExp.value = 'Todos';
        renderizarCandidatos(talentosSTAS);
    });

    // ==========================================
    // MODAL DE PERFIL (Ver Detalles)
    // ==========================================
    const modalPerfil = document.getElementById('modal-perfil');
    const cerrarModalPerfil = () => modalPerfil.classList.remove('active');
    
    document.getElementById('btn-cerrar-perfil').addEventListener('click', cerrarModalPerfil);
    document.getElementById('btn-cerrar-secundario').addEventListener('click', cerrarModalPerfil);
    
    modalPerfil.addEventListener('click', (e) => {
        if (e.target === modalPerfil) cerrarModalPerfil();
    });

    document.getElementById('btn-contactar').addEventListener('click', () => {
        const nombre = document.getElementById('modal-nombre').textContent;
        cerrarModalPerfil();
        Swal.fire({
            title: 'Mensaje Enviado',
            text: `Se ha notificado a ${nombre} a través del ecosistema STAS.`,
            icon: 'success',
            confirmButtonColor: '#34744C'
        });
    });

    // ==========================================
    // MODAL DE REGISTRO MÓVIL Y CONEXIÓN POST
    // ==========================================
    const modalRegistro = document.getElementById('modal-registro');
    const btnNuevoUsuario = document.getElementById('btn-nuevo-usuario');
    const cerrarModalRegistro = () => modalRegistro.classList.remove('active');

    btnNuevoUsuario.addEventListener('click', () => {
        modalRegistro.classList.add('active');
    });

    document.getElementById('btn-cerrar-registro').addEventListener('click', cerrarModalRegistro);
    document.getElementById('btn-cerrar-registro-x').addEventListener('click', cerrarModalRegistro);
    modalRegistro.addEventListener('click', (e) => {
        if (e.target === modalRegistro) cerrarModalRegistro();
    });

    document.getElementById('btn-generar-pass').addEventListener('click', () => {
        const randomPass = 'STAS-' + Math.random().toString(36).slice(-6).toUpperCase();
        document.getElementById('reg-pass').value = randomPass;
    });

    // Guardar Nuevo Usuario (Conexión Real a Laravel)
    document.getElementById('btn-guardar-registro').addEventListener('click', () => {
        const form = document.getElementById('form-nuevo-usuario');
        
        if(!form.checkValidity()) {
            form.reportValidity();
            return;
        }

        const datosNuevoUsuario = {
            nombre: document.getElementById('reg-nombre').value,
            ap: document.getElementById('reg-ap').value,
            am: document.getElementById('reg-am').value,
            telefono: document.getElementById('reg-tel').value,
            idRol: document.getElementById('reg-rol').value,
            idDepartamento: document.getElementById('reg-depto').value,
            email: document.getElementById('reg-email').value,
            contrasena: document.getElementById('reg-pass').value
        };

        Swal.fire({
            title: 'Creando cuenta...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        // Petición POST a Laravel
        fetch('http://127.0.0.1:8000/api/candidatos/registrar', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(datosNuevoUsuario)
        })
        .then(response => response.json())
        .then(data => {
            cerrarModalRegistro();
            if(data.exito) {
                Swal.fire({
                    title: '¡Cuenta Generada!',
                    html: `Se han registrado los datos y enviado las credenciales a:<br><b>${datosNuevoUsuario.email}</b>`,
                    icon: 'success',
                    confirmButtonColor: '#34744C'
                }).then(() => {
                    form.reset(); 
                    cargarCandidatosBD(); // Recargamos la BD para mostrar al nuevo usuario
                });
            } else {
                // Ahora JS leerá data.error o data.message si Laravel nos manda un error genérico
                Swal.fire('Error', 'Problema al guardar: ' + (data.error || data.message || 'Error en la base de datos'), 'error');
            }
        })
        .catch(error => {
            console.error('Error en POST:', error);
            Swal.fire('Error de Conexión', 'No se pudo conectar con el servidor STAS.', 'error');
        });
    });
});

// ==========================================
// FUNCIONES AUXILIARES
// ==========================================
function aplicarFiltros() {
    const textoBuscado = document.getElementById('filtro-nombre').value.toLowerCase();
    const areaSeleccionada = document.getElementById('filtro-area').value;
    const expSeleccionada = document.getElementById('filtro-experiencia').value;

    const filtrados = talentosSTAS.filter(candidato => {
        const coincideNombre = candidato.nombre.toLowerCase().includes(textoBuscado);
        const coincideArea = (areaSeleccionada === 'Todos') || (candidato.area === areaSeleccionada);
        
        let coincideExp = true;
        if (expSeleccionada === 'Junior') coincideExp = (candidato.exp <= 3);
        else if (expSeleccionada === 'Mid') coincideExp = (candidato.exp >= 4 && candidato.exp <= 7);
        else if (expSeleccionada === 'Senior') coincideExp = (candidato.exp >= 8);

        return coincideNombre && coincideArea && coincideExp;
    });

    renderizarCandidatos(filtrados);
}

function renderizarCandidatos(lista) {
    const contenedor = document.getElementById('grid-candidatos');
    contenedor.innerHTML = ''; 

    if(lista.length === 0) {
        contenedor.innerHTML = `<p style="color:#7F8C8D; grid-column: 1 / -1; text-align: center; padding: 40px; font-size:1.1rem;">No se encontraron candidatos con esos filtros.</p>`;
        return;
    }

    lista.forEach(candidato => {
        const partesNombre = candidato.nombre.split(' ');
        const letra1 = partesNombre[0] ? partesNombre[0][0] : '';
        const letra2 = partesNombre[1] ? partesNombre[1][0] : '';
        const iniciales = (letra1 + letra2).toUpperCase();
        
        const avatarHTML = `<div class="cand-initials">${iniciales}</div>`;

        const tarjetaHTML = `
            <div class="cand-card">
                <div class="cand-header">
                    ${avatarHTML}
                    <div class="cand-info">
                        <div class="cand-name">${candidato.nombre}</div>
                        <div class="cand-title">${candidato.puesto}</div>
                        <div class="cand-exp"><i class="fas fa-briefcase"></i> ${candidato.exp} años de exp.</div>
                    </div>
                </div>
                <div class="cand-tags">
                    <span class="tag-main">${candidato.tag1}</span>
                    <span class="tag-secondary">${candidato.tag2}</span>
                </div>
                <button class="cand-btn" onclick="abrirPerfil(${candidato.id})">Ver Perfil Completo</button>
            </div>
        `;
        
        contenedor.insertAdjacentHTML('beforeend', tarjetaHTML);
    });
}

window.abrirPerfil = function(idCandidato) {
    const candidato = talentosSTAS.find(c => c.id === idCandidato);
    if(!candidato) return;

    const partesNombre = candidato.nombre.split(' ');
    const iniciales = ((partesNombre[0] ? partesNombre[0][0] : '') + (partesNombre[1] ? partesNombre[1][0] : '')).toUpperCase();

    document.getElementById('modal-iniciales').textContent = iniciales;
    document.getElementById('modal-nombre').textContent = candidato.nombre;
    document.getElementById('modal-puesto').textContent = candidato.puesto;
    document.getElementById('modal-area').textContent = candidato.area;
    document.getElementById('modal-exp').textContent = `${candidato.exp} años`;
    document.getElementById('modal-certs').textContent = candidato.certs;

    const elEvaluaciones = document.getElementById('modal-evaluaciones');
    elEvaluaciones.textContent = candidato.estatus_evaluacion;
    
    if(candidato.estatus_evaluacion === 'Evaluaciones Completadas') {
        elEvaluaciones.style.color = '#34744C'; 
    } else {
        elEvaluaciones.style.color = '#e67e22'; 
    }

    document.getElementById('modal-perfil').classList.add('active');
};