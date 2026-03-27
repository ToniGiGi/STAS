document.addEventListener('DOMContentLoaded', () => {

    // 1. LÓGICA DE PESTAÑAS (TABS)
    const menuItems = document.querySelectorAll('.settings-item');
    const panels = document.querySelectorAll('.settings-panel');

    menuItems.forEach(item => {
        item.addEventListener('click', () => {
            // Quitar activo a todos los menús y paneles
            menuItems.forEach(i => i.classList.remove('active'));
            panels.forEach(p => p.classList.remove('active'));

            // Activar el menú clickeado y su panel correspondiente
            item.classList.add('active');
            const targetId = item.getAttribute('data-tab');
            document.getElementById(targetId).classList.add('active');
        });
    });

    // 2. LÓGICA DE LOS SLIDERS DEL ALGORITMO STAS
    const sliders = document.querySelectorAll('.custom-slider');
    const displayTotal = document.getElementById('total-weight');
    
    function calcularTotal() {
        let total = 0;
        sliders.forEach(slider => {
            const valor = parseInt(slider.value);
            // Actualizar la etiqueta de texto al lado del slider
            document.getElementById(`val-${slider.id.split('-')[1]}`).textContent = `${valor}%`;
            total += valor;
        });

        // Actualizar la caja del Total
        displayTotal.textContent = `${total}%`;

        // Si no suma 100%, ponerlo en rojo para advertir al usuario
        if(total !== 100) {
            displayTotal.className = 'text-red';
        } else {
            displayTotal.className = 'text-green';
        }
    }

    // Escuchar cambios en todos los sliders en tiempo real
    sliders.forEach(slider => {
        slider.addEventListener('input', calcularTotal);
    });

    // 3. EVENTO DE GUARDAR CAMBIOS
    document.getElementById('btn-guardar-cambios').addEventListener('click', () => {
        const total = parseInt(displayTotal.textContent);

        if (total !== 100) {
            Swal.fire({
                title: 'Error de Calibración',
                text: 'Los pesos del algoritmo deben sumar exactamente 100%. Por favor, ajusta los selectores.',
                icon: 'error',
                confirmButtonColor: '#34744C'
            });
            return; // Detiene el guardado
        }

        // Simulación de carga y éxito
        Swal.fire({
            title: 'Guardando Configuración...',
            allowOutsideClick: false,
            didOpen: () => { Swal.showLoading(); }
        });

        setTimeout(() => {
            Swal.fire({
                title: '¡Cambios Guardados!',
                text: 'La configuración de STAS y los parámetros del algoritmo han sido actualizados.',
                icon: 'success',
                confirmButtonColor: '#34744C'
            });
        }, 1500); // Finge que tarda 1.5 segundos en llegar a la BD
    });

});

// Función auxiliar para el botón del "Ojo" en la API Key
function mostrarAPI() {
    const input = document.getElementById('api-key-input');
    if (input.type === "password") {
        input.type = "text";
    } else {
        input.type = "password";
    }
}