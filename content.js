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
        /* Internal Links */
        @keyframes zeldaGlowInternalDofollow {
            0% { box-shadow: 0 0 5px #ffd700, 0 0 10px #ffd700; }  
            50% { box-shadow: 0 0 20px #ffec8b, 0 0 30px #ffd700; }
            100% { box-shadow: 0 0 5px #ffd700, 0 0 10px #ffd700; }
        }
        @keyframes zeldaGlowInternalNofollow {
            0% { box-shadow: 0 0 5px #ffa500, 0 0 10px #ffa500; }  
            50% { box-shadow: 0 0 20px #ffb347, 0 0 30px #ffa500; }
            100% { box-shadow: 0 0 5px #ffa500, 0 0 10px #ffa500; }
        }

        /* External Links */
        @keyframes zeldaGlowExternalDofollow {
            0% { box-shadow: 0 0 5px #00bfff, 0 0 10px #00bfff; } 
            50% { box-shadow: 0 0 20px #87cefa, 0 0 30px #00bfff; }
            100% { box-shadow: 0 0 5px #00bfff, 0 0 10px #00bfff; }
        }
        @keyframes zeldaGlowExternalNofollow {
            0% { box-shadow: 0 0 5px #8a2be2, 0 0 10px #8a2be2; }  
            50% { box-shadow: 0 0 20px #ba55d3, 0 0 30px #8a2be2; }
            100% { box-shadow: 0 0 5px #8a2be2, 0 0 10px #8a2be2; }
        }

        /* Subdomain Links */
        @keyframes zeldaGlowSubdomainDofollow {
            0% { box-shadow: 0 0 5px #32cd32, 0 0 10px #32cd32; }  
            50% { box-shadow: 0 0 20px #7cfc00, 0 0 30px #32cd32; }
            100% { box-shadow: 0 0 5px #32cd32, 0 0 10px #32cd32; }
        }
        @keyframes zeldaGlowSubdomainNofollow {
            0% { box-shadow: 0 0 5px #228b22, 0 0 10px #228b22; }  
            50% { box-shadow: 0 0 20px #6b8e23, 0 0 30px #228b22; }
            100% { box-shadow: 0 0 5px #228b22, 0 0 10px #228b22; }
        }

        /* Suspicious Links */
        @keyframes zeldaGlowSuspiciousDofollow {
            0% { box-shadow: 0 0 5px #ff4500, 0 0 10px #ff4500; }  
            50% { box-shadow: 0 0 20px #ff6347, 0 0 30px #ff4500; }
            100% { box-shadow: 0 0 5px #ff4500, 0 0 10px #ff4500; }
        }
        @keyframes zeldaGlowSuspiciousNofollow {
            0% { box-shadow: 0 0 5px #dc143c, 0 0 10px #dc143c; }  
            50% { box-shadow: 0 0 20px #ff1493, 0 0 30px #dc143c; }
            100% { box-shadow: 0 0 5px #dc143c, 0 0 10px #dc143c; }
        }

        /* Apply animations */
        a[data-zelda-highlight="internal-dofollow"] { animation: zeldaGlowInternalDofollow 2s infinite; }
        a[data-zelda-highlight="internal-nofollow"] { animation: zeldaGlowInternalNofollow 2s infinite; }
        a[data-zelda-highlight="external-dofollow"] { animation: zeldaGlowExternalDofollow 2s infinite; }
        a[data-zelda-highlight="external-nofollow"] { animation: zeldaGlowExternalNofollow 2s infinite; }
        a[data-zelda-highlight="subdomain-dofollow"] { animation: zeldaGlowSubdomainDofollow 2s infinite; }
        a[data-zelda-highlight="subdomain-nofollow"] { animation: zeldaGlowSubdomainNofollow 2s infinite; }
        a[data-zelda-highlight="suspicious-dofollow"] { animation: zeldaGlowSuspiciousDofollow 2s infinite; }
        a[data-zelda-highlight="suspicious-nofollow"] { animation: zeldaGlowSuspiciousNofollow 2s infinite; }
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

    function getBaseDomain(hostname) {
        const parts = hostname.split('.');
        return parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    }

    function isSubdomainOf(domain, base) {
        return domain !== base && domain.endsWith('.' + base);
    }

    injectZeldaStyles();

    const links = document.querySelectorAll('a');
    const currentDomain = window.location.hostname;
    const currentBase = getBaseDomain(currentDomain);

    links.forEach(link => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel') || '';
        let isSuspicious = isWeirdLink(href);
        const isNofollow = rel.includes('nofollow');

        let linkType = 'external';

        if (isSuspicious) {
            linkType = 'suspicious';
        } else {
            try {
                const url = new URL(link.href, window.location.href);
                const linkDomain = url.hostname;
                const linkBase = getBaseDomain(linkDomain);

                if (isSubdomainOf(linkDomain, currentDomain)) {
                    linkType = 'subdomain';
                } else if (linkDomain === currentDomain || linkBase === currentBase) {
                    linkType = 'internal';
                } else {
                    linkType = 'external';
                }
            } catch {
                linkType = 'suspicious';
                isSuspicious = true;
            }
        }

        // Reset styles
        link.removeAttribute('data-zelda-highlight');
        link.style.backgroundColor = '';
        link.style.color = '';
        link.style.fontWeight = '';
        link.style.opacity = 1;
        link.style.borderRadius = '';
        link.style.transition = '';
        link.title = '';
        const img = link.querySelector('img');
        if (img) {
            img.style.border = '';
            img.style.boxShadow = '';
        }

        const matchesLinkType =
            filters.linkType === 'all' ||
            (filters.linkType === 'internal' && (linkType === 'internal' || linkType === 'subdomain')) ||
            (filters.linkType === 'external' && linkType === 'external');

        const matchesFollowType =
            filters.followType === 'all' ||
            (filters.followType === 'dofollow' && !isNofollow) ||
            (filters.followType === 'nofollow' && isNofollow);

        if (matchesLinkType && matchesFollowType) {
            link.style.fontWeight = 'bold';
            link.style.borderRadius = '4px';
            link.style.transition = 'all 0.3s ease';

            let bgColor = '';
            let textColor = '#000';
            let dataHighlight = '';

            if (filters.highlightSuspiciousLinks && isSuspicious) {
                dataHighlight = isNofollow ? 'suspicious-nofollow' : 'suspicious-dofollow';
                bgColor = isNofollow ? '#dc143c' : '#ff4500';  
                textColor = '#fff';
            } else if (linkType === 'internal') {
                dataHighlight = isNofollow ? 'internal-nofollow' : 'internal-dofollow';
                bgColor = isNofollow ? '#ffa500' : '#ffd700';  
            } else if (linkType === 'subdomain') {
                dataHighlight = isNofollow ? 'subdomain-nofollow' : 'subdomain-dofollow';
                bgColor = isNofollow ? '#228b22' : '#32cd32'; 
            } else if (linkType === 'external') {
                dataHighlight = isNofollow ? 'external-nofollow' : 'external-dofollow';
                bgColor = isNofollow ? '#8a2be2' : '#00bfff';  
            }
            

            if (dataHighlight) {
                link.setAttribute('data-zelda-highlight', dataHighlight);
                link.style.backgroundColor = bgColor;
                link.style.color = textColor;
                link.title = dataHighlight.replace(/-/g, ' ');
            }

            if (img) {
                img.style.border = `3px solid ${bgColor}`;
                img.style.boxShadow = `0 0 10px ${bgColor}`;
            }
        }
    });
}