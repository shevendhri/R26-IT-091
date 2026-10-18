import sys
import warnings
warnings.filterwarnings("ignore")

ROOT_DIR = r"C:\Users\ASUS\Desktop\Material specification"
if ROOT_DIR not in sys.path:
    sys.path.insert(0, ROOT_DIR)

from backend.recommendation_engine import recommendation_engine
from backend.questionnaire_engine import UserProfile

prof = UserProfile(project_type='Residential', budget_tier='Standard', eco_priority='Balanced', aesthetic_style='Contemporary')
out = recommendation_engine.recommend_package({'building_type': 'Residential', 'num_floors': 2, 'total_area': 170.0, 'structural_system': 'Concrete Frame'}, 'Kandy', prof)
pkg = out['recommended_package']
for k, v in pkg.items():
    if isinstance(v, dict):
        print(f"[{k}] {v.get('name')}: Score={v.get('score')} | Eng={v.get('eng_score')} | ML={v.get('ml_score')}")
