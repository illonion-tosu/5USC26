import { updateChat } from "../_shared/core/chat.js"
import { delay, setLengthDisplay } from "../_shared/core/utils.js"
import { createTosuWsSocket } from "../_shared/core/websocket.js"

// Team star container
const ticketTeamStarContainerLeftEl = document.getElementById("ticket-team-star-container-left")
const ticketTeamStarContainerRightEl = document.getElementById("ticket-team-star-container-right")
const teamStarContainerLeft = document.getElementById("left-team-star-container")
const teamStarContainerRight = document.getElementById("right-team-star-container")

// Ban Containers
const teamBanContainerLeftEl = document.getElementById("team-bans-container-left")
const teamBanContainerRightEl = document.getElementById("team-bans-container-right")

// Beatmap information
const roundNameEl = document.getElementById("round-name")
const mappoolManagementMapsEl = document.getElementById("mappool-management-maps")
let allBeatmaps, roundName
let currentBestOf, currentFirstTo, currentStarLeft = 0, currentStarRight = 0, currentBanCount = 0
async function getBeatmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    // Set information
    allBeatmaps = response.data.beatmaps
    roundName = response.data.roundName

    // Set best of / first to information
    switch (roundName) {
        case "ROUND OF 32":
            currentBestOf = 9
            currentBanCount = 1
            break
        case "ROUND OF 16": case "QUARTERFINALS":
            currentBestOf = 11
            currentBanCount = 2
            break
        case "SEMIFINALS": case "FINALS":
            currentBestOf = 13
            currentBanCount = 2
            break
        case "GRAND FINALS":
            currentBestOf = 15
            currentBanCount = 3
    }
    currentFirstTo = Math.ceil(currentBestOf / 2)
    document.cookie = `currentFirstTo=${currentFirstTo}; path=/`
    document.cookie = `currentStarLeft=${currentStarLeft}; path=/`
    document.cookie = `currentStarRight=${currentStarRight}; path=/`

    // Append stars
    teamStarContainerLeft.append(createStars("left", currentStarLeft, true))
    teamStarContainerRight.append(createStars("right", currentStarRight, true))
    ticketTeamStarContainerLeftEl.append(createTicketStars("left", currentStarLeft))
    ticketTeamStarContainerRightEl.append(createTicketStars("left", currentStarRight))

    // Set round name
    roundNameEl.textContent = roundName

    // Append map buttons
    for (let i = 0; i < allBeatmaps.length - 1; i++) {
        const button = document.createElement("button")
        button.textContent = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
        button.addEventListener("mousedown", mapClickEvent)
        button.addEventListener("contextmenu", event => event.preventDefault())
        button.setAttribute("id", allBeatmaps[i].beatmap_id)
        button.dataset.id = allBeatmaps[i].beatmap_id
        mappoolManagementMapsEl.append(button)
    }

    // Set beatmap id
    mappoolTileTiebreakerEl.dataset.id = allBeatmaps[allBeatmaps.length - 1].beatmap_id
    mappoolTileTiebreakerEl.setAttribute("id", allBeatmaps[allBeatmaps.length - 1].beatmap_id)

    // Create Map Tiles
    for (let i = 0; i < currentFirstTo - 1; i++) {
        mappoolContainerLeftEl.append(createMappoolContainerTile("red"))
        mappoolContainerRightEl.append(createMappoolContainerTile("blue"))
    }

    // Edit Map Tile Width
    let width = (1195 - (30 * (currentFirstTo - 1))) / currentFirstTo
    for (const sheet of document.styleSheets) {
        for (const rule of sheet.cssRules) {
            if (rule.selectorText === ".mappool-container-tile" || rule.selectorText === ".mappool-container-tiebreaker") {
                rule.style.width = `${width}px`
            }
        }
    }

    // Geenrate bans
    for (let i = 0; i < currentBanCount; i++) {
        console.log("hello")
        teamBanContainerLeftEl.append(createMappoolBanTile("red"))
        teamBanContainerRightEl.append(createMappoolBanTile("blue"))
    }
}
getBeatmaps()
// Find Beatmaps
const findBeatmaps = beatmapId => allBeatmaps.find(beatmap => Number(beatmap.beatmap_id) === Number(beatmapId))

function createMappoolBanTile(team) {
    const teamBanImage = document.createElement("div")
    teamBanImage.classList.add("team-ban-image")

    const teamBanLayerOne = document.createElement("div")
    teamBanLayerOne.classList.add("team-ban-layer-one")

    const teamBanMiddleLine = document.createElement("div")
    teamBanMiddleLine.classList.add("team-ban-middle-line")

    const teamBanLayerTwo = document.createElement("div")
    teamBanLayerTwo.classList.add("team-ban-layer-two")

    const teamBanLayerCenter = document.createElement("div")
    teamBanLayerCenter.classList.add("team-ban-layer-center", `${team}-team-ban-layer-center`)

    const teamBanImageOverlay = document.createElement("div")
    teamBanImageOverlay.classList.add("team-ban-image-overlay")

    const teamBanIcon = document.createElement("img")
    teamBanIcon.classList.add("team-ban-icon")
    teamBanIcon.setAttribute("src", `static/${team}-ban.png`)

    const teamBanSecondBottomLayer = document.createElement("div")
    teamBanSecondBottomLayer.classList.add("team-ban-second-bottom-layer")

    const teamBanBottomLayer = document.createElement("div")
    teamBanBottomLayer.classList.add("team-ban-bottom-layer")

    teamBanLayerCenter.append(teamBanImageOverlay, teamBanIcon, teamBanSecondBottomLayer, teamBanBottomLayer)
    teamBanLayerOne.append(teamBanMiddleLine, teamBanLayerTwo, teamBanLayerCenter)
    teamBanImage.append(teamBanLayerOne)
    return teamBanImage
}

// Create Mappool Container Tile
function createMappoolContainerTile(side) {
    // Mappool Container Tile
    const mappoolContainerTile = document.createElement("div")
    mappoolContainerTile.classList.add("mappool-container-tile")

    // Mappool Container Tile Background
    const mappoolContainerTileBackground = document.createElement("div")
    mappoolContainerTileBackground.classList.add("mappool-container-tile-background")
    
    // Overlay
    const overlay = document.createElement("div")
    overlay.classList.add("overlay")
    mappoolContainerTileBackground.append(overlay)

    // Mappool Container Tile Bottom
    const mappoolContainerTileBottom = document.createElement("div")
    mappoolContainerTileBottom.classList.add("mappool-container-tile-bottom")

    // Crown
    const crown = document.createElement("img")
    crown.classList.add("crown")
    crown.setAttribute("src", `static/${side}-crown.png`)

    // Mappool Container Tile Bottom
    const mappoolContainerTileSecondBottom = document.createElement("div")
    mappoolContainerTileSecondBottom.classList.add("mappool-container-tile-second-bottom")

    mappoolContainerTile.append(mappoolContainerTileBackground, mappoolContainerTileBottom, crown, mappoolContainerTileSecondBottom)
    return mappoolContainerTile
}

// Create stars
function createTicketStars(side, starCount) {
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < currentFirstTo; i++) {
        const isFilled = i < starCount

        // Create image
        const image = document.createElement("img")
        image.classList.add("team-star")
        image.setAttribute("src", `../_shared/assets/points/small_star_${side}_${isFilled? "fill" : "empty"}.png`)
        
        // Position the star
        image.classList.add("ticket-team-star")
        image.setAttribute("style", `--i:${i + 1};`)

        const angle = (20 + -20 * currentFirstTo) + (i * 40)
        image.style.transform = `rotate(${angle}deg) translateY(-75px) rotate(${-angle}deg)`
        
        fragment.append(image)
    }
    return fragment
}

// Create Stars
function createStars(side) {
    const fragment = document.createDocumentFragment()
    for (let i = 0; i < currentFirstTo; i++) {
        const currentStarCount = side === "left" ? currentStarLeft : currentStarRight
        fragment.append(createStar(i, side, `${i < currentStarCount ? "fill" : "empty"}`))
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

    return fragment
}

// Team Dials
const ticketLeftTeamDialEl = document.getElementById("ticket-left-team-dial")
const ticketRightTeamDialEl = document.getElementById("ticket-right-team-dial")

// Update star count
const mappoolTileTiebreakerEl = document.getElementById("mappool-container-tiebreaker")
function updateStarCount(side, action) {
    if (side === "left") {
        currentStarLeft += action === "plus" ? 1 : -1
        currentStarLeft = Math.max(0, Math.min(currentStarLeft, currentFirstTo))
    } else if (side === "right") {
        currentStarRight += action === "plus" ? 1 : -1
        currentStarRight = Math.max(0, Math.min(currentStarRight, currentFirstTo))
    }

    teamStarContainerLeft.innerHTML = ""
    teamStarContainerRight.innerHTML = ""
    teamStarContainerLeft.append(createStars("left", currentStarLeft, true))
    teamStarContainerRight.append(createStars("right", currentStarRight, true))
    ticketTeamStarContainerLeftEl.append(createTicketStars("left", currentStarLeft, false))
    ticketTeamStarContainerRightEl.append(createTicketStars("right", currentStarRight, false))

    // Setting Tiebreaker Information
    if (currentStarLeft >= currentFirstTo - 1 && currentStarRight >= currentFirstTo - 1) {
        mappoolTileTiebreakerEl.children[0].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${allBeatmaps[allBeatmaps.length - 1].beatmapset_id}/covers/cover.jpg")`
        mappoolTileTiebreakerEl.children[1].style.backgroundColor = "#63cc4e"
        mappoolTileTiebreakerEl.children[1].textContent = "TB"
    } else {
        mappoolTileTiebreakerEl.children[0].style.backgroundImage = "none"
        mappoolTileTiebreakerEl.children[1].style.backgroundColor = "#2a2c30"
        mappoolTileTiebreakerEl.children[1].textContent = ""
    }

    // Spin dial
    if (side === "left") {
        const angle = (20 + -20 * currentFirstTo) + ((currentStarLeft - 1) * 40)
        ticketLeftTeamDialEl.style.transform = `translateX(-50%) rotate(${angle}deg)`
        if (currentStarLeft === 0) ticketLeftTeamDialEl.style.transform = `translateX(-50%) rotate(-180deg)`
    } else {
        const angle = (20 + -20 * currentFirstTo) + ((currentStarRight - 1) * 40)
        ticketRightTeamDialEl.style.transform = `translateX(-50%) rotate(${angle}deg)`
        if (currentStarRight === 0) ticketRightTeamDialEl.style.transform = `translateX(-50%) rotate(-180deg)`
    }

    document.cookie = `currentFirstTo=${currentFirstTo}; path=/`
    document.cookie = `currentStarLeft=${currentStarLeft}; path=/`
    document.cookie = `currentStarRight=${currentStarRight}; path=/`
}

// Star Toggle
const toggleStarsEl = document.getElementById("toggle-stars")
let isStarToggled = true
document.cookie = `isStarToggled=${isStarToggled}; path=/`
function toggleStars() {
    isStarToggled = !isStarToggled
    toggleStarsEl.innerText = `TOGGLE STARS: ${isStarToggled? "ON" : "OFF"}`
    document.cookie = `isStarToggled=${isStarToggled}; path=/`
    if (!isStarToggled) {
        teamStarContainerLeft.style.display = "none"
        teamStarContainerRight.style.display = "none"
        ticketTeamStarContainerLeftEl.style.display = "none"
        ticketTeamStarContainerRightEl.style.display = "none"

        toggleStarsEl.classList.add("toggle-inactive")
        toggleStarsEl.classList.remove("toggle-active")
    } else {
        teamStarContainerLeft.style.display = "flex"
        teamStarContainerRight.style.display = "flex"
        ticketTeamStarContainerLeftEl.style.display = "block"
        ticketTeamStarContainerRightEl.style.display = "block"
        toggleStarsEl.classList.add("toggle-active")
        toggleStarsEl.classList.remove("toggle-inactive")
    }
}

// Ban related elements
const teamBanImageContainerLeftEl = document.getElementById("team-ban-image-container-left")
const teamBanTextContainerLeftEl = document.getElementById("team-ban-text-container-left")
const teamBanImageContainerRightEl = document.getElementById("team-ban-image-container-right")
const teamBanTextContainerRightEl = document.getElementById("team-ban-text-container-right")

// Pick related elements
const mappoolContainerLeftEl = document.getElementById("mappool-container-left")
const mappoolContainerRightEl = document.getElementById("mappool-container-right")

// Map Click Event
async function mapClickEvent(event) {
    // Figure out whether it is a pick or ban
    const currentMapId = this.dataset.id
    const currentMap = findBeatmaps(currentMapId)
    if (!currentMap) return

    // Team
    let team
    if (event.button === 0) team = "left"
    else if (event.button === 2) team = "right"
    if (!team) return

    // Action
    let action = "pick"
    if (event.ctrlKey) action = "ban"

    // Check if map exists in bans
    const mapCheck = !!(
        teamBanContainerLeftEl.querySelector(`[data-id="${currentMapId}"]`) ||
        teamBanContainerRightEl.querySelector(`[data-id="${currentMapId}"]`) ||
        mappoolContainerLeftEl.querySelector(`[data-id="${currentMapId}"]`) ||
        mappoolContainerRightEl.querySelector(`[data-id="${currentMapId}"]`)
    )
    if (mapCheck) return

    // Bans
    if (action === "ban") {
        const currentBanContainer = team === "left" ? teamBanContainerLeftEl : teamBanContainerRightEl
        for (let i = 0; i < currentBanContainer.childElementCount; i++) {
            if (currentBanContainer.children[i].dataset.id !== undefined) continue
            setBan(
                currentBanContainer.children[i],
                currentBanContainer.children[i].children[0].children[2],
                currentBanContainer.children[i].children[0].children[2].children[3],
                currentMapId,
                currentMap
            )
            break
        }
    }

    // Picks
    if (action === "pick") {
        const currentMapooolContainer = team === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
        for (let i = 0; i < currentMapooolContainer.childElementCount; i++) {
            if (currentMapooolContainer.children[i].dataset.id !== undefined) continue
            setPick(currentMapooolContainer.children[i], currentMapId, currentMap, team)
            currentPickedTile = currentMapooolContainer.children[i]
            break
        }

        // Set picker
        document.cookie = `currentPicker=${team}; path=/`

        // Go to gameplay scene
        await delay(10000)
        if (enableAutoAdvance) {
            obsGetCurrentScene((currentScene) => {
                if (currentScene.name === gameplay_scene_name) return
                obsSetCurrentScene(gameplay_scene_name)
            })
        }
    }
}

// Set Ban
function setBan(banTile, imageTile, textTile, id, mapObject, tileNumber) {
    banTile.dataset.id = id
    imageTile.style.backgroundImage =  `url("https://assets.ppy.sh/beatmaps/${mapObject.beatmapset_id}/covers/cover.jpg")`
    imageTile.style.display = "block"
    textTile.textContent = `${mapObject.mod}${mapObject.order}`
}

// Set Pick
function setPick(pickTile, id, currentMap, team) {
    pickTile.dataset.id = id
    pickTile.children[0].style.backgroundImage = `url("https://assets.ppy.sh/beatmaps/${currentMap.beatmapset_id}/covers/cover.jpg")`
    pickTile.children[1].style.backgroundColor = team === "left" ? "var(--ban-container-colour-left)" : "var(--ban-container-colour-right)"
    pickTile.children[1].style.color = team === "left" ? "white" : "black"
    pickTile.children[3].style.backgroundColor = team === "left" ? "var(--ban-container-colour-left)" : "var(--ban-container-colour-right)"
    pickTile.children[1].textContent = `${currentMap.mod}${currentMap.order}`
}

// Set winner
function setWinner(tile, teamWinner, teamLoser) {
    tile.children[0].children[0].classList.add(`${teamWinner}-win-overlay`)
    tile.children[0].children[0].classList.remove(`${teamLoser}-win-overlay`)
    tile.children[2].style.display = "block"
    tile.children[2].setAttribute("src", `static/${teamWinner === "left"? "red" : "blue"}-crown.png`)
}

// Team Inforamtion
const leftTeamNameEl= document.getElementById("left-team-name")
const rightTeamNameEl = document.getElementById("right-team-name")
const ticketLeftTeamNameEl = document.getElementById("ticket-left-team-name")
const ticketRightTeamNameEl = document.getElementById("ticket-right-team-name")
let currentLeftTeamName, currentRightTeamName

// Set scores
let currentScoreLeft, currentScoreRight

// IPC State + Checked Winner
let currentIpcState, previousIpcState, checkedWinner = false

// Now Playing Information
let currentId, currentChecksum, currentMappoolBeatmap, currentPickedTile

// Current Picker
const currentPickerEl = document.getElementById("current-picker")

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

// Chat stuff
const chatDisplayContainerEl = document.getElementById("chat-display-container")
let chatLen = 0

// Socket
const socket = createTosuWsSocket()
socket.onmessage = event => {
    const data = JSON.parse(event.data)

    // Team information
    if (currentLeftTeamName !== data.tourney.team.left) {
        currentLeftTeamName = data.tourney.team.left
        const uppercaseName = currentLeftTeamName.toUpperCase()
        leftTeamNameEl.textContent = uppercaseName
        ticketLeftTeamNameEl.textContent = uppercaseName
        document.cookie = `currentLeftTeamName=${currentLeftTeamName}; path=/`
    }
    if (currentRightTeamName !== data.tourney.team.right) {
        currentRightTeamName = data.tourney.team.right
        const uppercaseName = currentRightTeamName.toUpperCase()
        rightTeamNameEl.textContent = uppercaseName
        ticketRightTeamNameEl.textContent = uppercaseName
        document.cookie = `currentRightTeamName=${currentRightTeamName}; path=/`
    }

    // Mappool map
    if (currentId !== data.beatmap.id || currentChecksum !== data.beatmap.checksum) {
        currentId = data.beatmap.id
        currentChecksum = data.beatmap.checksum
        currentMappoolBeatmap = findBeatmaps(currentId)

        // Set Now Playing Metadata
        nowPlayingSectionDetailsEl.style.backgroundImage = `url("${location.origin}/Songs/${data.folders.beatmap}/${data.files.background}")`
        nowPlayingSongTitleEl.textContent = data.beatmap.title
        nowPlayingSongArtistEl.textContent = data.beatmap.artist

        // Find element
        const element = document.getElementById(currentId)
        
        // Click event
        if (isAutopickToggled && element && (!element.hasAttribute("data-is-autopicked") || element.getAttribute("data-is-autopicked") !== "true")) {
            // Check if autopicked already
            const event = new MouseEvent('mousedown', {
                bubbles: true,
                cancelable: true,
                view: window,
                button: (currentNextPicker === "left")? 0 : 2
            })
            element.dispatchEvent(event)
            element.setAttribute("data-is-autopicked", "true")

            if (currentNextPicker === "left") setNextPicker("right")
            else if (currentNextPicker === "right") setNextPicker("left")
        }

        // Setting stats for found maps
        if (currentMappoolBeatmap) {
            let sr = Math.round(Number(currentMappoolBeatmap.difficultyrating) * 100) / 100
            let len = Number(currentMappoolBeatmap.total_length)
            let ar = Math.round(Number(currentMappoolBeatmap.diff_approach) * 10) / 10
            let hp = Math.round(Number(currentMappoolBeatmap.diff_drain) * 10) / 10
            let bpm = Math.round(Number(currentMappoolBeatmap.bpm) * 10) / 10
            let cs = Math.round(Number(currentMappoolBeatmap.diff_size) * 10) / 10
            let od = Math.round(Number(currentMappoolBeatmap.diff_overall) * 10) / 10

            // Add mods
            if (currentMappoolBeatmap.mod.includes("HR")) {
                cs = Math.min(Math.round(cs * 1.3 * 10) / 10, 10)
                ar = Math.min(Math.round(ar * 1.4 * 10) / 10, 10)
                hp = Math.min(Math.round(hp * 1.4 * 10) / 10, 10)
                od = Math.min(Math.round(od * 1.4 * 10) / 10, 10)
            }
            if (currentMappoolBeatmap.mod.includes("DT")) {
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
        }
    }

    if (!currentMappoolBeatmap) {
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

    // Set current scores
    if (currentIpcState === 2 || currentIpcState === 3) {
        // Auto switch to gameplay no matter what
        // Nevermind
        if (enableAutoAdvance) {
            obsSetCurrentScene(gameplay_scene_name)
        }
        
        currentScoreLeft = 0
        currentScoreRight = 0
        
        // Check if mappool map
        for (let i = 0; i < data.tourney.clients.length; i++) {
            let currentScore = data.tourney.clients[i].play.score

            // Set EZ Multiplier
            if (currentMappoolBeatmap && 
                (currentMappoolBeatmap.mod === "FCM" || currentMappoolBeatmap.mod === "FM" || currentMappoolBeatmap.mod === "TB") &&
                data.tourney.clients[i].play.mods.name.includes("EZ")
            ) {
                currentScore *= currentMappoolBeatmap.EZMultiplier ?? 1.8
            }

            // Set score to team
            if (data.tourney.clients[i].team === "left") currentScoreLeft += currentScore
            else currentScoreRight += currentScore
        }
    }

    // Update IPC State
    if (currentIpcState !== data.tourney.ipcState) {
        currentIpcState = data.tourney.ipcState
        
        // Results screen
        if (currentIpcState === 4 && !checkedWinner && isStarToggled) {
            checkedWinner = true

            // Set winner
            let winner = ""
            if (currentScoreLeft > currentScoreRight) winner = "left"
            else if (currentScoreLeft < currentScoreRight) winner = "right"
            const loser = winner === "left" ? "right" : "left"
            if (!winner) return
            updateStarCount(winner, "plus")
            
            // Set background to winning map
            if (currentMappoolBeatmap && currentPickedTile) setWinner(currentPickedTile, winner, loser)
        }

        // Non results screen
        if (currentIpcState !== 4) {
            checkedWinner = false

            // If no winners yet, then go to mappool scene
            // If winners, then go to winner scene
            // Generally this triggers when enableAutoAdvance is turned on and ipcState === 1 (from results screen)
            if (previousIpcState === 4 && 
                currentIpcState !== previousIpcState && 
                enableAutoAdvance) {
                
                const targetScene = (currentStarLeft === currentFirstTo || currentStarRight === currentFirstTo) 
                    ? winner_scene_name 
                    : mappool_scene_name

                obsGetCurrentScene((scene) => {
                    if (scene.name !== targetScene) obsSetCurrentScene(targetScene)
                })
            }
        }

        previousIpcState = currentIpcState

        // Chat Display
        const chatData = data.tourney.chat
        if (chatLen !== chatData.length) {
            chatLen = updateChat(chatLen, chatData, chatDisplayContainerEl)
        }
    }
}

// Toggle Autopick
const toggleAutopickEl = document.getElementById("toggle-autopick")
let isAutopickToggled = false
function toggleAutopick() {
    isAutopickToggled = !isAutopickToggled
    toggleAutopickEl.textContent = `TOGGLE AUTOPICK: ${isAutopickToggled? "ON": "OFF"}`
    if (isAutopickToggled) {
        toggleAutopickEl.classList.remove("toggle-inactive")
        toggleAutopickEl.classList.add("toggle-active")
    } else {
        toggleAutopickEl.classList.add("toggle-inactive")
        toggleAutopickEl.classList.remove("toggle-active")
    }
}

// Next Picker
const nextPickerEl = document.getElementById("next-picker")
let currentNextPicker = "none"
function setNextPicker(pickerTeam) {
    currentNextPicker = pickerTeam
    nextPickerEl.textContent = pickerTeam === "left" ? "RED" : pickerTeam === "right" ? "BLUE" : "NONE"
}

// Create h2 title
function createH2Title(text) {
    const h2 = document.createElement("h2")
    h2.textContent = text
    return h2
}

// Mappool override section
const mappoolOverrideColumnEl = document.getElementById("mappool-override-column")
const mappoolOverrideActionSelectEl = document.getElementById("mappool-override-action-select")
function mappoolOverrideChangeAction() {
    let mappoolOverrideAction = mappoolOverrideActionSelectEl.value

    // Remove last elements
    while (mappoolOverrideColumnEl.childElementCount > 3) {
        mappoolOverrideColumnEl.lastChild.remove()
    }

    const action = (mappoolOverrideAction === "setBan" || mappoolOverrideAction === "removeBan") ? "Ban" : "Pick"

    // Create h2 for which action or pick
    mappoolOverrideColumnEl.append(createH2Title(`Which ${action}?`))

    // Create select
    const actionsPerTeam = action === "Ban" ? currentBanCount : mappoolContainerLeftEl.childElementCount
    const whichActionSelect = document.createElement("select")
    whichActionSelect.classList.add("mappool-override-select")
    whichActionSelect.addEventListener("change", setMappoolOverrideInformation)
    whichActionSelect.setAttribute("id", "which-action-select")
    whichActionSelect.setAttribute("size", `${actionsPerTeam * 2}`)
    
    // Create options
    for (let i = 0; i < actionsPerTeam; i++) {
        // Create red option
        const redOption = document.createElement("option")
        redOption.setAttribute("value", `left|${i}`)
        redOption.textContent = `Red ${action} ${i + 1}`

        // Create blue option
        const blueOption = document.createElement("option")
        blueOption.setAttribute("value", `right|${i}`)
        blueOption.textContent = `Blue ${action} ${i + 1}`

        whichActionSelect.append(redOption, blueOption)
    }

    // Append select
    mappoolOverrideColumnEl.append(whichActionSelect)

    // Setting map
    if (mappoolOverrideAction === "setBan" || mappoolOverrideAction === "setPick") {
        // Which Map
        mappoolOverrideColumnEl.append(createH2Title("Which Map?"))

        // Select all maps
        const mappoolOverrideBeatmapsContainer = document.createElement("div")
        mappoolOverrideBeatmapsContainer.classList.add("mappool-override-beatmaps-container")

        for (let i = 0; i < allBeatmaps.length; i++) {
            const mappoolOverrideBeatmaps = document.createElement("div")
            mappoolOverrideBeatmaps.classList.add("mappool-override-beatmaps")
            mappoolOverrideBeatmaps.textContent = `${allBeatmaps[i].mod}${allBeatmaps[i].order}`
            mappoolOverrideBeatmaps.setAttribute("id", allBeatmaps[i].beatmap_id)
            mappoolOverrideBeatmaps.addEventListener("click", mappoolOverrideSelectMap)
            mappoolOverrideBeatmapsContainer.append(mappoolOverrideBeatmaps)
            mappoolOverrideColumnEl.append(mappoolOverrideBeatmapsContainer)
        }
    }

    // Setting team
    if (mappoolOverrideAction === "setWinner") {
        // Which Map
        mappoolOverrideColumnEl.append(createH2Title("Which Team?"))
    
        // Select Team
        const whichPickSelect = document.createElement("select")
        whichPickSelect.classList.add("mappool-override-select")
        whichPickSelect.setAttribute("id", "which-team-winner")
        whichPickSelect.setAttribute("size", 2)
        const redTeamOption = document.createElement("option")
        redTeamOption.setAttribute("value", "left")
        redTeamOption.textContent = `Left`
        const blueTeamOption = document.createElement("option")
        blueTeamOption.setAttribute("value", "right")
        blueTeamOption.textContent = `Right`
        whichPickSelect.append(redTeamOption, blueTeamOption)
        mappoolOverrideColumnEl.append(whichPickSelect)
    }

    // Apply Changes Button
    const sidebarButtonContainer = document.createElement("div")
    sidebarButtonContainer.classList.add("sidebar-button-container")
    mappoolOverrideColumnEl.append(sidebarButtonContainer)

    const applyChangesButton = document.createElement("button")
    applyChangesButton.setAttribute("id", "apply-changes")
    applyChangesButton.textContent = `APPLY CHANGES`
    applyChangesButton.style.fontSize = "1rem"
    sidebarButtonContainer.append(applyChangesButton)
    
    let currentApplyChangesHandler = null

    switch (mappoolOverrideAction) {
        case "setBan":
            currentApplyChangesHandler = mappoolOverrideSetBan
            break
        case "removeBan":
            currentApplyChangesHandler = mappoolOverrideRemoveBan
            break
        case "setPick":
            currentApplyChangesHandler = mappoolOverrideSetPick
            break
        case "removePick":
            currentApplyChangesHandler = mappoolOverrideRemovePick
            break
        case "setWinner":
            currentApplyChangesHandler = mappoolOverrideSetWinner
            break
        case "removeWinner":
            currentApplyChangesHandler = mappoolOverrideRemoveWinner
            break
    }

    if (currentApplyChangesHandler) {
        applyChangesButton.removeEventListener("click", currentApplyChangesHandler)
        applyChangesButton.addEventListener("click", currentApplyChangesHandler)
    }
}

// Set Mappool Override Information
let mappoolOverrideTeam, mappoolOverrideTileNumber
function setMappoolOverrideInformation() {
    [mappoolOverrideTeam, mappoolOverrideTileNumber] = document.getElementById("which-action-select").value.split("|")
}

// Mappool Override Select Map
let mappoolOverrideMap
function mappoolOverrideSelectMap() {
    mappoolOverrideMap = this.id
    const mappoolOverrideBeatmaps = document.getElementsByClassName("mappool-override-beatmaps")
    for (let i = 0; i < mappoolOverrideBeatmaps.length; i++) {
        mappoolOverrideBeatmaps[i].style.backgroundColor = "transparent"
        mappoolOverrideBeatmaps[i].style.color = "white"
    }
    this.style.backgroundColor = "#C2C2C2"
    this.style.color = "#26272B"
}

// Mappool Override Set Ban
function mappoolOverrideSetBan() {
    if (!mappoolOverrideTeam || !mappoolOverrideTileNumber || !mappoolOverrideMap) return

    // Get current map
    const currentMap = findBeatmaps(mappoolOverrideMap)
    if (!currentMap) return

    // Get Containers
    const currentBanContainer = mappoolOverrideTeam === "left" ? teamBanContainerLeftEl : teamBanContainerRightEl

    // Set information
    setBan(
        currentBanContainer.children[mappoolOverrideTileNumber],
        currentBanContainer.children[mappoolOverrideTileNumber].children[0].children[2],
        currentBanContainer.children[mappoolOverrideTileNumber].children[0].children[2].children[3],
        Number(mappoolOverrideMap),
        currentMap
    )
}

// Mappool Override Remove Ban
function mappoolOverrideRemoveBan() {
    if (!mappoolOverrideTeam || !mappoolOverrideTileNumber) return

    // Get Containers
    const currentBanContainer = mappoolOverrideTeam === "left" ? teamBanContainerLeftEl : teamBanContainerRightEl

    // Remove Information
    const currentBanImage = currentBanContainer.children[mappoolOverrideTileNumber].children[0].children[2]
    currentBanContainer.children[mappoolOverrideTileNumber].removeAttribute("data-id")
    currentBanImage.style.backgroundImage = "none"
    currentBanImage.style.display = "none"
}

// Mappool Override Set Pick
function mappoolOverrideSetPick() {
    if (!mappoolOverrideTeam || !mappoolOverrideTileNumber || !mappoolOverrideMap) return

    // Get current map
    const currentMap = findBeatmaps(mappoolOverrideMap)
    if (!currentMap) return

    // Set map information
    const currentMapooolContainer = mappoolOverrideTeam === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
    const currentTile = currentMapooolContainer.children[mappoolOverrideTileNumber]

    setPick(currentTile, mappoolOverrideMap, currentMap,mappoolOverrideTeam)
}

// Mappool Override Remove Pick
function mappoolOverrideRemovePick() {
    if (!mappoolOverrideTeam || !mappoolOverrideTileNumber) return

    // Set map information
    const currentMapooolContainer = mappoolOverrideTeam === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
    const currentTile = currentMapooolContainer.children[mappoolOverrideTileNumber]

    currentTile.removeAttribute("data-id")
    currentTile.children[0].style.backgroundImage = "none"
    currentTile.children[1].style.backgroundColor = "#2a2c30"
    currentTile.children[1].textContent = ""
    currentTile.children[2].style.display = "none"
}

// Set Mappool Override Team Winner
function mappoolOverrideSetWinner() {
    if (!mappoolOverrideTeam || !mappoolOverrideTileNumber) return
    const teamWinner = document.getElementById("which-team-winner").value
    if (!teamWinner) return
    const teamLoser = teamWinner === "left" ? "right" : "left"

    // Set map information
    const currentMapooolContainer = mappoolOverrideTeam === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
    const currentTile = currentMapooolContainer.children[mappoolOverrideTileNumber]

    setWinner(currentTile, teamWinner, teamLoser)
}

// Set Mappool Override Remove Winner
function mappoolOverrideRemoveWinner() {
    if (!mappoolOverrideTeam || !mappoolOverrideTileNumber) return
    // Set map information
    const currentMapooolContainer = mappoolOverrideTeam === "left" ? mappoolContainerLeftEl : mappoolContainerRightEl
    const currentTile = currentMapooolContainer.children[mappoolOverrideTileNumber]
    currentTile.children[0].children[0].classList.remove(`left-win-overlay`)
    currentTile.children[0].children[0].classList.remove(`right-win-overlay`)
    currentTile.children[2].style.display = "none"
}

// League Select
const leagueNameEl = document.getElementById("league-name")
const majorLeagueButtonEl = document.getElementById("major-league-button")
const minorLeagueButtonEl = document.getElementById("minor-league-button")
document.cookie = `leagueName=major; path=/`
function setLeague(league) {
    leagueNameEl.textContent = `${league.toUpperCase()} LEAGUE`
    document.cookie = `leagueName=${league}; path=/`
    if (league === "major") {
        majorLeagueButtonEl.classList.add("toggle-active")
        minorLeagueButtonEl.classList.remove("toggle-active")
    } else {
        majorLeagueButtonEl.classList.remove("toggle-active")
        minorLeagueButtonEl.classList.add("toggle-active")
    }
}


// OBS Information
const sceneCollection = document.getElementById("sceneCollection")
let autoadvance_button = document.getElementById('auto-advance-button')
let autoadvance_timer_label = document.getElementById('autoAdvanceTimerLabel')
const pick_to_transition_delay_ms = 10000;
let enableAutoAdvance = false
const gameplay_scene_name = "Gameplay"
const mappool_scene_name = "Mappool"
const winner_scene_name = "Team Win"

let sceneTransitionTimeoutID

function switchAutoAdvance() {
    enableAutoAdvance = !enableAutoAdvance
    if (enableAutoAdvance) {
        autoadvance_button.innerText = 'AUTO ADVANCE: ON'
        autoadvance_button.classList.add("toggle-active")
        autoadvance_button.classList.remove("toggle-inactive")
    } else {
        autoadvance_button.innerText = 'AUTO ADVANCE: OFF'
        autoadvance_button.classList.remove("toggle-active")
        autoadvance_button.classList.add("toggle-inactive")
    }
}

const obsGetCurrentScene = window.obsstudio?.getCurrentScene ?? (() => {})
const obsGetScenes = window.obsstudio?.getScenes ?? (() => {})
const obsSetCurrentScene = window.obsstudio?.setCurrentScene ?? (() => {})

obsGetScenes(scenes => {
    for (const scene of scenes) {
        let clone = document.getElementById("sceneButtonTemplate").content.cloneNode(true)
        let buttonNode = clone.querySelector('button')
        buttonNode.id = `scene__${scene}`
        buttonNode.textContent = `GO TO: ${scene}`
        buttonNode.onclick = function() { obsSetCurrentScene(scene); }
        sceneCollection.appendChild(clone)
    }

    obsGetCurrentScene((scene) => { document.getElementById(`scene__${scene.name}`).classList.add("active-scene") })
})

window.addEventListener('obsSceneChanged', function(event) {
    let activeButton = document.getElementById(`scene__${event.detail.name}`)
    for (const scene of sceneCollection.children) { scene.classList.remove("toggle-active") }
    activeButton.classList.add("toggle-active")
})

const updateStarCountLeftMinusEl = document.getElementById("update-star-count-left-minus")
const updateStarCountLeftPlusEl = document.getElementById("update-star-count-left-plus")
const updateStarCountRightMinusEl = document.getElementById("update-star-count-right-minus")
const updateStarCountRightPlusEl = document.getElementById("update-star-count-right-plus")
const setNextPickerLeftEl = document.getElementById("set-next-picker-left")
const setNextPickerRightEl = document.getElementById("set-next-picker-right")
const nextPickerNoneEl = document.getElementById("next-picker-none")

// Windows
window.onload = () => {
    updateStarCountLeftMinusEl.addEventListener("click", () => updateStarCount('left','minus'))
    updateStarCountLeftPlusEl.addEventListener("click", () => updateStarCount('left','plus'))
    updateStarCountRightMinusEl.addEventListener("click", () => updateStarCount('right','minus'))
    updateStarCountRightPlusEl.addEventListener("click", () => updateStarCount('right','plus'))
    toggleStarsEl.addEventListener("click", () => toggleStars())
    setNextPickerLeftEl.addEventListener("click", () => setNextPicker("left"))
    setNextPickerRightEl.addEventListener("click", () => setNextPicker("right"))
    nextPickerNoneEl.addEventListener("click", () => setNextPicker("none"))
    toggleAutopickEl.addEventListener("click", () => toggleAutopick())
    majorLeagueButtonEl.addEventListener("click", () => setLeague("major"))
    minorLeagueButtonEl.addEventListener("click", () => setLeague("minor"))
    mappoolOverrideActionSelectEl.addEventListener("click", () => mappoolOverrideChangeAction())
    autoadvance_button.addEventListener("click", () => switchAutoAdvance())
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