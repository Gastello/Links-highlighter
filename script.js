document.addEventListener('DOMContentLoaded', () => {
    const highlightBtn = document.getElementById('highlight-btn');
    const resetBtn = document.getElementById('reset-btn');
    const radios = document.querySelectorAll('input[type="radio"]');
    const highlightOnLoadCheckbox = document.getElementById('highlight-on-load');

    // Завантаження налаштувань
    chrome.storage.sync.get(['highlightOnLoad', 'linkType', 'followType'], (result) => {
        highlightOnLoadCheckbox.checked = result.highlightOnLoad || false;
        document.querySelector(`input[name="link-type"][value="${result.linkType || 'all'}"]`).checked = true;
        document.querySelector(`input[name="follow-type"][value="${result.followType || 'all'}"]`).checked = true;
    });

    // Показати інфо про всі посилання
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: collectLinkInfo
        }, (results) => {
            const info = results?.[0]?.result;
            if (info) {
                document.getElementById('info-total').textContent = info.total;
                document.getElementById('info-ext-dofollow').textContent = info.extDofollow;
                document.getElementById('info-ext-nofollow').textContent = info.extNofollow;
                document.getElementById('info-int-dofollow').textContent = info.intDofollow;
                document.getElementById('info-int-nofollow').textContent = info.intNofollow;
            }
        });
    });

    highlightOnLoadCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ highlightOnLoad: highlightOnLoadCheckbox.checked });
    });

    const getSelectedFilters = () => {
        const linkType = document.querySelector('input[name="link-type"]:checked')?.value || 'all';
        const followType = document.querySelector('input[name="follow-type"]:checked')?.value || 'all';
        return { linkType, followType };
    };

    const saveFilters = () => {
        const filters = getSelectedFilters();
        chrome.storage.sync.set(filters);
    };

    const resetStyles = () => {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: resetLinkStyles
            });
        });
    };

    radios.forEach(radio => {
        radio.addEventListener('change', () => {
            saveFilters();
            resetStyles();
        });
    });

    highlightBtn.addEventListener('click', () => {
        const filters = getSelectedFilters();

        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                function: highlightLinks,
                args: [filters]
            }, (results) => {
                const countElement = document.getElementById('external-links-count');
                if (countElement && results?.[0]?.result) {
                    countElement.textContent = results[0].result;
                }
            });
        });
    });

    resetBtn.addEventListener('click', () => {
        resetStyles();
        const countElement = document.getElementById('external-links-count');
        if (countElement) {
            countElement.textContent = 'Waiting...';
        }
    });

    const title = document.querySelector('.extension-settings__title');
    const container = document.querySelector('.extension-settings__radios');
    if (title && container) {
        title.addEventListener('click', () => {
            container.classList.toggle('hidden');
            title.classList.toggle('open');
        });
    }

    const fullInfoTitle = document.querySelector('.full-info-toggle');
    const fullInfoContent = document.querySelector('.full-info-content');
    if (fullInfoTitle && fullInfoContent) {
        fullInfoTitle.addEventListener('click', () => {
            fullInfoContent.classList.toggle('hidden');
            fullInfoTitle.classList.toggle('open');
        });
    }
});

// Підсвічування
function highlightLinks(filters) {
    const links = document.querySelectorAll('a');
    const currentDomain = window.location.hostname;
    let total = 0, count = 0;

    links.forEach(link => {
        let linkDomain;
        try {
            const url = new URL(link.href, window.location.href);
            if (url.href.startsWith('javascript:') || ['tel:', 'mailto:'].includes(url.protocol)) return;
            linkDomain = url.hostname;
        } catch { return; }

        const isExternal = linkDomain !== currentDomain;
        const isNofollow = link.rel.includes('nofollow');
        const isDofollow = !isNofollow;

        const matchesLinkType =
            filters.linkType === 'all' ||
            (filters.linkType === 'external' && isExternal) ||
            (filters.linkType === 'internal' && !isExternal);

        const matchesFollowType =
            filters.followType === 'all' ||
            (filters.followType === 'dofollow' && isDofollow) ||
            (filters.followType === 'nofollow' && isNofollow);

        link.style.backgroundColor = '';
        link.style.color = '';
        link.style.fontWeight = '';
        link.title = '';
        const img = link.querySelector('img');
        if (img) img.style.border = '';

        if (matchesLinkType && matchesFollowType) {
            count++;
            link.style.fontWeight = 'bold';

            if (isNofollow) {
                link.style.backgroundColor = 'blue';
                link.style.color = 'white';
                link.title = 'nofollow';
                if (img) img.style.border = '5px solid blue';
            } else {
                link.style.backgroundColor = 'aqua';
                link.title = 'dofollow';
                if (img) img.style.border = '5px solid aqua';
            }
        }

        total++;
    });

    return `Highlighted: ${count} of ${total} links`;
}

// Скидання стилів
function resetLinkStyles() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.style.backgroundColor = '';
        link.style.color = '';
        link.style.fontWeight = '';
        link.title = '';
        const img = link.querySelector('img');
        if (img) img.style.border = '';
    });
    return 'Styles reset.';
}

// Збір статистики
function collectLinkInfo() {
    const links = document.querySelectorAll('a');
    const currentDomain = window.location.hostname;
    let total = 0, extDofollow = 0, extNofollow = 0, intDofollow = 0, intNofollow = 0;

    links.forEach(link => {
        let linkDomain;
        try {
            const url = new URL(link.href, window.location.href);
            if (url.href.startsWith('javascript:') || ['tel:', 'mailto:'].includes(url.protocol)) return;
            linkDomain = url.hostname;
        } catch { return; }

        const isExternal = linkDomain !== currentDomain;
        const isNofollow = link.rel.includes('nofollow');

        if (isExternal && isNofollow) extNofollow++;
        if (isExternal && !isNofollow) extDofollow++;
        if (!isExternal && isNofollow) intNofollow++;
        if (!isExternal && !isNofollow) intDofollow++;

        total++;
    });

    return { total, extDofollow, extNofollow, intDofollow, intNofollow };
}
