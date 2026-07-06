# Chapter 3: Methodology

## 3.1 Overall Architecture
The GreenConstructAI pipeline follows a sequential, modular architecture:
1. Scenario Definition (Building Type, Budget, Climate, etc.)
2. Blueprint Generation
3. Material Recommendation
4. Intelligent Furniture Placement
5. Layout Evaluation (Hybrid Scoring)

## 3.2 Dataset
A validation dataset of 80 unique scenarios was generated to test the system across four building types: Residential, Hotel, Hospital, and Office.

## 3.3 Material Recommendation Algorithm
The system utilizes a rule-based engine mapped to Sri Lankan climate zones (e.g., Highland, Dry Zone, Moderate Coastal). It applies budget constraints to select structural and finishing materials.

## 3.4 ML Model
A simulated neural network scorer evaluates the spatial fluidity, aesthetics, and user-centric design of the generated layouts.

## 3.5 Engineering Rule Engine
Deterministic checks ensure layouts adhere to physical constraints, such as overlapping boundaries, minimum clearance zones, and structural integrity.

## 3.6 Hybrid Scoring
The Hybrid Score is computed as a weighted average of the ML Score (aesthetics/fluidity) and the Engineering Score (structural compliance).

## 3.7 Blueprint Generator
A bottom-up procedural generator creates a spatial program of rooms based on the building type, subsequently packing them into a cohesive floor plan geometry.

## 3.8 Furniture Placement Engine
Utilizes bounding box collision detection and functional zone mapping to insert required furniture items into designated rooms without geometric intersections.

## 3.9 Validation Methodology
The system was validated by executing the pipeline on 80 parameterized scenarios. Output metrics (Runtime, Placement Success, Functional Coverage, Sustainability, and Hybrid Score) were statistically analyzed to determine system robustness.
