/* IBBA Club Multi-Team Roster Submission - UI Updates & Rendering */
/* Version 5.8.1 - NO MIN PLAYERS */

// === Enhanced Multi-Step Navigation ===
function updateProgress() {
  const progress = (currentStep / totalSteps) * 100;
  document.getElementById('progressFill').style.width = progress + '%';
  
  document.querySelectorAll('.step').forEach((step, index) => {
    const stepNum = index + 1;
    step.classList.remove('active', 'completed', 'pending');
    
    if (stepNum < currentStep) {
      step.classList.add('completed');
      step.querySelector('.step-circle').textContent = '✓';
    } else if (stepNum === currentStep) {
      step.classList.add('active');
      step.querySelector('.step-circle').textContent = stepNum;
    } else {
      step.classList.add('pending');
      step.querySelector('.step-circle').textContent = stepNum;
    }
  });
}

function showStep(step) {
  document.querySelectorAll('.form-step').forEach(el => el.classList.remove('active'));
  document.querySelector(`.form-step[data-step="${step}"]`).classList.add('active');
  
  const prevBtn = document.getElementById('prevBtn');
  const nextBtn = document.getElementById('nextBtn');
  const submitBtn = document.getElementById('submitBtn');
  
  prevBtn.style.display = step > 1 ? 'block' : 'none';
  nextBtn.style.display = step < totalSteps ? 'block' : 'none';
  submitBtn.style.display = step === totalSteps ? 'block' : 'none';
  
  updateNextButtonState();
  
  window.scrollTo({ top: 0, behavior: 'smooth' });
  
  if (step === 3) {
    updateRosterView();
  } else if (step === 4) {
    updateReviewContent();
  }
}

function updateNextButtonState() {
  const nextBtn = document.getElementById('nextBtn');
  if (!nextBtn || nextBtn.style.display === 'none') return;
  
  let canProceed = false;
  let reasonText = '';
  
  if (currentStep === 1) {
    const clubName = document.getElementById('clubName').value.trim();
    const season = document.getElementById('season').value;
    const submitterName = document.getElementById('submitterName').value.trim();
    const submitterEmail = document.getElementById('submitterEmail').value.trim();
    
    const hasAllFields = clubName && season && submitterName && submitterEmail;
    const emailResult = emailValid(submitterEmail);
    
    canProceed = hasAllFields && emailResult.ok;
    
    if (!clubName) reasonText = 'Enter club name';
    else if (!season) reasonText = 'Select season';
    else if (!submitterName) reasonText = 'Enter your name';
    else if (!submitterEmail) reasonText = 'Enter your email';
    else if (!emailResult.ok) reasonText = 'Enter valid email';
    
  } else if (currentStep === 2) {
    const hasTeams = clubData.teams.length > 0;
    const allTeamsComplete = clubData.teams.every(team => isTeamComplete(team));
    
    canProceed = hasTeams && allTeamsComplete;
    
    if (!hasTeams) {
      reasonText = 'Add at least one team';
    } else if (!allTeamsComplete) {
      const incompleteCount = clubData.teams.filter(t => !isTeamComplete(t)).length;
      reasonText = `Complete age group and league for ${incompleteCount} team(s)`;
    }
  } else if (currentStep === 3) {
    if (activeTeamId) {
      saveCurrentTeamRoster();
    }
    
    // REMOVED MINIMUM PLAYER REQUIREMENT
    // Now check only for head coach requirement
    const incompleteTeams = [];
    clubData.teams.forEach(team => {
      const hasHeadCoach = team.staff?.[0]?.first && team.staff?.[0]?.last;
      
      if (!hasHeadCoach) {
        incompleteTeams.push(team);
      }
    });
    
    canProceed = incompleteTeams.length === 0;
    
    if (!canProceed) {
      reasonText = `${incompleteTeams.length} team(s) need head coach information`;
    }
  }
  
  if (canProceed) {
    nextBtn.disabled = false;
    nextBtn.textContent = 'Next →';
    nextBtn.style.opacity = '1';
    nextBtn.style.cursor = 'pointer';
    nextBtn.title = '';
    nextBtn.classList.remove('btn-outline');
    nextBtn.classList.add('btn-primary');
  } else {
    nextBtn.disabled = true;
    nextBtn.textContent = reasonText ? `Next → (${reasonText})` : 'Next →';
    nextBtn.style.opacity = '0.6';
    nextBtn.style.cursor = 'not-allowed';
    nextBtn.title = reasonText;
    nextBtn.classList.remove('btn-primary');
    nextBtn.classList.add('btn-outline');
  }
}

// === Enhanced Review Content ===
function updateReviewContent() {
  let html = '<div class="overview-grid">';
  
  // Club overview
  html += '<div class="overview-card">';
  html += '<h3>🏆 Club Information</h3>';
  html += `<p><strong>Club:</strong> ${clubData.clubName}</p>`;
  html += `<p><strong>Season:</strong> ${seasonLabel(parseInt(clubData.season.split('-')[0], 10))}</p>`;
  html += `<p><strong>Submitted by:</strong> ${clubData.submitterName}</p>`;
  html += `<p><strong>Email:</strong> ${clubData.submitterEmail}</p>`;
  html += '</div>';
  
  // Teams overview
  html += '<div class="overview-card">';
  html += `<h3>👥 Teams (${clubData.teams.length})</h3>`;
  html += '<div class="overview-stats">';
  const completeTeams = clubData.teams.filter(hasCompleteRoster).length;
  html += `<div class="stat"><div class="stat-number">${completeTeams}</div><div class="stat-label">Complete</div></div>`;
  html += `<div class="stat"><div class="stat-number">${clubData.teams.length - completeTeams}</div><div class="stat-label">Incomplete</div></div>`;
  const totalPlayers = clubData.teams.reduce((sum, team) => sum + (team.players?.filter(p => p.jersey && p.first && p.last).length || 0), 0);
  html += `<div class="stat"><div class="stat-number">${totalPlayers}</div><div class="stat-label">Total Players</div></div>`;
  html += '</div>';
  html += '</div>';
  
  html += '</div>';
  
  // Detailed team breakdown
  clubData.teams.forEach(team => {
    const fullName = getFullTeamName(team);
    const completePlayers = team.players?.filter(p => p.jersey && p.first && p.last && p.position) || [];
    const completeStaff = team.staff?.filter(s => s.first && s.last) || [];
    
    html += '<div class="overview-card">';
    html += `<h3>🏀 ${fullName}</h3>`;
    if (team.nickname && team.nickname.trim()) {
      html += `<p><strong>Nickname:</strong> ${team.nickname}</p>`;
    }
    if (team.venue && team.venue.trim()) {
      html += `<p><strong>Venue:</strong> ${team.venue}</p>`;
    }
    html += `<p><strong>Age Group:</strong> ${team.ageGroup} (${ageGroupToEnglish(team.ageGroup)})</p>`;
    html += `<p><strong>League:</strong> ${team.league} (${leagueToEnglish(team.league)})</p>`;
    
    html += '<div class="overview-stats">';
    html += `<div class="stat"><div class="stat-number">${completePlayers.length}</div><div class="stat-label">Players</div></div>`;
    html += `<div class="stat"><div class="stat-number">${completeStaff.length}</div><div class="stat-label">Staff</div></div>`;
    html += '</div>';
    
    if (completePlayers.length > 0) {
      html += '<h4>Players:</h4><ul style="margin: 0; padding-left: 20px; font-size: 14px;">';
      completePlayers.forEach(p => {
        const heightText = p.height ? ` | Height: ${p.height}cm` : '';
        const emailText = p.email ? ` | ${p.email}` : '';
        html += `<li>#${p.jersey} ${p.first} ${p.last} (${positionToFullName(p.position)})${heightText}${emailText}</li>`;
      });
      html += '</ul>';
    } else {
      html += '<p style="color: #64748b; font-weight: 400;">📝 No players added yet (can submit with 0 players)</p>';
    }
    
    if (completeStaff.length > 0) {
      html += '<h4>Staff:</h4><ul style="margin: 8px 0 0 20px; padding-left: 20px; font-size: 14px;">';
      completeStaff.forEach(s => {
        const emailText = s.email ? ` | ${s.email}` : '';
        const phoneText = s.phone ? ` | ${s.phone}` : '';
        html += `<li><strong>${s.role}:</strong> ${s.first} ${s.last}${emailText}${phoneText}</li>`;
      });
      html += '</ul>';
    } else {
      html += '<p style="color: #ef4444; font-weight: 600;">⚠️ No coaching staff added</p>';
    }
    
    html += '</div>';
  });
  
  document.getElementById('reviewContent').innerHTML = html;
}

// === Flash Messages ===
function flashOk(msg) { 
  const el = document.getElementById('okMsg'); 
  el.textContent = `✅ ${msg}`; 
  el.style.display = 'block'; 
  setTimeout(() => el.style.display = 'none', 3000); 
}

function showQuickMessage(message, type = 'info') {
  // Show a quick toast message
  const toast = document.createElement('div');
  toast.className = 'quick-message ' + type;
  toast.textContent = message;
  document.body.appendChild(toast);
  
  setTimeout(() => {
    toast.style.opacity = '0';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

// === UI LOCKDOWN FUNCTIONS ===
function lockdownUI() {
  const form = document.getElementById('clubForm');
  const container = document.querySelector('.container');
  const submitBtn = document.getElementById('submitBtn');
  
  // Lock entire form
  form.classList.add('form-submitting');
  container.style.pointerEvents = 'none';
  
  // Lock submit button specifically
  submitBtn.disabled = true;
  submitBtn.classList.add('btn-submitting');
  submitBtn.innerHTML = '<span>Submitting...</span>';
  
  // Disable all form inputs
  const inputs = form.querySelectorAll('input, select, button, textarea');
  inputs.forEach(input => {
    input.disabled = true;
    input.style.pointerEvents = 'none';
  });
  
  // Prevent browser navigation
  window.addEventListener('beforeunload', preventNavigation);
  
  console.log('UI LOCKED - form submission in progress');
}

function unlockUI() {
  const form = document.getElementById('clubForm');
  const container = document.querySelector('.container');
  const submitBtn = document.getElementById('submitBtn');
  
  // Unlock form
  form.classList.remove('form-submitting');
  container.style.pointerEvents = '';
  
  // Restore submit button
  submitBtn.disabled = false;
  submitBtn.classList.remove('btn-submitting');
  submitBtn.textContent = 'Submit Form';
  
  // Re-enable form inputs
  const inputs = form.querySelectorAll('input, select, button, textarea');
  inputs.forEach(input => {
    input.disabled = false;
    input.style.pointerEvents = '';
  });
  
  // Remove navigation prevention
  window.removeEventListener('beforeunload', preventNavigation);
  
  console.log('UI UNLOCKED - submission complete/failed');
}

function preventNavigation(e) {
  e.preventDefault();
  e.returnValue = 'Form submission in progress. Do not navigate away!';
  return e.returnValue;
}

