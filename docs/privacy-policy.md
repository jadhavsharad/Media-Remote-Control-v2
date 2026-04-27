# Privacy Policy for Media Remote Control

**Last Updated:** April 27, 2026

This Privacy Policy describes how "Media Remote Control" (the "Extension") handles your information. By installing and using the Extension, you agree to the practices described in this policy.

Our core privacy principle is simple: **We do not collect, store, or sell your personal data.** The Extension is designed to facilitate local and peer-to-peer style communication between your browser and your paired remote control device.

## 1. Information We Access and How We Use It

To function correctly, the Extension requires access to certain information within your browser. **All of this information is processed locally on your device or transmitted securely to your paired remote control device.** 

We access:
- **Active Tab Information:** URLs, page titles, and media playing status. This is used exclusively to display the currently playing media on your remote control device and to route playback commands (like play, pause, or mute) to the correct tab.
- **Media Content Metadata:** Information about HTML5 media elements (audio/video) on the page to facilitate remote control.

**None of this browsing data is logged, tracked, or sent to any third-party analytics or advertising servers.**

## 2. Browser Permissions and Why We Need Them

The Extension requests the following permissions. Here is exactly why they are needed and how they affect your privacy:

- **`tabs`:** Used to discover open browser tabs and identify which ones are currently playing media.
- **`host permissions` (`<all_urls>`):** Because you can play media on any website, the extension requires broad access to inject a minimal script that listens for and executes playback commands. It does not read your emails, passwords, or any non-media related content on these pages.
- **`scripting`:** Used to execute the user-initiated commands (like play, pause, mute, seek) directly on the media elements within the active tab.
- **`storage`:** Used strictly to save pairing keys, session identifiers, and trusted device tokens locally on your machine. This prevents you from having to re-pair your remote device every time you restart your browser.
- **`offscreen`:** Allows the extension to maintain a background WebSocket connection to receive remote commands even when the extension popup is closed.
- **`bookmarks`:** Allows you to bookmark the currently active media tab remotely. A bookmark is only created when you explicitly trigger the action from your remote device.

## 3. Data Storage and Retention

- **Local Storage Only:** Any data retained by the Extension (such as pairing tokens and connection preferences) is stored locally on your device using the browser's local storage mechanism.
- **No Remote Databases:** We do not maintain user accounts or remote databases of our users.
- **Data Deletion:** You can delete all data stored by the Extension at any time by uninstalling the Extension or clearing your browser's extension data.

## 4. Third-Party Services

The Extension utilizes a WebSocket server strictly for the purpose of relaying real-time commands (like play/pause) between your browser and your remote control device. 
- This connection is authenticated using the pairing keys generated on your device.
- The relay server does not persistently store your media activity, browsing history, or personal identity. It acts merely as a temporary, real-time message broker.

## 5. Security

We take reasonable measures to protect the communication between your browser and your remote device. The WebSocket connections are secured (WSS), and device pairing requires a localized pairing key. However, please be aware that no method of transmission over the internet is 100% secure.

## 6. Changes to this Privacy Policy

We may update this Privacy Policy from time to time to reflect changes in our practices or for other operational, legal, or regulatory reasons. Any updates will be reflected in this document, and the "Last Updated" date will be revised accordingly.

## 7. Contact Us

If you have any questions, concerns, or requests regarding this Privacy Policy or the Extension's data practices, please contact the developer via the support link provided on the Chrome Web Store page.
