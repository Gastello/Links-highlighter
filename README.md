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

## 🕵️ Suspicious Link Detection

Some links may not behave like regular web links — they can be broken, malformed, or use non-standard protocols. The extension includes smart logic to detect such links and treat them as **suspicious**, helping you identify potential issues in your link structure.

### 🚩 A link is marked as suspicious if it:

- Uses uncommon or insecure protocols:
  - `javascript:`, `vbscript:`, `data:`, `blob:`, `filesystem:`, `mailto:`, `tel:`, `sms:`, `file:`, `ftp:`, etc.
- Is clearly malformed or fake:
  - Empty string (`""`), just a hash (`"#"`), slashes-only (`"/"`, `"//"`)
  - Broken patterns like `hxxp://`, `htps://`, `http:///`, or `://`

Suspicious links are automatically highlighted with a **customizable color and glowing animation**, just like other link types.

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
