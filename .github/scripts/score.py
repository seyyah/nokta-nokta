#!/usr/bin/env python3
"""
Deterministic rubric scoring. Her submission için:
- Çalışır Teslim: 35p (README Expo link + demo video + APK + README var)
- Scope Disiplini: 25p (track belirtilmiş + README içerik checklist)
- Anti-Slop: 20p (similarity.json'dan)
- Engineering Trace: 20p (commit sayısı + mesaj kalitesi + decision log)
- APK bonus: +3 / yoksa -5
- Çılgınlık +10: manuel (bu script atlar)
"""

import os
import re
import json
import subprocess
from pathlib import Path

SUBMISSIONS_DIR = Path("submissions")
SCORING_DIR = Path("scoring")
SCORING_DIR.mkdir(exist_ok=True)


def commit_count(sub_dir: Path) -> int:
    try:
        result = subprocess.run(
            ["git", "log", "--oneline", "--", str(sub_dir)],
            capture_output=True, text=True, check=True
        )
        return len([l for l in result.stdout.strip().split("\n") if l])
    except Exception:
        return 0


def meaningful_commits(sub_dir: Path) -> int:
    """Generic mesajları elemeye yarar: 'update', 'fix', 'wip' tek başına sayılmaz."""
    try:
        result = subprocess.run(
            ["git", "log", "--format=%s", "--", str(sub_dir)],
            capture_output=True, text=True, check=True
        )
        lines = [l.strip() for l in result.stdout.strip().split("\n") if l.strip()]
        generic = {"update", "fix", "wip", "changes", "commit", "asdf", "test", ".", "..", "..."}
        meaningful = [l for l in lines if len(l) >= 10 and l.lower() not in generic]
        return len(meaningful)
    except Exception:
        return 0


def score_submission(sub_dir: Path, similarity_data: dict) -> dict:
    name = sub_dir.name
    breakdown = {}
    penalties = []

    # --- Challenge Version Detection
    # If a submission directory contains FORGE.md or the audit-reports/ folder, it is Challenge 2
    has_forge = (sub_dir / "FORGE.md").exists()
    has_audit_reports_dir = (sub_dir / "audit-reports").exists() and (sub_dir / "audit-reports").is_dir()
    
    if has_forge or has_audit_reports_dir:
        challenge_version = 2
    else:
        challenge_version = 1

    # --- Çalışır Teslim (35p)
    readme = sub_dir / "README.md"
    readme_text = readme.read_text(encoding="utf-8", errors="ignore") if readme.exists() else ""

    has_readme = readme.exists()
    has_expo_link = bool(re.search(r"(expo\.dev|exp\.host|expo-go|snack\.expo)", readme_text, re.IGNORECASE))
    has_demo_video = bool(re.search(r"(youtube|youtu\.be|loom|drive\.google|vimeo)", readme_text, re.IGNORECASE))
    has_apk = any(sub_dir.glob("*.apk"))
    has_app_json = (sub_dir / "app.json").exists() or any(sub_dir.rglob("app.json"))

    delivery_pts = 0
    if has_readme: delivery_pts += 7
    if has_expo_link: delivery_pts += 10
    if has_demo_video: delivery_pts += 10
    if has_apk: delivery_pts += 5
    if has_app_json: delivery_pts += 3

    # Challenge 2 specific: audit reports count check
    num_reports = 0
    if challenge_version == 2:
        if has_audit_reports_dir:
            markdown_reports = [f for f in (sub_dir / "audit-reports").rglob("*.md") if f.is_file()]
            num_reports = len(markdown_reports)
        
        if num_reports < 3:
            delivery_pts = max(0, delivery_pts - 10)
            penalties.append({
                "reason": f"Yetersiz audit raporu ({num_reports}/3)",
                "applied": "-10 on Çalışır Teslim"
            })

    breakdown["delivery"] = {
        "points": delivery_pts, "max": 35,
        "readme": has_readme, "expo_link": has_expo_link,
        "demo_video": has_demo_video, "apk": has_apk, "app_json": has_app_json,
    }
    if challenge_version == 2:
        breakdown["delivery"]["audit_reports_count"] = num_reports

    # --- Scope Disiplini (25p)
    track_match = re.search(r"track[:\s]*([ABC])", readme_text, re.IGNORECASE)
    track = track_match.group(1).upper() if track_match else None
    decision_log = bool(re.search(r"(decision log|karar.{0,10}log|kararlar)", readme_text, re.IGNORECASE))
    readme_long_enough = len(readme_text) >= 500

    scope_pts = 0
    if track: scope_pts += 10
    if decision_log: scope_pts += 8
    if readme_long_enough: scope_pts += 7
    breakdown["scope"] = {
        "points": scope_pts, "max": 25,
        "track": track, "decision_log": decision_log, "readme_length": len(readme_text),
    }

    # --- Anti-Slop (20p) — similarity.json'dan
    sim_entry = similarity_data.get("scores", {}).get(name, {})
    if sim_entry.get("penalty_applied"):
        antislop_pts = int(20 * (1 - 0.35))
        penalties.append({"reason": "similarity >= 0.80", "applied": "-35% on antislop"})
    else:
        antislop_pts = 20
    breakdown["antislop"] = {"points": antislop_pts, "max": 20, "flagged": sim_entry.get("penalty_applied", False)}

    # --- Engineering Trace (20p)
    total_commits = commit_count(sub_dir)
    good_commits = meaningful_commits(sub_dir)

    trace_pts = 0
    if total_commits >= 5: trace_pts += 8
    elif total_commits >= 3: trace_pts += 4
    if good_commits >= 5: trace_pts += 7
    elif good_commits >= 3: trace_pts += 4
    if decision_log: trace_pts += 5

    # Challenge 2 specific: missing FORGE.md sets Engineering Trace to 0
    if challenge_version == 2 and not has_forge:
        trace_pts = 0
        penalties.append({
            "reason": "FORGE.md eksik",
            "applied": "Engineering Trace = 0"
        })

    breakdown["trace"] = {
        "points": trace_pts, "max": 20,
        "total_commits": total_commits, "meaningful_commits": good_commits,
    }
    if challenge_version == 2:
        breakdown["trace"]["has_forge"] = has_forge

    base_score = delivery_pts + scope_pts + antislop_pts + trace_pts

    # --- APK bonus / ceza
    apk_adjustment = 0
    if has_apk:
        apk_adjustment = +3
    else:
        apk_adjustment = -5
        penalties.append({"reason": "APK eksik", "applied": "-5"})

    final_before_manual = base_score + apk_adjustment

    return {
        "submission": name,
        "challenge_version": challenge_version,
        "base_score": base_score,
        "apk_adjustment": apk_adjustment,
        "final_auto": final_before_manual,
        "manual_craziness_bonus_pending": "demo day +0..+10",
        "breakdown": breakdown,
        "penalties": penalties,
    }


def main():
    sim_path = SCORING_DIR / "similarity.json"
    similarity_data = json.loads(sim_path.read_text()) if sim_path.exists() else {"scores": {}}

    # --- Frozen Ch1 scores: load and preserve without rescoring ---
    frozen_ch1_path = SCORING_DIR / "scores_ch1.json"
    frozen_ch1_results = []
    frozen_ch1_names = set()
    if frozen_ch1_path.exists():
        frozen_data = json.loads(frozen_ch1_path.read_text())
        frozen_ch1_results = frozen_data.get("results", [])
        frozen_ch1_names = {r["submission"] for r in frozen_ch1_results}
        print(f"Loaded {len(frozen_ch1_results)} frozen Ch1 submissions from scores_ch1.json")

    # Only score submissions NOT already frozen as Ch1
    submissions = sorted([d for d in SUBMISSIONS_DIR.iterdir() if d.is_dir()])
    ch2_results = [
        score_submission(sub, similarity_data)
        for sub in submissions
        if sub.name not in frozen_ch1_names
    ]

    # Combine frozen Ch1 + new Ch2
    results = frozen_ch1_results + ch2_results

    # Sıralı tablo
    results.sort(key=lambda r: r["final_auto"], reverse=True)

    out = {"count": len(results), "results": results}
    (SCORING_DIR / "scores.json").write_text(json.dumps(out, indent=2, ensure_ascii=False))

    # Markdown özet
    md = ["# Auto Scoring (manual craziness bonus ayrıca eklenecek)\n"]
    md.append("| Submission | Challenge | Auto Score | Delivery | Scope | Anti-Slop | Trace | APK | Flags |")
    md.append("|---|---|---|---|---|---|---|---|---|")
    for r in results:
        b = r["breakdown"]
        flags = "⚠️" if b["antislop"]["flagged"] else ""
        apk = "✅ +3" if r["apk_adjustment"] > 0 else "❌ -5"
        ch_str = f"Challenge {r['challenge_version']}"
        md.append(
            f"| `{r['submission']}` | **{ch_str}** | **{r['final_auto']}** | "
            f"{b['delivery']['points']}/35 | {b['scope']['points']}/25 | "
            f"{b['antislop']['points']}/20 | {b['trace']['points']}/20 | {apk} | {flags} |"
        )
    (SCORING_DIR / "scores.md").write_text("\n".join(md))
    print("\n".join(md))


if __name__ == "__main__":
    main()