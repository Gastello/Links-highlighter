chrome.storage.sync.get(['highlightOnLoad', 'linkType', 'followType'], (result) => {
    if (result.highlightOnLoad) {
        const filters = {
            linkType: result.linkType || 'all',
            followType: result.followType || 'all'
        };

        const run = () => setTimeout(() => highlightLinks(filters), 700);

        if (document.readyState === 'complete' || document.readyState === 'interactive') {
            run();
        } else {
            window.addEventListener('DOMContentLoaded', run);
        }
    }
});

// Спрощена логіка підсвічування (без підрахунку)
function highlightLinks(filters) {
    const links = document.querySelectorAll('a');
    const currentDomain = window.location.hostname;

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
    });
}
