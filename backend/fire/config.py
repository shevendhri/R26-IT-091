from functools import lru_cache
from pathlib import Path
from pydantic import AliasChoices, Field, field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ENV_FILE = Path(__file__).with_name(".env")

class Settings(BaseSettings):
    openai_api_key: str | None = None
    openai_model: str = "gpt-4.1-mini"
    openai_plan_model: str | None = None
    openai_base_url: str | None = None
    openai_organization: str | None = Field(default=None, validation_alias=AliasChoices("OPENAI_ORGANIZATION", "OPENAI_ORG_ID"))
    openai_project: str | None = Field(default=None, validation_alias=AliasChoices("OPENAI_PROJECT", "OPENAI_PROJECT_ID"))
    openai_plan_max_pages: int = 3
    openai_plan_max_file_mb: int = 20
    openai_overview_max_edge: int = 2200
    openai_tile_max_edge: int = 1800
    openai_image_max_bytes: int = 19_000_000
    openai_jpeg_quality: int = 85
    openai_tile_overlap: float = 0.12
    openai_max_detail_tiles: int = 6
    openai_max_detail_regions: int = 2
    openai_detail_concurrency: int = 2
    openai_request_timeout_seconds: int | None = Field(default=None, validation_alias=AliasChoices("OPENAI_REQUEST_TIMEOUT_SECONDS"))
    openai_plan_timeout_seconds: int = 60
    fireguard_fast_mode: bool = False
    fireguard_panel_mode: bool = False
    fireguard_fast_analysis_timeout_seconds: int = 40
    plan_reader: str = "local"
    plan_render_dpi: int = 200
    plan_extraction_schema_version: int = 2
    plan_pipeline_version: str = "semantic-regions-v1"
    drawing_analyzer: str = "local"
    ocr_engine: str = "auto"
    paddle_device: str = "cpu"
    paddle_enable_mkldnn: bool = False
    tesseract_cmd: str | None = None
    frontend_origin: str = "http://localhost:3000,http://localhost:5173"
    max_file_size_mb: int = 25
    pdf_dpi: int = 200
    fireguard_build_id: str = "2026-08-extraction-hardening-v2"
    fireguard_debug_extraction: bool = False
    model_config = SettingsConfigDict(env_file=ENV_FILE, extra="ignore", populate_by_name=True)

    @field_validator("openai_api_key", "openai_base_url", "openai_organization", "openai_project", mode="before")
    @classmethod
    def strip_optional_secret_config(cls, value):
        if isinstance(value, str):
            return value.strip()
        return value

    @property
    def origins(self) -> list[str]:
        return [value.strip() for value in self.frontend_origin.split(",") if value.strip()]

    @property
    def effective_plan_reader(self) -> str:
        reader=(self.plan_reader or "").lower()
        if reader in {"openai","local","auto"}:
            return reader
        legacy=(self.drawing_analyzer or "local").lower()
        return "openai" if legacy=="openai" else "local"

@lru_cache
def get_settings() -> Settings:
    return Settings()
