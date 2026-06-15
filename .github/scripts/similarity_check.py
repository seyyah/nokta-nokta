#!/usr/bin/env python3
"""
Cross-submission similarity detection.
Her submission klasörünün README + kod dosyalarını okur, TF-IDF cosine similarity ile karşılaştırır.
Eşik >= 0.80 → flag. İlk commit zamanı erken olan orijinal, geç olan kopyacı (-%35).
"""

import os
import sys
import json
import subprocess
from pathlib import Path
from datetime import datetime
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

SIMILARITY_THRESHOLD = 0.80


def student_id_from_name(folder_name: str) -> str:
    """submissions/<id>-<slug> formatından öğrenci numarasını çıkar.
    Örn: '231118098-tohum' → '231118098'
    Aynı id'ye sahip submission'lar kendi aralarında benzerlik cezasından muaftır.
    """
    return folder_name.split("-")[0]
PENALTY_PERCENT = 0.35
SUBMISSIONS_DIR = Path("submissions")

# Hangi dosyalar similarity hesabına girer
INCLUDE_EXTENSIONS = {".md", ".js", ".jsx", ".ts", ".tsx", ".json"}
# Boilerplate — karşılaştırmaya dahil etme
EXCLUDE_PATTERNS = {"node_modules", ".expo", "android", "ios", "build", "dist", "package-lock.json", "yarn.lock"}


def collect_submission_text(sub_dir: Path) -> str:
    """Bir submission klasöründeki tüm anlamlı metin içeriğini birleştirir."""
    texts = []
    for path in sub_dir.rglob("*"):
        if not path.is_file():
            continue
        if path.suffix not in INCLUDE_EXTENSIONS:
            continue
        if any(excl in path.parts for excl in EXCLUDE_PATTERNS):
            continue
        try:
            content = path.read_text(encoding="utf-8", errors="ignore")
            # package.json'dan sadece scripts/dependencies anahtarlarını al, değerleri atla
            if path.name == "package.json":
                continue
            texts.append(content)
        except Exception:
            continue
    return "\n".join(texts)


def first_commit_time(sub_dir: Path) -> datetime:
    """Bu klasöre yapılmış ilk commit'in timestamp'i."""
    try:
        result = subprocess.run(
            ["git", "log", "--reverse", "--format=%aI", "--", str(sub_dir)],
            capture_output=True, text=True, check=True
        )
        first_line = result.stdout.strip().split("\n")[0]
        return datetime.fromisoformat(first_line)
    except Exception:
        return datetime.max


def main():
    if not SUBMISSIONS_DIR.exists():
        print("No submissions/ directory found.")
        sys.exit(0)

    submissions = sorted([d for d in SUBMISSIONS_DIR.iterdir() if d.is_dir()])
    if len(submissions) < 2:
        print("Less than 2 submissions, skipping similarity.")
        sys.exit(0)

    # Metin topla
    names = []
    texts = []
    for sub in submissions:
        text = collect_submission_text(sub)
        if not text.strip():
            continue
        names.append(sub.name)
        texts.append(text)

    # TF-IDF + cosine
    vectorizer = TfidfVectorizer(max_features=5000, ngram_range=(1, 2), stop_words="english")
    try:
        matrix = vectorizer.fit_transform(texts)
    except ValueError:
        print("Empty corpus, skipping.")
        sys.exit(0)

    sim_matrix = cosine_similarity(matrix)

    # Flag çiftleri bul
    flags = []
    for i in range(len(names)):
        for j in range(i + 1, len(names)):
            # Aynı öğrenci numarasına ait submission'lar → benzerlik cezasından muaf
            if student_id_from_name(names[i]) == student_id_from_name(names[j]):
                continue

            score = float(sim_matrix[i][j])
            if score >= SIMILARITY_THRESHOLD:
                t_i = first_commit_time(SUBMISSIONS_DIR / names[i])
                t_j = first_commit_time(SUBMISSIONS_DIR / names[j])
                if t_i <= t_j:
                    original, copycat = names[i], names[j]
                else:
                    original, copycat = names[j], names[i]
                flags.append({
                    "original": original,
                    "copycat": copycat,
                    "similarity": round(score, 4),
                    "penalty_percent": PENALTY_PERCENT * 100,
                    "note": "different students",
                })

    # Her submission için final similarity skoru (20 puan üzerinden)
    scores = {}
    flagged_copycats = {f["copycat"] for f in flags}
    for name in names:
        if name in flagged_copycats:
            scores[name] = {"similarity_points": 20, "penalty_applied": True, "penalty_percent": 35}
        else:
            scores[name] = {"similarity_points": 20, "penalty_applied": False, "penalty_percent": 0}

    output = {
        "threshold": SIMILARITY_THRESHOLD,
        "flags": flags,
        "scores": scores,
    }

    Path("scoring").mkdir(exist_ok=True)
    Path("scoring/similarity.json").write_text(json.dumps(output, indent=2, ensure_ascii=False))
    print(json.dumps(output, indent=2, ensure_ascii=False))


if __name__ == "__main__":
    main()