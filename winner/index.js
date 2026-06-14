let allTeams
async function getTeams() {
    const response = await axios.get("../_data/beatmaps.json")
    allTeams = response.data.beatmaps
}
getTeams()
// Find Teams
const findTeams = teamName => allBeatmaps.find(team => team.team_name === teamName)

let currentLeftTeamName, previousLeftTeamName, currentRightTeamName, previousRightTeamName
let currentStarLeft, previousStarLeft, currentStarRight, previousStarRight

const teamNameEl = document.getElementById("team-name")
const playerContainerEl = document.getElementById("player-container")

setInterval(() => {
    currentLeftTeamName = getCookie("currentLeftTeamName")
    currentRightTeamName = getCookie("currentRightTeamName")
    currentStarLeft = getCookie("currentStarLeft")
    currentStarRight = getCookie("currentStarRight")

    if (previousLeftTeamName !== currentLeftTeamName ||
        previousRightTeamName !== currentRightTeamName ||
        previousStarLeft !== currentStarLeft ||
        previousStarRight !== currentStarRight
    ) {
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
        teamNameEl.textContent = currentTeam
        playerContainerEl.innerHTML = ""

        for (let i = 0; i < currentTeam.player_names.length; i++) {
            const player = document.createElement("div")
            player.textContent = currentTeam.player_names[i]
            playerContainerEl.append(player)
        }
    }
}, 200)