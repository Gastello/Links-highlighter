document.addEventListener('DOMContentLoaded', () => {
    const highlightBtn = document.getElementById('highlight-btn');
    const resetBtn = document.getElementById('reset-btn');
    const radios = document.querySelectorAll('input[type="radio"]');
    const highlightOnLoadCheckbox = document.getElementById('highlight-on-load');
    const highlightSuspiciousLinksCheckbox  = document.getElementById('highlight-suspicious-links');

    chrome.storage.sync.get(['highlightSuspiciousLinks', 'highlightOnLoad', 'linkType', 'followType', 'highlightedCount'], (result) => {
        highlightOnLoadCheckbox.checked = result.highlightOnLoad || false;
        highlightSuspiciousLinksCheckbox.checked = result.highlightSuspiciousLinks || false;
        const linkType = result.linkType || 'all';
        const followType = result.followType || 'all';
        const highlightSuspiciousLinks = result.highlightSuspiciousLinks;
        document.querySelector(`input[name="link-type"][value="${linkType}"]`).checked = true;
        document.querySelector(`input[name="follow-type"][value="${followType}"]`).checked = true;
        const countElement = document.getElementById('external-links-count');
        
        if (result.highlightOnLoad) {
            if (countElement && result.highlightedCount) {
                countElement.textContent = result.highlightedCount;
            }
            chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    function: highlightLinks,
                    args: [{ linkType, followType, highlightSuspiciousLinks }]
                }, (results) => {
                    const countElement = document.getElementById('external-links-count');
                    if (countElement && results?.[0]?.result) {
                        countElement.textContent = results[0].result;
                    }
                });
            });
        }
    });

    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
        chrome.scripting.executeScript({
            target: { tabId: tabs[0].id },
            function: collectLinkInfo
        }, (results) => {
            const info = results?.[0]?.result;
            rewriteLinkInfo(info);
        });
    });

    const rewriteLinkInfo = (info) =>{
        if (info) {
            document.getElementById('info-total').textContent = info.total;
            document.getElementById('info-total-dofollow').textContent = info.dofollow;
            document.getElementById('info-total-nofollow').textContent = info.nofollow;
            
            document.getElementById('info-total-int').textContent = info.internal;
            document.getElementById('info-int-dofollow').textContent = info.intDofollow;
            document.getElementById('info-int-nofollow').textContent = info.intNofollow;
        
            document.getElementById('info-total-ext').textContent = info.external;
            document.getElementById('info-ext-dofollow').textContent = info.extDofollow;
            document.getElementById('info-ext-nofollow').textContent = info.extNofollow;
        
        
            document.getElementById('info-total-sub').textContent = info.subdomain;
            document.getElementById('info-sub-dofollow').textContent = info.subDofollow;
            document.getElementById('info-sub-nofollow').textContent = info.subNofollow;
        
            document.getElementById('info-total-sus').textContent = info.suspicious;
            document.getElementById('info-sus-dofollow').textContent = info.susDofollow;
            document.getElementById('info-sus-nofollow').textContent = info.susNofollow;    
        }

    }

    highlightOnLoadCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ highlightOnLoad: highlightOnLoadCheckbox.checked });
        resetStyles();
    });

    highlightSuspiciousLinksCheckbox.addEventListener('change', () => {
        chrome.storage.sync.set({ highlightSuspiciousLinks: highlightSuspiciousLinksCheckbox.checked });
        resetStyles();
    })

    const getSelectedFilters = () => {
        const linkType = document.querySelector('input[name="link-type"]:checked')?.value || 'all';
        const followType = document.querySelector('input[name="follow-type"]:checked')?.value || 'all';
        const highlightSuspiciousLinks = highlightSuspiciousLinksCheckbox.checked;
        return { linkType, followType, highlightSuspiciousLinks };
    };

    const saveFilters = () => {
        const filters = getSelectedFilters();
        chrome.storage.sync.set(filters);
    };

    const resetStyles = () => {
        const countElement = document.getElementById('external-links-count');
        if (countElement) {
            countElement.textContent = 'Waiting...';
        }
        chrome.storage.sync.remove('highlightedCount');
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
                const text = results?.[0]?.result;
                const countElement = document.getElementById('external-links-count');
                if (countElement && text) {
                    countElement.textContent = text;
                    chrome.storage.sync.set({ highlightedCount: text });
                }
            });
        });
    });

    resetBtn.addEventListener('click', () => {
        resetStyles();
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


function resetLinkStyles() {
    const links = document.querySelectorAll('a');
    links.forEach(link => {
        link.style.backgroundColor = '';
        link.style.color = '';
        link.style.fontWeight = '';
        link.style.borderRadius = '';
        link.style.transition = '';
        link.title = '';
        link.style.border = '';
        link.removeAttribute('data-zelda-highlight');
        const img = link.querySelector('img');
        if (img) {
            img.style.border = '';
            img.style.boxShadow = '';
        }
    });
    return 'Styles reset.';
}

function collectLinkInfo() {
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

    let total = 0, dofollow = 0, nofollow = 0;
    let internal = 0, intDofollow = 0, intNofollow = 0;
    let subdomain = 0, subDofollow = 0, subNofollow = 0;
    let external = 0, extDofollow = 0, extNofollow = 0;
    let suspicious = 0, susDofollow = 0, susNofollow = 0;

    links.forEach(link => {
        total++;
        const href = link.getAttribute('href');
        const isSuspicious = isWeirdLink(href);
        const isNofollow = (link.getAttribute('rel') || '').includes('nofollow');

        isNofollow ? nofollow++ : dofollow++;

        if (isSuspicious) {
            suspicious++;
            isNofollow ? susNofollow++ : susDofollow++;
            return;
        }

        try {
            const url = new URL(link.href, window.location.href);
            const linkDomain = url.hostname;
            const linkBase = getBaseDomain(linkDomain);

            if (isSubdomainOf(linkDomain, currentDomain)) {
                subdomain++;
                isNofollow ? subNofollow++ : subDofollow++;
            } else if (linkDomain === currentDomain) {
                internal++;
                isNofollow ? intNofollow++ : intDofollow++;
            } else if (linkBase === currentBase) {
                internal++;
                isNofollow ? intNofollow++ : intDofollow++;
            } else {
                external++;
                isNofollow ? extNofollow++ : extDofollow++;
            }            
        } catch {
            suspicious++;
            isNofollow ? susNofollow++ : susDofollow++;
        }
    });

    return {
        total,
        dofollow,
        nofollow,
        internal,
        intDofollow,
        intNofollow,
        subdomain,
        subDofollow,
        subNofollow,
        external,
        extDofollow,
        extNofollow,
        suspicious,
        susDofollow,
        susNofollow
    };
}


