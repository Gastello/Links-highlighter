# 🧝 Links Highlighter — Chrome Extension

A Chrome extension that visually highlights links on any webpage, helping SEOs and developers quickly distinguish between **dofollow/nofollow**, **internal/external**, and even **subdomains or suspicious links**. Styled with animated glowing effects inspired by *The Legend of Zelda* 🗡️✨

## 🔮 Features

- ✅ Highlight links by:
  - **Link type**: Internal, External, Subdomain, Suspicious
  - **Follow type**: Dofollow, Nofollow
- 🎨 Custom Zelda-style glow for each link type:
  - **Color pickers** for fine-tuned styling
- 🧠 Remembers all settings using `chrome.storage.sync`
- ⚡ **Auto-highlight on page load** (toggleable)
- 🔁 One-click **reset styles**
- 📋 **Full Info Panel** with breakdown:
  - Total links
  - Type counts (internal/external/etc.)
  - Follow type counts (dofollow/nofollow)
  - Live preview of highlighted links
- 🎯 Dynamic updates:
  - UI reflects changes immediately without reload

## 📦 How to Install

1. Clone or download this repo.
2. Go to `chrome://extensions/` in your browser.
3. Enable **Developer mode** (top right corner).
4. Click **Load unpacked** and select the extension folder.
5. Done! You should now see the extension in your toolbar.

## 🔧 How to Use

1. Click the extension icon.
2. Customize filters:
   - ✅ Select link types: Internal / External / Subdomain / Suspicious
   - 🔗 Select follow types: Dofollow / Nofollow
3. 🎨 Customize highlight colors per type
4. (Optional) Enable **Auto-highlight on load**
5. Click **Highlight** to apply styles to the current page
6. Click **Reset** to remove all applied styles
7. 📋 Click **Full Info** to view the link summary panel

## 📊 Link Info Panel

The "Full Info" panel shows:

- Total number of links
- Number of each type (internal, external, subdomain, suspicious)
- Count of dofollow vs. nofollow
- Live list of detected links (scrollable & color-coded)

## 🪄 Zelda-Style Animations

- Pure CSS `@keyframes` glow animations
- Injected dynamically per link
- Applies glowing borders to both text and image links
- Performance-friendly: injected only when needed

---

### 🛠 Tech Stack

- JavaScript
- Chrome Extension APIs (`chrome.storage.sync`, `chrome.runtime`, `chrome.scripting`)
- HTML + CSS (Zelda-style theming)

---

### 💡 Future Ideas

- Export link data as CSV 
- Detect and categorize file links (e.g., PDF, DOCX, ZIP, MP4) to help identify downloadable resources and media assets.

---

### 📜 License

MIT — Free to use, improve, and customize.
