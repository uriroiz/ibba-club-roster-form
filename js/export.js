/* IBBA Club Multi-Team Roster Submission - Data Export & CSV Generation */
/* Version 5.8.1 - NO MIN PLAYERS */

// === Enhanced Data Export & Processing ===
function buildSubmissionData() {
  return {
    clubName: clubData.clubName,
    season: clubData.season,
    submitterName: clubData.submitterName,
    submitterEmail: clubData.submitterEmail,
    teams: clubData.teams.map(team => ({
      nickname: team.nickname || '',
      fullName: getFullTeamName(team),
      venue: team.venue || '',
      ageGroup: team.ageGroup,
      ageGroupEnglish: ageGroupToEnglish(team.ageGroup),
      league: team.league,
      leagueEnglish: leagueToEnglish(team.league),
      players: team.players?.filter(p => p.jersey && p.first && p.last && p.position).map(p => ({
        jersey: p.jersey,
        firstName: p.first,
        lastName: p.last,
        height: p.height || '',
        position: p.position,
        email: p.email || ''
      })) || [],
      staff: team.staff?.filter(s => s.first || s.last).map(s => ({
        role: s.role,
        firstName: s.first || '',
        lastName: s.last || '',
        email: s.email || '',
        phone: s.phone || ''
      })) || []
    }))
  };
}

function buildSubmissionSummary(data) {
  let summary = '';
  summary += 'IBBA MULTI-TEAM ROSTER SUBMISSION\n';
  summary += '===================================\n\n';
  summary += `Club: ${data.clubName}\n`;
  summary += `Season: ${data.season}\n`;
  summary += `Submitted by: ${data.submitterName}\n`;
  summary += `Email: ${data.submitterEmail}\n`;
  summary += `Date: ${new Date().toLocaleString()}\n`;
  summary += `Version: ${APP_VERSION}\n`;
  summary += `Total Teams: ${data.teams.length}\n`;
  summary += `Total Players: ${data.teams.reduce((sum, team) => sum + team.players.length, 0)}\n\n`;
  
  data.teams.forEach((team, idx) => {
    summary += `TEAM ${idx + 1}: ${team.fullName}\n`;
    if (team.nickname && team.nickname.trim()) {
      summary += `Nickname: ${team.nickname}\n`;
    }
    if (team.venue && team.venue.trim()) {
      summary += `Venue: ${team.venue}\n`;
    }
    summary += `Age Group: ${team.ageGroupEnglish}\n`;
    summary += `League: ${team.leagueEnglish}\n`;
    summary += `Players: ${team.players.length}\n`;
    summary += `Staff: ${team.staff.length}\n\n`;
    
    if (team.players.length > 0) {
      summary += 'CSV FORMAT FOR COPYING:\n';
      summary += '=======================\n';
      team.players.forEach(p => {
        const email = p.email || '';
        summary += `${p.jersey},${p.firstName},${p.lastName},${email},${p.position}\n`;
      });
      summary += '\n';
      
      summary += `PLAYERS (${team.players.length}) - Sorted by Jersey Number:\n`;
      summary += '------------------------------------------------------------\n';
      team.players.forEach(p => {
        const heightText = p.height ? ` | Height: ${p.height}` : '';
        const emailText = p.email ? ` | Email: ${p.email}` : '';
        summary += `#${p.jersey} - Name: ${p.firstName} ${p.lastName} | Position: ${positionToFullName(p.position)}${heightText}${emailText}\n`;
      });
      summary += '\n';
    }
    
    if (team.staff.length > 0) {
      summary += 'COACHING STAFF:\n';
      summary += '----------------------------\n';
      team.staff.forEach(s => {
        const emailText = s.email ? ` | ${s.email}` : '';
        const phoneText = s.phone ? ` | ${s.phone}` : '';
        summary += `${s.role}: ${s.firstName} ${s.lastName}${emailText}${phoneText}\n`;
      });
      summary += '\n';
    }
    
    summary += '---\n\n';
  });
  
  return summary;
}

function downloadCSV(data) {
  const BOM = '\uFEFF';
  let csv = `IBBA Multi-Team Roster Submission - Pixellot Advantage - Version ${APP_VERSION}\n`;
  csv += `Generated: ${new Date().toLocaleString()}\n\n`;
  csv += `Club Name: ${data.clubName}\n`;
  csv += `Season: ${data.season} (${seasonLabel(parseInt(data.season.split('-')[0], 10))})\n`;
  csv += `Submitted by: ${data.submitterName}\n`;
  csv += `Contact Email: ${data.submitterEmail}\n`;
  csv += `Total Teams: ${data.teams.length}\n\n`;
  
  data.teams.forEach((team, idx) => {
    csv += `TEAM ${idx + 1}: ${team.fullName}\n`;
    if (team.nickname && team.nickname.trim()) {
      csv += `Nickname: ${team.nickname}\n`;
    }
    if (team.venue && team.venue.trim()) {
      csv += `Venue: ${team.venue}\n`;
    }
    csv += `Age Group: ${team.ageGroupEnglish}\n`;
    csv += `League: ${team.leagueEnglish}\n\n`;
    
    if (team.players.length > 0) {
      csv += 'PLAYERS\n';
      csv += 'Jersey,First Name,Last Name,Email,Position,Height\n';
      team.players.forEach(p => {
        csv += `${p.jersey},"${p.firstName}","${p.lastName}","${p.email}","${p.position}","${p.height}"\n`;
      });
      csv += '\n';
    }
    
    if (team.staff.length > 0) {
      csv += 'STAFF\n';
      csv += 'First Name,Last Name,Email,Phone,Role\n';
      team.staff.forEach(s => {
        csv += `"${s.firstName}","${s.lastName}","${s.email}","${s.phone}","${s.role}"\n`;
      });
      csv += '\n';
    }
    
    csv += '---\n\n';
  });
  
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ibba_${data.clubName.replace(/[^a-z0-9\u0590-\u05FF]/gi, '_').toLowerCase()}_${data.season}_multi_team_roster_v${APP_VERSION.replace(/[^a-z0-9]/gi, '_')}.csv`;
  document.body.appendChild(a); 
  a.click(); 
  document.body.removeChild(a); 
  URL.revokeObjectURL(url);
}

// === Utility Functions ===
function generateSubmissionId() {
  return 'ibba_multi_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

