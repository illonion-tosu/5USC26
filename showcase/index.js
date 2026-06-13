import { createTosuWsSocket } from "../_shared/core/websocket.js"

// Beatmap information
const roundNameEl = document.getElementById("round-name")
let allBeatmaps
async function getBeatmaps() {
    const response = await axios.get("../_data/showcase-beatmaps.json")
    allBeatmaps = response.data.beatmaps
    roundNameEl.textContent = response.data.roundName
}
getBeatmaps()

// Now Playing Information
const nowPlayingSectionDetailsEl = document.getElementById("now-playing-section-details")
const nowPlayingSongTitleEl = document.getElementById("now-playing-song-title")
const nowPlayingSongArtistEl = document.getElementById("now-playing-song-artist")
// Stats
const statsSrEl = document.getElementById("stats-sr")
const statsLengthEl = document.getElementById("stats-length")
const statsArEl = document.getElementById("stats-ar")
const statsHpEl = document.getElementById("stats-hp")
const statsBpmEl = document.getElementById("stats-bpm")
const statsCsEl = document.getElementById("stats-cs")
const statsOdEl = document.getElementById("stats-od")
// Variables
let currentId, currentChecksum

const socket = createTosuWsSocket()
socket.onmessage = async event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Now Playing Information
    if (currentId !== data.beatmap.id || currentChecksum !== data.beatmap.checksum) {
        currentId = data.beatmap.id
        currentChecksum = data.beatmap.checksum

        nowPlayingSectionDetailsEl.style.backgroundImage = `url("${location.origin}/Songs/${data.folders.beatmap}/${data.files.background}")`
        nowPlayingSongTitleEl.textContent = data.beatmap.title
        nowPlayingSongArtistEl.textContent = data.beatmap.artist
    }

    setStats({
        sr: data.beatmap.stats.stars.total,
        len: Math.round((data.beatmap.time.lastObject - data.beatmap.time.firstObject) / 1000),
        ar: data.beatmap.stats.ar.converted,
        hp: data.beatmap.stats.hp.converted,
        bpm: data.beatmap.stats.bpm.common,
        cs: data.beatmap.stats.cs.converted,
        od: data.beatmap.stats.od.converted
    })
}

// Set number stats
function setStats({sr, len, ar, hp, bpm, cs, od}) {
    statsSrEl.textContent = `${sr.toFixed(2)}*`
    statsLengthEl.textContent = setLengthDisplay(len)
    statsArEl.textContent = ar.toFixed(1)
    statsHpEl.textContent = hp.toFixed(1)
    statsBpmEl.textContent = Math.round(bpm)
    statsCsEl.textContent = cs.toFixed(1)
    statsOdEl.textContent = od.toFixed(1)
}

// Set Length Display
function setLengthDisplay(seconds) {
    const minuteCount = Math.floor(seconds / 60)
    const secondCount = seconds % 60

    return `${minuteCount.toString().padStart(2, "0")}:${secondCount.toString().padStart(2, "0")}`
}

ComfyJS.Init( "5usc26", null, "5usc26" );

// Twitch Chat
const twitchChatContainer = document.getElementById("chat-display-container")
ComfyJS.onChat = ( user, message, flags, self, extra ) => {

    // Get rid of nightbot messages
    if (user === "Nightbot") return

    // Set up message container
    const twitchChatMessageContainer = document.createElement("div")
    twitchChatMessageContainer.classList.add("message-container")
    twitchChatMessageContainer.setAttribute("id", extra.id)
    twitchChatMessageContainer.setAttribute("data-twitch-id", extra.userId)

    // Message user
    const messageUser = document.createElement("span")
    messageUser.classList.add("message-name")
    messageUser.innerText = `${user}:`

    if (!chatColours[user]) generateChatColour(user)
    let chatColour = chatColours[user]
    messageUser.style.color = `rgb(${chatColour.r}, ${chatColour.g}, ${chatColour.b})`

    // Message
    const chatMessage = document.createElement("span")
    chatMessage.classList.add("message-content")
    chatMessage.innerText = message

    // Append everything together
    twitchChatMessageContainer.append(messageUser, chatMessage)
    twitchChatContainer.append(twitchChatMessageContainer)
    twitchChatContainer.scrollTop = twitchChatContainer.scrollHeight
}

// Delete message
ComfyJS.onMessageDeleted = (id) => document.getElementById(id).remove()

// Timeout
ComfyJS.onTimeout = ( timedOutUsername, durationInSeconds, extra ) => deleteAllMessagesFromUser(extra.timedOutUserId)

// Ban
ComfyJS.onBan = (bannedUsername, extra) => deleteAllMessagesFromUser(extra.bannedUserId)

// Delete all messages from user
function deleteAllMessagesFromUser(twitchId) {
    const allTwitchChatMessages = Array.from(document.getElementsByClassName("twitchChatMessage"))
    allTwitchChatMessages.forEach((message) => {
        if (message.dataset.twitchId === twitchId) {
            message.remove()
        }
    })
}

// Generate Colour
let chatColours = {}
function generateChatColour(username) {
    let r, g, b
    let validColour = false

    while (!validColour) {
        r = Math.floor(Math.random() * 256)
        g = Math.floor(Math.random() * 256)
        b = Math.floor(Math.random() * 256)

        // Guard clauses
        if (r === 256 || g === 256 || b === 256) continue
        if (r + g + b >= 500) validColour = true
    }

    chatColours[username] = {"r": r, "g": g, "b": b}
}