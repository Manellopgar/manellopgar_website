// js/loader.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-content');
    const DEFAULT_HASH = '0_start/0_home';

    // 🟢 FUNCIÓN CORREGIDA: Procesa etiquetas <include> parseando HTML correctamente
    async function processIncludes(htmlString) {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const includes = tempDiv.querySelectorAll('include');
        
        await Promise.all(Array.from(includes).map(async (inc) => {
            const src = inc.getAttribute('src');
            if (!src) return;
            try {
                const res = await fetch(src);
                if (!res.ok) throw new Error(`HTTP ${res.status}`);
                const content = await res.text();
                
                // ✅ CORRECCIÓN: Usar <template> para que el navegador parsee el HTML como nodos reales
                const template = document.createElement('template');
                template.innerHTML = content.trim();
                inc.replaceWith(template.content);
                
            } catch (err) {
                console.error(`❌ Error cargando include: ${src}`, err);
                inc.replaceWith(`<p class="alert warning">⚠️ No se pudo cargar: ${src}</p>`);
            }
        }));
        
        return tempDiv.innerHTML;
    }

    // Función para cargar la página
    function loadPage(hash) {
        // Construir ruta: hash "1_bcloners/1_grid-array" -> "pages/1_bcloners/1_grid-array.html"
        const filePath = `pages/${hash}.html`;
        
        fetch(filePath)
            .then(res => {
                if (!res.ok) throw new Error(`Error ${res.status}: No se encontró ${filePath}`);
                return res.text();
            })
            .then(async (html) => {
                // 1. Procesar los includes antes de mostrar nada
                const finalHtml = await processIncludes(html);
                
                // 2. Inyectar en el DOM
                mainContainer.innerHTML = finalHtml;
                
                // 3. Actualizar menú y URL
                updateActiveMenu(hash);
                window.location.hash = hash;
            })
            .catch(err => {
                console.error('❌ Error:', err);
                mainContainer.innerHTML = `
                    <div style="text-align:center; padding:40px; color:var(--color-text-secondary);">
                        <h2>⚠️ Error cargando contenido</h2>
                        <p>${err.message}</p>
                    </div>`;
            });
    }

    // Función para actualizar el menú activo
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
        if (link) {
            const href = link.getAttribute('href');
            if (href && href.startsWith('#')) {
                e.preventDefault();
                const hash = href.replace('#', '');
                loadPage(hash);
            }
        }
    });

    // Soporte botón atrás/adelante
    window.addEventListener('hashchange', () => {
        const hash = window.location.hash.replace('#', '') || DEFAULT_HASH;
        loadPage(hash);
    });

    // Carga inicial
    const initialHash = window.location.hash.replace('#', '') || DEFAULT_HASH;
    loadPage(initialHash);
});