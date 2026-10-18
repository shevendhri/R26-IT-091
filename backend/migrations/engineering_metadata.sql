-- engineering_metadata.sql – creates data-driven tables for research-grade backend

BEGIN TRANSACTION;

-- 1. MaterialProperties (already exists as materials, keep for compatibility)
-- No changes – we will keep the existing `materials` table as the source of material attributes.

-- 2. MaterialBuildingCompatibility (many-to-many)
CREATE TABLE IF NOT EXISTS MaterialBuildingCompatibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    building_type TEXT NOT NULL,
    FOREIGN KEY (material_id) REFERENCES materials(Material_ID)
);

-- 3. MaterialClimateCompatibility (many-to-many)
CREATE TABLE IF NOT EXISTS MaterialClimateCompatibility (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    climate_zone TEXT NOT NULL,
    FOREIGN KEY (material_id) REFERENCES materials(Material_ID)
);

-- 4. StructuralSystemRequirements
CREATE TABLE IF NOT EXISTS StructuralSystemRequirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    system_name TEXT NOT NULL,
    building_type TEXT NOT NULL,
    min_floors INTEGER NOT NULL,
    max_floors INTEGER NOT NULL,
    description TEXT
);

-- 5. BuildingRequirements (project-level constraints)
CREATE TABLE IF NOT EXISTS BuildingRequirements (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    building_type TEXT NOT NULL,
    min_floors INTEGER,
    max_floors INTEGER,
    fire_rating_min TEXT,
    durability_min INTEGER,
    service_life_min INTEGER,
    budget_class TEXT,
    structural_systems TEXT, -- CSV of allowed system_name
    sustainability_target INTEGER,
    other_constraints TEXT
);

-- 6. EngineeringCriteriaWeights (used by MCDM for thresholds)
CREATE TABLE IF NOT EXISTS EngineeringCriteriaWeights (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    criterion TEXT NOT NULL,
    min_value REAL,
    max_value REAL,
    weight REAL,
    description TEXT
);

-- 7. MaterialExplanationTemplates
CREATE TABLE IF NOT EXISTS MaterialExplanationTemplates (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    material_id INTEGER NOT NULL,
    template_key TEXT NOT NULL,
    template_text TEXT NOT NULL,
    FOREIGN KEY (material_id) REFERENCES materials(Material_ID)
);

-- 8. CategoryAliases (UI ↔ canonical mapping)
CREATE TABLE IF NOT EXISTS CategoryAliases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    display_name TEXT NOT NULL,
    canonical_key TEXT NOT NULL
);

-- 9. StandardReferences (bibliography for engineering rules)
CREATE TABLE IF NOT EXISTS StandardReferences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    reference TEXT NOT NULL,
    url TEXT
);

COMMIT;
