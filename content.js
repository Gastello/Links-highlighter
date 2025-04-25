chrome.storage.sync.get(['highlightSuspiciousLinks', 'highlightOnLoad', 'linkType', 'followType'], (result) => {
    if (result.highlightOnLoad) {
        const filters = {
            linkType: result.linkType || 'all',
            followType: result.followType || 'all',
            highlightSuspiciousLinks: result.highlightSuspiciousLinks || false,
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

        @keyframes zeldaGlowRed {
            0%   { box-shadow: 0 0 5px #8b0000, 0 0 10px #8b0000; }
            50%  { box-shadow: 0 0 20px #ff0000, 0 0 30px #b22222; }
            100% { box-shadow: 0 0 5px #8b0000, 0 0 10px #8b0000; }
        }

        @keyframes zeldaGlowOrange {
            0%   { box-shadow: 0 0 5px #ff8c00, 0 0 10px #ff8c00; }
            50%  { box-shadow: 0 0 20px #ffa500, 0 0 30px #ff4500; }
            100% { box-shadow: 0 0 5px #ff8c00, 0 0 10px #ff8c00; }
        }

        a[data-zelda-highlight="nofollow"] {
            animation: zeldaGlowPurple 2s infinite;
        }

        a[data-zelda-highlight="dofollow"] {
            animation: zeldaGlowGold 2s infinite;
        }

       a[data-zelda-highlight="susnofollow"] {
            animation: zeldaGlowRed 2s infinite;
        }

        a[data-zelda-highlight="susdofollow"] {
            animation: zeldaGlowOrange 2s infinite;
        }
    `;
    document.head.appendChild(style);
}

function highlightLinks(filters) {
    function isWeirdLink(href) {
        return !href ||
            href.trim() === '' ||
            href === '#' ||
            href.startsWith('javascript:') ||
            href.startsWith('tel:') ||
            href.startsWith('mailto:') ||
            href.startsWith('ftp:') ||
            href.startsWith('about:') ||
            href.startsWith('chrome:') ||
            href.startsWith('edge:') ||
            href.startsWith('appname:') ||
            href.startsWith('magnet:');
    }

    injectZeldaStyles();
    const links = document.querySelectorAll('a');
    const currentDomain = window.location.hostname;

    links.forEach(link => {
        const href = link.getAttribute('href');
        let isSuspicious = isWeirdLink(href);
        let linkDomain;
        try {
            const url = new URL(link.href, window.location.href);
            linkDomain = url.hostname;
        
            if (!linkDomain) {
                isSuspicious = true;
            }
        } catch {
            isSuspicious = true;
        }

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
        link.style.opacity = 1;
        const img = link.querySelector('img');
        if (img) img.style.border = '';

        if (matchesLinkType && matchesFollowType) {
            link.style.fontWeight = 'bold';
            link.style.borderRadius = '4px';
            link.style.transition = 'all 0.3s ease';
            if (isNofollow) {
                if (filters.highlightSuspiciousLinks && isSuspicious) {
                    link.setAttribute('data-zelda-highlight', 'susnofollow');
                    link.style.backgroundColor = '#8b0000';   
                    link.style.color = '#fff0f5';  
                    link.title = 'Suspicious Nofollow';
                    if (img) {
                        img.style.border = '3px solid #8b0000';
                        img.style.boxShadow = '0 0 10px #8b0000';   
                    }
                } else {
                    link.setAttribute('data-zelda-highlight', 'nofollow');
                    link.style.backgroundColor = '#6b2aa5';   
                    link.style.color = '#fff0f5';   
                    link.title = 'nofollow';
                    if (img) {
                        img.style.border = '3px solid #6b2aa5';
                        img.style.boxShadow = '0 0 10px #6b2aa5';   
                    }
                }
            } else {
                if (filters.highlightSuspiciousLinks && isSuspicious) {
                    link.setAttribute('data-zelda-highlight', 'susdofollow');
                    link.style.backgroundColor = '#ff8c00';   
                    link.style.color = '#000';   
                    link.title = 'Suspicious Dofollow';
                    if (img) {
                        img.style.border = '3px solid #ff8c00';
                        img.style.boxShadow = '0 0 10px #ff8c00';   
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
        }
    });
}
