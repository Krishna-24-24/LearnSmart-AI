"""Bayesian Knowledge Tracing implementation."""

from dataclasses import dataclass


@dataclass
class BKTParams:
    p_l0: float = 0.3   # Prior probability of knowing
    p_t: float = 0.09   # Probability of learning after practice
    p_g: float = 0.2    # Probability of guessing correctly
    p_s: float = 0.1    # Probability of slipping (know but wrong)


DEFAULT_PARAMS = BKTParams()


def update_mastery(
    current_mastery: float,
    correct: bool,
    params: BKTParams = DEFAULT_PARAMS,
) -> float:
    """Update mastery estimate after one response using BKT."""
    p_l = max(0.001, min(0.999, current_mastery))

    if correct:
        numerator = p_l * (1 - params.p_s)
        denominator = numerator + (1 - p_l) * params.p_g
        p_l_given_obs = numerator / denominator if denominator > 0 else p_l
    else:
        numerator = p_l * params.p_s
        denominator = numerator + (1 - p_l) * (1 - params.p_g)
        p_l_given_obs = numerator / denominator if denominator > 0 else p_l

    p_l_new = p_l_given_obs + (1 - p_l_given_obs) * params.p_t
    return round(max(0.0, min(1.0, p_l_new)), 4)
