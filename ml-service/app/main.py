from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from app.bkt import update_mastery
from app.irt import select_difficulty, probability_correct, information_value
from app.recommendations import (
    build_recommendation,
    compute_analytics,
    get_learning_path,
    get_next_topic,
    get_weakest_skills,
)

app = FastAPI(
    title="LearnSmart ML Service",
    description="Bayesian Knowledge Tracing and Adaptive Assessment Engine",
    version="1.0.0",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class BKTUpdateRequest(BaseModel):
    skill: str
    correct: bool
    currentMastery: float = Field(default=0.3, ge=0, le=1)


class BKTUpdateResponse(BaseModel):
    skill: str
    previousMastery: float
    updatedMastery: float
    correct: bool


class BatchBKTRequest(BaseModel):
    responses: list[BKTUpdateRequest]


class AdaptiveSelectRequest(BaseModel):
    skill: str
    mastery: float = Field(ge=0, le=1)
    availableDifficulties: list[str] = ["easy", "medium", "hard"]


class AdaptiveSelectResponse(BaseModel):
    skill: str
    recommendedDifficulty: str
    mastery: float
    irtProbability: float


class AnalyticsRequest(BaseModel):
    masteryMap: dict[str, float]


class RecommendationRequest(BaseModel):
    masteryMap: dict[str, float]
    skill: str | None = None


@app.get("/health")
def health():
    return {"status": "ok", "service": "learnsmart-ml"}


@app.post("/bkt/update", response_model=BKTUpdateResponse)
def bkt_update(req: BKTUpdateRequest):
    updated = update_mastery(req.currentMastery, req.correct)
    return BKTUpdateResponse(
        skill=req.skill,
        previousMastery=req.currentMastery,
        updatedMastery=updated,
        correct=req.correct,
    )


@app.post("/bkt/batch-update")
def bkt_batch_update(req: BatchBKTRequest):
    results = []
    mastery_by_skill: dict[str, float] = {}

    for item in req.responses:
        current = mastery_by_skill.get(item.skill, item.currentMastery)
        updated = update_mastery(current, item.correct)
        mastery_by_skill[item.skill] = updated
        results.append({
            "skill": item.skill,
            "previousMastery": current,
            "updatedMastery": updated,
            "correct": item.correct,
        })

    return {"results": results, "masteryMap": mastery_by_skill}


@app.post("/irt/select-difficulty", response_model=AdaptiveSelectResponse)
def irt_select_difficulty(req: AdaptiveSelectRequest):
    difficulty = select_difficulty(req.mastery)
    if difficulty not in req.availableDifficulties and req.availableDifficulties:
        difficulty = req.availableDifficulties[0]
    prob = probability_correct(req.mastery, difficulty)  # type: ignore[arg-type]
    return AdaptiveSelectResponse(
        skill=req.skill,
        recommendedDifficulty=difficulty,
        mastery=req.mastery,
        irtProbability=round(prob, 4),
    )


@app.post("/irt/information")
def irt_information(req: AdaptiveSelectRequest):
    difficulties = req.availableDifficulties or ["easy", "medium", "hard"]
    return {
        "skill": req.skill,
        "mastery": req.mastery,
        "information": {
            d: round(information_value(req.mastery, d), 4)  # type: ignore[arg-type]
            for d in difficulties
        },
    }


@app.post("/analytics")
def analytics(req: AnalyticsRequest):
    data = compute_analytics(req.masteryMap)
    data["weakestSkills"] = get_weakest_skills(req.masteryMap, 3)
    data["learningPath"] = get_learning_path(req.masteryMap)
    data["nextTopic"] = get_next_topic(req.masteryMap)
    return data


@app.post("/recommendations")
def recommendations(req: RecommendationRequest):
    if req.skill:
        mastery = req.masteryMap.get(req.skill, 0.3)
        return build_recommendation(req.skill, mastery)

    weakest = get_weakest_skills(req.masteryMap, 1)
    if not weakest:
        return {"error": "No mastery data available"}
    skill = weakest[0]["skill"]
    return build_recommendation(skill, req.masteryMap[skill])


@app.post("/recommendations/batch")
def recommendations_batch(req: AnalyticsRequest):
    weakest = get_weakest_skills(req.masteryMap, 3)
    return [build_recommendation(w["skill"], w["masteryScore"]) for w in weakest]
