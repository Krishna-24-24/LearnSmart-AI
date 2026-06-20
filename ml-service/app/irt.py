"""Simplified 1-Parameter Logistic Item Response Theory."""

import math
from typing import Literal

Difficulty = Literal["easy", "medium", "hard"]

DIFFICULTY_B = {
    "easy": -1.0,
    "medium": 0.0,
    "hard": 1.0,
}


def probability_correct(mastery: float, difficulty: Difficulty) -> float:
    """P(correct | theta, b) using 1PL IRT."""
    theta = mastery * 2 - 1  # Map [0,1] mastery to [-1,1] ability scale
    b = DIFFICULTY_B[difficulty]
    return 1.0 / (1.0 + math.exp(-(theta - b)))


def select_difficulty(mastery: float) -> Difficulty:
    """Map mastery level to target question difficulty."""
    if mastery < 0.4:
        return "easy"
    if mastery <= 0.7:
        return "medium"
    return "hard"


def information_value(mastery: float, difficulty: Difficulty) -> float:
    """Fisher information — higher means better discrimination at this ability."""
    p = probability_correct(mastery, difficulty)
    p = max(0.001, min(0.999, p))
    return p * (1 - p)
