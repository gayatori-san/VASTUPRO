/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// Shared Type Definitions for VastuPro Platform

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

export interface UserProfile {
  uid: string;
  email: string;
  displayName?: string;
  photoURL?: string;
  role: 'user' | 'admin';
  credits: number;
  createdAt: string;
}

export type OrderStatus = 'pending' | 'completed' | 'failed';

export interface PurchaseOrder {
  orderId: string;
  userId: string;
  serviceId: string;
  serviceName: string;
  amount: number;
  status: OrderStatus;
  createdAt: string;
  customerEmail: string;
  customerName: string;
  inputs: Record<string, any>;
  reportId?: string;
}

export interface CashfreeOrder {
  order_id: string;
  order_token?: string;
  payment_link?: string;
  order_status: string;
}

export interface ServiceItem {
  serviceId: string;
  name: string;
  tagline: string;
  description: string;
  price: number;
  premium: boolean;
  category: 'astrology' | 'vastu' | 'numerology';
  features: string[];
  iconName: string;
}

export interface VastuReport {
  reportId: string;
  userId: string;
  serviceId: string;
  title: string;
  content: string; // Markdown formatted AI report content
  inputs: Record<string, any>;
  isPremium: boolean;
  createdAt: string;
}

// Service form inputs
export interface KundliInputs {
  name: string;
  birthDate: string;
  birthTime: string;
  birthPlace: string;
  gender: string;
  latitude?: number;
  longitude?: number;
}

export interface GunMilanInputs {
  boyName: string;
  boyBirthDate: string;
  boyBirthTime: string;
  boyBirthPlace: string;
  girlName: string;
  girlBirthDate: string;
  girlBirthTime: string;
  girlBirthPlace: string;
}

export interface VastuInputs {
  propertyType: 'home' | 'office' | 'shop';
  entranceDirection: string; // Main door direction
  kitchenDirection: string;
  masterBedDirection: string;
  toiletsDirection: string;
  poojaRoomDirection: string;
  livingRoomDirection: string;
}

export interface NumerologyInputs {
  fullName: string;
  birthDate: string;
}

export interface MobileNumerologyInputs {
  mobileNumber: string;
  birthDate: string;
}

export interface DailyHoroscopeInputs {
  zodiacSign: string;
}

// Catalog of default cosmic services
export const VA_SERVICES: ServiceItem[] = [
  {
    serviceId: 'kundli_analysis',
    name: 'Kundli Chart & Planetary Analysis',
    tagline: 'Comprehensive birth chart calculation and planetary positions analysis.',
    description: 'Generates your detailed Vedic natal chart (D1), Ascendant & Moon sign calculation, planetary degrees, details on yogas, Sade Sate analysis, and major Dasha periods with simple gemstone/remedy insights.',
    price: 499,
    premium: true,
    category: 'astrology',
    features: [
      'Interactive Lagna & Navamsha Chart details',
      'Planetary Positions & Nakshatra breakdown',
      'Vimshottari Dasha analysis & timings',
      'AI-backed personalized life & health predictions'
    ],
    iconName: 'Sparkles'
  },
  {
    serviceId: 'horoscope_matching',
    name: 'Gun Milan Compatibility',
    tagline: 'Vedic compatibility score checking out of 36 vital aspects.',
    description: 'Detailed analysis of the boy and girl’s birth details based on Ashtakoota Milan, tracking Varna, Vashya, Tara, Yoni, Maitri, Gana, Bhakoot, and Nandi. Diagnoses Manglik Dosha status and provides customized love compatibility advice.',
    price: 349,
    premium: true,
    category: 'astrology',
    features: [
      'Ashtakoota Milan scorecard out of 36 points',
      'Detailed Guna matching list',
      'Manglik Dosha presence and mitigation remedies',
      'AI Relationship harmony assessment'
    ],
    iconName: 'HeartHandshake'
  },
  {
    serviceId: 'vastu_audit',
    name: 'Home Vastu Audit & Correction',
    tagline: 'Unlock flow and prosperity in your living spaces without structural demolition.',
    description: 'Provide directions of key household spaces (Main door, kitchen, master bed, toilets, pooja room). VastuPro computes a Vastu Harmony Score, detects spatial elemental mismatches, and shares highly practical remedies (colors, elements, crystals).',
    price: 699,
    premium: true,
    category: 'vastu',
    features: [
      'Interactive Vastu Zone compass analysis',
      'Overall directional harmony rating',
      'Elemental imbalance breakdown',
      'Practical metallic, elemental & crystal remedies'
    ],
    iconName: 'Compass'
  },
  {
    serviceId: 'numerology_report',
    name: 'Numerology Life Grid',
    tagline: 'Reveal hidden energy vibrational patterns within your name and birth date.',
    description: 'Calculates your psychic (driver) number, destiny (conductor) number, name compatibility grid, soul urge, personal year guidance, lucky numbers, colors, stones, and detailed analysis of empty grids in the Loshu Grid chart.',
    price: 199,
    premium: true,
    category: 'numerology',
    features: [
      'Driver and Conductor planet vibrations',
      'Interactive Loshu Grid mapping',
      'Name correction and business matching scores',
      'Lucky days, colors, and direction guidance'
    ],
    iconName: 'Hash'
  },
  {
    serviceId: 'daily_horoscope',
    name: 'Daily Planetary Alignment',
    tagline: 'Stay aligned with real-time solar transitions and moon phases.',
    description: 'Instant cosmic checkups. Calculates daily personal moon alignments for your lunar sign with actionable guidance across love, health, career, and finance categories.',
    price: 0,
    premium: false,
    category: 'astrology',
    features: [
      'Zodiac lunar alignment checkups',
      'Daily score card across Career, Love, and Health',
      'Do’s & Don’ts instructions for optimal energy flow',
      'Auspicious hours of the day (Rahu Kaal & Shubh Muhurat)'
    ],
    iconName: 'Compass'
  },
  {
    serviceId: 'business_vastu',
    name: 'Office & Business Vastu Optimization',
    tagline: 'Boost commercial cashflow, team productivity, and business success.',
    description: 'Ensure perfect elemental alignment of office entrance, cashier desk, raw materials storage, and staff cabins. Ideal for showrooms, corporate headquarters, and retail shops.',
    price: 899,
    premium: true,
    category: 'vastu',
    features: [
      'Cash register and CEO seating placement audit',
      'Entrance energy enhancement methods',
      'Remedies for continuous revenue flows',
      'Auspicious logo and color advice'
    ],
    iconName: 'Building2'
  },
  {
    serviceId: 'mobile_numerology',
    name: 'Mobile Number Numerology Audit',
    tagline: 'Unlock luck, career success, and financial harmony through mobile numerology.',
    description: 'Calculates your King & Conductor numbers, performs advanced pairing audits of your mobile number digits, analyzes good/neutral/malefic combinations, checks repeated digit effects, and advises preferred total matches.',
    price: 299,
    premium: true,
    category: 'numerology',
    features: [
      'Automatic King (Psychic) & Conductor (Destiny) mapping',
      'Pairs matching rule-engine (Good, Neutral, Negative combos)',
      'Total Destiny Preference alignment checker',
      'AI-Powered professional Numerology report generation'
    ],
    iconName: 'Smartphone'
  }
];
