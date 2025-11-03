/* IBBA Club Multi-Team Roster Submission - Roster Management */
/* Version 5.8.1 - NO MIN PLAYERS */

// === Roster Management ===
function updateRosterView() {
  const noTeamsMsg = document.getElementById('noTeamsMessage');
  const rosterMgmt = document.getElementById('rosterManagement');
  
  if (clubData.teams.length === 0) {
    noTeamsMsg.style.display = 'block';
    rosterMgmt.style.display = 'none';
    return;
  }
  
  noTeamsMsg.style.display = 'none';
  rosterMgmt.style.display = 'block';
  
  renderTeamTabs();
  
  if (!activeTeamId && clubData.teams.length > 0) {
    activeTeamId = clubData.teams[0].id;
  }
  
  if (activeTeamId) {
    showTeamRoster(activeTeamId);
  }
}

function renderTeamTabs() {
  const tabsContainer = document.getElementById('teamTabs');
  tabsContainer.innerHTML = '';
  
  clubData.teams.forEach(team => {
    const fullName = getFullTeamName(team);
    const hasRoster = hasCompleteRoster(team);
    
    const tab = document.createElement('div');
    tab.className = `team-tab ${activeTeamId === team.id ? 'active' : ''} ${hasRoster ? 'complete' : ''}`;
    tab.textContent = fullName || `Team ${team.id}`;
    tab.onclick = () => showTeamRoster(team.id);
    tabsContainer.appendChild(tab);
  });
}

function hasCompleteRoster(team) {
  // SIMPLIFIED - now only requires head coach, players are optional
  const hasHeadCoach = team.staff?.[0]?.first && team.staff?.[0]?.last;
  return hasHeadCoach;
}

function showTeamRoster(teamId) {
  activeTeamId = teamId;
  const team = clubData.teams.find(t => t.id === teamId);
  if (!team) return;
  
  document.querySelectorAll('.team-tab').forEach((tab, idx) => {
    tab.classList.toggle('active', idx === clubData.teams.findIndex(t => t.id === teamId));
  });
  
  document.getElementById('activeRosterSection').style.display = 'block';
  
  loadTeamRoster(team);
}

function loadTeamRoster(team) {
  if (!team.players) team.players = [];
  if (!team.staff) team.staff = [];
  
  ensurePlayersRows(Math.max(DEFAULT_PLAYER_ROWS, team.players.length));
  
  team.players.forEach((player, idx) => {
    const rowIdx = idx + 1;
    const fields = ['jersey', 'first', 'last', 'height', 'position', 'email'];
    fields.forEach(field => {
      const input = document.querySelector(`input[name="player${rowIdx}_${field}"], select[name="player${rowIdx}_${field}"]`);
      if (input && player[field] !== undefined) {
        input.value = player[field];
      }
    });
  });
  
  const staffRoles = ['coach', 'asst1', 'asst2', 'asst3', 'gm'];
  staffRoles.forEach(role => {
    const fields = ['first', 'last', 'email', 'phone'];
    fields.forEach(field => {
      const input = document.querySelector(`input[name="${role}_${field}"]`);
      if (input) {
        input.value = '';
      }
    });
  });
  
  team.staff.forEach((staffMember, idx) => {
    if (idx < staffRoles.length) {
      const role = staffRoles[idx];
      const fields = ['first', 'last', 'email', 'phone'];
      fields.forEach(field => {
        const input = document.querySelector(`input[name="${role}_${field}"]`);
        if (input && staffMember[field] !== undefined) {
          input.value = staffMember[field];
        }
      });
    }
  });
  
  // Auto-apply GM from first team to other teams
  if (team.id > 1 && clubData.teams.length > 1) {
    const firstTeam = clubData.teams.find(t => t.id === 1);
    if (firstTeam && firstTeam.staff && firstTeam.staff.length >= 5) {
      const gmData = firstTeam.staff[4];
      if (gmData && (gmData.first || gmData.last)) {
        const gmFields = ['first', 'last', 'email', 'phone'];
        gmFields.forEach(field => {
          const input = document.querySelector(`input[name="gm_${field}"]`);
          if (input && gmData[field]) {
            input.value = gmData[field];
          }
        });
      }
    }
  }
  
  checkDuplicates();
  bumpRowCount();
}

function saveCurrentTeamRoster() {
  if (!activeTeamId) return;
  
  const team = clubData.teams.find(t => t.id === activeTeamId);
  if (!team) return;
  
  // Save players with enhanced data processing
  team.players = [];
  const rows = document.querySelectorAll('#playersTable tr').length;
  for (let i = 1; i <= rows; i++) {
    const jersey = normJersey(document.querySelector(`input[name="player${i}_jersey"]`)?.value || '');
    const first = ucName(document.querySelector(`input[name="player${i}_first"]`)?.value || '');
    const last = ucName(document.querySelector(`input[name="player${i}_last"]`)?.value || '');
    const height = normHeight(document.querySelector(`input[name="player${i}_height"]`)?.value || '');
    const position = document.querySelector(`select[name="player${i}_position"]`)?.value || '';
    const email = formatEmail(document.querySelector(`input[name="player${i}_email"]`)?.value || '');
    
    if (jersey || first || last || height || position || email) {
      team.players.push({
        jersey: jersey,
        first: first,
        last: last,
        height: height,
        position: position,
        email: email
      });
    }
  }
  
  // Sort players by jersey number
  team.players.sort((a, b) => {
    const aNum = parseInt(a.jersey, 10);
    const bNum = parseInt(b.jersey, 10);
    return aNum - bNum;
  });
  
  // Save staff with enhanced data processing
  team.staff = [];
  const staffRoles = [
    { key: 'coach', label: 'Head Coach' },
    { key: 'asst1', label: 'Assistant Coach 1' },
    { key: 'asst2', label: 'Assistant Coach 2' },
    { key: 'asst3', label: 'Assistant Coach 3' },
    { key: 'gm', label: 'General Manager' }
  ];
  
  staffRoles.forEach(role => {
    const first = ucName(document.querySelector(`input[name="${role.key}_first"]`)?.value || '');
    const last = ucName(document.querySelector(`input[name="${role.key}_last"]`)?.value || '');
    const email = formatEmail(document.querySelector(`input[name="${role.key}_email"]`)?.value || '');
    const phone = clean(document.querySelector(`input[name="${role.key}_phone"]`)?.value || '');
    
    if (first || last || email || phone) {
      team.staff.push({
        role: role.label,
        first: first,
        last: last,
        email: email,
        phone: phone
      });
    }
  });
  
  renderTeamTabs();
}

// === Enhanced Players Table Management ===
function playerRowTemplate(idx) {
  const sn = String(idx).padStart(2, '0');
  return `
    <tr data-player-row="${idx}">
      <td><input type="checkbox" class="player-select" data-player="${idx}" /></td>
      <td><strong>${sn}</strong></td>
      <td><input type="number" min="0" max="99" step="1" name="player${idx}_jersey" class="jersey-input" placeholder="#" inputmode="numeric" aria-label="Jersey number for player ${idx}" /></td>
      <td><input type="text" name="player${idx}_first" placeholder="First name" aria-label="First name for player ${idx}" /></td>
      <td><input type="text" name="player${idx}_last" placeholder="Last name" aria-label="Last name for player ${idx}" /></td>
      <td><input type="number" min="100" max="272" step="1" name="player${idx}_height" placeholder="CM" inputmode="numeric" class="jersey-input" aria-label="Height for player ${idx}" /></td>
      <td>
        <select name="player${idx}_position" aria-label="Position for player ${idx}">
          <option value="">-</option>
          <option value="G">G</option>
          <option value="F">F</option>
          <option value="C">C</option>
        </select>
      </td>
      <td><input type="email" name="player${idx}_email" placeholder="Email (optional)" aria-label="Email for player ${idx}" /></td>
    </tr>`;
}

function ensurePlayersRows(count) {
  const tbody = document.getElementById('playersTable');
  tbody.innerHTML = '';
  const n = Math.min(HARD_MAX_PLAYERS, Math.max(1, count|0));
  for (let i = 1; i <= n; i++) {
    tbody.insertAdjacentHTML('beforeend', playerRowTemplate(i));
  }
  hookDuplicateListeners();
  hookBulkSelectionListeners();
  hookEmailValidationListeners();
  hookHeightValidationListeners();
  bumpRowCount();
}

function addPlayersRow() {
  const tbody = document.getElementById('playersTable');
  const curr = document.querySelectorAll('#playersTable tr').length;
  if (curr >= HARD_MAX_PLAYERS) return;
  tbody.insertAdjacentHTML('beforeend', playerRowTemplate(curr + 1));
  hookDuplicateListeners();
  hookBulkSelectionListeners();
  hookEmailValidationListeners();
  hookHeightValidationListeners();
  bumpRowCount();
}

function removePlayersRow() {
  const tbody = document.getElementById('playersTable');
  const curr = document.querySelectorAll('#playersTable tr').length;
  if (curr <= 1) return;
  tbody.removeChild(tbody.lastElementChild);
  bumpRowCount();
  checkDuplicates();
  updateSelectAllState();
  saveCurrentTeamRoster();
}

function bumpRowCount() {
  const rows = document.querySelectorAll('#playersTable tr').length;
  document.getElementById('rowCountHelp').textContent = `${rows} rows (max ${HARD_MAX_PLAYERS})`;
}

// === Enhanced Email Validation for Players/Staff ===
function hookEmailValidationListeners() {
  // Player email validation
  document.querySelectorAll('input[name*="_email"]').forEach(input => {
    input.removeEventListener('blur', handleEmailBlur);
    input.addEventListener('blur', handleEmailBlur);
    
    input.removeEventListener('input', handleEmailInput);
    input.addEventListener('input', handleEmailInput);
  });
}

function hookHeightValidationListeners() {
  document.querySelectorAll('input[name*="_height"]').forEach(input => {
    input.removeEventListener('input', handleHeightInput);
    input.addEventListener('input', handleHeightInput);
    
    input.removeEventListener('blur', handleHeightBlur);
    input.addEventListener('blur', handleHeightBlur);
  });
}

function handleHeightInput(e) {
  // Allow typing but remove error styling
  e.target.classList.remove('input-error');
  e.target.removeAttribute('aria-invalid');
}

function handleHeightBlur(e) {
  if (validateHeightInput(e.target)) {
    saveCurrentTeamRoster();
  }
}

function handleEmailInput(e) {
  e.target.classList.remove('input-error');
  e.target.removeAttribute('aria-invalid');
  
  const emailWarn = document.getElementById('emailWarn');
  if (emailWarn) {
    emailWarn.style.display = 'none';
    emailWarn.textContent = '';
  }
}

function handleEmailBlur(e) {
  const email = e.target.value.trim();
  if (!email) return;
  
  const result = emailValid(email);
  if (!result.ok && result.suggestion) {
    const useCorrection = confirm(`Email typo detected!\n\nDid you mean: ${result.suggestion}?`);
    if (useCorrection) {
      e.target.value = result.suggestion;
      saveCurrentTeamRoster();
    } else {
      const emailWarn = document.getElementById('emailWarn');
      if (emailWarn) {
        emailWarn.textContent = `Email typo detected. Suggested: ${result.suggestion}`;
        emailWarn.style.display = 'block';
      }
      e.target.classList.add('input-error');
      e.target.setAttribute('aria-invalid', 'true');
    }
  } else if (!result.ok) {
    const emailWarn = document.getElementById('emailWarn');
    if (emailWarn) {
      emailWarn.textContent = 'Invalid email address detected.';
      emailWarn.style.display = 'block';
    }
    e.target.classList.add('input-error');
    e.target.setAttribute('aria-invalid', 'true');
  } else {
    // Valid email - save changes
    saveCurrentTeamRoster();
  }
}

// === Bulk Operations ===
function hookBulkSelectionListeners() {
  document.querySelectorAll('.player-select').forEach(checkbox => {
    checkbox.removeEventListener('change', handlePlayerSelectChange);
    checkbox.addEventListener('change', handlePlayerSelectChange);
  });
}

function handlePlayerSelectChange() {
  updateRowSelection(this);
  updateSelectAllState();
}

function updateRowSelection(checkbox) {
  const row = checkbox.closest('tr');
  if (checkbox.checked) {
    row.classList.add('selected-row');
  } else {
    row.classList.remove('selected-row');
  }
}

function updateSelectAllState() {
  const allCheckboxes = document.querySelectorAll('.player-select');
  const checkedBoxes = document.querySelectorAll('.player-select:checked');
  const selectAllBox = document.getElementById('selectAllPlayers');
  const statusSpan = document.getElementById('selectionCount');
  
  statusSpan.textContent = `${checkedBoxes.length} player${checkedBoxes.length !== 1 ? 's' : ''} selected`;
  
  if (checkedBoxes.length === 0) {
    selectAllBox.indeterminate = false;
    selectAllBox.checked = false;
  } else if (checkedBoxes.length === allCheckboxes.length) {
    selectAllBox.indeterminate = false;
    selectAllBox.checked = true;
  } else {
    selectAllBox.indeterminate = true;
    selectAllBox.checked = false;
  }
}

function toggleSelectAll() {
  const selectAll = document.getElementById('selectAllPlayers');
  const checkboxes = document.querySelectorAll('.player-select');
  
  checkboxes.forEach(checkbox => {
    checkbox.checked = selectAll.checked;
    updateRowSelection(checkbox);
  });
  
  updateSelectAllState();
}

function applyBulkPosition() {
  const selectedPosition = document.getElementById('bulkPosition').value;
  const selectedCheckboxes = document.querySelectorAll('.player-select:checked');
  
  if (selectedCheckboxes.length === 0) {
    alert('Please select at least one player first.');
    return;
  }
  
  if (!selectedPosition) {
    alert('Please select a position to apply.');
    return;
  }
  
  selectedCheckboxes.forEach(checkbox => {
    const playerNum = checkbox.dataset.player;
    const positionSelect = document.querySelector(`select[name="player${playerNum}_position"]`);
    if (positionSelect) {
      positionSelect.value = selectedPosition;
    }
  });
  
  document.getElementById('bulkPosition').value = '';
  saveCurrentTeamRoster();
  flashOk(`Applied ${selectedPosition} position to ${selectedCheckboxes.length} player(s).`);
}

function clearSelected() {
  document.querySelectorAll('.player-select:checked').forEach(checkbox => {
    checkbox.checked = false;
    updateRowSelection(checkbox);
  });
  updateSelectAllState();
}

// === Enhanced Duplicate Detection ===
let dupTimer;
function hookDuplicateListeners() {
  document.querySelectorAll('input[name*="_jersey"]').forEach(inp => {
    inp.removeEventListener('input', dupHandler);
    inp.addEventListener('input', dupHandler);
  });
}

function dupHandler() {
  window.clearTimeout(dupTimer);
  dupTimer = window.setTimeout(() => {
    checkDuplicates();
    saveCurrentTeamRoster();
  }, 350);
}

function checkDuplicates() {
  const jerseyInputs = document.querySelectorAll('input[name*="_jersey"]');
  const counts = {};
  
  jerseyInputs.forEach(inp => {
    const v = normJersey(inp.value);
    if (v) counts[v] = (counts[v] || 0) + 1;
  });
  
  let hasDup = false;
  jerseyInputs.forEach(inp => {
    const v = normJersey(inp.value);
    if (v && counts[v] > 1) { 
      inp.classList.add('duplicate'); 
      hasDup = true; 
    } else { 
      inp.classList.remove('duplicate'); 
    }
  });
  
  const warn = document.getElementById('dupWarn');
  if (hasDup) { 
    warn.style.display = 'block'; 
    warn.textContent = '⚠️ Duplicate jersey numbers detected. Each player must have a unique number.'; 
  } else { 
    warn.style.display = 'none'; 
    warn.textContent = ''; 
  }
}

