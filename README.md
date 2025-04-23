# 🧝 Links Highlighter — Chrome Extension

A Chrome extension that visually highlights links on any webpage, helping SEOs and developers quickly distinguish between **dofollow/nofollow** and **internal/external** links. Styled with animated glowing effects inspired by *The Legend of Zelda* 🗡️✨

## 🔮 Features

- ✅ Highlight links by:
  - **Link type**: All, Internal, External
  - **Follow type**: All, Dofollow, Nofollow
- 🎨 Zelda-style animated glow:
  - **Gold glow** for dofollow links
  - **Purple glow** for nofollow links
- 📷 Highlights images inside links (with border & glow)
- 🔄 One-click **reset styles**
- 🧠 **Remembers** selected filters and preferences
- ⚡ Optional: **Auto-highlight on page load** (with delay)

## 📦 How to Install

1. Clone or download this repo.
2. Go to `chrome://extensions/` in your browser.
3. Enable **Developer mode** (top right corner).
4. Click **Load unpacked** and select the extension folder.
5. Done! You should now see the extension in your toolbar.

## 🔧 How to Use

1. Click the extension icon.
2. Choose your filters:
   - **Link type**: All / External / Internal
   - **Follow type**: All / Dofollow / Nofollow
3. (Optional) Enable "Highlight on page load"
4. Click **Highlight** to apply styles to the current page.
5. Click **Reset** to remove all styles.

## 📊 Link Info Panel

Click "Full info" in the popup to see:

- Total links
- External dofollow/nofollow counts
- Internal dofollow/nofollow counts

(*Data updates each time the extension is opened.*)

## 🪄 Zelda-Style Animations

- Uses pure CSS `@keyframes` for glowing borders and shadows.
- Injected dynamically to ensure lightweight and performance-friendly integration.

---

### 🛠 Tech Stack

- JavaScript
- Chrome Extension APIs (`chrome.storage.sync`, `chrome.scripting`)
- HTML + CSS

---

### 💡 Future Ideas

- Export link data as CSV
- Custom highlight color setting

---

### 📜 License

MIT — Free to use and modify!
