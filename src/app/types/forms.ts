export interface MaternalFormData {
  userId: string;
  name: string;
  age: number;
  contact: string;
  gravida: number;
  parity: number;
  educationLevel: number;
  householdIncome: string;
  distanceToClinic: number;
  bmi: number;
  historyMiscarriage: boolean;
  historyPretermBirth: boolean;
  uterineSurgery: boolean;
  multiplePregnancy: boolean;
  previousDepression: boolean;
  familyHistoryDiabetes: boolean;
  previousAnaemia: boolean;
  thyroidDisorder: boolean;
  baselineBloodSugar: number;
  folicAcidIntake: number;
  registrationDate: string;
  weeklyData: WeeklyFormData[];
}

export interface NeonatalFormData {
  userId: string;
  motherName: string;
  motherAge: number;
  contact: string;
  deliveryDate: string;
  gestationalAge: number;
  birthWeight: number;
  birthLength: number;
  headCircumference: number;
  apgarScore: number;
  multipleBirth: boolean;
  birthComplications: boolean;
  requiresNICU: boolean;
  jaundice: boolean;
  respiratoryIssues: boolean;
  feedingIssues: boolean;
  congenitalAnomalies: boolean;
  maternalDiabetes: boolean;
  maternalHypertension: boolean;
  registrationDate: string;
  weeklyData?: NeonatalWeeklyData[];
}

export interface WeeklyFormData {
  gestationalAge: number;
  weightChange: number;
  bloodPressure: string;
  sleepHours: number;
  stressLevel: number;
  supportScore: number;
  phq2Score: number;
  anxietyScore: number;
  bleedingEpisodes: boolean;
  painCramping: boolean;
  contractionCount: boolean;
  fluidLeak: boolean;
  utiSymptoms: boolean;
  tirednessScore: number;
  dizzinessEpisodes: number;
  paleness: boolean;
  ironTablets: number;
  muac: number;
  dietaryIron: number;
  thirstFrequency: number;
  urinationFrequency: number;
  bloodSugar: number;
  appetiteScore: number;
  dietaryDiversity: number;
  mealFrequency: number;
  swelling: boolean;
  hairCondition: boolean;
  skinCondition: boolean;
  physicalActivity: number;
  slowHealingWounds: boolean;
  userId?: string;
  submissionDate: string;
  weekNumber: number;
}

export interface NeonatalWeeklyData {
  weekNumber: number;
  weightGain: number;
  heightGain: number;
  headCircumferenceGain: number;
  temperature: number;
  respiratoryRate: number;
  heartRate: number;
  feedingPattern: 'poor' | 'fair' | 'good' | 'excellent';
  feedingFrequency: number;
  urinationFrequency: number;
  stoolFrequency: number;
  sleepPattern: 'poor' | 'fair' | 'good' | 'excellent';
  sleepHours: number;
  skinColor: 'normal' | 'pale' | 'jaundiced' | 'cyanotic';
  skinCondition: 'normal' | 'rash' | 'dry' | 'other';
  umbilicalCordHealing: boolean;
  eyeCondition: 'normal' | 'discharge' | 'redness' | 'other';
  cryPattern: 'normal' | 'high-pitched' | 'weak' | 'excessive';
  jaundice: boolean;
  vomiting: boolean;
  diarrhea: boolean;
  fever: boolean;
  cough: boolean;
  breathing: 'normal' | 'fast' | 'difficult' | 'noisy';
  activity: 'normal' | 'lethargic' | 'irritable' | 'excessive-crying';
  immunizationsUpToDate: boolean;
  vitaminSupplements: boolean;
  issues: string[];
  notes: string;
  userId?: string;
  submissionDate: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string;
}