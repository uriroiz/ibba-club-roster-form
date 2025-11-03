/* IBBA Club Multi-Team Roster Submission - Form Handling & Navigation */
/* Version 5.8.1 - NO MIN PLAYERS */

// === Form Navigation ===
function nextStep() {
  if (!validateCurrentStep()) return;
  
  if (currentStep < totalSteps) {
    currentStep++;
    showStep(currentStep);
    updateProgress();
  }
}

function prevStep() {
  if (currentStep > 1) {
    currentStep--;
    showStep(currentStep);
    updateProgress();
  }
}

// === ENHANCED MODAL FUNCTIONS ===
function showFullScreenModal(content) {
  // Remove any existing modal
  hideEnhancedModal();
  
  const overlay = document.createElement('div');
  overlay.id = 'enhanced-submission-overlay';
  overlay.className = 'submission-overlay';
  overlay.style.cssText = `
    position: fixed; top: 0; left: 0; width: 100%; height: 100%;
    background: rgba(0,0,0,0.8); z-index: 10000; display: flex;
    justify-content: center; align-items: center;
  `;
  
  const modal = document.createElement('div');
  modal.className = 'submission-modal';
  modal.style.cssText = `
    background: white; padding: 40px; border-radius: 16px; text-align: center;
    max-width: 500px; margin: 20px; box-shadow: 0 20px 60px rgba(0,0,0,0.3);
    animation: modalAppear 0.3s ease-out;
  `;
  modal.innerHTML = content;
  
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden'; // Prevent scrolling
  
  // Prevent modal from being closed by clicking outside
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) {
      e.preventDefault();
      e.stopPropagation();
    }
  });
}

function hideEnhancedModal() {
  const overlay = document.getElementById('enhanced-submission-overlay');
  if (overlay) {
    overlay.style.opacity = '0';
    setTimeout(() => {
      overlay.remove();
      document.body.style.overflow = ''; // Restore scrolling
    }, 300);
  }
}

function showSubmittingModal() {
  showFullScreenModal(`
    <div style="width: 60px; height: 60px; border: 4px solid #e5e7eb; border-top-color: #3b82f6; border-radius: 50%; animation: spin 1s linear infinite; margin: 20px auto;"></div>
    <h2 style="margin: 0 0 20px; color: #1f2937; font-size: 1.8rem;">Submitting Multi-Team Rosters...</h2>
    <p style="margin: 10px 0; color: #374151; line-height: 1.5;"><strong>Please wait - do not close this page or navigate away.</strong></p>
    <p style="margin: 10px 0; color: #374151; line-height: 1.5;">We're processing your ${clubData.teams.length} team roster${clubData.teams.length !== 1 ? 's' : ''} and sending confirmation emails.</p>
    <p style="margin: 10px 0; color: #374151; line-height: 1.5;">This usually takes 15-30 seconds for multi-team submissions.</p>
  `);
}

function showSuccessModal() {
  showFullScreenModal(`
    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: #10b981; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem; font-weight: bold; animation: pulse 2s infinite;">✓</div>
    <h2 style="margin: 0 0 20px; color: #10b981; font-size: 1.8rem;">Multi-Team Rosters Submitted Successfully!</h2>
    <p style="margin: 10px 0; color: #374151; line-height: 1.5;"><strong>Your IBBA club's ${clubData.teams.length} team roster${clubData.teams.length !== 1 ? 's have' : ' has'} been submitted.</strong></p>
    <p style="margin: 10px 0; color: #374151; line-height: 1.5;">• CSV file downloaded to your device<br>
       • Data saved to IBBA system<br>
       • All roster information processed</p>
    <div style="margin: 20px 0; padding: 16px; background: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; color: #166534;">
      <strong>Next Steps:</strong><br>
      Keep the CSV file as your official roster records for all teams.
    </div>
    <button type="button" onclick="window.location.href='https://www.pixellot.tv'" style="margin-top: 20px; padding: 12px 18px; background: #3b82f6; color: white; border: none; border-radius: 10px; font-weight: 800; cursor: pointer;">
      Return to Main Page
    </button>
  `);
}

function showErrorModal(message) {
  showFullScreenModal(`
    <div style="width: 80px; height: 80px; margin: 0 auto 20px; background: #ef4444; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-size: 2.5rem;">!</div>
    <h2 style="color: #ef4444; margin: 0 0 20px; font-size: 1.8rem;">Multi-Team Submission Issue</h2>
    <p style="margin: 10px 0; color: #374151; line-height: 1.5;"><strong>There was a problem with the email system.</strong></p>
    <p style="margin: 10px 0; color: #374151; line-height: 1.5;">${message}</p>
    <div style="margin: 20px 0; padding: 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b;">
      <strong>Your CSV file has been downloaded.</strong><br>
      Please email it manually to: <strong>pixellotibba@gmail.com</strong>
    </div>
    <button type="button" onclick="window.location.href='https://www.pixellot.tv'" style="margin-top: 20px; padding: 12px 18px; background: #3b82f6; color: white; border: none; border-radius: 10px; font-weight: 800; cursor: pointer;">
      Return to Main Page
    </button>
  `);
}

// === MAIN SUBMISSION PROCESS ===
async function processSubmission() {
  try {
    console.log('📋 Processing multi-team submission...');
    
    // Enhanced validation logic for multi-team
    const submitEmail = clubData.submitterEmail;
    if (submitEmail) {
      const { ok: okEmail, suggestion } = emailValid(submitEmail);
      if (!okEmail && suggestion) {
        const use = confirm('Did you mean "' + suggestion + '" ?');
        if (use) {
          document.getElementById('submitterEmail').value = suggestion;
          clubData.submitterEmail = suggestion;
        } else {
          throw new Error('Email validation failed');
        }
      } else if (!okEmail) {
        throw new Error('Invalid email address');
      }
    }
    
    const submissionData = buildSubmissionData();

    // Derive season label and a clear, descriptive subject
    const seasonStartYear = parseInt(submissionData.season.split('-')[0], 10);
    const seasonShort = seasonLabel(seasonStartYear);
    const emailSubject = `IBBA Roster: ${submissionData.clubName} (${seasonShort}) – Multi-Team`;

    const submissionParams = {
      submission_id: submissionState.submissionId,
      club_name: submissionData.clubName,
      season: submissionData.season,
      season_label: seasonShort,
      submitter_name: submissionData.submitterName,
      submitter_email: submissionData.submitterEmail,
      total_teams: submissionData.teams.length,
      total_players: submissionData.teams.reduce((sum, team) => sum + team.players.length, 0),
      roster_data: buildSubmissionSummary(submissionData),
      timestamp: new Date().toISOString(),

      // Populate legacy single-team placeholders so existing templates render correct subjects
      team_name: submissionData.clubName,
      league: seasonShort,

      // Optional: some EmailJS templates support {{subject}}
      subject: emailSubject
    };

    // 🟢 STEP 1: DOWNLOAD CSV FIRST (CRITICAL - MUST SUCCEED)
    console.log('📁 Generating CSV files...');
    try {
      downloadCSV(submissionData);
      await delay(1500);
      console.log('✅ CSV downloaded successfully to user device');
    } catch (csvError) {
      console.error('💥 CSV download failed:', csvError);
      throw new Error('Could not generate CSV file for download. This is critical.');
    }

    // 🟡 STEP 2: SEND EMAIL (NON-CRITICAL - WARN IF FAILS BUT CONTINUE)
    console.log('📧 Sending multi-team confirmation email...');
    let emailSuccess = false;
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 25000); // 25 second timeout for multi-team

      try {
        const isMulti = submissionData.teams.length > 1;
        await sendEmailViaAPI(
          submissionParams,
          {
            signal: controller.signal,
            templateId: isMulti ? EmailJSConfig.templateIdMulti : EmailJSConfig.templateIdSingle
          }
        );
        console.log('✅ Email sent successfully');
        emailSuccess = true;
      } finally {
        clearTimeout(timeout);
      }
    } catch (emailError) {
      console.error('❌ EMAIL SEND FAILED:', emailError);
      console.error('❌ Error Details:', {
        name: emailError.name,
        message: emailError.message,
        stack: emailError.stack
      });
      alert(`⚠️ Email notification failed, but your CSV was saved!\n\nError: ${emailError.message}\n\nPlease check the browser console (F12) for details.`);
      // Don't throw - email failure is not critical since CSV was saved
    }
    
    if (!emailSuccess) {
      console.warn('⚠️ Proceeding without email notification. CSV was saved successfully.');
    }

    // 🟡 STEP 3: SAVE DATA TO SHEET (NON-CRITICAL - WARN IF FAILS BUT CONTINUE)
    console.log('💾 Saving all team data to backup sheet...');
    try {
      await sendToSheet(submissionData);
      console.log('✅ Data saved to backup sheet successfully');
    } catch (sheetError) {
      console.warn('⚠️ Sheet save failed (non-critical), but CSV was successfully downloaded:', sheetError);
      // Don't throw - sheet failure is not critical since CSV was saved
    }

    // Success - CSV was definitely downloaded
    console.log('✅ Multi-team submission completed successfully');
    showSubmissionSuccess();

  } catch (error) {
    console.error('💥 Multi-team process failed:', error);
    throw error;
  }
}

// === SUCCESS AND ERROR HANDLING ===
function showSubmissionSuccess() {
  hideEnhancedModal();
  unlockUI();
  
  const ok = document.getElementById('okMsg');
  ok.textContent = `✅ All ${clubData.teams.length} team rosters submitted successfully! Email sent and CSV downloaded.`;
  ok.style.display = 'block';
  document.getElementById('newBtn').style.display = 'inline-block';
  
  // Keep submit button in success state
  const submitBtn = document.getElementById('submitBtn');
  submitBtn.classList.remove('btn-submitting');
  submitBtn.classList.add('btn-success');
  submitBtn.innerHTML = '✅ Successfully Submitted';
  submitBtn.disabled = true; // Keep disabled to prevent resubmission
  
  // Show success modal
  showSuccessModal();
}

function handleSubmissionError(error) {
  hideEnhancedModal();
  unlockUI();
  
  submissionState.isSubmitting = false; // Allow retry on error
  
  // Show error modal with updated message
  showErrorModal('Your roster data should have been downloaded to your computer. If the download did not appear, try again. The email notification system may be temporarily unavailable.');
  
  console.error('Multi-team submission error details:', {
    submissionId: submissionState.submissionId,
    error: error,
    timestamp: new Date().toISOString(),
    teamsCount: clubData.teams.length
  });
}

// === ENHANCED EMAIL API ===
async function sendEmailViaAPI(params, options) {
  const url = 'https://api.emailjs.com/api/v1.0/email/send';
  
  const payload = {
    service_id: EmailJSConfig.serviceId,
    template_id: options?.templateId || EmailJSConfig.templateIdSingle,
    user_id: EmailJSConfig.publicKey,
    template_params: params
  };

  // Enhanced logging for debugging
  console.log('=== EmailJS Request Debug ===');
  console.log('📧 URL:', url);
  console.log('📧 Service ID:', EmailJSConfig.serviceId);
  console.log('📧 Template ID:', options?.templateId || EmailJSConfig.templateIdSingle);
  console.log('📧 User ID (Public Key):', EmailJSConfig.publicKey);
  console.log('📧 Submission ID:', params.submission_id);
  console.log('📧 Template Params Keys:', Object.keys(params));
  console.log('📧 Full Payload:', JSON.stringify(payload, null, 2));
  console.log('============================');

  const requestOptions = {
    method: 'POST',
    headers: { 
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(payload)
  };
  
  if (options?.signal) {
    requestOptions.signal = options.signal;
  }
  
  console.log('📧 Sending email request...');
  
  try {
    const response = await fetch(url, requestOptions);
    
    console.log('📧 Response Status:', response.status);
    console.log('📧 Response OK:', response.ok);
    
    if (!response.ok) {
      const errorText = await response.text().catch(() => 'Unknown error');
      console.error('❌ Email API Error Response:', errorText);
      throw new Error(`Email API failed (${response.status}): ${errorText}`);
    }
    
    const responseData = await response.text();
    console.log('✅ Email API Success Response:', responseData);
    
    return response;
  } catch (error) {
    console.error('❌ Email API Exception:', error);
    console.error('❌ Error Name:', error.name);
    console.error('❌ Error Message:', error.message);
    console.error('❌ Error Stack:', error.stack);
    throw error;
  }
}

// === Data Sink ===
async function sendToSheet(submissionData) {
  if (!DATA_SINK_URL) return true;
  
  const url = DATA_SINK_URL + '?key=' + encodeURIComponent(DATA_SINK_KEY);
  const payload = {
    app_version: APP_VERSION,
    build_date: BUILD_DATE,
    club_name: submissionData.clubName,
    season: submissionData.season,
    submitter_name: submissionData.submitterName,
    submitter_email: submissionData.submitterEmail,
    teams: submissionData.teams,
    total_teams: submissionData.teams.length,
    total_players: submissionData.teams.reduce((sum, team) => sum + team.players.length, 0),
    submission_type: 'multi_team'
  };
  
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      await fetch(url, {
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(payload)
      });
      return true;
    } catch (error) {
      if (attempt === 3) throw error;
      await new Promise(resolve => setTimeout(resolve, 400 * attempt));
    }
  }
}

// === IMPROVED SUBMISSION HANDLER ===
function setupImprovedSubmissionHandler() {
  const form = document.getElementById('clubForm');
  
  // Remove existing listeners by cloning the form
  const newForm = form.cloneNode(true);
  form.parentNode.replaceChild(newForm, form);
  
  // Add new, improved handler
  document.getElementById('clubForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    e.stopPropagation();
    
    console.log('Multi-team submit attempt at:', new Date().toISOString());
    
    // IMMEDIATE PREVENTION CHECKS
    const now = Date.now();
    
    if (submissionState.isSubmitting) {
      console.log('Already submitting, blocked');
      showQuickMessage('Multi-team submission already in progress!', 'warning');
      return false;
    }
    
    if (now - submissionState.lastSubmissionTime < MIN_SUBMISSION_INTERVAL) {
      const waitTime = Math.ceil((MIN_SUBMISSION_INTERVAL - (now - submissionState.lastSubmissionTime)) / 1000);
      console.log(`Too soon, blocked. Wait ${waitTime} seconds`);
      showQuickMessage(`Please wait ${waitTime} more seconds before submitting again.`, 'warning');
      return false;
    }
    
    // SET STATE IMMEDIATELY
    submissionState.isSubmitting = true;
    submissionState.lastSubmissionTime = now;
    submissionState.submissionId = generateSubmissionId();
    
    console.log('Multi-team submission started with ID:', submissionState.submissionId);
    
    // IMMEDIATE UI LOCKDOWN
    lockdownUI();
    showSubmittingModal();
    
    try {
      await processSubmission();
    } catch (error) {
      console.error('Multi-team submission failed:', error);
      handleSubmissionError(error);
    } finally {
      // Only reset state on completion or error
      setTimeout(() => {
        submissionState.isSubmitting = false;
      }, 5000); // Keep locked for 5 more seconds after completion
    }
  });
}

