import pathlib
import random

# -------------------------------------------------------------------
# Validation framework configuration
# -------------------------------------------------------------------

# Deterministic seed for reproducibility
RANDOM_SEED = 42
random.seed(RANDOM_SEED)

# Hybrid weighting constants (must remain 0.75 engineering, 0.25 ML)
HYBRID_WEIGHT_ENGINEERING = 0.75
HYBRID_WEIGHT_ML = 0.25

# Scenario counts per sector (must sum to 130)
SCENARIO_COUNTS = {
    "Residential": 50,
    "Commercial": 20,
    "Industrial": 20,
    "Hospital": 20,
    "Educational": 20,
}

# Sri Lankan climate locations to be used in the scenarios
LOCATIONS = [
    "Colombo",
    "Jaffna",
    "Kandy",
    "Galle",
    "Hambantota",
    "Nuwara Eliya",
    "Batticaloa",
    "Anuradhapura",
]

# API endpoint – use the same recommendation endpoint as the frontend
API_URL = "http://127.0.0.1:5000/api/recommendations"

# Paths for generated artefacts (relative to project root)
BASE_ARTIFACT_DIR = pathlib.Path("artifacts")
BASE_ARTIFACT_DIR.mkdir(exist_ok=True)

CSV_RESULTS = BASE_ARTIFACT_DIR / "validation_results.csv"
TRACE_JSON = BASE_ARTIFACT_DIR / "engineering_traceability.json"
# VERIFICATION_REPORT_MD defined directly below; removed undefined alias
VERIFICATION_REPORT_MD = BASE_ARTIFACT_DIR / "verification_report.md"
PERFORMANCE_REPORT_MD = BASE_ARTIFACT_DIR / "performance_report.md"
STATISTICS_MD = BASE_ARTIFACT_DIR / "validation_statistics.md"
SYSTEM_SUMMARY_MD = BASE_ARTIFACT_DIR / "system_validation_summary.md"
WALKTHROUGH_MD = BASE_ARTIFACT_DIR / "walkthrough.md"

# Figure output directory (PNG files)
FIGURES_DIR = BASE_ARTIFACT_DIR / "figures"
FIGURES_DIR.mkdir(exist_ok=True)

# Mapping of figure filenames
FIGURES = {
    "engineering_score": FIGURES_DIR / "engineering_score_dist.png",
    "ml_score": FIGURES_DIR / "ml_score_dist.png",
    "hybrid_score": FIGURES_DIR / "hybrid_score_dist.png",
    "engineering_confidence": FIGURES_DIR / "engineering_confidence_dist.png",
    "prediction_confidence": FIGURES_DIR / "prediction_confidence_dist.png",
    "climate_confidence": FIGURES_DIR / "climate_confidence_dist.png",
    "constraint_pass_rate": FIGURES_DIR / "constraint_pass_rate.png",
    "material_selection": FIGURES_DIR / "material_selection_freq.png",
    "response_time": FIGURES_DIR / "response_time_dist.png",
}

# Directory for final dissertation evidence package
EVIDENCE_DIR = BASE_ARTIFACT_DIR / "dissertation_evidence"
EVIDENCE_DIR.mkdir(exist_ok=True)
