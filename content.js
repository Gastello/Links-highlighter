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

chrome.storage.sync.remove("highlightedCount");

chrome.storage.sync.get(
  [
    "highlightSuspiciousLinks",
    "highlightOnLoad",
    "linkType",
    "followType",
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
    injectZeldaStyles(colorsSettings);

    if (result.highlightOnLoad) {
      const filters = {
        linkType: result.linkType || "all",
        followType: result.followType || "all",
        highlightSuspiciousLinks: result.highlightSuspiciousLinks,
      };

      const run = () =>
        setTimeout(() => {
          highlightLinks(filters);
        }, 700);

      document.readyState === "loading"
        ? window.addEventListener("DOMContentLoaded", run)
        : run();
    }
  }
);

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
