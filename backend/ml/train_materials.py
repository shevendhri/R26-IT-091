import pickle
import numpy as np
from sklearn.ensemble import RandomForestClassifier

# Synthetic training data for GreenConstructAI (v3 - Building Type Aware)
# Features: [Humidity, Soil, Budget, Landscape, BuildingType]
# Landscape: 0: Coastal, 1: Mountain, 2: Inland
# BuildingType: 0: Residential, 1: Commercial, 2: Industrial
# Target: 0 (Concrete), 1 (Masonry / Blocks)

X = []
y = []

# Generate data
for h in range(30, 100, 15):
    for s in np.arange(0.5, 2.1, 0.5):
        for b in [100000, 500000, 2000000, 10000000]:
            for l in [0, 1, 2]: # Landscape
                for t in [0, 1, 2]: # Building Type
                    X.append([float(h), float(s), float(b), float(l), float(t)])
                    
                    # Logic for Target Label
                    label = 0 # Default to Concrete (0)
                    
                    # 1. Industrial (2) always needs Concrete (0)
                    if t == 2:
                        label = 0
                    # 2. Low Budget (< 300k) and Residential (0) prefers Masonry (1)
                    elif b < 300000 and t == 0:
                        label = 1
                    # 3. Inland (2) with low humidity and Residential (0) prefers Masonry (1)
                    elif l == 2 and h < 50 and t == 0:
                        label = 1
                    # 4. Mountains (1) with stable soil (s < 1.0) and low budget can use Masonry
                    elif l == 1 and s < 1.0 and b < 500000 and t == 0:
                        label = 1
                    # 5. Otherwise, if it's high budget or high load (Commercial/Industrial), use Concrete
                    elif b > 2000000 or t >= 1:
                        label = 0
                    else:
                        label = 0
                    
                    y.append(label)

# Train model
model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

# Save model
model_data = {
    "model": model,
    "description": "Trained GreenConstructAI Material Classifier (v3 - Building Type Aware)",
    "features": ["Humidity", "Soil", "Budget", "Landscape", "BuildingType"],
    "mapping": {
        "landscape": {0: "Coastal", 1: "Mountain", 2: "Inland"},
        "building_type": {0: "Residential", 1: "Commercial", 2: "Industrial"}
    }
}

with open("ecobuild_model.pkl", "wb") as f:
    pickle.dump(model_data, f)

print("New GreenConstructAI model (v3 - Building Type Aware) trained and saved!")
