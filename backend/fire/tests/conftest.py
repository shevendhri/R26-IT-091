import os,sys
import importlib
from pathlib import Path
os.environ.setdefault("OPENAI_API_KEY","test-key")
os.environ.setdefault("FIREGUARD_FAST_MODE","false")
os.environ.setdefault("OPENAI_REQUEST_TIMEOUT_SECONDS","12")
repo_root = Path(__file__).resolve().parents[3]
sys.path.insert(0, str(repo_root))
backend_pkg = importlib.import_module("backend")

for name in (
    "config",
    "pdf_utils",
    "schemas",
    "project_builder",
    "recommendations",
    "openai_diagnostics",
    "main",
    "rules",
    "drawing_understanding",
    "scripts",
):
    module = importlib.import_module(f"backend.fire.{name}")
    sys.modules[f"backend.{name}"] = module
    setattr(backend_pkg, name, module)
