chrome.storage.sync.get(['highlightSuspiciousLinks', 'highlightOnLoad', 'linkType', 'followType'], (result) => {
    injectZeldaStyles();

    if (result.highlightOnLoad) {
        const filters = {
            linkType: result.linkType || 'all',
            followType: result.followType || 'all',
            highlightSuspiciousLinks: result.highlightSuspiciousLinks,
        };

        const run = () => setTimeout(() => {
            highlightLinks(filters);
        }, 700);

        document.readyState === 'loading'
        ? window.addEventListener('DOMContentLoaded', run)
        : run();
    }
});

function injectZeldaStyles() {
    if (document.getElementById('zelda-styles')) return;
    const style = document.createElement('style');
    style.id = 'zelda-styles';
    style.textContent = `
        /* Animations */
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

        /* Styling by data-attribute */
        a[data-zelda-highlight="internal-dofollow"] {
            background-color: #ffd700;
            color: #000;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowInternalDofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="internal-nofollow"] {
            background-color: #ffa500;
            color: #000;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowInternalNofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="external-dofollow"] {
            background-color: #00bfff;
            color: #000;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowExternalDofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="external-nofollow"] {
            background-color: #8a2be2;
            color: #fff;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowExternalNofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="subdomain-dofollow"] {
            background-color: #32cd32;
            color: #000;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowSubdomainDofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="subdomain-nofollow"] {
            background-color: #228b22;
            color: #fff;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowSubdomainNofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="suspicious-dofollow"] {
            background-color: #ff4500;
            color: #fff;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowSuspiciousDofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="suspicious-nofollow"] {
            background-color: #dc143c;
            color: #fff;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowSuspiciousNofollow 2s infinite;
            transition: all 0.3s ease;
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

    function getBaseDomain(hostname) {
        const parts = hostname.split('.');
        return parts.length >= 2 ? parts.slice(-2).join('.') : hostname;
    }

    function isSubdomainOf(domain, base) {
        return domain !== base && domain.endsWith('.' + base);
    }

    const links = document.querySelectorAll('a');
    const currentDomain = window.location.hostname;
    const currentBase = getBaseDomain(currentDomain);

    links.forEach(link => {
        const href = link.getAttribute('href');
        const rel = link.getAttribute('rel') || '';
        const isNofollow = rel.includes('nofollow');
        let isSuspicious = isWeirdLink(href);

        let linkType = '';

        if (!isSuspicious) {
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
                isSuspicious = true;
            }
        }

        if (isSuspicious) {
            linkType = 'external';
        }

        const matchesLinkType =
            filters.linkType === 'all' ||
            (filters.linkType === 'internal' && (linkType === 'internal' || linkType === 'subdomain')) ||
            (filters.linkType === 'external' && linkType === 'external');

        const matchesFollowType =
            filters.followType === 'all' ||
            (filters.followType === 'dofollow' && !isNofollow) ||
            (filters.followType === 'nofollow' && isNofollow);

        const shouldHighlightSuspicious = filters.highlightSuspiciousLinks && isSuspicious;

        if (matchesLinkType && matchesFollowType && (shouldHighlightSuspicious || !isSuspicious)) {
            let dataHighlight = '';

            if (shouldHighlightSuspicious && isSuspicious) {
                dataHighlight = isNofollow ? 'suspicious-nofollow' : 'suspicious-dofollow';
            } else if (linkType === 'internal') {
                dataHighlight = isNofollow ? 'internal-nofollow' : 'internal-dofollow';
            } else if (linkType === 'subdomain') {
                dataHighlight = isNofollow ? 'subdomain-nofollow' : 'subdomain-dofollow';
            } else if (linkType === 'external') {
                dataHighlight = isNofollow ? 'external-nofollow' : 'external-dofollow';
            }

            if (dataHighlight) {
                link.setAttribute('data-zelda-highlight', dataHighlight);
                link.setAttribute('title', dataHighlight.replace(/-/g, ' '));
            }
        } else {
            link.removeAttribute('data-zelda-highlight');
        }
    });
}
