const types = [
  { highlight: "internal-dofollow", key: "internalDofollowColor" },
  { highlight: "internal-nofollow", key: "internalNofollowColor" },
  { highlight: "external-dofollow", key: "externalDofollowColor" },
  { highlight: "external-nofollow", key: "externalNofollowColor" },
  { highlight: "subdomain-dofollow", key: "subdomainDofollowColor" },
  { highlight: "subdomain-nofollow", key: "subdomainNofollowColor" },
  { highlight: "suspicious-dofollow", key: "suspiciousDofollowColor" },
  { highlight: "suspicious-nofollow", key: "suspiciousNofollowColor" },
];

const colorsSettings = {
  internalDofollowColor: "#ffd700",
  internalNofollowColor: "#ffa500",

  externalDofollowColor: "#00bfff",
  externalNofollowColor: "#8a2be2",

  subdomainDofollowColor: "#32cd32",
  subdomainNofollowColor: "#228b22",

  suspiciousDofollowColor: "#ff4500",
  suspiciousNofollowColor: "#dc143c",
};

document.addEventListener("DOMContentLoaded", () => {
  const highlightBtn = document.getElementById("highlight-btn");
  const resetBtn = document.getElementById("reset-btn");
  const radios = document.querySelectorAll('input[type="radio"]');
  const highlightOnLoadCheckbox = document.getElementById("highlight-on-load");
  const highlightSuspiciousLinksCheckbox = document.getElementById(
    "highlight-suspicious-links"
  );

  chrome.storage.sync.get(
    [
      "highlightSuspiciousLinks",
      "highlightOnLoad",
      "linkType",
      "followType",
      "highlightedCount",
      "internalDofollowColor",
      "externalDofollowColor",
      "subdomainDofollowColor",
      "suspiciousDofollowColor",
      "internalNofollowColor",
      "externalNofollowColor",
      "subdomainNofollowColor",
      "suspiciousNofollowColor",
    ],
    (result) => {
      colorsSettings.internalDofollowColor =
        result.internalDofollowColor || "#ffd700";
      colorsSettings.internalNofollowColor =
        result.internalNofollowColor || "#ffa500";

      colorsSettings.externalDofollowColor =
        result.externalDofollowColor || "#00bfff";
      colorsSettings.externalNofollowColor =
        result.externalNofollowColor || "#8a2be2";

      colorsSettings.subdomainDofollowColor =
        result.subdomainDofollowColor || "#32cd32";
      colorsSettings.subdomainNofollowColor =
        result.subdomainNofollowColor || "#228b22";

      colorsSettings.suspiciousDofollowColor =
        result.suspiciousDofollowColor || "#ff4500";
      colorsSettings.suspiciousNofollowColor =
        result.suspiciousNofollowColor || "#dc143c";

      highlightOnLoadCheckbox.checked = result.highlightOnLoad || false;
      highlightSuspiciousLinksCheckbox.checked =
        result.highlightSuspiciousLinks || false;

      const linkType = result.linkType || "all";
      const followType = result.followType || "all";
      const highlightSuspiciousLinks = result.highlightSuspiciousLinks || false;

      document.querySelector(
        `input[name="link-type"][value="${linkType}"]`
      ).checked = true;
      document.querySelector(
        `input[name="follow-type"][value="${followType}"]`
      ).checked = true;

      types.forEach(({ highlight, key }) => {
        const input = document.getElementById(`${highlight}-color`);
        if (input) {
          input.value = colorsSettings[key];
        }
      });

      const countElement = document.getElementById("external-links-count");
      if (countElement && result.highlightedCount) {
        countElement.textContent = result.highlightedCount;
      }
      if (result.highlightOnLoad) {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          chrome.scripting.executeScript(
            {
              target: { tabId: tabs[0].id },
              function: highlightLinks,
              args: [{ linkType, followType, highlightSuspiciousLinks }],
            },
            (results) => {
              const countElement = document.getElementById(
                "external-links-count"
              );
              if (countElement && results?.[0]?.result) {
                countElement.textContent = results[0].result;
              }
            }
          );
        });
      }
    }
  );

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: collectLinkInfo,
      },
      (results) => {
        const info = results?.[0]?.result;
        rewriteLinkInfo(info);
      }
    );
  });

  const rewriteLinkInfo = (info) => {
    if (!info) return;

    const mappings = [
      { id: "info-total", key: "total" },
      { id: "info-total-dofollow", key: "dofollow" },
      { id: "info-total-nofollow", key: "nofollow" },

      { id: "info-total-int", key: "internal" },
      { id: "info-int-dofollow", key: "intDofollow" },
      { id: "info-int-nofollow", key: "intNofollow" },

      { id: "info-total-ext", key: "external" },
      { id: "info-ext-dofollow", key: "extDofollow" },
      { id: "info-ext-nofollow", key: "extNofollow" },

      { id: "info-total-sub", key: "subdomain" },
      { id: "info-sub-dofollow", key: "subDofollow" },
      { id: "info-sub-nofollow", key: "subNofollow" },

      { id: "info-total-sus", key: "suspicious" },
      { id: "info-sus-dofollow", key: "susDofollow" },
      { id: "info-sus-nofollow", key: "susNofollow" },
    ];

    mappings.forEach(({ id, key }) => {
      const element = document.getElementById(id);
      if (element) {
        element.textContent = info[key];
      }
    });
  };

  highlightOnLoadCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({
      highlightOnLoad: highlightOnLoadCheckbox.checked,
    });
    resetStyles();
  });

  highlightSuspiciousLinksCheckbox.addEventListener("change", () => {
    chrome.storage.sync.set({
      highlightSuspiciousLinks: highlightSuspiciousLinksCheckbox.checked,
    });
    resetStyles();
  });

  const getSelectedFilters = () => {
    const linkType =
      document.querySelector('input[name="link-type"]:checked')?.value || "all";
    const followType =
      document.querySelector('input[name="follow-type"]:checked')?.value ||
      "all";
    const highlightSuspiciousLinks = highlightSuspiciousLinksCheckbox.checked;
    return { linkType, followType, highlightSuspiciousLinks };
  };

  const saveFilters = () => {
    const filters = getSelectedFilters();
    chrome.storage.sync.set(filters);
  };

  const resetStyles = () => {
    const countElement = document.getElementById("external-links-count");
    if (countElement) {
      countElement.textContent = "Waiting...";
    }
    chrome.storage.sync.remove("highlightedCount");
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript({
        target: { tabId: tabs[0].id },
        function: resetLinkStyles,
      });
    });
  };

  radios.forEach((radio) => {
    radio.addEventListener("change", () => {
      saveFilters();
      resetStyles();
    });
  });

  highlightBtn.addEventListener("click", () => {
    const filters = getSelectedFilters();
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      chrome.scripting.executeScript(
        {
          target: { tabId: tabs[0].id },
          function: highlightLinks,
          args: [filters],
        },
        (results) => {
          const text = results?.[0]?.result;
          const countElement = document.getElementById("external-links-count");
          if (countElement && text) {
            countElement.textContent = text;
            chrome.storage.sync.set({ highlightedCount: text });
          }
        }
      );
    });
  });

  resetBtn.addEventListener("click", () => {
    resetStyles();
  });

  types.forEach(({ highlight, key }) => {
    const input = document.getElementById(`${highlight}-color`);
    if (!input) return;

    input.addEventListener("change", function () {
      const newColor = this.value;
      chrome.storage.sync.set({ [key]: newColor });
      colorsSettings[key] = newColor;
      executeInContent(injectZeldaStyles, colorsSettings);
    });
  });

  const title = document.querySelector(".extension-settings__title");
  const container = document.querySelector(".extension-settings__radios");
  if (title && container) {
    title.addEventListener("click", () => {
      container.classList.toggle("hidden");
      title.classList.toggle("open");
    });
  }

  const fullInfoTitle = document.querySelector(".full-info-toggle");
  const fullInfoContent = document.querySelector(".full-info-content");
  if (fullInfoTitle && fullInfoContent) {
    fullInfoTitle.addEventListener("click", () => {
      fullInfoContent.classList.toggle("hidden");
      fullInfoTitle.classList.toggle("open");
    });
  }
});

function highlightLinks(filters) {
  const links = document.querySelectorAll("a");
  const currentDomain = window.location.hostname;
  const currentBase = getBaseDomain(currentDomain);

  let total = 0,
    count = 0;

  links.forEach((link) => {
    const href = link.getAttribute("href");
    const rel = link.getAttribute("rel") || "";
    const isNofollow = rel.includes("nofollow");
    let isSuspicious = isWeirdLink(href);

    let linkType = "";

    if (!isSuspicious) {
      try {
        const url = new URL(link.href, window.location.href);
        const linkDomain = url.hostname;
        const linkBase = getBaseDomain(linkDomain);

        if (isSubdomainOf(linkDomain, currentDomain)) {
          linkType = "subdomain";
        } else if (linkDomain === currentDomain || linkBase === currentBase) {
          linkType = "internal";
        } else {
          linkType = "external";
        }
      } catch {
        isSuspicious = true;
      }
    }

    if (isSuspicious) {
      linkType = "external";
    }

    total++;

    const matchesLinkType =
      filters.linkType === "all" ||
      (filters.linkType === "internal" &&
        (linkType === "internal" || linkType === "subdomain")) ||
      (filters.linkType === "external" && linkType === "external");

    const matchesFollowType =
      filters.followType === "all" ||
      (filters.followType === "dofollow" && !isNofollow) ||
      (filters.followType === "nofollow" && isNofollow);

    const shouldHighlightSuspicious =
      filters.highlightSuspiciousLinks && isSuspicious;

    if (
      matchesLinkType &&
      matchesFollowType &&
      (shouldHighlightSuspicious || !isSuspicious)
    ) {
      count++;

      let dataHighlight = "";

      if (shouldHighlightSuspicious && isSuspicious) {
        dataHighlight = isNofollow
          ? "suspicious-nofollow"
          : "suspicious-dofollow";
      } else if (linkType === "internal") {
        dataHighlight = isNofollow ? "internal-nofollow" : "internal-dofollow";
      } else if (linkType === "subdomain") {
        dataHighlight = isNofollow
          ? "subdomain-nofollow"
          : "subdomain-dofollow";
      } else if (linkType === "external") {
        dataHighlight = isNofollow ? "external-nofollow" : "external-dofollow";
      }

      if (dataHighlight) {
        link.setAttribute("data-zelda-highlight", dataHighlight);
        link.setAttribute("title", dataHighlight.replace(/-/g, " "));
      }
    } else {
      link.removeAttribute("data-zelda-highlight");
      link.removeAttribute("title");
    }
  });

  return `Highlighted: ${count} of ${total} links`;
}

function resetLinkStyles() {
  const links = document.querySelectorAll("a");
  links.forEach((link) => {
    link.style.backgroundColor = "";
    link.style.color = "";
    link.style.fontWeight = "";
    link.style.borderRadius = "";
    link.style.transition = "";
    link.title = "";
    link.style.border = "";
    link.removeAttribute("data-zelda-highlight");
    const img = link.querySelector("img");
    if (img) {
      img.style.border = "";
      img.style.boxShadow = "";
    }
  });
  return "Styles reset.";
}

function collectLinkInfo() {
  const links = document.querySelectorAll("a");
  const currentDomain = window.location.hostname;
  const currentBase = getBaseDomain(currentDomain);

  let total = 0,
    dofollow = 0,
    nofollow = 0;
  let internal = 0,
    intDofollow = 0,
    intNofollow = 0;
  let subdomain = 0,
    subDofollow = 0,
    subNofollow = 0;
  let external = 0,
    extDofollow = 0,
    extNofollow = 0;
  let suspicious = 0,
    susDofollow = 0,
    susNofollow = 0;

  links.forEach((link) => {
    total++;
    const href = link.getAttribute("href");
    const isSuspicious = isWeirdLink(href);
    const isNofollow = (link.getAttribute("rel") || "").includes("nofollow");

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
    susNofollow,
  };
}

function injectZeldaStyles(colorsSettings) {
  let style = document.getElementById("zelda-styles");

  if (!style) {
    style = document.createElement("style");
    style.id = "zelda-styles";
    document.head.appendChild(style);
  }

  const styleBase = ` 
    a[data-zelda-highlight] {
        color: #fff !important;
        font-weight: bold !important;
        border-radius: 4px !important;
        transition: all 0.3s ease !important;
        text-shadow: 0px 0px 4px black !important;
        opacity: 1 !important;
        display: inline-block !important;
    }
    `;

  let styles = styleBase;

  types.forEach(({ highlight, key }) => {
    const animName = `zeldaGlow${key.replace("Color", "")}`;
    const color = colorsSettings[key];
    styles += `
            @keyframes ${animName} {
                0% { box-shadow: 0 0 5px ${color}, 0 0 10px ${color}; }
                50% { box-shadow: 0 0 15px ${color}, 0 0 30px ${color}; }
                100% { box-shadow: 0 0 5px ${color}, 0 0 10px ${color}; }
            }
            a[data-zelda-highlight="${highlight}"] {
                background-color: ${color};
                animation: ${animName} 2s infinite;
            }
        `;
  });

  style.textContent = styles;
  document.head.appendChild(style);
}

// input: function and parameters as Object
const executeInContent = (func, params) => {
  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    chrome.scripting.executeScript(
      {
        target: { tabId: tabs[0].id },
        function: func,
        args: [params],
      },
      (results) => {
        const info = results?.[0]?.result;
        return info;
      }
    );
  });
};

function isWeirdLink(href) {
  if (!href || typeof href !== "string") return true;

  const trimmedHref = href.trim().toLowerCase();

  const weirdSchemes = [
    "javascript:",
    "vbscript:",
    "data:",
    "blob:",
    "filesystem:",
    "about:",
    "view-source:",
    "chrome:",
    "edge:",
    "appname:",
    "intent:",
    "ftp:",
    "mailto:",
    "tel:",
    "sms:",
    "file:",
  ];

  if (
    trimmedHref === "" ||
    trimmedHref === "#" ||
    /^\/+$/.test(trimmedHref) ||  
    weirdSchemes.some((scheme) => trimmedHref.startsWith(scheme))
  ) {
    return true;
  }

  if (
    trimmedHref.startsWith("hxxp://") ||  
    trimmedHref.startsWith("htps://") ||  
    trimmedHref.startsWith("http:///") ||  
    trimmedHref.startsWith("://") 
  ) {
    return true;
  }

  try {
    const parsed = new URL(trimmedHref, window.location.href);  
    if (!["http:", "https:"].includes(parsed.protocol)) {
      return true;
    }
  } catch (e) {
    return true;  
  }

  return false;
}

function getBaseDomain(hostname) {
  const parts = hostname.split(".");
  return parts.length >= 2 ? parts.slice(-2).join(".") : hostname;
}

function isSubdomainOf(domain, base) {
  return domain !== base && domain.endsWith("." + base);
}
