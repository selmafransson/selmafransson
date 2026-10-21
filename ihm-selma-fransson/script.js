// Återställ valt tema tidigt för att undvika att fel tema visas vid sidladdning.
(function () {
    const storageKey = 'selma-design-theme';
    const root = document.documentElement;

    function savedTheme() {
        try {
            const value = localStorage.getItem(storageKey);
            return value === 'dark' || value === 'light' ? value : null;
        } catch (error) { return null; }
    }

    function renderTheme(theme) {
        const isDark = theme === 'dark';
        root.dataset.theme = theme;
        const button = document.getElementById('themeToggle');
        if (button) {
            const label = isDark ? 'Växla till ljust läge' : 'Växla till mörkt läge';
            button.setAttribute('aria-label', label);
            button.setAttribute('title', label);
            button.setAttribute('aria-pressed', String(isDark));
        }
        const themeColor = document.querySelector('meta[name="theme-color"]');
        if (themeColor) themeColor.content = getComputedStyle(root).getPropertyValue('--paper').trim();
    }

    renderTheme(savedTheme() || 'light');

    document.addEventListener('click', function (event) {
        if (!event.target.closest || !event.target.closest('#themeToggle')) return;
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        renderTheme(nextTheme);
        try { localStorage.setItem(storageKey, nextTheme); } catch (error) { /* Temaväxling fungerar även när lagring inte är tillgänglig. */ }
    });

    window.addEventListener('storage', function (event) {
        if (event.key === storageKey) renderTheme(savedTheme() || 'light');
    });

    function setupPage() {
        const button = document.getElementById('themeToggle');
        if (button) renderTheme(root.dataset.theme);

        const header = document.querySelector('.site-header');
        if (header) {
            window.addEventListener('scroll', function () {
                header.classList.toggle('scrolled', window.scrollY > 40);
            }, { passive: true });
        }

        if ('IntersectionObserver' in window) {
            const navLinks = document.querySelectorAll('.nav-link');
            const observer = new IntersectionObserver(function (entries) {
                entries.forEach(function (entry) {
                    if (!entry.isIntersecting) return;
                    navLinks.forEach(function (link) {
                        link.classList.toggle('active', link.getAttribute('href') === '#' + entry.target.id);
                    });
                });
            }, { threshold: 0.25 });
            document.querySelectorAll('section[id]').forEach(function (section) { observer.observe(section); });
        }
    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupPage);
    else setupPage();
})();

// Befintlig Google Tag Manager-installation.
(function (window, document) {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({ 'gtm.start': Date.now(), event: 'gtm.js' });
    const tag = document.createElement('script');
    tag.async = true;
    tag.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-PZT4K5DB';
    document.head.appendChild(tag);
})(window, document);
