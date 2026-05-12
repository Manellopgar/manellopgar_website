// js/loader.js
document.addEventListener('DOMContentLoaded', () => {
    const mainContainer = document.getElementById('main-content');
    const DEFAULT_HASH = '0_home';

    // 🟢 FUNCIÓN NUEVA: Busca etiquetas <include> y carga su contenido
    async function processIncludes(htmlString) {
        // Creamos un contenedor temporal para manipular el HTML sin mostrarlo aún
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        
        // Buscamos todas las etiquetas <include src="...">
        const includes = tempDiv.querySelectorAll('include');
        
        if (includes.length > 0) {
            // Procesamos todas las inclusiones en paralelo
            await Promise.all(Array.from(includes).map(async (inc) => {
                const src = inc.getAttribute('src');
                if (!src) return;
                
                try {
                    // Hacemos fetch del archivo indicado
                    // Nota: La ruta es relativa a index.html (la raíz)
                    const res = await fetch(src);
                    if (!res.ok) throw new Error(`HTTP ${res.status}`);
                    
                    // Reemplazamos la etiqueta <include> por el contenido real
                    const content = await res.text();
                    inc.replaceWith(content);
                } catch (err) {
                    console.error(`❌ Error cargando include: ${src}`, err);
                    inc.replaceWith(`<p style="color:red; padding:10px; background:#ffebeb;">⚠️ Error: No se pudo cargar el bloque (${src})</p>`);
                }
            }));
        }
        
        // Devolvemos el HTML ya procesado y completo
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

    // Función para actualizar el menú activo (igual que tenías)
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