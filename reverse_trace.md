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
    "score": 79.33,
    "cost_guidance": "LKR 1,180,952",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Optimized for Moderate Coastal Humid climate soil conditions. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
    "sustainability_rating": 92,
    "service_life": 80,
    "embodied_carbon": 0.12,
    "eng_score": 85.35,
    "ml_score": 61.25182071788626,
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
    }
  },
  "structural": {
    "name": "GFRP Rebar (Glass Fibre Reinforced Polymer)",
    "score": 64.31,
    "cost_guidance": "LKR 9,209,550",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.",
    "sustainability_rating": 80,
    "service_life": 100,
    "embodied_carbon": 0.55,
    "eng_score": 83.25,
    "ml_score": 7.50141390702121,
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
    }
  },
  "concrete": {
    "name": "Gr. 30 Marine-Grade Concrete Mix",
    "score": 62.22,
    "cost_guidance": "LKR 45,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Mandatory sulphate and corrosion resistance for high-salinity coastal environments. Sustainability: Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
    "sustainability_rating": 46,
    "service_life": 100,
    "embodied_carbon": 0.68,
    "eng_score": 82.8,
    "ml_score": 0.473471916774431,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#4",
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
    }
  },
  "walls": {
    "name": "CSEB Compressed Stabilized Earth Block",
    "score": 77.68,
    "cost_guidance": "LKR 615,991",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for thermal performance and humidity resistance. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.08 kgCO2/kg.",
    "sustainability_rating": 98,
    "service_life": 60,
    "embodied_carbon": 0.08,
    "eng_score": 79.9,
    "ml_score": 71.00621495741521,
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
    }
  },
  "roofing": {
    "name": "Portuguese Clay Tile (Unglazed Terracotta)",
    "score": 49.07,
    "cost_guidance": "LKR 561,970",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Provides weather protection and thermal comfort for Moderate Coastal Humid climate. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.18 kgCO2/kg.",
    "sustainability_rating": 85,
    "service_life": 65,
    "embodied_carbon": 0.18,
    "eng_score": 63.1125,
    "ml_score": 6.9611595400072845,
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
    }
  },
  "windows": {
    "name": "uPVC Multi-Chamber Window System",
    "score": 65.64,
    "cost_guidance": "LKR 72,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
    "sustainability_rating": 82,
    "service_life": 45,
    "embodied_carbon": 0.28,
    "eng_score": 62.1375,
    "ml_score": 76.14471732255656,
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
    }
  },
  "doors": {
    "name": "Steel Security Door (Powder-Coated)",
    "score": 56.33,
    "cost_guidance": "LKR 65,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #3). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
    "sustainability_rating": 40,
    "service_life": 40,
    "embodied_carbon": 0.72,
    "eng_score": 74.375,
    "ml_score": 2.1927844178359712,
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
    }
  },
  "flooring": {
    "name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "score": 55.38,
    "cost_guidance": "LKR 902,160",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
    "sustainability_rating": 75,
    "service_life": 65,
    "embodied_carbon": 0.22,
    "eng_score": 73.1625,
    "ml_score": 2.031745415354246,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
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
    }
  },
  "ceiling": {
    "name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "score": 56.14,
    "cost_guidance": "LKR 473,634",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 25,
    "embodied_carbon": 0.05,
    "eng_score": 51.7125,
    "ml_score": 69.44234416311565,
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
    }
  },
  "finishes": {
    "name": "Eco-Friendly Low VOC Emulsion",
    "score": 31.76,
    "cost_guidance": "LKR 668,674",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 15,
    "embodied_carbon": 0.12,
    "eng_score": 41.3125,
    "ml_score": 3.092548927506937,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
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
    }
  },
  "waterproofing": {
    "name": "Crystalline Slurry Waterproofing (Penetrating)",
    "score": 42.49,
    "cost_guidance": "LKR 314,070",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Designed to prevent moisture ingress under 2400mm annual rainfall. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 58,
    "service_life": 60,
    "embodied_carbon": 0.05,
    "eng_score": 55.275,
    "ml_score": 4.125239159510784,
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
    }
  }
}```

**Selected Material ID:** None

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
    "name": "Lime-Pozzolan Natural Foundation",
    "score": 79.33,
    "cost_guidance": "LKR 1,180,952",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Optimized for Moderate Coastal Humid climate soil conditions. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
    "sustainability_rating": 92,
    "service_life": 80,
    "embodied_carbon": 0.12,
    "eng_score": 85.35,
    "ml_score": 61.251820717886275,
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
    }
  },
  "structural": {
    "name": "GFRP Rebar (Glass Fibre Reinforced Polymer)",
    "score": 64.31,
    "cost_guidance": "LKR 9,209,550",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.",
    "sustainability_rating": 80,
    "service_life": 100,
    "embodied_carbon": 0.55,
    "eng_score": 83.25,
    "ml_score": 7.50141390702121,
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
    }
  },
  "concrete": {
    "name": "Gr. 30 Marine-Grade Concrete Mix",
    "score": 62.22,
    "cost_guidance": "LKR 45,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Mandatory sulphate and corrosion resistance for high-salinity coastal environments. Sustainability: Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
    "sustainability_rating": 46,
    "service_life": 100,
    "embodied_carbon": 0.68,
    "eng_score": 82.8,
    "ml_score": 0.47347191677443107,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#4",
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
    }
  },
  "walls": {
    "name": "CSEB Compressed Stabilized Earth Block",
    "score": 77.68,
    "cost_guidance": "LKR 615,991",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for thermal performance and humidity resistance. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.08 kgCO2/kg.",
    "sustainability_rating": 98,
    "service_life": 60,
    "embodied_carbon": 0.08,
    "eng_score": 79.9,
    "ml_score": 71.0062149574152,
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
    }
  },
  "roofing": {
    "name": "Portuguese Clay Tile (Unglazed Terracotta)",
    "score": 49.07,
    "cost_guidance": "LKR 561,970",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Provides weather protection and thermal comfort for Moderate Coastal Humid climate. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.18 kgCO2/kg.",
    "sustainability_rating": 85,
    "service_life": 65,
    "embodied_carbon": 0.18,
    "eng_score": 63.1125,
    "ml_score": 6.9611595400072845,
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
    }
  },
  "windows": {
    "name": "uPVC Multi-Chamber Window System",
    "score": 65.64,
    "cost_guidance": "LKR 72,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
    "sustainability_rating": 82,
    "service_life": 45,
    "embodied_carbon": 0.28,
    "eng_score": 62.1375,
    "ml_score": 76.14471732255656,
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
    }
  },
  "doors": {
    "name": "Steel Security Door (Powder-Coated)",
    "score": 56.33,
    "cost_guidance": "LKR 65,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #3). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
    "sustainability_rating": 40,
    "service_life": 40,
    "embodied_carbon": 0.72,
    "eng_score": 74.375,
    "ml_score": 2.1927844178359712,
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
    }
  },
  "flooring": {
    "name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "score": 55.38,
    "cost_guidance": "LKR 902,160",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
    "sustainability_rating": 75,
    "service_life": 65,
    "embodied_carbon": 0.22,
    "eng_score": 73.1625,
    "ml_score": 2.031745415354246,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
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
    }
  },
  "ceiling": {
    "name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "score": 56.14,
    "cost_guidance": "LKR 473,634",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 25,
    "embodied_carbon": 0.05,
    "eng_score": 51.7125,
    "ml_score": 69.44234416311565,
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
    }
  },
  "finishes": {
    "name": "Eco-Friendly Low VOC Emulsion",
    "score": 31.76,
    "cost_guidance": "LKR 668,674",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 15,
    "embodied_carbon": 0.12,
    "eng_score": 41.3125,
    "ml_score": 3.092548927506937,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
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
    }
  },
  "waterproofing": {
    "name": "Crystalline Slurry Waterproofing (Penetrating)",
    "score": 42.49,
    "cost_guidance": "LKR 314,070",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Designed to prevent moisture ingress under 2400mm annual rainfall. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 58,
    "service_life": 60,
    "embodied_carbon": 0.05,
    "eng_score": 55.275,
    "ml_score": 4.125239159510784,
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
    }
  }
}```

**Selected Material ID:** None

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
    "name": "Lime-Pozzolan Natural Foundation",
    "score": 79.33,
    "cost_guidance": "LKR 1,180,952",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Optimized for Moderate Coastal Humid climate soil conditions. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
    "sustainability_rating": 92,
    "service_life": 80,
    "embodied_carbon": 0.12,
    "eng_score": 85.35,
    "ml_score": 61.25182071788626,
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
    }
  },
  "structural": {
    "name": "GFRP Rebar (Glass Fibre Reinforced Polymer)",
    "score": 64.31,
    "cost_guidance": "LKR 9,209,550",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.55 kgCO2/kg.",
    "sustainability_rating": 80,
    "service_life": 100,
    "embodied_carbon": 0.55,
    "eng_score": 83.25,
    "ml_score": 7.501413907021208,
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
    }
  },
  "concrete": {
    "name": "Gr. 30 Marine-Grade Concrete Mix",
    "score": 62.22,
    "cost_guidance": "LKR 45,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Mandatory sulphate and corrosion resistance for high-salinity coastal environments. Sustainability: Engineered mix optimized for structural service-life extension, reducing future repair carbon.",
    "sustainability_rating": 46,
    "service_life": 100,
    "embodied_carbon": 0.68,
    "eng_score": 82.8,
    "ml_score": 0.473471916774431,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#4",
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
    }
  },
  "walls": {
    "name": "CSEB Compressed Stabilized Earth Block",
    "score": 77.68,
    "cost_guidance": "LKR 615,991",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for thermal performance and humidity resistance. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.08 kgCO2/kg.",
    "sustainability_rating": 98,
    "service_life": 60,
    "embodied_carbon": 0.08,
    "eng_score": 79.9,
    "ml_score": 71.00621495741521,
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
    }
  },
  "roofing": {
    "name": "Portuguese Clay Tile (Unglazed Terracotta)",
    "score": 49.07,
    "cost_guidance": "LKR 561,970",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #4). Climate: Provides weather protection and thermal comfort for Moderate Coastal Humid climate. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.18 kgCO2/kg.",
    "sustainability_rating": 85,
    "service_life": 65,
    "embodied_carbon": 0.18,
    "eng_score": 63.1125,
    "ml_score": 6.961159540007284,
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
    }
  },
  "windows": {
    "name": "uPVC Multi-Chamber Window System",
    "score": 65.64,
    "cost_guidance": "LKR 72,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.28 kgCO2/kg.",
    "sustainability_rating": 82,
    "service_life": 45,
    "embodied_carbon": 0.28,
    "eng_score": 62.1375,
    "ml_score": 76.14471732255656,
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
    }
  },
  "doors": {
    "name": "Steel Security Door (Powder-Coated)",
    "score": 56.33,
    "cost_guidance": "LKR 65,000",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #3). Climate: Engineered to minimize air infiltration and resist corrosion under saline/humid drafts. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.72 kgCO2/kg.",
    "sustainability_rating": 40,
    "service_life": 40,
    "embodied_carbon": 0.72,
    "eng_score": 74.375,
    "ml_score": 2.1927844178359717,
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
    }
  },
  "flooring": {
    "name": "Polished Terrazzo Flooring (Marble Aggregate)",
    "score": 55.38,
    "cost_guidance": "LKR 902,160",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.22 kgCO2/kg.",
    "sustainability_rating": 75,
    "service_life": 65,
    "embodied_carbon": 0.22,
    "eng_score": 73.1625,
    "ml_score": 2.031745415354246,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
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
    }
  },
  "ceiling": {
    "name": "Bamboo-Fibre Acoustic Ceiling Panel",
    "score": 56.14,
    "cost_guidance": "LKR 473,634",
    "rationale": "Selected via Hybrid AI (Eng Rank: #2, ML Rank: #1). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 25,
    "embodied_carbon": 0.05,
    "eng_score": 51.7125,
    "ml_score": 69.44234416311565,
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
    }
  },
  "finishes": {
    "name": "Eco-Friendly Low VOC Emulsion",
    "score": 31.76,
    "cost_guidance": "LKR 668,674",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #2). Climate: Selected for general compatibility with regional tropical environmental parameters. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.12 kgCO2/kg.",
    "sustainability_rating": 95,
    "service_life": 15,
    "embodied_carbon": 0.12,
    "eng_score": 41.3125,
    "ml_score": 3.092548927506937,
    "prediction_source": "ML_MODEL",
    "selection_reason": {
      "engineering_rank": "#1",
      "ml_rank": "#2",
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
    }
  },
  "waterproofing": {
    "name": "Crystalline Slurry Waterproofing (Penetrating)",
    "score": 42.49,
    "cost_guidance": "LKR 314,070",
    "rationale": "Selected via Hybrid AI (Eng Rank: #1, ML Rank: #1). Climate: Designed to prevent moisture ingress under 2400mm annual rainfall. Sustainability: Maintains balanced environmental footprint with an embodied carbon of 0.05 kgCO2/kg.",
    "sustainability_rating": 58,
    "service_life": 60,
    "embodied_carbon": 0.05,
    "eng_score": 55.275,
    "ml_score": 4.125239159510784,
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
    }
  }
}```

**Selected Material ID:** None

---

