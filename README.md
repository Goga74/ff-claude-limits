# 0Tokens for Firefox - Claude Usage Monitor

A Firefox extension that displays your Claude AI usage limits directly in the browser toolbar badge.

Ported from the [Chrome version](https://github.com/your-repo/claude-limits).

## Features

- **Badge Display** - Shows current usage percentage right on the extension icon
- **Color-Coded Status**:
  - 🟢 Green (0-50%) - Plenty of usage remaining
  - 🟠 Orange (51-80%) - Moderate usage
  - 🔴 Red (81-100%) - High usage, approaching limit
  - ⚪ Gray "?" - Not logged in or no data
- **Auto-Updates** - Fetches data every 5 minutes without interrupting your workflow
- **Notifications** - Alerts at 80%, 90%, and 95% usage
- **Persistent Storage** - Remembers last known usage between browser sessions

## Installation

### Temporary Installation (for development)

1. Download or clone this repository
2. Open Firefox and navigate to `about:debugging#/runtime/this-firefox`
3. Click **Load Temporary Add-on...**
4. Select the `manifest.json` file from the `ff-claude-limits` folder
5. The extension icon will appear in your toolbar

### Permanent Installation (signed add-on)

1. Package the extension as `.xpi` using `web-ext build`
2. Submit to [addons.mozilla.org](https://addons.mozilla.org) for signing
3. Install the signed `.xpi` file

## Usage

### View Current Usage

- Look at the badge on the extension icon - it shows your current usage percentage
- Click the extension icon to open the popup with more details

### First Time Setup

1. Make sure you're logged in to [claude.ai](https://claude.ai)
2. Wait for auto-update or visit [claude.ai/settings/usage](https://claude.ai/settings/usage) manually

## Technical Details

### Key Differences from Chrome Version

| Feature | Chrome | Firefox |
|---------|--------|---------|
| Manifest version | V3 | V2 |
| Background | Service Worker | Event Page |
| API namespace | `chrome.*` | `browser.*` (Promise-based) |
| Action API | `chrome.action` | `browser.browserAction` |
| Gecko ID | N/A | Required (`browser_specific_settings`) |

### Permissions

| Permission | Purpose |
|------------|---------|
| `storage` | Save usage data between sessions |
| `tabs` | Create/close background tabs for refresh |
| `alarms` | Schedule automatic updates |
| `notifications` | Alert at high usage levels |
| `https://claude.ai/*` | Access Claude's usage page |

### File Structure

```
ff-claude-limits/
├── manifest.json     # Extension configuration (Manifest V2)
├── background.js     # Event page for badge management
├── content.js        # Page parser with MutationObserver
├── popup.html        # Popup UI structure
├── popup.js          # Popup logic
├── styles.css        # Dark theme popup styles
├── icons/
│   ├── icon16.png    # Toolbar icon
│   ├── icon48.png    # Extensions page icon
│   └── icon128.png   # Add-ons manager icon
└── README.md         # This file
```

## Requirements

- **Browser**: Firefox 109+
- **Account**: Active Claude account at [claude.ai](https://claude.ai)
- **Access**: Must be logged in to Claude for the extension to work

## Development

### Using web-ext

```bash
# Install web-ext
npm install -g web-ext

# Run with auto-reload
web-ext run --source-dir=./ff-claude-limits

# Build .xpi
web-ext build --source-dir=./ff-claude-limits
```

## License

This project is licensed under the MIT License.

## Acknowledgments

- Original Chrome extension by [Igor Zamiatin](https://www.linkedin.com/in/izamiatin/)
- Built for monitoring [Claude](https://claude.ai) by Anthropic
