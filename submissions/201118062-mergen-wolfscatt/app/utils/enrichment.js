function normalizeText(value) {
  return (value || "").trim().replace(/\s+/g, " ");
}

function toSentence(value) {
  const cleaned = normalizeText(value);

  if (!cleaned) {
    return "";
  }

  const first = cleaned.charAt(0).toUpperCase();
  const rest = cleaned.slice(1);

  return /[.!?]$/.test(cleaned) ? `${first}${rest}` : `${first}${rest}.`;
}

function buildMvpList(scopeAnswer) {
  const parsed = normalizeText(scopeAnswer)
    .split(/,|;|\n/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 3);

  if (parsed.length > 0) {
    return parsed;
  }

  return ["Tek ana kullanıcı akışı", "Basit giriş ve çıktı ekranı"];
}

function buildIdeaSummary(idea, user, problem) {
  return `${toSentence(idea)} Bu ürün, ${user.toLocaleLowerCase(
    "tr-TR"
  )} için ${problem.toLocaleLowerCase("tr-TR")} problemini daha net ve odaklı bir MVP'ye dönüştürmeyi hedefler.`;
}

function buildFirstStep(user, scope, constraint) {
  const loweredConstraint = constraint.toLocaleLowerCase("tr-TR");

  if (loweredConstraint.includes("veri")) {
    return "İlk adım olarak veri kaynağının nasıl sağlanacağını ve MVP'de hangi verinin gerçekten gerekli olduğunu netleştir.";
  }

  if (loweredConstraint.includes("zaman")) {
    return "İlk adım olarak kapsamı tek ana kullanıcı akışına indir ve 1 haftada gösterilebilecek demo senaryosunu seç.";
  }

  if (loweredConstraint.includes("teknik")) {
    return "İlk adım olarak en riskli teknik parçayı küçük bir prototiple doğrula ve geri kalan akışı buna göre sadeleştir.";
  }

  return `${user} için "${scope}" odağında küçük bir demo akışı çıkar ve en kritik varsayımı erken test et.`;
}

export function generateSpec(idea, answers) {
  const safeIdea = normalizeText(idea);
  const safeProblem = normalizeText(answers.problem);
  const safeUser = normalizeText(answers.user);
  const safeScope = normalizeText(answers.scope);
  const safeConstraint = normalizeText(answers.constraint);

  return {
    ideaSummary: buildIdeaSummary(safeIdea, safeUser, safeProblem),
    problem: toSentence(safeProblem),
    targetUser: toSentence(safeUser),
    mvpItems: buildMvpList(safeScope),
    constraints: toSentence(safeConstraint),
    firstStep: buildFirstStep(safeUser, safeScope, safeConstraint)
  };
}
