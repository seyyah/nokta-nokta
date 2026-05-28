import { MASCOT_RESPONSES } from '../constants/mockData';
import { routeToExpert, shouldSuggestExpert, getMentorTypeForText } from './expertRouter';

function getRandomItem<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateResponse(text: string): string {
  const route = routeToExpert(text);

  if (route) {
    const key = route.mentorType;
    const responses = MASCOT_RESPONSES[key] ?? MASCOT_RESPONSES['default'];
    return getRandomItem(responses);
  }

  return getRandomItem(MASCOT_RESPONSES['default']);
}

function getDetectedKeyword(text: string): string | null {
  return routeToExpert(text)?.matchedKeyword ?? null;
}

function getMentorTypeForKeyword(keyword: string): string {
  return getMentorTypeForText(keyword);
}

export const MockMascotService = {
  generateResponse,
  shouldSuggestExpert,
  getDetectedKeyword,
  getMentorTypeForKeyword,
};
