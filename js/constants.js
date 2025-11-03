/* IBBA Club Multi-Team Roster Submission - Constants & Configuration */
/* Version 5.8.1 - NO MIN PLAYERS */

// === EmailJS Configuration ===
// ⚠️ IMPORTANT: Replace these with YOUR actual EmailJS credentials!
// Get them from: https://dashboard.emailjs.com/
const EmailJSConfig = Object.freeze({
  publicKey: "mJ-xVVEQiH1Uxvfu3",       // ✅ Your actual Public Key
  serviceId: "service_4bdvcf9",         // ✅ Your Service ID
  // Existing single-team template (kept for backward compatibility)
  templateIdSingle: "template_6o8secn", // ✅ Your Template ID
  // New multi-team template – create in EmailJS and paste its ID here
  templateIdMulti: "template_6o8secn"   // ✅ Using same template for multi-team
});

// === Data Sink Configuration ===
const DATA_SINK_URL = 'https://script.google.com/macros/s/AKfycbxchgyxazvH9t4N0prpLTboqeAlb6kRz6xUj-klQ1HIYtrZjs9qeKxWVqTttVJKdREj/exec';
const DATA_SINK_KEY = 'Pixellot2@25';

// === Application Version ===
const APP_VERSION = '5.8.1 - NO MIN PLAYERS';
const BUILD_DATE = new Date().toISOString().slice(0,10);

// === Season Configuration ===
const CURRENT_SEASON_START_YEAR = 2025;
const NEXT_SEASON_START_YEAR = 2026;
const SWITCHOVER_DATE = new Date(2026, 7, 1);
const FORCE_EXPOSE_NEXT_SEASON = false;

// === Roster Configuration ===
const DEFAULT_PLAYER_ROWS = 16;
const HARD_MAX_PLAYERS = 40;
const MIN_REQUIRED_PLAYERS = 0; // Changed from 8 to 0 - no minimum required
const STORAGE_KEY = "ibbaMultiTeamDraft_v581"; // bumped for CSV download fix

// === Submission Protection Configuration ===
const MIN_SUBMISSION_INTERVAL = 30000; // 30 seconds between attempts

// === Form Configuration ===
const TOTAL_STEPS = 4;

// === Age Group Options (Hebrew to English mapping) ===
const AGE_GROUP_OPTIONS = [
  { value: 'קט-סל ב', label: 'קט-סל ב' },
  { value: 'קט-סל א', label: 'קט-סל א' },
  { value: 'ילדים ב', label: 'ילדים ב' },
  { value: 'ילדות ב', label: 'ילדות ב' },
  { value: 'ילדים א', label: 'ילדים א' },
  { value: 'ילדות א', label: 'ילדות א' },
  { value: 'נערים ב', label: 'נערים ב' },
  { value: 'נערות ב', label: 'נערות ב' },
  { value: 'נערים א', label: 'נערים א' },
  { value: 'נערות א', label: 'נערות א' },
  { value: 'נוער', label: 'נוער' },
  { value: 'בוגרים', label: 'בוגרים' },
  { value: 'בוגרות', label: 'בוגרות' }
];

// === League Options (Hebrew to English mapping) ===
const LEAGUE_OPTIONS = [
  { value: 'רגיל', label: 'רגיל' },
  { value: 'מחוזית', label: 'מחוזית' },
  { value: 'ארצית', label: 'ארצית' },
  { value: 'לאומית', label: 'לאומית' },
  { value: 'על', label: 'על' }
];

// === Position Options ===
const POSITION_OPTIONS = [
  { value: 'G', label: 'Guard' },
  { value: 'F', label: 'Forward' },
  { value: 'C', label: 'Center' }
];

// === Translation Maps ===
const LEAGUE_TRANSLATIONS = {
  'רגיל': 'Regular',
  'מחוזית': 'Regional',
  'ארצית': 'National',
  'לאומית': '2nd Division',
  'על': '1st Division'
};

const AGE_GROUP_TRANSLATIONS = {
  'קט-סל ב': 'U11',
  'קט-סל א': 'U12', 
  'ילדים ב': 'U13 Boys',
  'ילדות ב': 'U13 Girls',
  'ילדים א': 'U14 Boys',
  'ילדות א': 'U14 Girls',
  'נערים ב': 'U15 Boys',
  'נערות ב': 'U16 Girls',
  'נערים א': 'U16 Boys',
  'נערות א': 'U18 Girls',
  'נוער': 'U18 Boys',
  'בוגרים': 'Adults Men',
  'בוגרות': 'Adults Women'
};

const POSITION_FULL_NAMES = {
  'G': 'Guard',
  'F': 'Forward',
  'C': 'Center'
};

// === Email Typo Corrections ===
const EMAIL_TYPO_MAP = {
  '.con': '.com', '.cmo': '.com', '.ocm': '.com', '.cpm': '.com',
  '@gamil.': '@gmail.', '@gmial.': '@gmail.', '@gmai.': '@gmail.',
  '@yahooo.': '@yahoo.', '@hotmial.': '@hotmail.', '@outlok.': '@outlook.'
};

