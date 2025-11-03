/* IBBA Club Multi-Team Roster Submission - Data Management & State */
/* Version 5.8.1 - NO MIN PLAYERS */

// === Global State ===
let clubData = {
  clubName: '',
  season: '',
  submitterName: '',
  submitterEmail: '',
  teams: [] // { id, nickname, ageGroup, league, venue, players: [], staff: [] }
};

let currentStep = 1;
let totalSteps = TOTAL_STEPS;
let activeTeamId = null;
let teamIdCounter = 1;

// === ENHANCED SUBMISSION PROTECTION GLOBALS ===
let submissionState = {
  isSubmitting: false,
  lastSubmissionTime: 0,
  submissionId: null
};

// === Utility Functions ===
function clean(s) { 
  return (s ?? '').toString().trim(); 
}

function ucWords(str="") { 
  return str.toLowerCase().replace(/\b\w/g, ch => ch.toUpperCase()); 
}

function properCase(str="") {
  // Split by spaces and process each word
  return str.split(' ').map(word => {
    // Handle empty strings
    if (!word) return word;
    
    // Check for all caps (like "URI") - convert to proper case
    if (word === word.toUpperCase() && word.length > 1) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // Check for mixed case (like "RoIZ") - convert to proper case
    const hasLowerCase = /[a-z]/.test(word);
    const hasUpperCase = /[A-Z]/.test(word);
    if (hasLowerCase && hasUpperCase) {
      return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
    }
    
    // Already properly formatted
    if (word.charAt(0) === word.charAt(0).toUpperCase() && 
        word.slice(1) === word.slice(1).toLowerCase()) {
      return word;
    }
    
    // Default: capitalize first letter, lowercase the rest
    return word.charAt(0).toUpperCase() + word.slice(1).toLowerCase();
  }).join(' ');
}

function ucName(s) { 
  return properCase(clean(s)); 
}

// === Translation Functions ===
function leagueToEnglish(h) {
  return LEAGUE_TRANSLATIONS[h] || 'Unknown League';
}

function ageGroupToEnglish(h) {
  return AGE_GROUP_TRANSLATIONS[h] || 'Unknown Age Group';
}

function positionToFullName(pos) {
  return POSITION_FULL_NAMES[pos] || pos;
}

function seasonLabel(fromYear) {
  const toYear = (fromYear + 1).toString().slice(-2);
  return `${fromYear}/${toYear}`;
}

// === Club Info Management ===
function saveClubInfo() {
  clubData.clubName = properCase(document.getElementById('clubName').value.trim());
  clubData.season = document.getElementById('season').value;
  clubData.submitterName = properCase(document.getElementById('submitterName').value.trim());
  clubData.submitterEmail = formatEmail(document.getElementById('submitterEmail').value.trim());
}

// === Draft Save/Restore ===
function saveDraft() {
  try {
    // Save current roster if in step 3
    if (currentStep === 3 && activeTeamId) {
      saveCurrentTeamRoster();
    }
    
    const draftData = {
      clubData,
      currentStep,
      activeTeamId,
      teamIdCounter,
      timestamp: Date.now()
    };
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draftData));
    flashOk('Draft saved successfully!');
    console.log('Draft saved to localStorage');
  } catch (e) {
    console.error('Failed to save draft:', e);
    alert('Failed to save draft. Your browser may not support localStorage or storage is full.');
  }
}

function restoreDraft() {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) {
      alert('No saved draft found.');
      return;
    }
    
    if (!confirm('Restore saved draft? This will replace current data.')) return;
    
    const draftData = JSON.parse(stored);
    clubData = draftData.clubData;
    currentStep = draftData.currentStep || 1;
    activeTeamId = draftData.activeTeamId || null;
    teamIdCounter = draftData.teamIdCounter || 1;
    
    // Restore form fields
    document.getElementById('clubName').value = clubData.clubName || '';
    document.getElementById('season').value = clubData.season || '';
    document.getElementById('submitterName').value = clubData.submitterName || '';
    document.getElementById('submitterEmail').value = clubData.submitterEmail || '';
    
    // Render teams and rosters
    renderTeams();
    updateRosterView();
    
    // Show the correct step
    showStep(currentStep);
    updateProgress();
    
    flashOk('Draft restored successfully!');
    console.log('Draft restored from localStorage');
  } catch (e) {
    console.error('Failed to restore draft:', e);
    alert('Failed to restore draft. The saved data may be corrupted.');
  }
}

function clearAllData() {
  try {
    // Reset state
    clubData = {
      clubName: '',
      season: '',
      submitterName: '',
      submitterEmail: '',
      teams: []
    };
    
    activeTeamId = null;
    teamIdCounter = 1;
    currentStep = 1;
    
    // Clear localStorage
    localStorage.removeItem(STORAGE_KEY);
    
    // Reset form
    document.getElementById('clubForm').reset();
    populateSeasonSelect();
    
    // Reset UI
    renderTeams();
    updateRosterView();
    showStep(1);
    updateProgress();
    
    // Hide messages
    ['dupWarn', 'emailWarn', 'okMsg', 'newBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    
    // Reset submission state
    submissionState.isSubmitting = false;
    submissionState.lastSubmissionTime = 0;
    submissionState.submissionId = null;
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    console.log('All data cleared');
    return true;
  } catch (e) {
    console.error('Failed to clear data:', e);
    return false;
  }
}

// === Season Population ===
function populateSeasonSelect() {
  const sel = document.getElementById('season');
  if (!sel) return;
  
  sel.innerHTML = '';
  const seasons = [CURRENT_SEASON_START_YEAR];
  const exposeNext = FORCE_EXPOSE_NEXT_SEASON || (new Date() >= SWITCHOVER_DATE);
  if (exposeNext) seasons.push(NEXT_SEASON_START_YEAR);
  
  for (const y of seasons) {
    const opt = document.createElement('option');
    opt.value = `${y}-${y + 1}`;
    opt.textContent = seasonLabel(y);
    sel.appendChild(opt);
  }
  
  // Set default value
  const defaultYear = exposeNext ? NEXT_SEASON_START_YEAR : CURRENT_SEASON_START_YEAR;
  sel.value = `${defaultYear}-${defaultYear + 1}`;
}

