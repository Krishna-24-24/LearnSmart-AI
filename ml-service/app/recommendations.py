"""Explainable recommendation engine."""

from typing import Any

SKILL_ERROR_HINTS: dict[str, str] = {
    "Arrays": "Off-by-one errors in index bounds or incorrect two-pointer movement.",
    "Strings": "Missing edge cases for empty strings or incorrect character comparisons.",
    "Linked Lists": "Losing references during pointer updates or failing to handle null nodes.",
    "Stacks": "Incorrect push/pop order or not checking for underflow conditions.",
    "Queues": "Confusing front/rear pointers or improper circular queue wrap-around.",
    "Trees": "Incorrect recursive base cases or misidentifying left/right subtrees.",
    "Graphs": "Missing visited tracking or incorrect BFS/DFS traversal order.",
    "Binary Search": "Incorrect boundary updates in the search interval.",
    "Dynamic Programming": "Wrong state transition or overlapping subproblem identification.",
}

SKILL_ACTIONS: dict[str, str] = {
    "Arrays": "Attempt Beginner Array Manipulation Set.",
    "Strings": "Review string pattern matching fundamentals.",
    "Linked Lists": "Practice pointer manipulation with a Linked List starter set.",
    "Stacks": "Complete the Stack Operations practice module.",
    "Queues": "Work through Queue implementation exercises.",
    "Trees": "Study tree traversals and attempt Beginner Tree Set.",
    "Graphs": "Practice BFS/DFS with the Graph Fundamentals set.",
    "Binary Search": "Attempt Beginner Binary Search Set.",
    "Dynamic Programming": "Start with 1D DP patterns and tabulation basics.",
}

MASTERY_THRESHOLD = 0.7


def build_recommendation(skill: str, mastery: float) -> dict[str, Any]:
    pct = round(mastery * 100)
    return {
        "skill": skill,
        "masteryScore": mastery,
        "masteryPercent": pct,
        "explanation": (
            f"Your mastery score is {pct}%, "
            f"{'below' if mastery < MASTERY_THRESHOLD else 'at or above'} "
            f"the recommended threshold of {int(MASTERY_THRESHOLD * 100)}%."
        ),
        "commonError": SKILL_ERROR_HINTS.get(skill, "Review core concepts for this skill."),
        "suggestedAction": SKILL_ACTIONS.get(skill, f"Practice more {skill} problems."),
    }


def get_weakest_skills(mastery_map: dict[str, float], count: int = 3) -> list[dict]:
    sorted_skills = sorted(mastery_map.items(), key=lambda x: x[1])
    return [
        {"skill": skill, "masteryScore": score, "masteryPercent": round(score * 100)}
        for skill, score in sorted_skills[:count]
    ]


def get_learning_path(mastery_map: dict[str, float]) -> list[str]:
    """Generate learning path: weakest to strongest skills."""
    return [skill for skill, _ in sorted(mastery_map.items(), key=lambda x: x[1])]


def get_next_topic(mastery_map: dict[str, float]) -> dict | None:
    """Recommend the weakest skill below threshold."""
    weakest = get_weakest_skills(mastery_map, count=1)
    if not weakest:
        return None
    skill_data = weakest[0]
    if skill_data["masteryScore"] >= MASTERY_THRESHOLD:
        return {
            "skill": skill_data["skill"],
            "masteryScore": skill_data["masteryScore"],
            "masteryPercent": skill_data["masteryPercent"],
            "reason": "All skills are above the recommended threshold. Keep practicing!",
        }
    rec = build_recommendation(skill_data["skill"], skill_data["masteryScore"])
    return {
        "skill": rec["skill"],
        "masteryScore": rec["masteryScore"],
        "masteryPercent": rec["masteryPercent"],
        "reason": rec["explanation"],
    }


def compute_analytics(mastery_map: dict[str, float]) -> dict:
    if not mastery_map:
        return {
            "averageMastery": 0,
            "weakestSkill": None,
            "strongestSkill": None,
            "skillCount": 0,
        }
    scores = list(mastery_map.values())
    weakest = min(mastery_map.items(), key=lambda x: x[1])
    strongest = max(mastery_map.items(), key=lambda x: x[1])
    return {
        "averageMastery": round(sum(scores) / len(scores), 4),
        "averageMasteryPercent": round(sum(scores) / len(scores) * 100),
        "weakestSkill": {"skill": weakest[0], "masteryScore": weakest[1]},
        "strongestSkill": {"skill": strongest[0], "masteryScore": strongest[1]},
        "skillCount": len(mastery_map),
    }
