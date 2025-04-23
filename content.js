chrome.storage.sync.get(['highlightOnLoad', 'linkType', 'followType'], (result) => {
    if (result.highlightOnLoad) {
        const filters = {
            linkType: result.linkType || 'all',
            followType: result.followType || 'all'
        };

        const run = () => setTimeout(() => {
            injectZeldaStyles();
            highlightLinks(filters);
        }, 700);

        document.readyState === 'loading'
        ? window.addEventListener('DOMContentLoaded', run)
        : run();
    }
});

function injectZeldaStyles() {
    const style = document.createElement('style');
    style.textContent = `
        @keyframes zeldaGlowGold {
            0% { box-shadow: 0 0 5px #ffd700, 0 0 10px #ffd700; }
            50% { box-shadow: 0 0 20px #ffef70, 0 0 30px #ffd700; }
            100% { box-shadow: 0 0 5px #ffd700, 0 0 10px #ffd700; }
        }

        @keyframes zeldaGlowPurple {
            0% { box-shadow: 0 0 5px #6b2aa5, 0 0 10px #6b2aa5; }
            50% { box-shadow: 0 0 20px #9f5ee0, 0 0 30px #6b2aa5; }
            100% { box-shadow: 0 0 5px #6b2aa5, 0 0 10px #6b2aa5; }
        }

        a[data-zelda-highlight="dofollow"] {
            animation: zeldaGlowGold 2s infinite;
        }

        a[data-zelda-highlight="nofollow"] {
            animation: zeldaGlowPurple 2s infinite;
        }
    `;
    document.head.appendChild(style);
}


function highlightLinks(filters) {
    const links = document.querySelectorAll('a');
    const currentDomain = window.location.hostname;

    links.forEach(link => {
        let linkDomain;
        try {
            const url = new URL(link.href, window.location.href);
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

        link.removeAttribute('data-zelda-highlight');
        link.style.backgroundColor = '';
        link.style.color = '';
        link.style.fontWeight = '';
        link.title = '';
        const img = link.querySelector('img');
        if (img) img.style.border = '';

        if (matchesLinkType && matchesFollowType) {
            link.style.fontWeight = 'bold';
            link.style.borderRadius = '4px';
            link.style.transition = 'all 0.3s ease';

            if (isNofollow) {
                link.setAttribute('data-zelda-highlight', 'nofollow');
                link.style.backgroundColor = '#6b2aa5';
                link.style.color = '#fff0f5';
                link.title = 'nofollow';
                if (img) {
                    img.style.border = '3px solid #6b2aa5';
                    img.style.boxShadow = '0 0 10px #6b2aa5';
                }
            } else {
                link.setAttribute('data-zelda-highlight', 'dofollow');
                link.style.backgroundColor = '#ffd700';
                link.style.color = '#000';
                link.title = 'dofollow';
                if (img) {
                    img.style.border = '3px solid #ffd700';
                    img.style.boxShadow = '0 0 10px #ffd700';
                }
            }
        }
    });
}
