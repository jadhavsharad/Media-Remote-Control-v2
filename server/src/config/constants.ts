const auth = Object.freeze({
    hostRegister: "init.host_register",
    hostRegistered: "init.host_registered",
    pairingKeyRequest: "init.pairing_key_request",
    pairingKey: "init.pairing_key",
    pairingKeyValid: "init.pairing_key_valid",
    exchangePairKey: "init.exchange_pair_key",
    pairSuccess: "init.pair_success",
    pairFailed: "init.pair_failed",
    hostOffline: "init.host_offline",

    // session
    validateSession: "session.validate",
    sessionValid: "session.valid",
    sessionInvalid: "session.invalid",
    remoteJoined: "session.remote_joined",
    hostDisconnect: "session.host_disconnect",
    hostDisconnected: "session.host_disconnected",
    hostReconnect: "session.host_reconnect",
    hostReconnected: "session.host_reconnected",
    kickRemote: "session.kick_remote",
    remoteKicked: "session.remote_kicked",
    newTab: "session.new_tab",
});

const socket = Object.freeze({
    onOpen: "connection.ws_open",
    onClose: "connection.ws_closed",
    connectWs: "connection.connect_ws",
    disconnectWs: "connection.disconnect_ws",
    onError: "connection.ws_error",
});

const media = Object.freeze({
    list: "media.list",
    selectTab: "media.select_tab",
    tabCreated: "media.tab_created",
    tabRemoved: "media.tab_removed",
    bookmark:"media.bookmark"
});

const control = Object.freeze({
    stateUpdate: "control.state_update",
    set: "control.set",
    report: "control.report",
});

const role = Object.freeze({
    host: "HOST" as const,
    remote: "REMOTE" as const,
});

const extension = Object.freeze({
    configuration: "extension.updated"
})

export default { auth, socket, media, control, role, extension };