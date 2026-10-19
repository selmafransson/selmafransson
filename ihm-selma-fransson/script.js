// Apply the theme in the head and listen for taps before the rest of the page finishes loading.
(function () {
    const storageKey = 'selma-theme';
    const root = document.documentElement;
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)');

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
        if (themeColor) themeColor.content = isDark ? '#111d2b' : '#f7fbff';
    }

    renderTheme(savedTheme() || (systemTheme.matches ? 'dark' : 'light'));

    document.addEventListener('click', function (event) {
        if (!event.target.closest || !event.target.closest('#themeToggle')) return;
        const nextTheme = root.dataset.theme === 'dark' ? 'light' : 'dark';
        renderTheme(nextTheme);
        try { localStorage.setItem(storageKey, nextTheme); } catch (error) { /* Storage may be unavailable. */ }
    });

    const onSystemChange = function (event) {
        if (!savedTheme()) renderTheme(event.matches ? 'dark' : 'light');
    };
    if (systemTheme.addEventListener) systemTheme.addEventListener('change', onSystemChange);
    else if (systemTheme.addListener) systemTheme.addListener(onSystemChange);

    window.addEventListener('storage', function (event) {
        if (event.key === storageKey) renderTheme(savedTheme() || (systemTheme.matches ? 'dark' : 'light'));
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

        const contactForm = document.getElementById('contactForm');
        const contactStatus = document.getElementById('contactStatus');
        if (contactForm && contactStatus) {
            contactForm.addEventListener('submit', async function (event) {
                event.preventDefault();
                const submitButton = contactForm.querySelector('button[type="submit"]');
                const formData = new FormData(contactForm);
                const fields = ['firstname', 'email', 'message'].map(function (name) {
                    return { objectTypeId: '0-1', name: name, value: String(formData.get(name) || '').trim() };
                });

                contactStatus.textContent = 'Skickar ditt meddelande…';
                contactStatus.removeAttribute('data-state');
                submitButton.disabled = true;

                try {
                    const response = await fetch('https://api.hsforms.com/submissions/v3/integration/submit/149565638/df5eea5e-67e5-4ec2-88ea-fdc095c9094c', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            fields: fields,
                            context: { pageUri: window.location.href, pageName: document.title }
                        })
                    });
                    if (!response.ok) throw new Error('HubSpot rejected the submission');
                    contactForm.reset();
                    contactStatus.textContent = 'Tack! Ditt meddelande har skickats.';
                    contactStatus.dataset.state = 'success';
                } catch (error) {
                    contactStatus.textContent = 'Det gick inte att skicka just nu. Prova igen eller använd mejlknappen till vänster.';
                    contactStatus.dataset.state = 'error';
                } finally {
                    submitButton.disabled = false;
                }
            });
        }

    }

    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', setupPage);
    else setupPage();
})();
