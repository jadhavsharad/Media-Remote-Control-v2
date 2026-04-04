/* -------------------- MESSAGE TYPES -------------------- */
export const MESSAGE_TYPES = {
  // init / pairing
  HOST_REGISTER: "init.host_register", // CHECK
  HOST_REGISTERED: "init.host_registered", // CHECK
  PAIRING_KEY_REQUEST: "init.pairing_key_request", // CHECK
  PAIRING_KEY: "init.pairing_key",
  PAIRING_KEY_VALID: "init.pairing_key_valid",


  // session
  VALIDATE_SESSION: "session.validate",
  SESSION_VALID: "session.valid",
  SESSION_INVALID: "session.invalid",
  REMOTE_JOINED: "session.remote_joined",
  HOST_DISCONNECTED: "session.host_disconnected",
  HOST_DISCONNECT: "session.host_disconnect", // CHECK
  HOST_RECONNECTED: "session.host_reconnected",
  HOST_RECONNECT: "session.host_reconnect", // CHECK

  // connection
  WS_OPEN: "connection.ws_open", // CHECK
  WS_CLOSED: "connection.ws_closed", // CHECK
  CONNECT_WS: "connection.connect_ws",
  DISCONNECT_WS: "connection.disconnect_ws",
  WS_ERROR: "connection.ws_error", // CHECK

  // media
  MEDIA_LIST: "media.list", // CHECK
  SELECT_ACTIVE_TAB: "media.select_tab", // CHECK

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
  TO_POPUP: "send.to.popup", // CHECK
  TO_OFFSCREEN: "send.to.offscreen", // CHECK

  FROM_BACKGROUND: "receive.from.background", 
  FROM_CONTENT_SCRIPT: "receive.from.content_script",
  FROM_POPUP: "receive.from.popup", // CHECK
  FROM_OFFSCREEN: "receive.from.offscreen", // CHECK
};

export const MEDIA_STATE = {
  PLAYBACK: "playback",       // values: "PLAYING", "PAUSED"
  MUTE: "muted",              // values: true, false
  TIME: "currentTime",        // values: number (seconds)
  DURATION: "duration",       // values: number (seconds)
  TITLE: "title",             // values: string
  VOLUME: "volume",           // values: number (0-100)
  ENDED: "ended",             // values: true, false
} ;

export const supportedPlatforms = [
  "youtube",
  "netflix",
  "primevideo",
  "hotstar",
  "sonyliv",
  "amazon",
  "mxplayer",
  "vimeo",
  "jiosaavn",
  "apple",
  "spotify",
]

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

