chrome.storage.sync.remove('highlightedCount');

chrome.storage.sync.get(['highlightSuspiciousLinks', 'highlightOnLoad', 'linkType', 'followType', 
    'internalDofollowColor', 'externalDofollowColor', 'subdomainDofollowColor', 'suspiciousDofollowColor',
    'internalNofollowColor', 'externalNofollowColor', 'subdomainNofollowColor', 'suspiciousNofollowColor'], (result) => {
    const colorsSettings = {
        internalDofollowColor: result.internalDofollowColor || '#ffd700',
        externalDofollowColor: result.externalDofollowColor || '#00bfff',
        subdomainDofollowColor: result.subdomainDofollowColor || '#32cd32',
        suspiciousDofollowColor: result.suspiciousDofollowColor|| '#ff4500',
        internalNofollowColor: result.internalNofollowColor || '#ffa500',
        externalNofollowColor: result.externalNofollowColor || '#8a2be2',
        subdomainNofollowColor: result.subdomainNofollowColor || '#228b22',
        suspiciousNofollowColor: result.suspiciousNofollowColor|| '#dc143c'
    }
    injectZeldaStyles(colorsSettings);
    
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

function injectZeldaStyles(colorsSettings) {
    let style = document.getElementById('zelda-styles');
    
    if (!style) {
        style = document.createElement('style');
        style.id = 'zelda-styles';
        document.head.appendChild(style);
    }

    style.textContent = `
        /* Animations */
        @keyframes zeldaGlowInternalDofollow {
            0% { box-shadow: 0 0 5px ${colorsSettings.internalDofollowColor}, 0 0 10px ${colorsSettings.internalDofollowColor}; }
            50% { box-shadow: 0 0 15px ${colorsSettings.internalDofollowColor}, 0 0 30px ${colorsSettings.internalDofollowColor}; }
            100% { box-shadow: 0 0 5px ${colorsSettings.internalDofollowColor}, 0 0 10px ${colorsSettings.internalDofollowColor}; }
        }
        @keyframes zeldaGlowInternalNofollow {
            0% { box-shadow: 0 0 5px ${colorsSettings.internalNofollowColor}, 0 0 10px ${colorsSettings.internalNofollowColor}; }
            50% { box-shadow: 0 0 15px ${colorsSettings.internalNofollowColor}, 0 0 30px ${colorsSettings.internalNofollowColor}; }
            100% { box-shadow: 0 0 5px ${colorsSettings.internalNofollowColor}, 0 0 10px ${colorsSettings.internalNofollowColor}; }
        }
        @keyframes zeldaGlowExternalDofollow {
            0% { box-shadow: 0 0 5px ${colorsSettings.externalDofollowColor}, 0 0 10px ${colorsSettings.externalDofollowColor}; }
            50% { box-shadow: 0 0 15px ${colorsSettings.externalDofollowColor}, 0 0 30px ${colorsSettings.externalDofollowColor}; }
            100% { box-shadow: 0 0 5px ${colorsSettings.externalDofollowColor}, 0 0 10px ${colorsSettings.externalDofollowColor}; }
        }
        @keyframes zeldaGlowExternalNofollow {
            0% { box-shadow: 0 0 5px ${colorsSettings.externalNofollowColor}, 0 0 10px ${colorsSettings.externalNofollowColor}; }
            50% { box-shadow: 0 0 15px ${colorsSettings.externalNofollowColor}, 0 0 30px ${colorsSettings.externalNofollowColor}; }
            100% { box-shadow: 0 0 5px ${colorsSettings.externalNofollowColor}, 0 0 10px ${colorsSettings.externalNofollowColor}; }
        }
        @keyframes zeldaGlowSubdomainDofollow {
            0% { box-shadow: 0 0 5px ${colorsSettings.subdomainDofollowColor}, 0 0 10px ${colorsSettings.subdomainDofollowColor}; }
            50% { box-shadow: 0 0 15px ${colorsSettings.subdomainDofollowColor}, 0 0 30px ${colorsSettings.subdomainDofollowColor}; }
            100% { box-shadow: 0 0 5px ${colorsSettings.subdomainDofollowColor}, 0 0 10px ${colorsSettings.subdomainDofollowColor}; }
        }
        @keyframes zeldaGlowSubdomainNofollow {
            0% { box-shadow: 0 0 5px ${colorsSettings.subdomainNofollowColor}, 0 0 10px ${colorsSettings.subdomainNofollowColor}; }
            50% { box-shadow: 0 0 15px ${colorsSettings.subdomainNofollowColor}, 0 0 30px ${colorsSettings.subdomainNofollowColor}; }
            100% { box-shadow: 0 0 5px ${colorsSettings.subdomainNofollowColor}, 0 0 10px ${colorsSettings.subdomainNofollowColor}; }
        }
        @keyframes zeldaGlowSuspiciousDofollow {
            0% { box-shadow: 0 0 5px ${colorsSettings.suspiciousDofollowColor}, 0 0 10px ${colorsSettings.suspiciousDofollowColor}; }
            50% { box-shadow: 0 0 15px ${colorsSettings.suspiciousDofollowColor}, 0 0 30px ${colorsSettings.suspiciousDofollowColor}; }
            100% { box-shadow: 0 0 5px ${colorsSettings.suspiciousDofollowColor}, 0 0 10px ${colorsSettings.suspiciousDofollowColor}; }
        }
        @keyframes zeldaGlowSuspiciousNofollow {
            0% { box-shadow: 0 0 5px ${colorsSettings.suspiciousNofollowColor}, 0 0 10px ${colorsSettings.suspiciousNofollowColor}; }
            50% { box-shadow: 0 0 15px ${colorsSettings.suspiciousNofollowColor}, 0 0 30px ${colorsSettings.suspiciousNofollowColor}; }
            100% { box-shadow: 0 0 5px ${colorsSettings.suspiciousNofollowColor}, 0 0 10px ${colorsSettings.suspiciousNofollowColor}; }
        }

        /* Styling by data-attribute */
        a[data-zelda-highlight="internal-dofollow"] {
            background-color: ${colorsSettings.internalDofollowColor};
            color: #000;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowInternalDofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="internal-nofollow"] {
            background-color: ${colorsSettings.internalNofollowColor};
            color: #000;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowInternalNofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="external-dofollow"] {
            background-color: ${colorsSettings.externalDofollowColor};
            color: #000;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowExternalDofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="external-nofollow"] {
            background-color: ${colorsSettings.externalNofollowColor};
            color: #fff;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowExternalNofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="subdomain-dofollow"] {
            background-color: ${colorsSettings.subdomainDofollowColor};
            color: #000;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowSubdomainDofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="subdomain-nofollow"] {
            background-color: ${colorsSettings.subdomainNofollowColor};
            color: #fff;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowSubdomainNofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="suspicious-dofollow"] {
            background-color: ${colorsSettings.suspiciousDofollowColor};
            color: #fff;
            font-weight: bold;
            border-radius: 4px;
            animation: zeldaGlowSuspiciousDofollow 2s infinite;
            transition: all 0.3s ease;
        }
        a[data-zelda-highlight="suspicious-nofollow"] {
            background-color: ${colorsSettings.suspiciousNofollowColor};
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

    let total = 0, count = 0;

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

        total++;

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
            count++;

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
            link.removeAttribute('title');
        }
    });

    return `Highlighted: ${count} of ${total} links`;
}