/* IBBA Club Multi-Team Roster Submission - Main Initialization */
/* Version 5.8.1 - NO MIN PLAYERS */

// === Event Listeners Setup ===
function setupEventListeners() {
  // Navigation
  document.getElementById('nextBtn').addEventListener('click', (e) => {
    e.preventDefault();
    nextStep();
  });
  document.getElementById('prevBtn').addEventListener('click', prevStep);
  
  // Team management
  document.getElementById('addTeamCard').addEventListener('click', addTeam);
  
  // Roster management
  document.getElementById('addRowBtn').addEventListener('click', addPlayersRow);
  document.getElementById('removeRowBtn').addEventListener('click', removePlayersRow);
  
  // Bulk operations
  document.getElementById('selectAllPlayers').addEventListener('change', toggleSelectAll);
  document.getElementById('applyBulkPosition').addEventListener('click', applyBulkPosition);
  document.getElementById('clearSelected').addEventListener('click', clearSelected);
  
  // Enhanced form field validation
  const submitterEmailField = document.getElementById('submitterEmail');
  submitterEmailField.addEventListener('input', () => clearFieldError(submitterEmailField, 'submitterEmailError'));
  submitterEmailField.addEventListener('blur', function() {
    const result = emailValid(this.value);
    if (!result.ok && !result.suggestion && this.value.trim()) {
      showFieldError(this, 'Please enter a valid email address.', 'submitterEmailError');
    }
  });
  
  // Clear field errors on input
  ['clubName', 'season', 'submitterName'].forEach(fieldId => {
    const field = document.getElementById(fieldId);
    if (field) {
      field.addEventListener('input', () => clearFieldError(field, fieldId + 'Error'));
    }
  });
  
  // Form controls
  document.getElementById('clearBtn').addEventListener('click', (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (!confirm('Clear all data and start over?')) return;
    
    const success = clearAllData();
    if (success) {
      flashOk('All data cleared successfully! Form is now empty.');
    } else {
      alert('Clear failed - check console for details');
    }
  });
  
  document.getElementById('newBtn').addEventListener('click', () => {
    const keepName = clubData.submitterName;
    const keepEmail = clubData.submitterEmail;
    
    clubData = {
      clubName: '',
      season: '',
      submitterName: keepName,
      submitterEmail: keepEmail,
      teams: []
    };
    
    activeTeamId = null;
    teamIdCounter = 1;
    currentStep = 1;
    
    document.getElementById('clubForm').reset();
    populateSeasonSelect();
    document.getElementById('submitterName').value = keepName;
    document.getElementById('submitterEmail').value = keepEmail;
    renderTeams();
    showStep(currentStep);
    updateProgress();
    
    ['dupWarn', 'emailWarn', 'okMsg', 'newBtn'].forEach(id => {
      const el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Reset submission state
    submissionState.isSubmitting = false;
    submissionState.lastSubmissionTime = 0;
    setupImprovedSubmissionHandler();
  });

  document.getElementById('saveBtn').addEventListener('click', saveDraft);
  document.getElementById('restoreBtn').addEventListener('click', restoreDraft);
  
  // Auto-save and validation on roster changes
  document.addEventListener('change', (e) => {
    if (currentStep === 3 && (
        e.target.matches('input[name*="player"]') ||
        e.target.matches('select[name*="player"]') ||
        e.target.matches('input[name*="coach"]') ||
        e.target.matches('input[name*="asst"]') ||
        e.target.matches('input[name*="gm"]')
    )) {
      clearTimeout(window.rosterUpdateTimeout);
      window.rosterUpdateTimeout = setTimeout(() => {
        saveCurrentTeamRoster();
        updateNextButtonState();
      }, 100);
    }
  });
  
  // Update button state on input changes
  document.addEventListener('input', (e) => {
    if (currentStep === 1 && e.target.matches('.form-step[data-step="1"] [required]')) {
      clearTimeout(window.buttonUpdateTimeout);
      window.buttonUpdateTimeout = setTimeout(updateNextButtonState, 150);
    }
  });
}

// === Initialize ===
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('versionBadge').textContent = `Version ${APP_VERSION}`;
  populateSeasonSelect();
  updateProgress();
  renderTeams();
  
  // Setup improved submission handler
  setupImprovedSubmissionHandler();
  setupEventListeners();
  
  // Initial validation state
  setTimeout(() => {
    updateNextButtonState();
  }, 100);
  
  console.log('IBBA Multi-Team Form - No minimum players requirement initialized');
});

