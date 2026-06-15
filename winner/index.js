import { getCookie } from "../_shared/core/utils.js"

// Match Winner Round
const matchWinnerRoundEl = document.getElementById("match-winner-round")
async function getBeatmaps() {
    const response = await axios.get("../_data/beatmaps.json")
    matchWinnerRoundEl.textContent = response.data.roundName
}
getBeatmaps()

let allTeams
async function getTeams() {
    const response = await axios.get("../_data/teams.json")
    allTeams = response.data
}
getTeams()
// Find Teams
const findTeams = teamName => allTeams.find(team => team.team_name === teamName)

let currentLeftTeamName, previousLeftTeamName, currentRightTeamName, previousRightTeamName
let currentStarLeft, previousStarLeft, currentStarRight, previousStarRight

const teamNameEl = document.getElementById("team-name")
const playerContainerEl = document.getElementById("player-container")

setInterval(() => {
    // Set information
    currentLeftTeamName = getCookie("currentLeftTeamName")
    currentRightTeamName = getCookie("currentRightTeamName")
    currentStarLeft = getCookie("currentStarLeft")
    currentStarRight = getCookie("currentStarRight")

    // Compare information
    if (previousLeftTeamName !== currentLeftTeamName ||
        previousRightTeamName !== currentRightTeamName ||
        previousStarLeft !== currentStarLeft ||
        previousStarRight !== currentStarRight
    ) {
        // Reset information
        previousLeftTeamName = currentLeftTeamName
        previousRightTeamName = currentRightTeamName
        previousStarLeft = currentStarLeft
        previousStarRight = currentStarRight

        // Set winning team
        let winningTeam
        if (currentStarLeft > currentStarRight) {
            winningTeam = currentLeftTeamName
        } else if (currentStarRight > currentStarLeft) {
            winningTeam = currentRightTeamName
        }

        // Get team
        const currentTeam = findTeams(winningTeam)
        teamNameEl.textContent = currentTeam.team_name
        playerContainerEl.innerHTML = ""

        // Set players
        for (let i = 0; i < currentTeam.player_names.length; i++) {
            const player = document.createElement("div")
            player.textContent = currentTeam.player_names[i]
            playerContainerEl.append(player)
        }
    }
}, 200)