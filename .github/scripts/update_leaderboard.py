#!/usr/bin/env python3
"""
LEADERBOARD.md regenerator.

Inputs:
  - scoring/scores.json      (produced by .github/scripts/score.py)
  - scoring/similarity.json  (produced by .github/scripts/similarity_check.py)
  - gh pr list --state merged --json number,author,files,mergedAt
    (requires GH_TOKEN; available as ${{ github.token }} inside Actions)

Output:
  - LEADERBOARD.md (overwritten; do not hand-edit — changes will be lost)

Mapping logic: a submission folder is attributed to the *latest* merged PR that
touched any path under submissions/<name>/. Direct-to-main commits with no PR
show "—" in the PR / Author columns.
"""
from __future__ import annotations

import json
import re
import subprocess
from collections import defaultdict
from datetime import datetime, timezone
from pathlib import Path

SCORING_DIR = Path("scoring")
LEADERBOARD_FILE = Path("LEADERBOARD.md")
TOP_N = 15


def load_json(path: Path, default):
    if not path.exists():
        return default
    return json.loads(path.read_text(encoding="utf-8"))


def pr_map_from_gh() -> dict[str, dict]:
    """submission folder name -> {"pr": int, "author": str}; latest merged PR wins."""
    try:
        result = subprocess.run(
            [
                "gh", "pr", "list", "--state", "merged", "--limit", "500",
                "--json", "number,author,mergedAt",
            ],
            capture_output=True, text=True, check=True,
        )
        prs = json.loads(result.stdout)
    except (subprocess.CalledProcessError, FileNotFoundError, json.JSONDecodeError) as e:
        print(f"WARN: gh pr list failed: {e}")
        prs = []

    # Map PR number -> author username
    pr_to_author = {}
    for pr in prs:
        author = (pr.get("author") or {}).get("login", "")
        pr_to_author[pr["number"]] = author

    mapping: dict[str, dict] = {}
    
    # Iterate through all folders in submissions/ and find their PR info using git log
    submissions_dir = Path("submissions")
    if submissions_dir.exists():
        for sub_dir in sorted(submissions_dir.iterdir()):
            if not sub_dir.is_dir():
                continue
            folder_name = sub_dir.name
            
            try:
                # Find the commit message and author of the latest change to this folder
                res = subprocess.run(
                    ["git", "log", "-n", "1", "--format=%s|%an", "--", str(sub_dir)],
                    capture_output=True, text=True, check=True
                )
                output = res.stdout.strip()
                if output:
                    subject, git_author = output.split("|", 1)
                    # Extract PR number like (#302) from the end of the subject
                    match = re.search(r"\(#(\d+)\)\s*$", subject)
                    if match:
                        pr_num = int(match.group(1))
                        # Look up author from gh pr list mapping
                        author = pr_to_author.get(pr_num)
                        if not author:
                            # Fallback: query PR details specifically
                            try:
                                pr_details_res = subprocess.run(
                                    ["gh", "pr", "view", str(pr_num), "--json", "author"],
                                    capture_output=True, text=True, check=True
                                )
                                pr_details = json.loads(pr_details_res.stdout)
                                author = (pr_details.get("author") or {}).get("login", "")
                            except Exception:
                                author = git_author
                        mapping[folder_name] = {"pr": pr_num, "author": author}
                    else:
                        # Direct commit or no PR number found in message, use git author as author
                        mapping[folder_name] = {"pr": None, "author": git_author}
            except Exception as e:
                print(f"Error mapping {folder_name}: {e}")
                
    return mapping


def render(scores: dict, similarity: dict, pr_map: dict[str, dict]) -> str:
    results = scores.get("results", [])
    flagged = {f["copycat"] for f in similarity.get("flags", [])}

    # Group results by challenge version
    results_ch1 = [r for r in results if r.get("challenge_version", 1) == 1]
    results_ch2 = [r for r in results if r.get("challenge_version", 1) == 2]

    def get_top_contributors(ch_results):
        by_author: dict[str, list] = defaultdict(list)
        for r in ch_results:
            info = pr_map.get(r["submission"], {})
            author = info.get("author") or ""
            if not author:
                continue
            by_author[author].append((r["final_auto"], r["submission"], info.get("pr")))

        top = []
        for author, subs in by_author.items():
            subs.sort(reverse=True)
            best_score, _, best_pr = subs[0]
            top.append({
                "author": author,
                "best_score": best_score,
                "submission_count": len(subs),
                "best_pr": best_pr,
            })
        top.sort(key=lambda x: (-x["best_score"], -x["submission_count"], x["author"].lower()))
        return top

    top_ch1 = get_top_contributors(results_ch1)
    top_ch2 = get_top_contributors(results_ch2)

    out: list[str] = []
    out.append("# 🏆 Nokta Leaderboard\n")
    out.append(
        "Otomatik puanlama: `.github/scripts/score.py` rubric ile her submission'a "
        "0–110 arası skor verir. Anti-slop + APK düzeltmesi dahil. "
        "\"Çılgınlık +10\" bonusu demo gününde elden eklenecek.\n"
    )
    out.append("**Rubric (Challenge 1 - Away Mission):** Delivery 35 + Scope 25 + Anti-Slop 20 + Trace 20 + APK (±3/−5) = 110 max.\n")
    out.append("**Rubric (Challenge 2 - Audit-Forge):** Aynı temel puanlama geçerlidir. Ancak `FORGE.md` dosyası eksikse Engineering Trace otomatik olarak **0** puanlanır. `audit-reports/` altında en az 3 adet `.md` raporu yoksa Çalışır Teslim puanından **-10** düşülür.\n")
    out.append("---\n")

    def render_challenge_tables(title, ch_results, ch_top):
        lines = []
        lines.append(f"## {title}\n")
        
        lines.append("### Top Contributors")
        lines.append("| Rank | Contributor | Best Score | Submissions | Best PR |")
        lines.append("|---|---|---|---|---|")
        if not ch_top:
            lines.append("| — | — | — | — | — |")
        for i, t in enumerate(ch_top[:TOP_N], 1):
            pr_link = f"#{t['best_pr']}" if t["best_pr"] else "—"
            lines.append(
                f"| {i} | [@{t['author']}](https://github.com/{t['author']}) | "
                f"**{t['best_score']}** | {t['submission_count']} | {pr_link} |"
            )
        lines.append("")

        lines.append("### All Submissions")
        lines.append("| Rank | Submission | Score | Delivery | Scope | Anti-Slop | Trace | APK | Author | PR | Flags |")
        lines.append("|---|---|---|---|---|---|---|---|---|---|---|")
        if not ch_results:
            lines.append("| — | — | — | — | — | — | — | — | — | — | — |")
        sorted_results = sorted(ch_results, key=lambda r: -r["final_auto"])
        for i, r in enumerate(sorted_results, 1):
            b = r["breakdown"]
            flag = "⚠️ similarity" if r["submission"] in flagged else ""
            apk = "+3 ✅" if r["apk_adjustment"] > 0 else "−5 ❌"
            info = pr_map.get(r["submission"], {})
            author = info.get("author") or ""
            author_cell = f"@{author}" if author else "—"
            pr_cell = f"#{info['pr']}" if info.get("pr") else "—"
            lines.append(
                f"| {i} | `{r['submission']}` | **{r['final_auto']}** | "
                f"{b['delivery']['points']}/35 | {b['scope']['points']}/25 | "
                f"{b['antislop']['points']}/20 | {b['trace']['points']}/20 | {apk} | "
                f"{author_cell} | {pr_cell} | {flag} |"
            )
        lines.append("")
        return lines

    # Render Challenge 1
    out.extend(render_challenge_tables("☄️ Challenge 1: Away Mission", results_ch1, top_ch1))
    out.append("---\n")

    # Render Challenge 2
    out.extend(render_challenge_tables("🛠️ Challenge 2: Audit-Forge Mission", results_ch2, top_ch2))
    out.append("---\n")

    out.append("## Anti-Slop (Similarity ≥ 0.80)\n")
    out.append(
        "TF-IDF cosine similarity; `.github/scripts/similarity_check.py` detayını üretir. "
        "Daha geç commit eden \"copycat\" sayılır ve anti-slop puanı %35 ceza alır.\n"
    )
    out.append("| Original | Copycat | Similarity |")
    out.append("|---|---|---|")
    flags_sorted = sorted(similarity.get("flags", []), key=lambda f: -f["similarity"])
    if not flags_sorted:
        out.append("| — | — | — |")
    for f in flags_sorted:
        out.append(f"| `{f['original']}` | `{f['copycat']}` | **{f['similarity']:.3f}** |")
    out.append("")

    now = datetime.now(timezone.utc).strftime("%Y-%m-%d %H:%M UTC")
    contributors = {info.get("author") for info in pr_map.values() if info.get("author")}
    out.append("---\n")
    out.append(f"**Last Updated:** {now}\n")
    out.append(f"**Total Contributors:** {len(contributors)}\n")
    out.append(f"**Total Submissions (Challenge 1):** {len(results_ch1)}\n")
    out.append(f"**Total Submissions (Challenge 2):** {len(results_ch2)}\n")
    out.append(f"**Similarity flags:** {len(flags_sorted)}\n")
    out.append("")
    out.append(
        "🤖 Otomatik üretildi — kaynak: `scoring/scores.json` + `gh pr list --state merged`. "
        "Manuel \"Çılgınlık +10\" bonusu eklenmedi."
    )

    return "\n".join(out) + "\n"


def main() -> None:
    scores = load_json(SCORING_DIR / "scores.json", {"count": 0, "results": []})
    similarity = load_json(SCORING_DIR / "similarity.json", {"flags": [], "scores": {}})
    pr_map = pr_map_from_gh()
    LEADERBOARD_FILE.write_text(render(scores, similarity, pr_map), encoding="utf-8")
    print(f"Wrote {LEADERBOARD_FILE} — {scores.get('count', 0)} submissions, "
          f"{len(pr_map)} mapped to PRs")


if __name__ == "__main__":
    main()
