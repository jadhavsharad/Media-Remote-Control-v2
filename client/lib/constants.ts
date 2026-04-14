export const auth = Object.freeze({
    pairingKeyValid: "init.pairing_key_valid",
    exchangePairKey: "init.exchange_pair_key",
    pairSuccess: "init.pair_success",
    pairFailed: "init.pair_failed",
    hostOffline: "init.host_offline",
    validateSession: "session.validate",
    sessionValid: "session.valid",
    sessionInvalid: "session.invalid",
    remoteKicked: "session.remote_kicked",
})

export const media = Object.freeze({
    mediaList: "media.list",
    selectActiveTab: "media.select_tab",
    stateUpdate: "control.state_update",
    tabCreated: "media.tab_created",
    tabRemoved: "media.tab_removed",
    bookmark:"media.bookmark",
    intent: {
        set: "control.set",
        report: "control.report"
    },
    key:{
        playback: "playback",
        mute: "muted",
        volume: "volume",
        time: "currentTime",
        duration: "duration",
        title: "title",
        bookmark:"bookmark"
    },
    session:{
        launchApp:"session.new_tab"
    }
})