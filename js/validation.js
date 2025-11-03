/* IBBA Club Multi-Team Roster Submission - Validation Functions */
/* Version 5.8.1 - NO MIN PLAYERS */

// === Jersey Number Normalization ===
function normJersey(val) {
  const j = String(val || '').trim();
  if (!j) return '';
  const parsed = parseInt(j, 10);
  if (!Number.isFinite(parsed) || parsed < 0 || parsed > 99) return '';
  return String(parsed);
}

// === Enhanced Email Validation & Typo Correction ===
function emailValid(email) {
  const e = (email || '').trim().toLowerCase();
  if (!e) return { ok: true };
  
  // Basic format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) return { ok: false };
  
  // Check for invalid patterns
  if (e.includes('..')) return { ok: false }; // Double dots anywhere
  if (e.includes('@.') || e.includes('.@')) return { ok: false }; // Dots adjacent to @
  if (e.startsWith('.') || e.endsWith('.')) return { ok: false }; // Starts or ends with dot
  if (e.includes('@-') || e.includes('-@')) return { ok: false }; // Hyphens adjacent to @
  
  // Split and validate parts
  const parts = e.split('@');
  if (parts.length !== 2) return { ok: false };
  
  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return { ok: false };
  
  // Validate domain part has proper TLD
  const domainParts = domainPart.split('.');
  if (domainParts.length < 2) return { ok: false };
  
  // Check for empty parts in domain
  for (let i = 0; i < domainParts.length; i++) {
    if (!domainParts[i] || domainParts[i].length === 0) return { ok: false };
  }
  
  // TLD should be at least 2 characters
  const tld = domainParts[domainParts.length - 1];
  if (tld.length < 2) return { ok: false };
  
  // Common typo corrections
  for (const k in EMAIL_TYPO_MAP) {
    if (e.includes(k)) return { ok: false, suggestion: e.replace(k, EMAIL_TYPO_MAP[k]) };
  }
  
  return { ok: true };
}

function formatEmail(email) {
  if (!email) return '';
  return email.trim().toLowerCase();
}

// === Enhanced Height Validation ===
function normHeight(val) {
  const h = parseInt(String(val).trim(), 10);
  if (!Number.isFinite(h)) return '';
  if (h < 100 || h > 272) return '';
  return String(h);
}

function validateHeightInput(input) {
  const value = input.value.trim();
  if (!value) return true; // Empty is OK
  
  const height = parseInt(value, 10);
  if (isNaN(height) || height < 100 || height > 272) {
    input.classList.add('input-error');
    input.setAttribute('aria-invalid', 'true');
    return false;
  } else {
    input.classList.remove('input-error');
    input.removeAttribute('aria-invalid');
    return true;
  }
}

// === Inline Error Helpers ===
function showFieldError(inputEl, msg, errorElId) {
  const box = document.getElementById(errorElId);
  if (box) {
    box.textContent = msg;
    box.style.display = 'block';
  }
  if (inputEl) {
    inputEl.classList.add('input-error');
    inputEl.setAttribute('aria-invalid', 'true');
  }
}

function clearFieldError(inputEl, errorElId) {
  const box = document.getElementById(errorElId);
  if (box) {
    box.textContent = '';
    box.style.display = 'none';
  }
  if (inputEl) {
    inputEl.classList.remove('input-error');
    inputEl.removeAttribute('aria-invalid');
  }
}

// === Form Step Validation ===
function validateCurrentStep() {
  if (currentStep === 1) {
    const clubNameField = document.getElementById('clubName');
    const seasonField = document.getElementById('season');
    const submitterNameField = document.getElementById('submitterName');
    const submitterEmailField = document.getElementById('submitterEmail');
    
    // Clear previous errors
    clearFieldError(clubNameField, 'clubNameError');
    clearFieldError(seasonField, 'seasonError');
    clearFieldError(submitterNameField, 'submitterNameError');
    clearFieldError(submitterEmailField, 'submitterEmailError');
    
    // Validate required fields
    if (!clubNameField.value.trim()) {
      showFieldError(clubNameField, 'Club name is required.', 'clubNameError');
      clubNameField.focus();
      return false;
    }
    
    if (!seasonField.value) {
      showFieldError(seasonField, 'Season selection is required.', 'seasonError');
      seasonField.focus();
      return false;
    }
    
    if (!submitterNameField.value.trim()) {
      showFieldError(submitterNameField, 'Your name is required.', 'submitterNameError');
      submitterNameField.focus();
      return false;
    }
    
    if (!submitterEmailField.value.trim()) {
      showFieldError(submitterEmailField, 'Your email is required.', 'submitterEmailError');
      submitterEmailField.focus();
      return false;
    }
    
    // Enhanced email validation with typo correction
    const emailResult = emailValid(submitterEmailField.value);
    if (!emailResult.ok && emailResult.suggestion) {
      const useCorrection = confirm(`Email typo detected!\n\nDid you mean: ${emailResult.suggestion}?`);
      if (useCorrection) {
        submitterEmailField.value = emailResult.suggestion;
      } else {
        showFieldError(submitterEmailField, `Please correct your email. Suggested: ${emailResult.suggestion}`, 'submitterEmailError');
        submitterEmailField.focus();
        return false;
      }
    } else if (!emailResult.ok) {
      showFieldError(submitterEmailField, 'Please enter a valid email address.', 'submitterEmailError');
      submitterEmailField.focus();
      return false;
    }
    
    saveClubInfo();
  } else if (currentStep === 2) {
    if (clubData.teams.length === 0) {
      alert('Please add at least one team before proceeding.');
      return false;
    }
    
    const incompleteTeams = clubData.teams.filter(team => !isTeamComplete(team));
    if (incompleteTeams.length > 0) {
      alert('Please complete all team information (age group and league are required) before proceeding.');
      return false;
    }
  } else if (currentStep === 3) {
    if (activeTeamId) {
      saveCurrentTeamRoster();
    }
    
    // SIMPLIFIED VALIDATION - REMOVED MINIMUM PLAYER REQUIREMENT
    const validationResults = validateAllTeamRosters();
    if (!validationResults.valid) {
      alert(validationResults.message);
      return false;
    }
  }
  
  return true;
}

// === Team Roster Validation ===
function validateAllTeamRosters() {
  for (const team of clubData.teams) {
    const teamName = getFullTeamName(team);
    
    // REMOVED MINIMUM PLAYER CHECK - teams can now have 0 players
    
    // Check for player completeness only if players exist
    if (team.players && team.players.length > 0) {
      const playerValidation = validatePlayersCompleteness(team);
      if (playerValidation) {
        return {
          valid: false,
          message: `${teamName}: ${playerValidation}`
        };
      }
      
      // Check for duplicate jerseys only if players exist
      const jerseys = team.players?.map(p => normJersey(p.jersey)).filter(Boolean) || [];
      const duplicates = jerseys.filter((jersey, index) => jerseys.indexOf(jersey) !== index);
      if (duplicates.length > 0) {
        return {
          valid: false,
          message: `${teamName} has duplicate jersey numbers: ${duplicates.join(', ')}`
        };
      }
    }
    
    // Check head coach (still required)
    const headCoachValidation = validateHeadCoach(team);
    if (headCoachValidation) {
      return {
        valid: false,
        message: `${teamName}: ${headCoachValidation}`
      };
    }
    
    // Check staff completeness
    const staffValidation = validateStaffCompleteness(team);
    if (staffValidation) {
      return {
        valid: false,
        message: `${teamName}: ${staffValidation}`
      };
    }
    
    // Validate all email addresses
    const emailValidation = validateAllEmails(team);
    if (emailValidation) {
      return {
        valid: false,
        message: `${teamName}: ${emailValidation}`
      };
    }
  }
  
  return { valid: true };
}

function validatePlayersCompleteness(team) {
  const players = team.players || [];
  for (let i = 0; i < players.length; i++) {
    const player = players[i];
    const hasAny = player.jersey || player.first || player.last || player.position || player.email || player.height;
    
    if (hasAny) {
      if (!normJersey(player.jersey)) return `Player ${i + 1} is missing jersey number`;
      if (!player.first?.trim()) return `Player ${i + 1} is missing first name`;
      if (!player.last?.trim()) return `Player ${i + 1} is missing last name`;
      if (!player.position) return `Player ${i + 1} is missing position`;
      
      // Validate height if provided
      if (player.height) {
        const height = parseInt(player.height, 10);
        if (isNaN(height) || height < 100 || height > 272) {
          return `Player ${i + 1} has invalid height (must be between 100-272 cm)`;
        }
      }
    }
  }
  return null;
}

function validateHeadCoach(team) {
  const staff = team.staff || [];
  const headCoach = staff[0]; // Head coach is always first
  
  if (!headCoach) return 'Head coach information is required';
  if (!headCoach.first?.trim()) return 'Head coach first name is required';
  if (!headCoach.last?.trim()) return 'Head coach last name is required';
  if (!headCoach.email?.trim()) return 'Head coach email is required';
  if (!headCoach.phone?.trim()) return 'Head coach phone is required';
  
  return null;
}

function validateStaffCompleteness(team) {
  const staff = team.staff || [];
  const roles = ['Head Coach', 'Assistant Coach 1', 'Assistant Coach 2', 'Assistant Coach 3', 'General Manager'];
  
  for (let i = 0; i < staff.length; i++) {
    const staffMember = staff[i];
    const roleName = roles[i] || `Staff member ${i + 1}`;
    
    if (i === 0) {
      // Head coach - all fields required
      if (!staffMember.first?.trim()) return `${roleName} first name is required`;
      if (!staffMember.last?.trim()) return `${roleName} last name is required`;
      if (!staffMember.email?.trim()) return `${roleName} email is required`;
      if (!staffMember.phone?.trim()) return `${roleName} phone is required`;
    } else {
      // Other staff - if first name is filled, all fields required
      if (staffMember.first?.trim()) {
        if (!staffMember.last?.trim()) return `${roleName} last name is required when first name is entered`;
        if (!staffMember.email?.trim()) return `${roleName} email is required when first name is entered`;
        if (!staffMember.phone?.trim()) return `${roleName} phone is required when first name is entered`;
      }
    }
  }
  
  return null;
}

function validateAllEmails(team) {
  // Check player emails
  const players = team.players || [];
  for (let i = 0; i < players.length; i++) {
    const email = players[i].email?.trim();
    if (email) {
      const result = emailValid(email);
      if (!result.ok) {
        return `Player ${i + 1} has invalid email address`;
      }
    }
  }
  
  // Check staff emails
  const staff = team.staff || [];
  const roleNames = ['Head Coach', 'Assistant Coach 1', 'Assistant Coach 2', 'Assistant Coach 3', 'General Manager'];
  
  for (let i = 0; i < staff.length; i++) {
    const email = staff[i].email?.trim();
    if (email) {
      const result = emailValid(email);
      if (!result.ok) {
        return `${roleNames[i] || 'Staff member'} has invalid email address`;
      }
    }
  }
  
  return null;
}

