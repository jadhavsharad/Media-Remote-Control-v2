/* -------------------- MESSAGE TYPES -------------------- */
export const MESSAGE_TYPES = {
  // init / pairing
  HOST_REGISTER: "init.host_register", // CHECK
  HOST_REGISTERED: "init.host_registered", // CHECK
  PAIRING_KEY_REQUEST: "init.pairing_key_request", // CHECK
  PAIRING_KEY: "init.pairing_key",

  // session
  REMOTE_JOINED: "session.remote_joined",
  HOST_DISCONNECT: "session.host_disconnect", // CHECK
  HOST_RECONNECT: "session.host_reconnect", // CHECK
  KICK_REMOTE: "session.kick_remote",
  NEW_TAB: "session.new_tab",

  // connection
  WS_OPEN: "connection.ws_open", // CHECK
  WS_CLOSED: "connection.ws_closed", // CHECK
  WS_ERROR: "connection.ws_error", // CHECK

  // media
  MEDIA_LIST: "media.list", // CHECK
  SELECT_ACTIVE_TAB: "media.select_tab", // CHECK
  MEDIA_TAB_REMOVED: "media.tab_removed", // CHECK
  MEDIA_TAB_CREATED: "media.tab_created", // CHECK
  MEDIA_BOOKMARK: "media.bookmark",

  // controls
  STATE_UPDATE: "control.state_update", // CHECK
  INTENT: {
    SET: "control.set", // CHECK
    REPORT: "control.report" // CHECK
  },
};

/* -------------------- CHANNELS -------------------- */
export const CHANNELS = {
  TO_CONTENT_SCRIPT: "send.to.content_script", // CHECK
  TO_OFFSCREEN: "send.to.offscreen", // CHECK

  FROM_CONTENT_SCRIPT: "receive.from.content_script",
  FROM_POPUP: "receive.from.popup", // CHECK
  FROM_OFFSCREEN: "receive.from.offscreen", // CHECK
};

export const MEDIA_STATE = {
  PLAYBACK: "playback",       // values: "PLAYING", "PAUSED"
  MUTE: "muted",              // values: true, false
  TIME: "currentTime",        // values: number (seconds)
  DURATION: "duration",       // values: number (seconds)
  VOLUME: "volume",           // values: number (0-100)
  ENDED: "ended",             // values: true, false
};

export const supportedPlatforms = [
  "youtube.com",
  "netflix.com",
  "primevideo.com",
  "hotstar.com",
  "jiohotstar.com",
  "sonyliv.com",
  "amazon.com",
  "vimeo.com",
  "jiosaavn.com",
  "apple.com",
  "spotify.com",
]

export const platforms = supportedPlatforms.map(
  (domain) => `https://*.${domain}/*`
);

export const activeIcons = {
  "16": "/icon/16.png",
  "32": "/icon/32.png",
  "48": "/icon/48.png",
  "128": "/icon/128.png"
};

export const inactiveIcons = {
  "16": "/icon/16-inactive.png",
  "32": "/icon/32-inactive.png",
  "48": "/icon/48-inactive.png",
  "128": "/icon/128-inactive.png"
};
