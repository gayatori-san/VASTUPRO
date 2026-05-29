/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Cosmic and Astrological Calculators for VastuPro Platform

import { KundliInputs, GunMilanInputs, VastuInputs, NumerologyInputs, MobileNumerologyInputs } from '../types';
import numerologyRules from '../../numerology-rules.json';

// Rashi and Zodiac list
export const ZODIAC_SIGNS = [
  { name: 'Aries', ruler: 'Mars', symbol: '♈', element: 'Fire' },
  { name: 'Taurus', ruler: 'Venus', symbol: '♉', element: 'Earth' },
  { name: 'Gemini', ruler: 'Mercury', symbol: '♊', element: 'Air' },
  { name: 'Cancer', ruler: 'Moon', symbol: '♋', element: 'Water' },
  { name: 'Leo', ruler: 'Sun', symbol: '♌', element: 'Fire' },
  { name: 'Virgo', ruler: 'Mercury', symbol: '♍', element: 'Earth' },
  { name: 'Libra', ruler: 'Venus', symbol: '♎', element: 'Air' },
  { name: 'Scorpio', ruler: 'Mars/Pluto', symbol: '♏', element: 'Water' },
  { name: 'Sagittarius', ruler: 'Jupiter', symbol: '♐', element: 'Fire' },
  { name: 'Capricorn', ruler: 'Saturn', symbol: '♑', element: 'Earth' },
  { name: 'Aquarius', ruler: 'Saturn/Uranus', symbol: '♒', element: 'Air' },
  { name: 'Pisces', ruler: 'Jupiter/Neptune', symbol: '♓', element: 'Water' }
];

export const NAKSHATRAS = [
  'Ashwini', 'Bharani', 'Krittika', 'Rohini', 'Mrigashira', 'Ardra', 'Punarvasu',
  'Pushya', 'Ashlesha', 'Magha', 'Purva Phalguni', 'Uttara Phalguni', 'Hasta',
  'Chitra', 'Swati', 'Vishakha', 'Anuradha', 'Jyeshtha', 'Moola', 'Purva Ashadha',
  'Uttara Ashadha', 'Shravana', 'Dhanishta', 'Shatabhisha', 'Purva Bhadrapada',
  'Uttara Bhadrapada', 'Revati'
];

/**
 * 1. Kundli Calculator: Simulates Vedic Astrology calculations based on birth data
 */
export function calculateKundli(inputs: KundliInputs) {
  const { birthDate, birthTime, name } = inputs;
  
  // Create deterministic values from input string hashes
  const hashSeed = stringToHash(birthDate + birthTime + name);
  const lagnaIndex = Math.abs(hashSeed % 12);
  const rashiIndex = Math.abs((hashSeed * 7) % 12);
  const nakshatraIndex = Math.abs((hashSeed * 13) % 27);
  
  const lagna = ZODIAC_SIGNS[lagnaIndex];
  const rashi = ZODIAC_SIGNS[rashiIndex];
  const birthStar = NAKSHATRAS[nakshatraIndex];
  
  // Distribute planets across houses (1 to 12)
  const planetsList = ['Sun', 'Moon', 'Mars', 'Mercury', 'Jupiter', 'Venus', 'Saturn', 'Rahu', 'Ketu'];
  const houseAssignments: Record<string, number> = {};
  
  planetsList.forEach((planet, index) => {
    // Generate deterministic but spread out houses
    houseAssignments[planet] = ((hashSeed + index * 5) % 12) + 1;
  });

  // Calculate generic Dasha periods
  const currentYear = new Date().getFullYear();
  const dashaPlanets = ['Jupiter', 'Saturn', 'Mercury', 'Ketu', 'Venus', 'Sun', 'Moon', 'Mars', 'Rahu'];
  const startYear = parseInt(birthDate.substring(0, 4)) || 1990;
  
  let tempYear = startYear;
  const dashaTimeline = dashaPlanets.map((planet, index) => {
    const duration = [16, 19, 17, 7, 20, 6, 10, 7, 18][index];
    const item = {
      planet,
      start: tempYear,
      end: tempYear + duration,
      status: currentYear >= tempYear && currentYear <= (tempYear + duration) ? 'Active' : (currentYear > (tempYear + duration) ? 'Completed' : 'Upcoming')
    };
    tempYear += duration;
    return item;
  });

  return {
    lagna: lagna.name,
    lagnaSymbol: lagna.symbol,
    rashi: rashi.name,
    rashiSymbol: rashi.symbol,
    nakshatra: birthStar,
    rulingPlanet: rashi.ruler,
    element: rashi.element,
    houses: houseAssignments, // Maps planet to house number
    dashas: dashaTimeline,
    yogas: getDeterministicYogas(hashSeed)
  };
}

/**
 * 2. Ashtakoot Compatibility Compatibility (Gun Milan checker out of 36)
 */
export function calculateGunMilan(inputs: GunMilanInputs) {
  const { boyName, girlName, boyBirthDate, girlBirthDate } = inputs;
  
  const seed = stringToHash(boyName + girlName + boyBirthDate + girlGirlHash(girlBirthDate));
  
  // Calculate Ashtakoot categories: varna, vashya, tara, yoni, maitri, gana, bhakoot, nadi
  const varna = (seed % 2 === 0) ? 1 : 0.5; // max 1
  const vashya = (seed % 3 === 0) ? 2 : ((seed % 3 === 1) ? 1 : 1.5); // max 2
  const tara = (seed % 4 === 0) ? 3 : 1.5; // max 3
  const yoni = ((seed * 7) % 5 === 0) ? 4 : ((seed % 2 === 0) ? 2 : 3); // max 4
  const maitri = ((seed * 3) % 4 === 0) ? 5 : 3; // max 5
  const gana = (seed % 3 === 0) ? 6 : 4; // max 6
  const bhakoot = ((seed * 2) % 3 === 0) ? 7 : 0; // max 7
  const nadi = ((seed * 9) % 2 === 0) ? 8 : 0; // max 8
  
  const score = varna + vashya + tara + yoni + maitri + GanaMatch(seed, gana) + bhakoot + nadi;
  const roundedScore = Math.min(36, parseFloat(score.toFixed(1)));
  
  // Analyze Manglik status
  const boyManglik = (seed % 5 === 0 || seed % 11 === 0);
  const girlManglik = (seed % 4 === 0 || seed % 9 === 0);
  
  let matchCategory: 'Excellent' | 'Good' | 'Average' | 'Poor' = 'Average';
  if (roundedScore >= 28) matchCategory = 'Excellent';
  else if (roundedScore >= 18) matchCategory = 'Good';
  else if (roundedScore >= 10) matchCategory = 'Average';
  else matchCategory = 'Poor';

  return {
    score: roundedScore,
    maxScore: 36,
    category: matchCategory,
    details: [
      { name: 'Varna (Work focus)', scored: varna, max: 1, desc: 'Indicates mutual mental alignment and work matching.' },
      { name: 'Vashya (Control)', scored: vashya, max: 2, desc: 'Measures magnetic attraction and power balance.' },
      { name: 'Tara (Destiny/Luck)', scored: tara, max: 3, desc: 'Stands for health, longevity, and star harmony.' },
      { name: 'Yoni (Physical/Nature)', scored: yoni, max: 4, desc: 'Indicates intimate compatibility and temperaments.' },
      { name: 'Maitri (Friendship)', scored: maitri, max: 5, desc: 'Measures absolute mutual affection, trust, and mental wave.' },
      { name: 'Gana (Temperament)', scored: GanaMatch(seed, gana), max: 6, desc: 'Evaluates matching of Dev (Divine), Manushya (Human), and Rakshasa (Demon) natures.' },
      { name: 'Bhakoot (Growth/Children)', scored: bhakoot, max: 7, desc: 'Monitors prosperity, family harmony, and longevity of the node.' },
      { name: 'Nadi (Health/Progeny)', scored: nadi, max: 8, desc: 'Tracks genetic matching and energetic compatibility.' }
    ],
    manglikReport: {
      boy: boyManglik ? 'High Manglik' : 'Non-Manglik',
      girl: girlManglik ? 'High Manglik' : 'Non-Manglik',
      verdict: (boyManglik && girlManglik) 
        ? 'Perfect Match! Both are Manglik, canceling out any negative dosage.'
        : ((!boyManglik && !girlManglik) 
          ? 'Excellent! No Manglik Dosha concerns between the couple.'
          : 'Caution Required. One partner is Manglik. Appropriate Vedic dynamic balancing rituals suggested.')
    }
  };
}

function GanaMatch(seed: number, originalGana: number): number {
  return seed % 7 === 0 ? 0 : originalGana;
}

function girlGirlHash(str: string): string {
  return str + "milan";
}

/**
 * 3. Vastu Audit Calculator: Computes Vastu Score and remedies
 */
export function calculateVastu(inputs: VastuInputs) {
  const directionsRating: Record<string, Record<string, { rating: number; status: string; remedy: string }>> = {
    entrance: {
      'NE': { rating: 100, status: 'Perfect', remedy: 'Keep clean, place golden water vessel.' },
      'E': { rating: 95, status: 'Excellent', remedy: 'Adorn door with brass sun symbol.' },
      'N': { rating: 95, status: 'Excellent', remedy: 'Hang a silver windchime on main entrance.' },
      'NW': { rating: 75, status: 'Good', remedy: 'Paint white, use raw sea salt in brass container.' },
      'SE': { rating: 40, status: 'Strong Defect', remedy: 'Install a copper strip along the floor under threshold.' },
      'S': { rating: 50, status: 'Moderate Defect', remedy: 'Place brass pyramid and red swastik symbol.' },
      'SW': { rating: 20, status: 'Critical Defect', remedy: 'Place lead metal wire and heavy yellow quartz stones.' },
      'W': { rating: 70, status: 'Average', remedy: 'Install a brass/iron windchime at entryway.' }
    },
    kitchen: {
      'SE': { rating: 100, status: 'Perfect', remedy: 'Excellent fire zone! No correction needed.' },
      'NW': { rating: 85, status: 'Very Good', remedy: 'Keep kitchen counters green/beige.' },
      'N': { rating: 30, status: 'Critical Defect', remedy: 'Water and Fire clash. Place green aventurine stone pyramid to balance.' },
      'NE': { rating: 20, status: 'Critical Defect', remedy: 'Heavily harms health/finances. Place yellow jasper tape, avoid red cookware.' },
      'SW': { rating: 45, status: 'Strong Defect', remedy: 'Harms domestic peace. Place yellow marble slate below stove burner.' },
      'E': { rating: 80, status: 'Good', remedy: 'Ensure stove is placed on green granite block.' },
      'S': { rating: 90, status: 'Excellent', remedy: 'No major defect. Fire aligns well with South.' },
      'W': { rating: 60, status: 'Average', remedy: 'Place yellow slate or perform yellow tape outline.' }
    },
    bedroom: {
      'SW': { rating: 100, status: 'Perfect', remedy: 'Earthy zone - provides perfect grounding and relationship stability.' },
      'E': { rating: 70, status: 'Average', remedy: 'Excellent for kids or study, minor adjustments for head direction.' },
      'W': { rating: 85, status: 'Good', remedy: 'Ideal bedroom zone. Sleep with head pointing South.' },
      'S': { rating: 90, status: 'Excellent', remedy: 'Provides solid sleep and high recognition. No correction needed.' },
      'N': { rating: 50, status: 'Moderate Defect', remedy: 'Disturbs sleep patterns. Hang crystal spheres in the North corner.' },
      'NE': { rating: 40, status: 'Strong Defect', remedy: 'Sleep is shallow and restless here. Place zinc metal pyramids in corners.' },
      'NW': { rating: 80, status: 'Good', remedy: 'Excellent for guest room or married daughters.' },
      'SE': { rating: 55, status: 'Strong Defect', remedy: 'Gives rise to anger and friction. Avoid red colored bedroom curtains.' }
    },
    toilets: {
      'SW': { rating: 20, status: 'Critical Defect', remedy: 'Drains wealth and safety. Keep door locked. Place lead spirals and salt bowl.' },
      'NE': { rating: 15, status: 'Critical Defect', remedy: 'Extremely critical. Drains luck. Place blue tape on toilet pot or virtual copper barrier.' },
      'SE': { rating: 40, status: 'Strong Defect', remedy: 'Drains cash flows. Place copper strip boundary on toilet floor.' },
      'NW': { rating: 95, status: 'Perfect', remedy: 'Excellent drain zone! Clean and place white candles.' },
      'W': { rating: 90, status: 'Excellent', remedy: 'Excellent sanitation placement. Keep clean.' },
      'N': { rating: 35, status: 'Strong Defect', remedy: 'Blocks career opportunities. Wrap toilet lines with blue paint bands.' },
      'E': { rating: 60, status: 'Average', remedy: 'Place green plant pots near toilet corners.' },
      'S': { rating: 75, status: 'Good', remedy: 'Use copper spirals to prevent downward energy drain.' }
    },
    pooja: {
      'NE': { rating: 100, status: 'Perfect', remedy: 'Deity Zone of pure energy! Best for meditation and spiritual flow.' },
      'E': { rating: 90, status: 'Excellent', remedy: 'Perfect for sun worship and social connection temple.' },
      'N': { rating: 85, status: 'Good', remedy: 'Auspicious zone for water element altars.' },
      'SE': { rating: 40, status: 'Moderate Defect', remedy: 'Fire area. Put copper plate inside altar shelf.' },
      'SW': { rating: 20, status: 'Strong Defect', remedy: 'Never place temple here. Place heavy brass idol to neutralize.' },
      'S': { rating: 30, status: 'Moderate Defect', remedy: 'Use yellow cloth on the floor mat and wooden idols.' },
      'W': { rating: 70, status: 'Average', remedy: 'Excellent zone for secondary home temple. Clear clutter.' },
      'NW': { rating: 65, status: 'Average', remedy: 'Keep temple illuminated with soft warm yellow lights.' }
    },
    living: {
      'E': { rating: 100, status: 'Perfect', remedy: 'Fosters amazing family bonding and social status.' },
      'N': { rating: 95, status: 'Excellent', remedy: 'No correction. Encourages financial opportunities and discussions.' },
      'NE': { rating: 95, status: 'Excellent', remedy: 'Brilliant spiritual flow. Keep simple and spacious.' },
      'NW': { rating: 85, status: 'Very Good', remedy: 'Excellent for air flow and hospitality.' },
      'W': { rating: 80, status: 'Good', remedy: 'Brings gains and professional stability.' },
      'S': { rating: 70, status: 'Average', remedy: 'Keep furniture heavy, use crimson accents.' },
      'SE': { rating: 65, status: 'Average', remedy: 'Keep fire elements (TV, routers, candles) in South-East corner.' },
      'SW': { rating: 50, status: 'Moderate Defect', remedy: 'Use heavy curtains, paint the room cream/beige.' }
    }
  };

  const ent = directionsRating.entrance[inputs.entranceDirection] || { rating: 70, status: 'Average', remedy: 'Neutralize energy flow with auspicious symbols.' };
  const kit = directionsRating.kitchen[inputs.kitchenDirection] || { rating: 70, status: 'Average', remedy: 'Neutralize with elemental colors.' };
  const bed = directionsRating.bedroom[inputs.masterBedDirection] || { rating: 70, status: 'Average', remedy: 'Neutralize with grounding accessories.' };
  const toi = directionsRating.toilets[inputs.toiletsDirection] || { rating: 70, status: 'Average', remedy: 'Neutralize drains with metallic wires.' };
  const pooj = directionsRating.pooja[inputs.poojaRoomDirection] || { rating: 70, status: 'Average', remedy: 'Keep tidy.' };
  const liv = directionsRating.living[inputs.livingRoomDirection] || { rating: 70, status: 'Average', remedy: 'Align seating.' };

  const averageScore = Math.round((ent.rating + kit.rating + bed.rating + toi.rating + pooj.rating + liv.rating) / 6);
  
  const defects = [];
  if (ent.rating < 60) defects.push({ zone: 'Main Entrance', score: ent.rating, remedy: ent.remedy });
  if (kit.rating < 60) defects.push({ zone: 'Kitchen Altar', score: kit.rating, remedy: kit.remedy });
  if (bed.rating < 60) defects.push({ zone: 'Master Bedroom', score: bed.rating, remedy: bed.remedy });
  if (toi.rating < 60) defects.push({ zone: 'Toilet Washroom', score: toi.rating, remedy: toi.remedy });
  if (pooj.rating < 60) defects.push({ zone: 'Pooja Temple', score: pooj.rating, remedy: pooj.remedy });
  if (liv.rating < 60) defects.push({ zone: 'Living Lounge', score: liv.rating, remedy: liv.remedy });

  return {
    score: averageScore,
    ratings: {
      entrance: ent,
      kitchen: kit,
      bedroom: bed,
      toilets: toi,
      pooja: pooj,
      living: liv
    },
    defects: defects,
    verdict: averageScore >= 85 
      ? 'Extremely Harmonious! The layout carries a highly pure (Sattvic) elemental flow promoting peace and health.'
      : (averageScore >= 65 
        ? 'Moderately Healthy. Elemental channels are active but require minor alignment corrections to optimize wealth flows.'
        : 'Requires Remedial Attention. Core elemental zones clash. Implementing the recommended non-destructive remedies will restore vital energy corridors.')
  };
}

/**
 * 4. Numerology Calculator: Driver, Conductor, Loshu Grid and Name Matching
 */
export function calculateNumerology(inputs: NumerologyInputs) {
  const { fullName, birthDate } = inputs;
  
  // Date values: YYYY-MM-DD
  const parts = birthDate.split('-');
  const year = parts[0] || '1990';
  const month = parts[1] || '01';
  const day = parts[2] || '01';
  
  // 1. Driver (Psychic Number) - Reduced day of birth
  const daySum = day.split('').reduce((sum, d) => sum + parseInt(d || '0'), 0);
  const driverNum = reduceToSingleDigit(daySum);
  
  // 2. Conductor (Destiny Number) - Reduced complete birth date
  const fullDateStr = year + month + day;
  const fullSum = fullDateStr.split('').reduce((sum, d) => sum + parseInt(d || '0'), 0);
  const conductorNum = reduceToSingleDigit(fullSum);
  
  // 3. Name Number - Chaldean standard mapping
  const nameScore = calculateChaldeanNameNumber(fullName);
  const nameNum = reduceToSingleDigit(nameScore);
  
  // 4. Generate Loshu Grid (3x3 matching):
  // 4 9 2
  // 3 5 7
  // 8 1 6
  const gridPositions: Record<number, number> = {
    4: 0, 9: 1, 2: 2,
    3: 3, 5: 4, 7: 5,
    8: 6, 1: 7, 6: 8
  };
  
  const birthdigits = (birthDate.replace(/-/g, '')).split('').map(Number);
  const counts: Record<number, number> = { 1:0, 2:0, 3:0, 4:0, 5:0, 6:0, 7:0, 8:0, 9:0 };
  birthdigits.forEach(digit => {
    if (digit > 0 && digit <= 9) {
      counts[digit] = (counts[digit] || 0) + 1;
    }
  });

  const loshuGrid = [
    { num: 4, label: 'Wealth', count: counts[4] },
    { num: 9, label: 'Fame', count: counts[9] },
    { num: 2, label: 'Marriage', count: counts[2] },
    { num: 3, label: 'Family', count: counts[3] },
    { num: 5, label: 'Center', count: counts[5] },
    { num: 7, label: 'Children', count: counts[7] },
    { num: 8, label: 'Knowledge', count: counts[8] },
    { num: 1, label: 'Career', count: counts[1] },
    { num: 6, label: 'Friends', count: counts[6] }
  ];

  // Derive planet characteristics
  const planetsMap: Record<number, { planet: string; traits: string; color: string }> = {
    1: { planet: 'Sun', traits: 'Leadership, Authority, Originality, Determination', color: 'Gold / Orange' },
    2: { planet: 'Moon', traits: 'Intuition, Diplomacy, Sensitivity, Cooperation', color: 'White / Silver' },
    3: { planet: 'Jupiter', traits: 'Wisdom, Expansion, Ambition, Creative Expression', color: 'Yellow' },
    4: { planet: 'Rahu', traits: 'Unconventional, Order, Hardworking, Intelligence', color: 'Grey' },
    5: { planet: 'Mercury', traits: 'Communication, Versatility, Business acumen', color: 'Green' },
    6: { planet: 'Venus', traits: 'Harmony, Luxury, Art, Love, Responsibility', color: 'Bright White / Cream' },
    7: { planet: 'Ketu', traits: 'Spiritual, Analytical, Introspective, Mystery', color: 'Light Blue' },
    8: { planet: 'Saturn', traits: 'Discipline, Karma, Material success, Justice', color: 'Dark Blue / Black' },
    9: { planet: 'Mars', traits: 'Energy, Courage, Action, Humanitarian', color: 'Red' }
  };

  return {
    driver: driverNum,
    conductor: conductorNum,
    nameNumber: nameNum,
    nameChaldeanSum: nameScore,
    loshuGrid,
    driverPlanet: planetsMap[driverNum] || { planet: 'Cosmos', traits: 'Dynamic energy', color: 'Gold' },
    conductorPlanet: planetsMap[conductorNum] || { planet: 'Cosmos', traits: 'Dynamic career', color: 'Gold' },
    advice: getNumerologyAxiom(driverNum, conductorNum)
  };
}

/**
 * Chaldean numerology name vibration calculation mapping
 */
function calculateChaldeanNameNumber(name: string) {
  const chaldeanTable: Record<string, number> = {
    a: 1, i: 1, j: 1, q: 1, y: 1,
    b: 2, k: 2, r: 2,
    c: 3, g: 3, l: 3, s: 3,
    d: 4, m: 4, t: 4,
    e: 5, h: 5, n: 5, x: 5,
    u: 6, v: 6, w: 6,
    o: 7, z: 7,
    f: 8, p: 8
  };
  
  return name.toLowerCase().split('').reduce((sum, char) => {
    return sum + (chaldeanTable[char] || 0);
  }, 0);
}

function reduceToSingleDigit(n: number): number {
  let val = n;
  while (val > 9) {
    val = val.toString().split('').reduce((sum, num) => sum + parseInt(num), 0);
  }
  return val;
}

// Simple hash from string
function stringToHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return Math.abs(hash);
}

function getDeterministicYogas(seed: number) {
  const yogas = [
    { name: 'Gaja Kesari Yoga', type: 'Wealth & Wisdom', desc: 'Formed when Jupiter is in angular coordinates from Moon. Grants absolute learning, royal status, and lasting joy.' },
    { name: 'Sunapha Yoga', type: 'Prosperity', desc: 'Formed when auspicious planets occupy the 2nd house from moon. Yields self-earned luxury and dynamic command over speech.' },
    { name: 'Budhaditya Yoga', type: 'Intelligence', desc: 'Formed when Sun and Mercury are conjunct in a favorable house. Grants elevated analytical skills, academic awards, and leadership.' },
    { name: 'Adhi Yoga', type: 'Leadership', desc: 'Formed when Jupiter, Venus, and Mercury are located in the 6th, 7th, and 8th houses from the Moon. Generates dynamic career power and fame.' }
  ];
  
  // Pick 2 yogas deterministically
  const idx1 = seed % 4;
  const idx2 = (seed + 1) % 4;
  return [yogas[idx1], yogas[idx2]];
}

function getNumerologyAxiom(driver: number, conductor: number) {
  const combinations: Record<string, string> = {
    '1-1': 'The Double Sun alignment. You are driven for independent action and high management. Ensure you listen to advice from others.',
    '1-5': 'Sun and Mercury coupling makes a brilliant commercial/business professional. Absolute versatility in enterprise.',
    '1-9': 'King and Soldier combo. Excellent courageous dynamic potential. Ideal for defense, engineering, or top leadership.',
    '3-3': 'Deeply wise Jupiter combination. Outstanding advisor, author, or spiritual mentor. Money flows via wisdom.',
    '5-5': 'Outstanding communicator and business wizard. Capable of turning any networking contact into financial gains.',
    '8-8': 'Saturn double influence. Promotes highly disciplined, gradual building of extreme wealth. Hard worker who achieves success in later years.',
    '9-9': 'Fiery combination. Limitless determination and energy output. Balance impatience with meditative focus.'
  };
  
  return combinations[`${driver}-${conductor}`] || `Driver ${driver} paired with Conductor ${conductor} marks are excellent. You are guided by the planetary forces of the Cosmic Realm. Build systems that reward patience and long-term focus.`;
}

/**
 * 5. Daily Horoscope Prediction Generator
 */
export function getDailyHoroscope(zodiac: string) {
  const seed = stringToHash(zodiac + new Date().toISOString().substring(0, 10));
  
  const scoreCard = {
    career: 70 + (seed % 31),
    love: 68 + (seed % 33),
    health: 65 + (seed % 36),
    wealth: 72 + (seed % 29)
  };

  const adviceText = [
    'Today is highly beneficial for executing expansion projects. Keep communications gentle.',
    'The cosmic field supports deep alignment. Postpone major real estate investments.',
    'Solar energy channels support structural improvements in health. Practice diaphragmatic breathing.',
    'An outstanding day for professional presentations and signing dynamic commercial agreements.'
  ];

  return {
    zodiac,
    scores: scoreCard,
    idealHours: `${(8 + (seed % 4))}:00 AM - ${(11 + (seed % 4))}:00 AM`,
    luckyColor: ['Deep Saffron', 'Royal Crimson', 'Cosmic Blue', 'Pure Pearl Milk', 'Emerald Saffron', 'Golden Honey'][(seed % 6)],
    luckyNumber: (seed % 9) + 1,
    guidance: adviceText[seed % adviceText.length]
  };
}

/**
 * 6. Mobile Numerology calculation engine using the rule-engine loaded from numerology-rules.json
 */
export function calculateMobileNumerology(inputs: MobileNumerologyInputs) {
  const { mobileNumber, birthDate } = inputs;
  
  // Date values: YYYY-MM-DD
  const parts = birthDate.split('-');
  const year = parts[0] || '1990';
  const month = parts[1] || '01';
  const day = parts[2] || '01';
  
  // 1. King Number (Driver)
  const daySum = day.split('').reduce((sum, d) => sum + parseInt(d || '0'), 0);
  const kingNum = reduceToSingleDigit(daySum);
  
  // 2. Conductor Number (Destiny)
  const fullDateStr = year + month + day;
  const fullSum = fullDateStr.split('').reduce((sum, d) => sum + parseInt(d || '0'), 0);
  const conductorNum = reduceToSingleDigit(fullSum);
  
  // 3. Process mobile number digits
  const cleanMobile = mobileNumber.replace(/\D/g, '');
  
  // Calculate total and reduced total of mobile number digits
  const digits = cleanMobile.split('').map(Number);
  const mobileTotal = digits.reduce((sum, d) => sum + d, 0);
  const reducedTotal = reduceToSingleDigit(mobileTotal);
  
  // Get rules from JSON config
  const rules = (numerologyRules as any) || {
    kingNumbers: {},
    repeatEffects: {},
    goodCombos: {},
    neutralCombos: {},
    negativeCombos: {},
    totalPreferences: {},
    avoidList: []
  };
  
  // Get King rules
  const kingRules = rules.kingNumbers[String(kingNum)] || {
    lucky: [],
    enemy: [],
    hardCoreEnemy: [],
    neutral: []
  };
  
  // Evaluate compatibility of reduced mobile total with King Number
  let compatibility: 'Lucky' | 'Enemy' | 'Hard Core Enemy' | 'Neutral' | 'Compatible' = 'Compatible';
  if (kingRules.lucky.includes(reducedTotal)) {
    compatibility = 'Lucky';
  } else if (kingRules.hardCoreEnemy.includes(reducedTotal)) {
    compatibility = 'Hard Core Enemy';
  } else if (kingRules.enemy.includes(reducedTotal)) {
    compatibility = 'Enemy';
  } else if (kingRules.neutral.includes(reducedTotal)) {
    compatibility = 'Neutral';
  }
  
  // Find combos in mobile number (pairs)
  const goodFound: { combo: string; desc: string }[] = [];
  const neutralFound: { combo: string; desc: string }[] = [];
  const negativeFound: { combo: string; desc: string }[] = [];
  const avoidedFound: string[] = [];
  
  // Unique combos arrays to prevent duplicates
  const seenGood = new Set<string>();
  const seenNeutral = new Set<string>();
  const seenNegative = new Set<string>();
  
  for (let i = 0; i < cleanMobile.length - 1; i++) {
    const pair = cleanMobile.substring(i, i + 2);
    
    // Check Good Combos
    if (rules.goodCombos[pair]) {
      if (!seenGood.has(pair)) {
        seenGood.add(pair);
        goodFound.push({ combo: pair, desc: rules.goodCombos[pair] });
      }
    }
    
    // Check Neutral Combos
    if (rules.neutralCombos[pair]) {
      if (!seenNeutral.has(pair)) {
        seenNeutral.add(pair);
        neutralFound.push({ combo: pair, desc: rules.neutralCombos[pair] });
      }
    }
    
    // Check Negative Combos
    if (rules.negativeCombos[pair]) {
      if (!seenNegative.has(pair)) {
        seenNegative.add(pair);
        negativeFound.push({ combo: pair, desc: rules.negativeCombos[pair] });
      }
    }
  }
  
  // Find avoided combos from the entire mobile string
  rules.avoidList.forEach((avoidVal: string) => {
    if (cleanMobile.includes(avoidVal)) {
      avoidedFound.push(avoidVal);
    }
  });
  
  // Evaluate repeating digits (runs of 2 or more of the same digit)
  const repeatsFound: { combo: string; count: number; desc: string }[] = [];
  const seenRepeats = new Set<string>();
  
  for (let i = 0; i < cleanMobile.length; i++) {
    const digit = cleanMobile[i];
    let runLength = 1;
    while (i + 1 < cleanMobile.length && cleanMobile[i + 1] === digit) {
      runLength++;
      i++;
    }
    
    if (runLength >= 2) {
      // Create double and triple representations
      const repeatKey = digit + digit; // e.g. "11", "22", "33"
      const effectDesc = rules.repeatEffects[repeatKey];
      if (effectDesc && !seenRepeats.has(repeatKey)) {
        seenRepeats.add(repeatKey);
        repeatsFound.push({
          combo: digit.repeat(runLength),
          count: runLength,
          desc: effectDesc
        });
      }
    }
  }
  
  // Total preference match details (for mobile total 1, 3, 5, 6)
  const totalPrefInfo = rules.totalPreferences[String(reducedTotal)];
  let totalPreferenceMatched = false;
  let matchedPrefCombos: string[] = [];
  if (totalPrefInfo) {
    totalPrefInfo.prefCombos.forEach((pref: string) => {
      if (cleanMobile.includes(pref)) {
        totalPreferenceMatched = true;
        matchedPrefCombos.push(pref);
      }
    });
  }
  
  // Calculate dynamic compatibility score starting at 85
  let score = 85; // baseline
  
  if (compatibility === 'Lucky') score += 10;
  if (compatibility === 'Enemy') score -= 15;
  if (compatibility === 'Hard Core Enemy') score -= 25;
  if (compatibility === 'Neutral') score += 0;
  
  // Adjust for combos
  score += goodFound.length * 4;
  score -= negativeFound.length * 6;
  score -= avoidedFound.length * 3;
  
  if (totalPreferenceMatched) {
    score += 8;
  }
  
  // Bound score between 15 and 99 (100 is rare perfection)
  score = Math.max(15, Math.min(99, score));
  
  const rightCount = goodFound.length;
  const wrongCount = negativeFound.length + avoidedFound.length;
  const isBadNumber = wrongCount > rightCount;
  
  // Let's create an excellent summary and verdict text based on rules
  let verdict = '';
  if (isBadNumber) {
    verdict = `Your mobile number has more negative configurations than positive ones, meaning this number is fundamentally bad for you. It contains multiple conflicting vibration sequences that can invite unnecessary struggles, delays, and obstacles in career and health.`;
  } else if (score >= 80) {
    verdict = `Highly auspicious and harmonious phone number. The reduced total single-digit is ${reducedTotal}, which aligns beautifully with your King (Driver) number ${kingNum}. This vibration promotes health, cash flow, and steady growth.`;
  } else if (score >= 60) {
    verdict = `Fairly compatible phone number with standard elements. While there are a few productive energy combinations present, we detected some minor elements of friction that can be balanced using recommended silent digital/metallic remedies.`;
  } else {
    verdict = `Requires energetic corrections or number adjustments. The reduced total ${reducedTotal} clashes with your core King Number ${kingNum}, and we identified some malefic combos or avoided sequences that could lead to financial blocks or high medical expenditures.`;
  }
  
  return {
    kingNumber: kingNum,
    conductorNumber: conductorNum,
    mobileTotal,
    reducedMobileTotal: reducedTotal,
    kingNumberRules: kingRules,
    isTotalCompatible: compatibility,
    goodCombosFound: goodFound,
    neutralCombosFound: neutralFound,
    negativeCombosFound: negativeFound,
    repeatsFound,
    avoidedCombosFound: avoidedFound,
    totalPreferenceMatched,
    matchedPrefCombos,
    totalPrefInfo: totalPrefInfo || null,
    score,
    verdict,
    rightCount,
    wrongCount,
    isBadNumber
  };
}
