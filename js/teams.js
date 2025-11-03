/* IBBA Club Multi-Team Roster Submission - Team Management */
/* Version 5.8.1 - NO MIN PLAYERS */

// === Team Management ===
function getFullTeamName(team) {
  const ageGroupEnglish = ageGroupToEnglish(team.ageGroup);
  if (team.nickname && team.nickname.trim()) {
    return `${clubData.clubName} ${team.nickname} (${ageGroupEnglish})`.trim();
  } else {
    return `${clubData.clubName} ${ageGroupEnglish}`.trim();
  }
}

function addTeam() {
  const team = {
    id: teamIdCounter++,
    nickname: '',
    ageGroup: '',
    league: '',
    venue: '',
    players: [],
    staff: []
  };
  clubData.teams.push(team);
  renderTeams();
}

function removeTeam(teamId) {
  if (!confirm('Remove this team and all its roster data?')) return;
  clubData.teams = clubData.teams.filter(t => t.id !== teamId);
  if (activeTeamId === teamId) {
    activeTeamId = null;
  }
  renderTeams();
  updateRosterView();
}

function updateTeam(teamId, field, value) {
  const team = clubData.teams.find(t => t.id === teamId);
  if (team) {
    if (field === 'nickname') {
      value = formatTeamNickname(value);
    } else if (field === 'venue') {
      value = ucWords(value.trim());
    }
    team[field] = value;
    
    updateTeamStatus(teamId);
    updateNextButtonState();
  }
}

function formatTeamNickname(nickname) {
  if (!nickname) return nickname;
  
  const hasHebrew = /[\u0590-\u05FF]/.test(nickname);
  
  if (hasHebrew) {
    return nickname;
  } else {
    return ucWords(nickname.trim());
  }
}

function isTeamComplete(team) {
  return team.ageGroup && team.league;
}

function getTeamStatus(team) {
  if (!team.ageGroup || !team.league) return 'incomplete';
  return 'complete';
}

function updateTeamStatus(teamId) {
  const team = clubData.teams.find(t => t.id === teamId);
  if (!team) return;
  
  const status = getTeamStatus(team);
  const statusText = status === 'complete' ? 'Complete' : 'Incomplete';
  
  const teamCards = document.querySelectorAll('.team-card');
  teamCards.forEach(card => {
    const titleElement = card.querySelector('.team-title');
    if (titleElement && titleElement.textContent === `Team ${teamId}`) {
      const statusElement = card.querySelector('.team-status');
      if (statusElement) {
        statusElement.className = `team-status ${status}`;
        statusElement.textContent = statusText;
      }
      card.className = `team-card ${status}`;
    }
  });
}

function updateLeagueOptions(ageGroup, selectElement) {
  selectElement.innerHTML = '<option value="">Select League</option>';
  
  const noLeagueAgeGroups = ['קט-סל ב', 'קט-סל א', 'ילדים ב', 'ילדות ב'];
  
  if (noLeagueAgeGroups.includes(ageGroup)) {
    const option = document.createElement('option');
    option.value = 'רגיל';
    option.textContent = 'רגיל';
    selectElement.appendChild(option);
    selectElement.value = 'רגיל';
    selectElement.disabled = true;
    return 'רגיל';
  } else if (ageGroup) {
    const leagues = [
      { value: 'מחוזית', text: 'מחוזית' },
      { value: 'ארצית', text: 'ארצית' },
      { value: 'לאומית', text: 'לאומית' },
      { value: 'על', text: 'על' }
    ];
    
    leagues.forEach(league => {
      const option = document.createElement('option');
      option.value = league.value;
      option.textContent = league.text;
      selectElement.appendChild(option);
    });
    
    selectElement.disabled = false;
  } else {
    selectElement.disabled = false;
  }
  
  return null;
}

function updateLeagueForTeam(teamId, ageGroup) {
  const team = clubData.teams.find(t => t.id === teamId);
  const leagueSelect = document.getElementById(`league_${teamId}`);
  
  if (team && leagueSelect) {
    const autoLeague = updateLeagueOptions(ageGroup, leagueSelect);
    
    if (autoLeague) {
      team.league = autoLeague;
    } else if (team.league) {
      leagueSelect.value = team.league;
    }
    
    updateTeamStatus(teamId);
    updateNextButtonState();
  }
}

function renderTeams() {
  const container = document.getElementById('teamsContainer');
  container.innerHTML = '';
  
  clubData.teams.forEach(team => {
    const status = getTeamStatus(team);
    const statusText = status === 'complete' ? 'Complete' : 'Incomplete';
    
    const teamCard = document.createElement('div');
    teamCard.className = `team-card ${status}`;
    teamCard.innerHTML = `
      <div class="team-header">
        <div class="team-title">Team ${team.id}</div>
        <div class="team-status ${status}">${statusText}</div>
      </div>
      <div class="team-info">
        <div>
          <label class="tooltip">Team Nickname
            <span class="tooltiptext">Optional: Add a team nickname like "EAGLES" or coach name. If left empty, team will be called by age group only.</span>
          </label>
          <input type="text" value="${team.nickname}" placeholder="e.g., EAGLES, COACH_SMITH (optional)" 
                 onchange="updateTeam(${team.id}, 'nickname', this.value)" 
                 oninput="updateTeam(${team.id}, 'nickname', this.value)" />
        </div>
        <div>
          <label class="tooltip">Camera Venue
            <span class="tooltiptext">Optional: Enter the venue/location where the Pixellot camera is installed for this team's games.</span>
          </label>
          <input type="text" value="${team.venue || ''}" placeholder="e.g., Main Gym, Court A (optional)" 
                 onchange="updateTeam(${team.id}, 'venue', this.value)" 
                 oninput="updateTeam(${team.id}, 'venue', this.value)" />
        </div>
        <div>
          <label class="required tooltip">Age Group
            <span class="tooltiptext">Required: Select the age category for this team (e.g., U16 Boys, U13 Girls, Adults)</span>
          </label>
          <select onchange="updateTeam(${team.id}, 'ageGroup', this.value); updateLeagueForTeam(${team.id}, this.value)">
            <option value="">Select Age Group</option>
            <option value="קט-סל ב" ${team.ageGroup === 'קט-סל ב' ? 'selected' : ''}>קט-סל ב (U11)</option>
            <option value="קט-סל א" ${team.ageGroup === 'קט-סל א' ? 'selected' : ''}>קט-סל א (U12)</option>
            <option value="ילדים ב" ${team.ageGroup === 'ילדים ב' ? 'selected' : ''}>ילדים ב (U13 Boys)</option>
            <option value="ילדות ב" ${team.ageGroup === 'ילדות ב' ? 'selected' : ''}>ילדות ב (U13 Girls)</option>
            <option value="ילדים א" ${team.ageGroup === 'ילדים א' ? 'selected' : ''}>ילדים א (U14 Boys)</option>
            <option value="ילדות א" ${team.ageGroup === 'ילדות א' ? 'selected' : ''}>ילדות א (U14 Girls)</option>
            <option value="נערים ב" ${team.ageGroup === 'נערים ב' ? 'selected' : ''}>נערים ב (U15 Boys)</option>
            <option value="נערות ב" ${team.ageGroup === 'נערות ב' ? 'selected' : ''}>נערות ב (U16 Girls)</option>
            <option value="נערים א" ${team.ageGroup === 'נערים א' ? 'selected' : ''}>נערים א (U16 Boys)</option>
            <option value="נערות א" ${team.ageGroup === 'נערות א' ? 'selected' : ''}>נערות א (U18 Girls)</option>
            <option value="נוער" ${team.ageGroup === 'נוער' ? 'selected' : ''}>נוער (U18 Boys)</option>
            <option value="בוגרים" ${team.ageGroup === 'בוגרים' ? 'selected' : ''}>בוגרים (Adults Men)</option>
            <option value="בוגרות" ${team.ageGroup === 'בוגרות' ? 'selected' : ''}>בוגרות (Adults Women)</option>
          </select>
        </div>
        <div>
          <label class="required tooltip">League
            <span class="tooltiptext">Required: Select the competition level. Some age groups automatically assign "Regular" league.</span>
          </label>
          <select id="league_${team.id}" onchange="updateTeam(${team.id}, 'league', this.value)">
            <option value="">Select League</option>
          </select>
        </div>
        <div>
          <button class="remove-team" onclick="removeTeam(${team.id})">🗑️ Remove</button>
        </div>
      </div>
    `;
    
    container.appendChild(teamCard);
    
    // Initialize league options
    const leagueSelect = teamCard.querySelector(`#league_${team.id}`);
    if (team.ageGroup && leagueSelect) {
      updateLeagueOptions(team.ageGroup, leagueSelect);
      if (team.league) {
        leagueSelect.value = team.league;
      }
    }
  });
  
  updateNextButtonState();
}

