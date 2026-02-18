// Background script for automatic updates and notifications
// Firefox uses browser.* API (also supports chrome.* via polyfill)
const api = typeof browser !== 'undefined' ? browser : chrome;

const COLORS = {
  GREEN: '#4CAF50',
  ORANGE: '#FF9800',
  RED: '#F44336',
  GRAY: '#999999'
};

let lastNotificationLevel = 0;

// Update every 5 minutes
api.alarms.create('autoUpdate', { periodInMinutes: 5 });

// Update immediately on extension install/update
api.runtime.onInstalled.addListener(() => {
  initializeBadge();
  setTimeout(() => {
    updateUsageData();
  }, 3000);
});

// Handle startup
api.runtime.onStartup.addListener(() => {
  initializeBadge();
});

// Handle alarms
api.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'autoUpdate') {
    updateUsageData();
  }
});

async function updateUsageData() {
  try {
    // Check if there's already an open claude.ai/settings/usage tab
    const existingTabs = await api.tabs.query({
      url: 'https://claude.ai/settings/usage*'
    });

    if (existingTabs.length > 0) {
      await api.tabs.reload(existingTabs[0].id);
      return;
    }

    // Create a background tab (not a popup window — Firefox ignores minimized state)
    const tab = await api.tabs.create({
      url: 'https://claude.ai/settings/usage',
      active: false
    });

    // Safety timeout: close tab after 15 seconds even if no data received
    setTimeout(async () => {
      try {
        await api.tabs.remove(tab.id);
      } catch (e) {
        // Tab might already be closed
      }
    }, 15000);

  } catch (error) {
    console.error('Error updating usage:', error);
  }
}

// Listen for data from content script
api.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'USAGE_DATA') {
    const data = message.data;

    if (data.loggedIn) {
      updateBadge(data.percent);

      api.storage.local.set({
        usageData: {
          ...data,
          lastUpdated: Date.now()
        }
      });

      checkAndNotify(data.percent);

      // Close the background tab as soon as data is received
      if (sender.tab) {
        api.tabs.remove(sender.tab.id).catch(() => {});
      }
    } else {
      api.browserAction.setBadgeText({ text: '?' });
      api.browserAction.setBadgeBackgroundColor({ color: COLORS.GRAY });
    }

    sendResponse({ success: true });
  }
  return true;
});

function updateBadge(percent) {
  api.browserAction.setBadgeText({ text: `${percent}` });

  let color = COLORS.GREEN;
  if (percent > 50) color = COLORS.ORANGE;
  if (percent > 80) color = COLORS.RED;

  api.browserAction.setBadgeBackgroundColor({ color });
  api.browserAction.setBadgeTextColor({ color: '#FFFFFF' });
}

function checkAndNotify(percent) {
  const levels = [
    { threshold: 80, id: 'limit80', message: "You've used 80% of your Claude limit" },
    { threshold: 90, id: 'limit90', message: "You've used 90% of your Claude limit" },
    { threshold: 95, id: 'limit95', message: "You've used 95% of your Claude limit!" }
  ];

  for (const level of levels) {
    if (percent >= level.threshold && lastNotificationLevel < level.threshold) {
      api.notifications.create(level.id, {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'Claude Usage Alert',
        message: level.message
      });
      lastNotificationLevel = level.threshold;
      break;
    }
  }

  if (percent < 80) {
    lastNotificationLevel = 0;
  }
}

function initializeBadge() {
  api.storage.local.get('usageData').then((result) => {
    if (result.usageData && result.usageData.loggedIn) {
      updateBadge(result.usageData.percent);
    } else {
      api.browserAction.setBadgeText({ text: '?' });
      api.browserAction.setBadgeBackgroundColor({ color: COLORS.GRAY });
    }
  });
}
