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

export interface Message {
  text: string;
  sender: 'user' | 'ai';
}