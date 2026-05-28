import { ActivityLevel, DailyLog, Goal, UserProfile } from '../context/AppContext';

function clamp(value: number, min: number, max: number) {
  return Math.max(min, Math.min(max, value));
}

const ACTIVITY_MULTIPLIER: Record<ActivityLevel, number> = {
  low: 1.2,
  medium: 1.45,
  high: 1.7,
};

const GOAL_CALORIE_ADJUSTMENT: Record<Goal, number> = {
  lose: -350,
  maintain: 0,
  gain: 250,
};

function qualityScore(mealsText: string) {
  const text = mealsText.toLowerCase();
  const positive = ['salata', 'sebze', 'protein', 'yogurt', 'tavuk', 'balik', 'yulaf', 'meyve'];
  const negative = ['kizartma', 'fast food', 'cips', 'tatli', 'gazli', 'burger', 'pizza'];
  const pos = positive.filter((item) => text.includes(item)).length;
  const neg = negative.filter((item) => text.includes(item)).length;
  return clamp(16 + pos * 4 - neg * 5, 0, 32);
}

function fitMessage(score: number) {
  if (score >= 80) return 'Super gidiyorsun. Bu ritmi korursan hedefe stabil ilerlersin.';
  if (score >= 65) return 'Iyi bir gun. Suyu biraz artirip aksami hafif tutarsan yarin skor yukselir.';
  if (score >= 50) return 'Temel duzeydesin. Yarin ogun planini netlestirip kisa bir yuruyus ekle.';
  return 'Bugun toparlanma lazim. Sana 3 gunluk sade bir plan oneriyorum.';
}

export const aiSimulationService = {
  calculateBMI(profile: UserProfile) {
    const h = profile.heightCm / 100;
    return Number((profile.weightKg / (h * h)).toFixed(1));
  },

  calculateTDEE(profile: UserProfile, activityLevel: ActivityLevel) {
    const bmr =
      10 * profile.weightKg +
      6.25 * profile.heightCm -
      5 * profile.age +
      (profile.gender === 'male' ? 5 : -161);
    return Math.round(bmr * ACTIVITY_MULTIPLIER[activityLevel]);
  },

  calculateFitScore(profile: UserProfile, mealsText: string, waterLiters: number, activityLevel: ActivityLevel) {
    const bmi = this.calculateBMI(profile);
    const tdee = this.calculateTDEE(profile, activityLevel);
    const hydration = clamp((waterLiters / 2.5) * 28, 0, 28);
    const activity = activityLevel === 'high' ? 28 : activityLevel === 'medium' ? 20 : 12;
    const nutrition = qualityScore(mealsText);
    const bmiBalance = clamp(18 - Math.abs(22 - bmi) * 2.1, 8, 18);
    const goalBonus = profile.goal === 'lose' ? 4 : profile.goal === 'gain' ? 5 : 3;

    const fitScore = Math.round(clamp(hydration + activity + nutrition + bmiBalance + goalBonus, 0, 100));

    return {
      fitScore,
      bmi,
      tdee,
      targetCalories: tdee + GOAL_CALORIE_ADJUSTMENT[profile.goal],
      coachMessage: fitMessage(fitScore),
    };
  },

  getRecoveryMealPlan(goal: Goal): DailyLog['mealPlan'] {
    const maintainPlan = [
      { breakfast: 'Omlet + tam tahilli ekmek', lunch: 'Tavuklu salata + ayran', dinner: 'Sebze corbasi + yogurt' },
      { breakfast: 'Yulaf + yogurt + meyve', lunch: 'Ton balikli sandvic', dinner: 'Izgara kofte + salata' },
      { breakfast: 'Haslanmis yumurta + avokado', lunch: 'Mercimek bowl', dinner: 'Firin tavuk + brokoli' },
    ];
    const losePlan = [
      { breakfast: 'Yulaf + chia + yogurt', lunch: 'Buyuk yesil salata + tavuk', dinner: 'Sebze yemegi + cacik' },
      { breakfast: '2 yumurta + domates', lunch: 'Ton balikli salata', dinner: 'Mercimek corbasi + yogurt' },
      { breakfast: 'Protein smoothie', lunch: 'Hindi wrap + ayran', dinner: 'Firin somon + sebze' },
    ];
    const gainPlan = [
      { breakfast: 'Yulaf + sut + muz + fistik ezmesi', lunch: 'Pilav + tavuk + yogurt', dinner: 'Somon + patates' },
      { breakfast: 'Omlet + peynirli tost', lunch: 'Kiymali makarna + ayran', dinner: 'Et sote + bulgur' },
      { breakfast: 'Granola + yogurt + kuruyemis', lunch: 'Tavuklu sandvic', dinner: 'Kuru fasulye + pirinc' },
    ];
    if (goal === 'lose') return losePlan;
    if (goal === 'gain') return gainPlan;
    return maintainPlan;
  },
};
