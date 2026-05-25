export interface PiiResult {
  hasRisk: boolean;
  confidence: number;
  severity: 'CRITICAL' | 'HIGH' | 'LOW' | 'NONE';
  maskedText: string;
}

export class PiiInterceptor {
  private static readonly CRITICAL_KEYWORDS = ['TC Kimlik', 'Apple', 'Amazon', 'IBAN', 'Kredi Kartı'];

  public static analyze(text: string): PiiResult {
    let hasRisk = false;
    let maskedText = text;

    for (const keyword of this.CRITICAL_KEYWORDS) {
      const regex = new RegExp(keyword, 'gi');
      if (regex.test(maskedText)) {
        hasRisk = true;
        maskedText = maskedText.replace(regex, '[REDACTED]');
      }
    }

    if (hasRisk) {
      return {
        hasRisk: true,
        confidence: 0.98,
        severity: 'CRITICAL',
        maskedText
      };
    }

    return {
      hasRisk: false,
      confidence: 1.0,
      severity: 'NONE',
      maskedText: text
    };
  }
}
