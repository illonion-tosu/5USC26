import { updateChat } from "../_shared/core/chat.js"
import { getCookie, setLengthDisplay } from "../_shared/core/utils.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"

// Clear cookie
document.cookie = `currentPicker=; path=/`

// Team Inforamtion
const leftTeamFlagEl= document.getElementById("left-team-flag")
const rightTeamFlagEl = document.getElementById("right-team-flag")
const leftTeamNameEl= document.getElementById("left-team-name")
const rightTeamNameEl = document.getElementById("right-team-name")
let currentLeftTeamName, currentRightTeamName

// Beatmap information
const roundNameEl = document.getElementById("round-name")
let allBeatmaps
async function getBeatmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    allBeatmaps = response.data.beatmaps
    roundNameEl.textContent = response.data.roundName
}
getBeatmaps()
// Find Beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

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
let currentId, currentChecksum, mapFound = false, currentBeatmap

// Score Bar
const scoreBarLeftEl = document.getElementById("score-bar-left")
const scoreBarRightEl = document.getElementById("score-bar-right")
// Scores
const scoresContainerEl = document.getElementById("scores-container")
const scoreLeftEl = document.getElementById("score-left")
const scoreRightEl = document.getElementById("score-right")
const scoreDifferenceNumberEl = document.getElementById("score-difference-number")
const animation = {
    "scoreLeft": new CountUp(scoreLeftEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    "scoreRight": new CountUp(scoreRightEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
    "scoreDifferenceNumber": new CountUp(scoreDifferenceNumberEl, 0, 0, 0, 0.2, { useEasing: true, useGrouping: true, separator: ",", decimal: "." }),
}
let scoreVisible

// Score Dial
const scoreDialEl = document.getElementById("score-dial")

// Star containers
const leftTeamStarContainerEl = document.getElementById("left-team-star-container")
const rightTeamStarContainerEl = document.getElementById("right-team-star-container")

// Chat stuff
const chatDisplayEl = document.getElementById("chat-display")
const chatDisplayContainerEl = document.getElementById("chat-display-container")
let chatLen = 0

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)
    console.log(data)

    // Team information
    if (currentLeftTeamName !== data.tourney.team.left) {
        currentLeftTeamName = data.tourney.team.left
        setFlagAndTeamName(currentLeftTeamName, leftTeamNameEl, leftTeamFlagEl)
    }
    if (currentRightTeamName !== data.tourney.team.right) {
        currentRightTeamName = data.tourney.team.right
        setFlagAndTeamName(currentRightTeamName, rightTeamNameEl, rightTeamFlagEl)
    }

    // Now Playing Information
    if ((currentId !== data.beatmap.id || currentChecksum !== data.beatmap.checksum) && allBeatmaps) {
        currentId = data.beatmap.id
        currentChecksum = data.beatmap.checksum
        mapFound = false

        nowPlayingSectionDetailsEl.style.backgroundImage = `url("${location.origin}/Songs/${data.folders.beatmap}/${data.files.background}")`
        nowPlayingSongTitleEl.textContent = data.beatmap.title
        nowPlayingSongArtistEl.textContent = data.beatmap.artist
    
        currentBeatmap = findBeatmaps(currentId)
        if (currentBeatmap) {
            let sr = Math.round(Number(currentBeatmap.difficultyrating) * 100) / 100
            let len = Number(currentBeatmap.total_length)
            let ar = Math.round(Number(currentBeatmap.diff_approach) * 10) / 10
            let hp = Math.round(Number(currentBeatmap.diff_drain) * 10) / 10
            let bpm = Math.round(Number(currentBeatmap.bpm) * 10) / 10
            let cs = Math.round(Number(currentBeatmap.diff_size) * 10) / 10
            let od = Math.round(Number(currentBeatmap.diff_overall) * 10) / 10

            // Add mods
            if (currentBeatmap.mod.includes("HR")) {
                cs = Math.min(Math.round(cs * 1.3 * 10) / 10, 10)
                ar = Math.min(Math.round(ar * 1.4 * 10) / 10, 10)
                hp = Math.min(Math.round(hp * 1.4 * 10) / 10, 10)
                od = Math.min(Math.round(od * 1.4 * 10) / 10, 10)
            }
            if (currentBeatmap.mod.includes("DT")) {
                if (ar > 5) ar = Math.round((((1200 - (( 1200 - (ar - 5) * 150) * 2 / 3)) / 150) + 5) * 10) / 10
                else ar = Math.round((1800 - ((1800 - ar * 120) * 2 / 3)) / 120 * 10) / 10
                od = Math.round((79.5 - (( 79.5 - 6 * od) * 2 / 3)) / 6 * 10) / 10
                bpm = Math.round(bpm * 1.5)
                len = Math.round(len / 1.5)
            }

            setStats({
                sr: sr,
                len: len,
                ar: ar,
                hp: hp,
                bpm: bpm,
                cs: cs,
                od: od
            })
            mapFound = true
        }
    }

    if (!mapFound) {
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

    // Score visibility
    if (scoreVisible !== data.tourney.scoreVisible) {
        scoreVisible = data.tourney.scoreVisible

        if (scoreVisible) {
            scoresContainerEl.style.opacity = 1
            chatDisplayEl.style.opacity = 0
        } else {
            scoresContainerEl.style.opacity = 0
            chatDisplayEl.style.opacity = 1
        }
    }

    if (scoreVisible) {
        // Update scores
        let currentScoreLeft = 0, currentScoreRight = 0
        for (let i = 0; i < data.tourney.clients.length; i++) {
            let currentScore = data.tourney.clients[i].play.score
            if (currentBeatmap && currentBeatmap.EZMultiplier && data.tourney.clients[i].play.mods.name.includes("EZ")) currentScore *= currentBeatmap.EZMultiplier ?? 1.8
            if (data.tourney.clients[i].team === "left") currentScoreLeft += currentScore
            else currentScoreRight += currentScore
        }
        animation.scoreLeft.update(currentScoreLeft)
        animation.scoreRight.update(currentScoreRight)

        // Score difference
        const scoreDifference = Math.abs(currentScoreLeft - currentScoreRight)
        animation.scoreDifferenceNumber.update(scoreDifference)

        // Score bar width
        const multiplier = 1
        const scoreBarMaxWidth = 960
		const scoreBarMaxDifference = 800000 // originally was 450000
        let scoreBarDifferencePercent = Math.min(scoreDifference / (scoreBarMaxDifference * multiplier), 1)
        let scoreBarRectangleWidth = Math.min(Math.pow(scoreBarDifferencePercent, 1.4) * scoreBarMaxWidth, scoreBarMaxWidth)

        // Score bar
        if (currentScoreLeft > currentScoreRight) {
            scoreBarLeftEl.style.width = `${scoreBarRectangleWidth}px`
            scoreBarRightEl.style.width = "0px"
            scoreDialEl.style.transform = `translateX(-50%) rotate(${Math.round(90 - scoreBarDifferencePercent * 120)}deg)`
        } else if (currentScoreLeft === currentScoreRight) {
            scoreBarLeftEl.style.width = "0px"
            scoreBarRightEl.style.width = "0px"
            scoreDialEl.style.transform = `translateX(-50%) rotate(${Math.round(90)}deg)`
        } else if (currentScoreLeft < currentScoreRight) {
            scoreBarLeftEl.style.width = "0px"
            scoreBarRightEl.style.width = `${scoreBarRectangleWidth}px`
            scoreDialEl.style.transform = `translateX(-50%) rotate(${Math.round(90 + scoreBarDifferencePercent * 120)}deg)`
        }
    }

    // Chat Display
    if (!scoreVisible) {
        // Chat Display
        const chatData = data.tourney.chat
        if (chatLen !== chatData.length) {
            chatLen = updateChat(chatLen, chatData, chatDisplayContainerEl)
        }
    }
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

// Set flag and team name
function setFlagAndTeamName(teamName, teamNameElement, teamFlagElement) {
    teamNameElement.textContent = teamName.toUpperCase()

    // Set team flag
    teamFlagElement.setAttribute("src", `../flags/${teamName}.png`)
    teamFlagElement.onerror = () => {
        teamFlagElement.onerror = null
        teamFlagElement.src = "../flags/transparent.png"
    }
}

// Interval stuff reading cookies and setting information
const leagueNameEl = document.getElementById("league-name")
let currentPicker
let currentLeagueName, previousLeagueName
let currentFirstTo, previousFirstTo
let currentStarLeft, previousStarLeft
let currentStarRight, previousStarRight
let isStarToggled
setInterval(() => {
    // Set picker
    currentPicker = getCookie("currentPicker")
    if (currentPicker === "left") nowPlayingSongTitleEl.style.color = "var(--ban-container-colour-left)"
    else if (currentPicker === "right") nowPlayingSongTitleEl.style.color = "var(--ban-container-colour-right)"
    else nowPlayingSongTitleEl.style.color = "white"

    // Set league name
    currentLeagueName = getCookie("leagueName")
    if (currentLeagueName !== previousLeagueName) {
        previousLeagueName = currentLeagueName
        leagueNameEl.textContent = `${currentLeagueName.toUpperCase()} LEAGUE`
    }

    // Set stars
    currentFirstTo = Number(getCookie("currentFirstTo"))
    currentStarLeft = Number(getCookie("currentStarLeft"))
    currentStarRight = Number(getCookie("currentStarRight"))
    if (currentFirstTo !== previousFirstTo ||
        currentStarLeft !== previousStarLeft ||
        currentStarRight !== previousStarRight
    ) {
        previousFirstTo = currentFirstTo
        previousStarLeft = currentStarLeft
        previousStarRight = currentStarRight

        leftTeamStarContainerEl.innerHTML = ""
        rightTeamStarContainerEl.innerHTML = ""

        let i = 0
        for (i; i < currentFirstTo; i++) {
            leftTeamStarContainerEl.append(createStar(i, "left", `${i < currentStarLeft? "fill" : "empty"}`))
            rightTeamStarContainerEl.append(createStar(i, "right", `${i < currentStarRight? "fill" : "empty"}`))
        }

        // Create star
        function createStar(index, side, attr) {
            const teamStar = document.createElement("div")
            teamStar.classList.add("team-star")

            const image = document.createElement("img")
            image.setAttribute("src", `../_shared/assets/points/${index === currentFirstTo - 1 ? "big" : "small"}_star_${side}_${attr}.png`)

            teamStar.append(image)
            return teamStar
        }
    }

    // Star toggling
    isStarToggled = getCookie("isStarToggled")
    if (isStarToggled === "true") {
        leftTeamStarContainerEl.style.opacity = 1
        rightTeamStarContainerEl.style.opacity = 1
    } else {
        leftTeamStarContainerEl.style.opacity = 0
        rightTeamStarContainerEl.style.opacity = 0
    }
}, 200)