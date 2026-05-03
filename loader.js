// js/loader.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-content');
    const DEFAULT_HASH = '0_home';

    // Cargar contenido desde archivo .html usando hash
    function loadPage(hash) {
        const filePath = `pages/${hash}.html`;
        
        fetch(filePath)
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}: ${filePath}`);
                return res.text();
            })
            .then(html => {
                // 1. Inyectar contenido
                mainContainer.innerHTML = html;
                
                // 2. Actualizar menú activo
                updateActiveMenu(hash);
                
                // 3. Actualizar URL con hash (sin recargar)
                window.location.hash = hash;
            })
            .catch(err => {
                console.error('❌ Error cargando página:', err);
                mainContainer.innerHTML = `
                    <div style="text-align:center; padding:40px; color:var(--color-text-secondary);">
                        <h2>⚠️ Error cargando contenido</h2>
                        <p>${err.message}</p>
                        <a href="#${DEFAULT_HASH}" class="nav-link" style="display:inline-block; margin-top:15px; color:var(--color-primary);">Volver al inicio</a>
                    </div>`;
            });
    }

    // Actualizar clase 'active' en el menú y abrir submenús
    function updateActiveMenu(currentHash) {
        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });

        // Buscar enlace que coincida con el hash actual
        const activeLink = document.querySelector(`.nav-menu .nav-link[href="#${currentHash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
            
            // Abrir todos los <details> padres hasta el root
            let parent = activeLink.parentElement;
            while (parent && parent !== document.body) {
                if (parent.tagName === 'DETAILS') {
                    parent.setAttribute('open', '');
                }
                parent = parent.parentElement;
            }
        }
    }

    // Interceptamos clics en el menú para cargar contenido sin recargar
    document.querySelector('.nav-menu').addEventListener('click', (e) => {
        const link = e.target.closest('a.nav-link');
        if (link) {
            const href = link.getAttribute('href');
            // Solo interceptar enlaces con hash (#nombre)
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const hash = href.replace('#', '');
                loadPage(hash);
            }
        }
    });

    // Soporte para botones Atrás/Adelante del navegador
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || DEFAULT_HASH;
        loadPage(hash);
    });

    // Cargar página inicial al abrir la web
    const initialHash = window.location.hash.replace('#', '') || DEFAULT_HASH;
    loadPage(initialHash);
});