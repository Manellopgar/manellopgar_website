// js/loader.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-content');
    const DEFAULT_HASH = '0_home';

    function loadPage(hash) {
        // Construir ruta: hash "0_start/0_home" → "pages/0_start/0_home.html"
        const filePath = `pages/${hash}.html`;
        
        fetch(filePath)
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}: ${filePath}`);
                return res.text();
            })
            .then(html => {
                mainContainer.innerHTML = html;
                updateActiveMenu(hash);
                window.location.hash = hash; // Actualiza URL sin recargar
            })
            .catch(err => {
                console.error('❌ Error:', err);
                mainContainer.innerHTML = `
                    <div style="text-align:center;padding:40px;color:var(--color-text-secondary)">
                        <h2>⚠️ Error cargando contenido</h2>
                        <p>${err.message}</p>
                    </div>`;
            });
    }

    function updateActiveMenu(currentHash) {
        document.querySelectorAll('.nav-menu .nav-link').forEach(link => {
            link.classList.remove('active');
            link.removeAttribute('aria-current');
        });
        const activeLink = document.querySelector(`.nav-menu .nav-link[href="#${currentHash}"]`);
        if (activeLink) {
            activeLink.classList.add('active');
            activeLink.setAttribute('aria-current', 'page');
            // Abrir padres
            let parent = activeLink.parentElement;
            while (parent && parent !== document.body) {
                if (parent.tagName === 'DETAILS') parent.setAttribute('open', '');
                parent = parent.parentElement;
            }
        }
    }

    // Interceptador de clics
    document.querySelector('.nav-menu').addEventListener('click', (e) => {
        const link = e.target.closest('a.nav-link');
        if (link && link.getAttribute('href')?.startsWith('#')) {
            e.preventDefault();
            loadPage(link.getAttribute('href').replace('#', ''));
        }
    });

    // Soporte para botón atrás/adelante
    window.addEventListener('hashchange', () => {
        loadPage(window.location.hash.replace('#', '') || DEFAULT_HASH);
    });

    // Carga inicial
    loadPage(window.location.hash.replace('#', '') || DEFAULT_HASH);
});
