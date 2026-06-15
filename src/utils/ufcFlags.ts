// Dictionary mapping popular UFC fighters to their country codes (ISO 3166-1 alpha-2)
export const fighterFlags: Record<string, string> = {
  'Alex Pereira': 'br',
  'Jon Jones': 'us',
  'Ilia Topuria': 'ge', // Georgia
  'Conor McGregor': 'ie', // Ireland
  'Khabib Nurmagomedov': 'ru', // Russia
  'Islam Makhachev': 'ru', // Russia
  'Israel Adesanya': 'nz', // New Zealand
  'Sean O\'Malley': 'us',
  'Kamaru Usman': 'ng', // Nigeria
  'Leon Edwards': 'gb', // United Kingdom
  'Georges St-Pierre': 'ca', // Canada
  'Max Holloway': 'us',
  'Dustin Poirier': 'us',
  'Charles Oliveira': 'br',
  'Brandon Moreno': 'mx', // Mexico
  'Marlon Vera': 'ec', // Ecuador
  'Justin Gaethje': 'us',
  'Alexander Volkanovski': 'au', // Australia
  'Robert Whittaker': 'au', // Australia
  'Ciryl Gane': 'fr', // France
  'Sean Strickland': 'us',
  'Dricus Du Plessis': 'za', // South Africa
  'Merab Dvalishvili': 'ge', // Georgia
  'Aljamain Sterling': 'jm', // Jamaica
  'Amanda Nunes': 'br',
  'Valentina Shevchenko': 'kg', // Kyrgyzstan
  'Zhang Weili': 'cn', // China
  'Weili Zhang': 'cn',
  'Jose Aldo': 'br',
  'Anderson Silva': 'br',
  'Demetrious Johnson': 'us',
  'Stipe Miocic': 'us',
  'Daniel Cormier': 'us',
  'Francis Ngannou': 'cm', // Cameroon
  'Tom Aspinall': 'gb',
  'Belal Muhammad': 'ps', // Palestine
  'Gilbert Burns': 'br',
  'Colby Covington': 'us',
  'Tony Ferguson': 'us',
  'Khamzat Chimaev': 'ae', // UAE / Chechnya
};

// Maps event location country text to country flag code
export const getCountryCode = (location: string): string => {
  if (!location) return 'us';
  const parts = location.split(',');
  const country = parts[parts.length - 1].trim().toLowerCase();

  switch (country) {
    case 'usa':
    case 'united states':
      return 'us';
    case 'brazil':
      return 'br';
    case 'canada':
      return 'ca';
    case 'england':
    case 'united kingdom':
    case 'uk':
    case 'scotland':
      return 'gb';
    case 'australia':
      return 'au';
    case 'mexico':
      return 'mx';
    case 'france':
      return 'fr';
    case 'japan':
      return 'jp';
    case 'united arab emirates':
    case 'uae':
    case 'abu dhabi':
      return 'ae';
    case 'singapore':
      return 'sg';
    case 'sweden':
      return 'se';
    case 'germany':
      return 'de';
    case 'china':
      return 'cn';
    case 'croatia':
      return 'hr';
    case 'new zealand':
      return 'nz';
    case 'poland':
      return 'pl';
    case 'netherlands':
      return 'nl';
    case 'russia':
      return 'ru';
    case 'south korea':
    case 'korea':
      return 'kr';
    default:
      return 'us'; // Fallback
  }
};

// Returns Flag CDN url for a given country code
export const getFlagUrl = (code: string): string => {
  return `https://flagcdn.com/w40/${code.toLowerCase()}.png`;
};

// Helper to get a fighter's flag url (checking dictionary first, then falling back to generic)
export const getFighterFlagUrl = (name: string, eventLocation?: string): string => {
  if (fighterFlags[name]) {
    return getFlagUrl(fighterFlags[name]);
  }
  
  // Fallback to location country flag if provided, else US
  if (eventLocation) {
    return getFlagUrl(getCountryCode(eventLocation));
  }
  
  return getFlagUrl('us');
};
