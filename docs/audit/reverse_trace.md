# Reverse Traceability (3 Recommendations)

## Recommendation 1

**API Payload**

```{
  "building_type": "Residential",
  "num_floors": 3,
  "total_area": 250.0,
  "structural_system": "Concrete Frame",
  "budget": 0.0
}```

**API Response (selected package)**

```{
  "foundation": {
    "name": "Lime-Pozzolan Natural Foundation",
    "score": 78.87,
    "cost_guidance": "LKR 787,302",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Optimized for Moderate Coastal Humid climate soil conditions. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
    "sustainability_rating": 92,
    "service_life": 80,
    "embodied_carbon": 0.12,
    "eng_score": 85.35,
    "ml_score": 59.43978085441751,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Optimized for Moderate Coastal Humid climate soil conditions.",
      "durability": "Offers structural capacity rating of 60/100 and service life of 80 years.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 85.35,
      "criterion_breakdown": {
        "structural": {
          "score": 25.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 12.0,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 5.0,
          "max": 10
        },
        "maintenance": {
          "score": 3.75,
          "max": 5
        },
        "sustainability": {
          "score": 4.6,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Very Good"
    },
    "material_id": "123"
  },
  "structural": {
    "name": "GFRP Rebar (Glass Fibre Reinforced Polymer)",
    "score": 63.83,
    "cost_guidance": "LKR 9,209,550",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.",
    "sustainability_rating": 80,
    "service_life": 100,
    "embodied_carbon": 0.55,
    "eng_score": 83.25,
    "ml_score": 5.554885253109653,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 83.25,
      "criterion_breakdown": {
        "structural": {
          "score": 25.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 13.5,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.75,
          "max": 5
        },
        "sustainability": {
          "score": 4.0,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "132"
  },
  "concrete": {
    "name": "Gr. 30 Marine-Grade Concrete Mix",
    "score": 62.36,
    "cost_guidance": "LKR 45,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #3). Climate: Mandatory sulphate and corrosion resistance for high-salinity coastal environments. Sustainability: Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
    "sustainability_rating": 46,
    "service_life": 100,
    "embodied_carbon": 0.68,
    "eng_score": 82.8,
    "ml_score": 1.0344486444861951,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#3",
      "hybrid_rank": "#1",
      "climate": "Mandatory sulphate and corrosion resistance for high-salinity coastal environments.",
      "durability": "Extreme durability against chloride penetration with a 100-year target service life.",
      "sustainability": "Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
      "cost": "Premium specification justified by extreme durability requirements in coastal zones."
    },
    "engineering_metadata": {
      "engineering_score": 82.8,
      "criterion_breakdown": {
        "structural": {
          "score": 22.5,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 14.25,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 4.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.25,
          "max": 5
        },
        "sustainability": {
          "score": 2.3,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "125"
  },
  "walls": {
    "name": "CSEB Compressed Stabilized Earth Block",
    "score": 76.65,
    "cost_guidance": "LKR 754,431",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for thermal performance and humidity resistance. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.08 kgCO2/kg.",
    "sustainability_rating": 98,
    "service_life": 60,
    "embodied_carbon": 0.08,
    "eng_score": 79.9,
    "ml_score": 66.90978667767811,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#2",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for thermal performance and humidity resistance.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.08 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 79.9,
      "criterion_breakdown": {
        "structural": {
          "score": 15.5,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 11.4,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 9.2,
          "max": 10
        },
        "maintenance": {
          "score": 3.9,
          "max": 5
        },
        "sustainability": {
          "score": 4.9,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "136"
  },
  "roofing": {
    "name": "Portuguese Clay Tile (Unglazed Terracotta)",
    "score": 48.94,
    "cost_guidance": "LKR 374,647",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Provides weather protection and thermal comfort for Moderate Coastal Humid climate. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.18 kgCO2/kg.",
    "sustainability_rating": 85,
    "service_life": 65,
    "embodied_carbon": 0.18,
    "eng_score": 63.1125,
    "ml_score": 6.440167909147777,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#4",
      "hybrid_rank": "#1",
      "climate": "Provides weather protection and thermal comfort for Moderate Coastal Humid climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.18 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 63.1125,
      "criterion_breakdown": {
        "structural": {
          "score": 2.5,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 8.06,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 9.2,
          "max": 10
        },
        "maintenance": {
          "score": 4.1,
          "max": 5
        },
        "sustainability": {
          "score": 4.25,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "140"
  },
  "windows": {
    "name": "uPVC Multi-Chamber Window System",
    "score": 65.82,
    "cost_guidance": "LKR 72,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
    "sustainability_rating": 82,
    "service_life": 45,
    "embodied_carbon": 0.28,
    "eng_score": 62.1375,
    "ml_score": 76.88493886482394,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 62.1375,
      "criterion_breakdown": {
        "structural": {
          "score": 3.75,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 6.19,
          "max": 15
        },
        "service_life": {
          "score": 9.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 9.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.6,
          "max": 5
        },
        "sustainability": {
          "score": 4.1,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "147"
  },
  "doors": {
    "name": "Steel Security Door (Powder-Coated)",
    "score": 56.36,
    "cost_guidance": "LKR 65,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #3). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
    "sustainability_rating": 40,
    "service_life": 40,
    "embodied_carbon": 0.72,
    "eng_score": 74.375,
    "ml_score": 2.299871897096107,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#3",
      "hybrid_rank": "#1",
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 74.375,
      "criterion_breakdown": {
        "structural": {
          "score": 21.25,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 10.88,
          "max": 15
        },
        "service_life": {
          "score": 8.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 3.5,
          "max": 10
        },
        "maintenance": {
          "score": 3.75,
          "max": 5
        },
        "sustainability": {
          "score": 2.0,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "157"
  },
  "flooring": {
    "name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "score": 55.42,
    "cost_guidance": "LKR 902,160",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #3). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
    "sustainability_rating": 75,
    "service_life": 65,
    "embodied_carbon": 0.22,
    "eng_score": 73.1625,
    "ml_score": 2.206679136093368,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#3",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 73.1625,
      "criterion_breakdown": {
        "structural": {
          "score": 13.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 11.21,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 5.8,
          "max": 10
        },
        "maintenance": {
          "score": 4.4,
          "max": 5
        },
        "sustainability": {
          "score": 3.75,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "160"
  },
  "ceiling": {
    "name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "score": 54.04,
    "cost_guidance": "LKR 473,634",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 25,
    "embodied_carbon": 0.05,
    "eng_score": 51.7125,
    "ml_score": 61.00793421848556,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#2",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 51.7125,
      "criterion_breakdown": {
        "structural": {
          "score": 2.5,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 3.56,
          "max": 15
        },
        "service_life": {
          "score": 5.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 6.8,
          "max": 10
        },
        "maintenance": {
          "score": 4.1,
          "max": 5
        },
        "sustainability": {
          "score": 4.75,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "167"
  },
  "finishes": {
    "name": "Eco-Friendly Low VOC Emulsion",
    "score": 32.42,
    "cost_guidance": "LKR 818,955",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 15,
    "embodied_carbon": 0.12,
    "eng_score": 41.3125,
    "ml_score": 5.757639889014179,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 41.3125,
      "criterion_breakdown": {
        "structural": {
          "score": 1.25,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 2.06,
          "max": 15
        },
        "service_life": {
          "score": 3.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.25,
          "max": 5
        },
        "sustainability": {
          "score": 4.75,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "179"
  },
  "waterproofing": {
    "name": "Crystalline Slurry Waterproofing (Penetrating)",
    "score": 42.71,
    "cost_guidance": "LKR 234,713",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Designed to prevent moisture ingress under 2400mm annual rainfall. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 58,
    "service_life": 60,
    "embodied_carbon": 0.05,
    "eng_score": 55.275,
    "ml_score": 5.019066216900306,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Designed to prevent moisture ingress under 2400mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 55.275,
      "criterion_breakdown": {
        "structural": {
          "score": 3.75,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 7.88,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.75,
          "max": 5
        },
        "sustainability": {
          "score": 2.9,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "173"
  }
}```

**Selected Material ID:** 123

---

## Recommendation 2

**API Payload**

```{
  "building_type": "Commercial",
  "num_floors": 5,
  "total_area": 500.0,
  "structural_system": "Steel Frame",
  "budget": 100000.0
}```

**API Response (selected package)**

```{
  "foundation": {
    "name": "Raft Foundation Assembly (RC Heavy)",
    "score": 71.33,
    "cost_guidance": "LKR 207,740",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #2). Climate: Optimized for Moderate Coastal Humid climate soil conditions. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.8 kgCO2/kg.",
    "sustainability_rating": 42,
    "service_life": 120,
    "embodied_carbon": 0.8,
    "eng_score": 84.85,
    "ml_score": 30.765090955955,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#2",
      "ml_rank": "#2",
      "hybrid_rank": "#1",
      "climate": "Optimized for Moderate Coastal Humid climate soil conditions.",
      "durability": "Offers structural capacity rating of 98/100 and service life of 120 years.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.8 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 84.85,
      "criterion_breakdown": {
        "structural": {
          "score": 25.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 14.85,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 3.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.4,
          "max": 5
        },
        "sustainability": {
          "score": 2.1,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "122"
  },
  "structural": {
    "name": "GFRP Rebar (Glass Fibre Reinforced Polymer)",
    "score": 62.96,
    "cost_guidance": "LKR 1,381,800",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.",
    "sustainability_rating": 80,
    "service_life": 100,
    "embodied_carbon": 0.55,
    "eng_score": 83.25,
    "ml_score": 2.0878944951260268,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 83.25,
      "criterion_breakdown": {
        "structural": {
          "score": 25.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 13.5,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.75,
          "max": 5
        },
        "sustainability": {
          "score": 4.0,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "132"
  },
  "concrete": {
    "name": "Gr. 30 Marine-Grade Concrete Mix",
    "score": 62.44,
    "cost_guidance": "LKR 45,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Mandatory sulphate and corrosion resistance for high-salinity coastal environments. Sustainability: Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
    "sustainability_rating": 46,
    "service_life": 100,
    "embodied_carbon": 0.68,
    "eng_score": 82.8,
    "ml_score": 1.3589283425963545,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
      "hybrid_rank": "#1",
      "climate": "Mandatory sulphate and corrosion resistance for high-salinity coastal environments.",
      "durability": "Extreme durability against chloride penetration with a 100-year target service life.",
      "sustainability": "Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
      "cost": "Premium specification justified by extreme durability requirements in coastal zones."
    },
    "engineering_metadata": {
      "engineering_score": 82.8,
      "criterion_breakdown": {
        "structural": {
          "score": 22.5,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 14.25,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 4.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.25,
          "max": 5
        },
        "sustainability": {
          "score": 2.3,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "125"
  },
  "walls": {
    "name": "Hollow Clay Block (Perforated)",
    "score": 57.71,
    "cost_guidance": "LKR 337,554",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Traditional thermal mass properties suitable for dry and intermediate climates. Sustainability: Made from local natural clay, though requiring high firing energy.",
    "sustainability_rating": 78,
    "service_life": 65,
    "embodied_carbon": 0.18,
    "eng_score": 75.5875,
    "ml_score": 4.074293941668994,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#4",
      "hybrid_rank": "#1",
      "climate": "Traditional thermal mass properties suitable for dry and intermediate climates.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Made from local natural clay, though requiring high firing energy.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 75.5875,
      "criterion_breakdown": {
        "structural": {
          "score": 13.75,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 11.44,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 7.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.0,
          "max": 5
        },
        "sustainability": {
          "score": 3.9,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "137"
  },
  "roofing": {
    "name": "Green Intensive Roof System (Growing Medium)",
    "score": 65.15,
    "cost_guidance": "LKR 117,312",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Standard climate compatibility with enhanced resilience to moisture variability. Sustainability: Features low embodied carbon (0.1 kgCO2/kg) and high recyclability (95/100).",
    "sustainability_rating": 98,
    "service_life": 50,
    "embodied_carbon": 0.1,
    "eng_score": 63.8,
    "ml_score": 69.1842117433581,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.1 kgCO2/kg) and high recyclability (95/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "engineering_metadata": {
      "engineering_score": 63.8,
      "criterion_breakdown": {
        "structural": {
          "score": 3.75,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 6.75,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 9.8,
          "max": 10
        },
        "maintenance": {
          "score": 3.6,
          "max": 5
        },
        "sustainability": {
          "score": 4.9,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "144"
  },
  "windows": {
    "name": "uPVC Multi-Chamber Window System",
    "score": 59.78,
    "cost_guidance": "LKR 72,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
    "sustainability_rating": 82,
    "service_life": 45,
    "embodied_carbon": 0.28,
    "eng_score": 62.1375,
    "ml_score": 52.70424473508686,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 62.1375,
      "criterion_breakdown": {
        "structural": {
          "score": 3.75,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 6.19,
          "max": 15
        },
        "service_life": {
          "score": 9.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 9.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.6,
          "max": 5
        },
        "sustainability": {
          "score": 4.1,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "147"
  },
  "doors": {
    "name": "Steel Security Door (Powder-Coated)",
    "score": 56.15,
    "cost_guidance": "LKR 65,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #6). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
    "sustainability_rating": 40,
    "service_life": 40,
    "embodied_carbon": 0.72,
    "eng_score": 74.375,
    "ml_score": 1.4909361513733395,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#6",
      "hybrid_rank": "#1",
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 74.375,
      "criterion_breakdown": {
        "structural": {
          "score": 21.25,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 10.88,
          "max": 15
        },
        "service_life": {
          "score": 8.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 3.5,
          "max": 10
        },
        "maintenance": {
          "score": 3.75,
          "max": 5
        },
        "sustainability": {
          "score": 2.0,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "157"
  },
  "flooring": {
    "name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "score": 58.97,
    "cost_guidance": "LKR 135,360",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
    "sustainability_rating": 75,
    "service_life": 65,
    "embodied_carbon": 0.22,
    "eng_score": 73.1625,
    "ml_score": 16.388496226167597,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 73.1625,
      "criterion_breakdown": {
        "structural": {
          "score": 13.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 11.21,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 5.8,
          "max": 10
        },
        "maintenance": {
          "score": 4.4,
          "max": 5
        },
        "sustainability": {
          "score": 3.75,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "160"
  },
  "ceiling": {
    "name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "score": 54.64,
    "cost_guidance": "LKR 71,064",
    "rationale": "Selected via Hybrid AI (Eng Rank: #3, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 25,
    "embodied_carbon": 0.05,
    "eng_score": 51.7125,
    "ml_score": 63.41920017185421,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#3",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 51.7125,
      "criterion_breakdown": {
        "structural": {
          "score": 2.5,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 3.56,
          "max": 15
        },
        "service_life": {
          "score": 5.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 6.8,
          "max": 10
        },
        "maintenance": {
          "score": 4.1,
          "max": 5
        },
        "sustainability": {
          "score": 4.75,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "167"
  },
  "finishes": {
    "name": "Advanced Nano-Exterior Paint",
    "score": 29.56,
    "cost_guidance": "LKR 521,223",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.",
    "sustainability_rating": 65,
    "service_life": 12,
    "embodied_carbon": 0.25,
    "eng_score": 38.875,
    "ml_score": 1.6003223252601684,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 38.875,
      "criterion_breakdown": {
        "structural": {
          "score": 1.25,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 1.73,
          "max": 15
        },
        "service_life": {
          "score": 2.4,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.25,
          "max": 5
        },
        "sustainability": {
          "score": 3.25,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "178"
  },
  "waterproofing": {
    "name": "Crystalline Slurry Waterproofing (Penetrating)",
    "score": 41.48,
    "cost_guidance": "LKR 90,288",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #5). Climate: Designed to prevent moisture ingress under 2400mm annual rainfall. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 58,
    "service_life": 60,
    "embodied_carbon": 0.05,
    "eng_score": 55.275,
    "ml_score": 0.10949050176104734,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#5",
      "hybrid_rank": "#1",
      "climate": "Designed to prevent moisture ingress under 2400mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 55.275,
      "criterion_breakdown": {
        "structural": {
          "score": 3.75,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 7.88,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.75,
          "max": 5
        },
        "sustainability": {
          "score": 2.9,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "173"
  }
}```

**Selected Material ID:** 122

---

## Recommendation 3

**API Payload**

```{
  "building_type": "Industrial",
  "num_floors": 2,
  "total_area": 150.0,
  "structural_system": "Concrete Frame",
  "budget": 50000.0
}```

**API Response (selected package)**

```{
  "foundation": {
    "name": "Raft Foundation Assembly (RC Heavy)",
    "score": 68.13,
    "cost_guidance": "LKR 464,100",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #2). Climate: Optimized for Moderate Coastal Humid climate soil conditions. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.8 kgCO2/kg.",
    "sustainability_rating": 42,
    "service_life": 120,
    "embodied_carbon": 0.8,
    "eng_score": 84.85,
    "ml_score": 17.98260740493106,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#2",
      "ml_rank": "#2",
      "hybrid_rank": "#1",
      "climate": "Optimized for Moderate Coastal Humid climate soil conditions.",
      "durability": "Offers structural capacity rating of 98/100 and service life of 120 years.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.8 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 84.85,
      "criterion_breakdown": {
        "structural": {
          "score": 25.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 14.85,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 3.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.4,
          "max": 5
        },
        "sustainability": {
          "score": 2.1,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "122"
  },
  "structural": {
    "name": "Stainless Steel Rebar (Grade 316L)",
    "score": 63.23,
    "cost_guidance": "LKR 1,965,600",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 1.25 kgCO2/kg.",
    "sustainability_rating": 35,
    "service_life": 150,
    "embodied_carbon": 1.25,
    "eng_score": 82.125,
    "ml_score": 6.5331760449026195,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#2",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 1.25 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 82.125,
      "criterion_breakdown": {
        "structural": {
          "score": 25.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 14.62,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.75,
          "max": 5
        },
        "sustainability": {
          "score": 1.75,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "131"
  },
  "concrete": {
    "name": "Gr. 30 Marine-Grade Concrete Mix",
    "score": 62.61,
    "cost_guidance": "LKR 45,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Mandatory sulphate and corrosion resistance for high-salinity coastal environments. Sustainability: Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
    "sustainability_rating": 46,
    "service_life": 100,
    "embodied_carbon": 0.68,
    "eng_score": 82.8,
    "ml_score": 2.034151483673976,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
      "hybrid_rank": "#1",
      "climate": "Mandatory sulphate and corrosion resistance for high-salinity coastal environments.",
      "durability": "Extreme durability against chloride penetration with a 100-year target service life.",
      "sustainability": "Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
      "cost": "Premium specification justified by extreme durability requirements in coastal zones."
    },
    "engineering_metadata": {
      "engineering_score": 82.8,
      "criterion_breakdown": {
        "structural": {
          "score": 22.5,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 14.25,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 4.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.25,
          "max": 5
        },
        "sustainability": {
          "score": 2.3,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Good"
    },
    "material_id": "125"
  },
  "walls": {
    "name": "High-Density Cement Block",
    "score": 49.88,
    "cost_guidance": "LKR 157,295",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Selected for thermal performance and humidity resistance. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.",
    "sustainability_rating": 46,
    "service_life": 40,
    "embodied_carbon": 0.38,
    "eng_score": 66.05,
    "ml_score": 1.3819961605115145,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#4",
      "hybrid_rank": "#1",
      "climate": "Selected for thermal performance and humidity resistance.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.38 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 66.05,
      "criterion_breakdown": {
        "structural": {
          "score": 14.5,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 8.85,
          "max": 15
        },
        "service_life": {
          "score": 8.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 4.8,
          "max": 10
        },
        "maintenance": {
          "score": 2.6,
          "max": 5
        },
        "sustainability": {
          "score": 2.3,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "135"
  },
  "roofing": {
    "name": "Marine-Grade Aluminium Roofing (0.55mm)",
    "score": 46.75,
    "cost_guidance": "LKR 85,176",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #2). Climate: Provides weather protection and thermal comfort for Moderate Coastal Humid climate. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.",
    "sustainability_rating": 65,
    "service_life": 45,
    "embodied_carbon": 0.48,
    "eng_score": 56.2875,
    "ml_score": 18.117552207386844,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#2",
      "ml_rank": "#2",
      "hybrid_rank": "#1",
      "climate": "Provides weather protection and thermal comfort for Moderate Coastal Humid climate.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.48 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 56.2875,
      "criterion_breakdown": {
        "structural": {
          "score": 3.75,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 6.19,
          "max": 15
        },
        "service_life": {
          "score": 9.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 4.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.6,
          "max": 5
        },
        "sustainability": {
          "score": 3.25,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "139"
  },
  "windows": {
    "name": "uPVC Multi-Chamber Window System",
    "score": 17.87,
    "cost_guidance": "LKR 72,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #6, ML Rank: #1). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
    "sustainability_rating": 82,
    "service_life": 45,
    "embodied_carbon": 0.28,
    "eng_score": 0.0,
    "ml_score": 71.48628239414968,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#6",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 0.0,
      "criterion_breakdown": {
        "structural": {
          "score": 3.75,
          "max": 25
        },
        "climate": {
          "score": 0.0,
          "max": 20
        },
        "durability": {
          "score": 6.19,
          "max": 15
        },
        "service_life": {
          "score": 9.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 9.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.6,
          "max": 5
        },
        "sustainability": {
          "score": 4.1,
          "max": 5
        }
      },
      "engineering_confidence": 33.3,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "147"
  },
  "doors": {
    "name": "Aluminium Profile Glass Door (Heavy-Duty)",
    "score": 51.38,
    "cost_guidance": "LKR 85,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #6). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.",
    "sustainability_rating": 52,
    "service_life": 50,
    "embodied_carbon": 0.58,
    "eng_score": 67.925,
    "ml_score": 1.736810472899708,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#6",
      "hybrid_rank": "#1",
      "climate": "Engineered to minimize air infiltration and resist corrosion under saline/humid drafts.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.58 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 67.925,
      "criterion_breakdown": {
        "structural": {
          "score": 12.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 9.22,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 5.2,
          "max": 10
        },
        "maintenance": {
          "score": 3.9,
          "max": 5
        },
        "sustainability": {
          "score": 2.6,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "154"
  },
  "flooring": {
    "name": "Rubber Flooring (Recycled Automotive)",
    "score": 52.36,
    "cost_guidance": "LKR 142,800",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Standard climate compatibility with enhanced resilience to moisture variability. Sustainability: Features low embodied carbon (0.28 kgCO2/kg) and high recyclability (92/100).",
    "sustainability_rating": 80,
    "service_life": 30,
    "embodied_carbon": 0.28,
    "eng_score": 64.075,
    "ml_score": 17.219080755308227,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Standard climate compatibility with enhanced resilience to moisture variability.",
      "durability": "Meets target durability with high moisture resistance and structural stability under typical tropical loads.",
      "sustainability": "Features low embodied carbon (0.28 kgCO2/kg) and high recyclability (92/100).",
      "cost": "Optimizes lifecycle costs by reducing thermal load and maintenance overheads."
    },
    "engineering_metadata": {
      "engineering_score": 64.075,
      "criterion_breakdown": {
        "structural": {
          "score": 12.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 6.97,
          "max": 15
        },
        "service_life": {
          "score": 6.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 5.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.6,
          "max": 5
        },
        "sustainability": {
          "score": 4.0,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "164"
  },
  "ceiling": {
    "name": "Calcium Silicate Board Ceiling",
    "score": 39.23,
    "cost_guidance": "LKR 54,432",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
    "sustainability_rating": 62,
    "service_life": 30,
    "embodied_carbon": 0.28,
    "eng_score": 51.975,
    "ml_score": 0.9867680017218262,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 51.975,
      "criterion_breakdown": {
        "structural": {
          "score": 2.0,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 3.98,
          "max": 15
        },
        "service_life": {
          "score": 6.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 7.5,
          "max": 10
        },
        "maintenance": {
          "score": 4.4,
          "max": 5
        },
        "sustainability": {
          "score": 3.1,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "170"
  },
  "finishes": {
    "name": "Advanced Nano-Exterior Paint",
    "score": 29.82,
    "cost_guidance": "LKR 311,623",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.",
    "sustainability_rating": 65,
    "service_life": 12,
    "embodied_carbon": 0.25,
    "eng_score": 38.875,
    "ml_score": 2.6545754214591386,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#1",
      "hybrid_rank": "#1",
      "climate": "Selected for general compatibility with regional tropical environmental parameters.",
      "durability": "Standard durability profile providing adequate resistance for typical residential application.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.25 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 38.875,
      "criterion_breakdown": {
        "structural": {
          "score": 1.25,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 1.73,
          "max": 15
        },
        "service_life": {
          "score": 2.4,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.25,
          "max": 5
        },
        "sustainability": {
          "score": 3.25,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "178"
  },
  "waterproofing": {
    "name": "Crystalline Slurry Waterproofing (Penetrating)",
    "score": 42.06,
    "cost_guidance": "LKR 107,920",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Designed to prevent moisture ingress under 2400mm annual rainfall. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 58,
    "service_life": 60,
    "embodied_carbon": 0.05,
    "eng_score": 55.275,
    "ml_score": 2.4089361170920176,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
      "hybrid_rank": "#1",
      "climate": "Designed to prevent moisture ingress under 2400mm annual rainfall.",
      "durability": "High moisture resistance (100/100) ensuring structural protection.",
      "sustainability": "Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
      "cost": "Cost-optimized solution for standard construction project requirements."
    },
    "engineering_metadata": {
      "engineering_score": 55.275,
      "criterion_breakdown": {
        "structural": {
          "score": 3.75,
          "max": 25
        },
        "climate": {
          "score": 20.0,
          "max": 20
        },
        "durability": {
          "score": 7.88,
          "max": 15
        },
        "service_life": {
          "score": 10.0,
          "max": 10
        },
        "fire": {
          "score": 5.0,
          "max": 10
        },
        "thermal": {
          "score": 1.0,
          "max": 10
        },
        "maintenance": {
          "score": 4.75,
          "max": 5
        },
        "sustainability": {
          "score": 2.9,
          "max": 5
        }
      },
      "engineering_confidence": 66.7,
      "climate_confidence": 0.0,
      "recommendation_quality": "Acceptable"
    },
    "material_id": "173"
  }
}```

**Selected Material ID:** 122

---

