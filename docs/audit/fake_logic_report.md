# Fake Logic Search Report

Found 237 occurrences.

./backend/app.py:562:import random
./backend/app.py:564:total_floor_area = round(float(floor_count) * 85.0 + random.uniform(-10.0, 15.0), 1)
./backend/brain.py:121:- DISALLOW: Unrelated room suggestions, generic foyer comments, or random dining/master suite conflicts.
./backend/experiment_calibration_deepdive.py:170:lines.append("> **Key insight:** The *Theoretical Uniform* column shows the expected probability if the Random Forest had zero discrimination power (all classes equally likely). A winning probability well above this threshold confirms the model *is* discriminating — the low absolute numbers are an artifact of the class count, not weak learning.")
./backend/experiment_calibration_deepdive.py:210:lines.append("> **Interpretation:** If observed entropy ≈ max entropy, the model is essentially random (uniform prior). If observed entropy is substantially *below* max entropy, the model is concentrating probability mass on a subset of candidates — meaning it *is* learning meaningful structure. Values well below 100% confirm genuine signal.")
./backend/experiment_calibration_deepdive.py:306:lines.append(f"| **Many competing classes** | Average {int(np.mean([per_output[i]['n_classes'] for i in range(n_outputs)]))} classes per output. Theoretical uniform share = {overall_uniform:.1f}%. Observed average top-1 = {overall_avg_top1:.1f}%, which is {ratio_above_uniform:.1f}× above uniform random. | ✅ **Primary cause of low raw scores** |")
./backend/experiment_calibration_deepdive.py:342:lines.append("> **Entropy evidence:** If the model were poorly calibrated (overconfident from synthetic data), entropy would be near 0 (all mass on one class). If it were random (underfit), entropy would be near log₂(n_classes). The observed entropy sitting at a healthy intermediate level confirms the model has learned genuine class structure without collapse.")
./backend/generate_calibration_report.py:43:md += "The synthetic generation heavily relies on generating rows across all materials. If some materials have broader acceptable ranges (e.g., standard concrete) versus niche materials (e.g., GFRP rebar), the Random Forest will naturally output higher basal probabilities for the broader classes, punishing specialized materials with scores < 5% even when they are appropriate.\n\n"
./backend/generate_calibration_report.py:46:md += "The use of random jitter during synthetic data generation created 240,000+ distinct rows. A Random Forest interprets this vast amount of tiny variance as strict categorical boundaries. It becomes overconfident that specific micro-variations strictly rule out certain materials, leading to extreme low scores (approaching 0%) for perfectly valid engineering options.\n\n"
./backend/generate_calibration_report.py:52:md += "- **CalibratedClassifierCV**: Wrapping the Random Forest in scikit-learn's `CalibratedClassifierCV` (using Isotonic or Sigmoid) would directly map these raw Random Forest confidence scores to true empirical probabilities. However, since the dataset is 100% synthetic, it would calibrate to the *synthetic distribution*, which might not reflect real-world material selection distributions.\n"
./backend/generate_calibration_report.py:54:md += "- **Platt Scaling (Sigmoid)**: Better for smaller datasets or when parametric shape (S-curve) is assumed. Good for pushing probabilities away from extreme 0/100, but Random Forests typically don't suffer from sigmoid-shaped distortion (they usually suffer from pushing probabilities toward the center, though deep trees do the opposite).\n"
./backend/generate_calibration_report.py:55:md += "- **`min_samples_leaf` Tuning**: By requiring e.g., `min_samples_leaf=20` or `50`, the leaf nodes are forced to remain impure. This naturally smooths the probabilities output by the forest without requiring a post-hoc calibration step. This is often the most robust architectural fix for Random Forest overconfidence.\n"
./backend/material_specification_engine.py:324:"ml_model": "Random Forest Sustainability Predictor",
./backend/visualization_engine.py:3:import random
./backend/visualization_engine.py:46:"sustainability_score": round(random.uniform(0.6, 0.95), 2)
./backend/ml/experiment_train.py:5:from sklearn.ensemble import RandomForestClassifier
./backend/ml/experiment_train.py:41:X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.15, random_state=42)
./backend/ml/experiment_train.py:86:model = RandomForestClassifier(
./backend/ml/experiment_train.py:92:random_state=42,
./backend/ml/prepare_dataset.py:4:import random
./backend/ml/prepare_dataset.py:46:# Shuffle images so we get a good random subset
./backend/ml/prepare_dataset.py:48:random.seed(42)
./backend/ml/prepare_dataset.py:49:random.shuffle(images)
./backend/ml/temp_train_materials.py:4:Trains a Multi-Output Random Forest Classifier using GreenConstructAI_ML_Dataset.csv.
./backend/ml/temp_train_materials.py:34:from sklearn.ensemble import RandomForestClassifier
./backend/ml/temp_train_materials.py:317:np.random.seed(42)
./backend/ml/temp_train_materials.py:338:b_type    = np.random.randint(0, 3)
./backend/ml/temp_train_materials.py:339:floor_cnt = float(np.random.randint(1, 13))
./backend/ml/temp_train_materials.py:340:area      = float(np.random.randint(50, 1501))
./backend/ml/temp_train_materials.py:341:c_zone    = np.random.randint(0, 5)
./backend/ml/temp_train_materials.py:344:humidity  += np.random.uniform(-3, 3)
./backend/ml/temp_train_materials.py:345:rainfall  += np.random.uniform(-100, 100)
./backend/ml/temp_train_materials.py:347:struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
./backend/ml/temp_train_materials.py:348:sus_level  = float(np.random.randint(0, 3))
./backend/ml/temp_train_materials.py:381:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/temp_train_materials.py:393:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/temp_train_materials.py:406:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/temp_train_materials.py:425:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/temp_train_materials.py:446:Jitter is applied per sample so the random forest sees distinct data points
./backend/ml/temp_train_materials.py:449:np.random.seed(123)
./backend/ml/temp_train_materials.py:473:b_type    = float(np.random.randint(0, 3))
./backend/ml/temp_train_materials.py:474:floor_cnt = float(np.random.randint(1, 13))
./backend/ml/temp_train_materials.py:475:area      = float(np.random.randint(50, 1501))
./backend/ml/temp_train_materials.py:476:c_zone    = float(np.random.randint(0, 5))
./backend/ml/temp_train_materials.py:480:humidity  += np.random.uniform(-5, 5)
./backend/ml/temp_train_materials.py:481:rainfall  += np.random.uniform(-150, 150)
./backend/ml/temp_train_materials.py:482:salinity  += np.random.uniform(-0.05, 0.05)
./backend/ml/temp_train_materials.py:484:struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
./backend/ml/temp_train_materials.py:485:sus_level  = float(np.random.randint(0, 3))
./backend/ml/temp_train_materials.py:565:X_all, y_all, test_size=0.15, random_state=42
./backend/ml/temp_train_materials.py:572:print(f"\n[5] Training RandomForestClassifier "
./backend/ml/temp_train_materials.py:574:model = RandomForestClassifier(
./backend/ml/temp_train_materials.py:580:random_state=42,
./backend/ml/train_materials.py:4:Trains a Multi-Output Random Forest Classifier using GreenConstructAI_ML_Dataset.csv.
./backend/ml/train_materials.py:34:from sklearn.ensemble import RandomForestClassifier
./backend/ml/train_materials.py:317:np.random.seed(42)
./backend/ml/train_materials.py:338:b_type    = np.random.randint(0, 3)
./backend/ml/train_materials.py:339:floor_cnt = float(np.random.randint(1, 13))
./backend/ml/train_materials.py:340:area      = float(np.random.randint(50, 1501))
./backend/ml/train_materials.py:341:c_zone    = np.random.randint(0, 5)
./backend/ml/train_materials.py:344:humidity  += np.random.uniform(-3, 3)
./backend/ml/train_materials.py:345:rainfall  += np.random.uniform(-100, 100)
./backend/ml/train_materials.py:347:struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
./backend/ml/train_materials.py:348:sus_level  = float(np.random.randint(0, 3))
./backend/ml/train_materials.py:381:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/train_materials.py:393:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/train_materials.py:406:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/train_materials.py:425:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/train_materials.py:446:Jitter is applied per sample so the random forest sees distinct data points
./backend/ml/train_materials.py:449:np.random.seed(123)
./backend/ml/train_materials.py:473:b_type    = float(np.random.randint(0, 3))
./backend/ml/train_materials.py:474:floor_cnt = float(np.random.randint(1, 13))
./backend/ml/train_materials.py:475:area      = float(np.random.randint(50, 1501))
./backend/ml/train_materials.py:476:c_zone    = float(np.random.randint(0, 5))
./backend/ml/train_materials.py:480:humidity  += np.random.uniform(-5, 5)
./backend/ml/train_materials.py:481:rainfall  += np.random.uniform(-150, 150)
./backend/ml/train_materials.py:482:salinity  += np.random.uniform(-0.05, 0.05)
./backend/ml/train_materials.py:484:struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
./backend/ml/train_materials.py:485:sus_level  = float(np.random.randint(0, 3))
./backend/ml/train_materials.py:565:X_all, y_all, test_size=0.15, random_state=42
./backend/ml/train_materials.py:572:print(f"\n[5] Training RandomForestClassifier "
./backend/ml/train_materials.py:574:model = RandomForestClassifier(
./backend/ml/train_materials.py:580:random_state=42,
./backend/ml/verify_10gb_model.py:12:from sklearn.ensemble import RandomForestClassifier
./backend/ml/verify_10gb_model.py:35:X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.15, random_state=42)
./backend/ml/verify_10gb_model.py:38:model = RandomForestClassifier(
./backend/ml/verify_10gb_model.py:44:random_state=42,
./backend/ml/verify_10gb_model.py:58:# For multi-output, it's a list of estimators. Wait, for multi-output random forest,
./backend/validation/config.py:2:import random
./backend/validation/config.py:9:RANDOM_SEED = 42
./backend/validation/config.py:10:random.seed(RANDOM_SEED)
./backend/validation/validation_runner.py:1:import random
./backend/validation/validation_runner.py:11:RANDOM_SEED,
./backend/validation/validation_runner.py:22:random.seed(RANDOM_SEED)
./backend/validation/validation_runner.py:58:location = random.choice(LOCATIONS)
./backend/vision/vision_analysis.py:6:import random
./backend/ml/temp_train_materials.py:338:b_type    = np.random.randint(0, 3)
./backend/ml/temp_train_materials.py:339:floor_cnt = float(np.random.randint(1, 13))
./backend/ml/temp_train_materials.py:340:area      = float(np.random.randint(50, 1501))
./backend/ml/temp_train_materials.py:341:c_zone    = np.random.randint(0, 5)
./backend/ml/temp_train_materials.py:347:struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
./backend/ml/temp_train_materials.py:348:sus_level  = float(np.random.randint(0, 3))
./backend/ml/temp_train_materials.py:381:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/temp_train_materials.py:393:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/temp_train_materials.py:406:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/temp_train_materials.py:425:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/temp_train_materials.py:473:b_type    = float(np.random.randint(0, 3))
./backend/ml/temp_train_materials.py:474:floor_cnt = float(np.random.randint(1, 13))
./backend/ml/temp_train_materials.py:475:area      = float(np.random.randint(50, 1501))
./backend/ml/temp_train_materials.py:476:c_zone    = float(np.random.randint(0, 5))
./backend/ml/temp_train_materials.py:484:struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
./backend/ml/temp_train_materials.py:485:sus_level  = float(np.random.randint(0, 3))
./backend/ml/train_materials.py:338:b_type    = np.random.randint(0, 3)
./backend/ml/train_materials.py:339:floor_cnt = float(np.random.randint(1, 13))
./backend/ml/train_materials.py:340:area      = float(np.random.randint(50, 1501))
./backend/ml/train_materials.py:341:c_zone    = np.random.randint(0, 5)
./backend/ml/train_materials.py:347:struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
./backend/ml/train_materials.py:348:sus_level  = float(np.random.randint(0, 3))
./backend/ml/train_materials.py:381:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/train_materials.py:393:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/train_materials.py:406:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/train_materials.py:425:chosen = g_mats[np.random.randint(0, len(g_mats))]
./backend/ml/train_materials.py:473:b_type    = float(np.random.randint(0, 3))
./backend/ml/train_materials.py:474:floor_cnt = float(np.random.randint(1, 13))
./backend/ml/train_materials.py:475:area      = float(np.random.randint(50, 1501))
./backend/ml/train_materials.py:476:c_zone    = float(np.random.randint(0, 5))
./backend/ml/train_materials.py:484:struct_sys = float(np.random.randint(0, 2) if floor_cnt >= 4 else np.random.randint(0, 4))
./backend/ml/train_materials.py:485:sus_level  = float(np.random.randint(0, 3))
./backend/ml/prepare_dataset.py:46:# Shuffle images so we get a good random subset
./backend/ml/prepare_dataset.py:49:random.shuffle(images)
./backend/experiment_evaluate.py:135:md += "> - **Sustainability**: Model C achieves a similar or higher sustainability profile while maximizing diversity, making it the superior architectural choice without needing post-hoc mathematical calibration layers.\n"
./backend/generate_report.py:44:md += "1. **Floor Count (0.21)**: Heavily influences foundation and structural choices.\n"
./backend/material_specification_engine.py:576:"""Resolves specific quantity, unit, and piece counts based on material choice."""
./backend/validation/validation_runner.py:58:location = random.choice(LOCATIONS)
./backend/validation/validation_runner.py:26:Includes a placeholder blueprint with an empty components dict to avoid empty blueprint issues.
./backend/test_recommend.py:7:# Minimal dummy data
./backend/test_blueprint_engine.py:7:# Mock a building program
./backend/feasibility_validator.py:96:"is_feasible": True, # Hardcoded True to remove cost failure blocking
./backend/visualization_engine.py:8:Iterates over the generated blueprint without hardcoded heuristics.
./backend/app.py:23:"""Fallback stub when visualization_engine is unavailable."""
./backend/architectural_style_engine.py:44:# Fallback if dataset failed to load
./backend/architectural_style_engine.py:61:"reasoning": "Fallback to Modern style due to missing style dataset.",
./backend/blueprint_engine.py:228:chunk = all_rooms[:3]  # fallback
./backend/brain.py:157:# ── CONTEXT-AWARE DETERMINISTIC FALLBACK (VIVA SAFETY NET) ──
./backend/brain.py:163:# Fallback Suggestion Template Engine
./backend/brain.py:164:fallback_sug = []
./backend/brain.py:166:fallback_sug = [{
./backend/brain.py:172:fallback_sug = [{
./backend/brain.py:178:fallback_sug = [{
./backend/brain.py:184:fallback_sug = [{
./backend/brain.py:197:"suggestions": fallback_sug,
./backend/building_form_engine.py:53:# Fallbacks
./backend/furniture_catalog.py:431:# Commercial / Industrial fallbacks
./backend/furniture_catalog.py:442:return "Utility Room"   # safe fallback – never empty
./backend/inspect_model_v7.py:87:fallback_ids = []
./backend/inspect_model_v7.py:99:fallback_ids.append((mid, m["Name"], gidx))
./backend/inspect_model_v7.py:103:print(f"Will use fallback     : {len(fallback_ids)}")
./backend/inspect_model_v7.py:104:if fallback_ids:
./backend/inspect_model_v7.py:105:for mid, name, gidx in fallback_ids:
./backend/inspect_model_v7.py:106:print(f"  FALLBACK  ID={mid}  group={gidx}  {name}")
./backend/inspect_model_v7.py:125:The heuristic fallback branch is DEAD CODE for the current database.
./backend/inspect_model_v7.py:128:print(f"  WARNING: {len(fallback_ids)} IDs will still hit the heuristic fallback.")
./backend/material_specification_engine.py:52:• Provides realistic ML scores (fallback uses sustainability & carbon).
./backend/material_specification_engine.py:566:logger.debug(f"ML score fallback triggered for component '{component}', material {material_id}: {e}")
./backend/material_specification_engine.py:568:# Heuristic fallback: combine sustainability rating and low carbon for a more realistic baseline
./backend/recommendation_engine.py:66:# Category specific fallback logic
./backend/recommendation_engine.py:109:"""Safely loads the ML model (greenconstruct_model.pkl or fallback)."""
./backend/recommendation_engine.py:175:return None, "HEURISTIC_FALLBACK"
./backend/recommendation_engine.py:230:return max(30.0, min(100.0, heuristic)), "HEURISTIC_FALLBACK"
./backend/recommendation_engine.py:232:return 50.0, "HEURISTIC_FALLBACK"
./backend/recommendation_engine.py:235:return 50.0, "HEURISTIC_FALLBACK"
./backend/recommendation_engine.py:261:fallback_predictions_count = 0
./backend/recommendation_engine.py:345:if pred_source == "HEURISTIC_FALLBACK":
./backend/recommendation_engine.py:346:fallback_predictions_count += 1
./backend/recommendation_engine.py:543:# Check for fallback usage in selected package items
./backend/recommendation_engine.py:545:if sm["prediction_source"] == "HEURISTIC_FALLBACK":
./backend/recommendation_engine.py:546:ml_warnings.append(f"Heuristic fallback was used for recommended item: {sm['material']['Name']} in category {sm['material']['Category']}.")
./backend/recommendation_engine.py:600:"fallback_predictions": fallback_predictions_count,
./backend/recommendation_engine.py:616:"fallback_usage_count": fallback_predictions_count,
./backend/room_furnishing_engine.py:190:# ─── GENERAL/FALLBACK SOLVER ───
./backend/room_furnishing_engine.py:222:# Forced placement center fallback
./backend/room_furnishing_engine.py:223:fallback_pos = {"name": item["name"], "w": w, "d": d, "px": 0.5, "pz": 0.5, "rotY": 0.0, "color": item["color"], "shape": item["shape"]}
./backend/room_furnishing_engine.py:224:if "parts" in item: fallback_pos["parts"] = item["parts"]
./backend/room_furnishing_engine.py:225:placed_items.append(fallback_pos)
./backend/test_v7_recommendation.py:2:V7 Full Recommendation + ML Path / Fallback Hit Counter
./backend/test_v7_recommendation.py:10:# Patch _get_ml_score to count fallback hits before importing
./backend/test_v7_recommendation.py:14:_fallback_hits  = {"count": 0, "ids": []}
./backend/test_v7_recommendation.py:69:# ── FALLBACK HIT — count it ───────────────────────────────
./backend/test_v7_recommendation.py:70:_fallback_hits["count"] += 1
./backend/test_v7_recommendation.py:71:_fallback_hits["ids"].append(material_id)
./backend/test_v7_recommendation.py:126:# ─── ML Path vs Fallback counters ────────────────────────────────────────────
./backend/test_v7_recommendation.py:128:print("ML PATH vs FALLBACK COUNTER (patched scorer)")
./backend/test_v7_recommendation.py:135:print(f"  Total materials evaluated          : {_ml_path_count['count'] + _fallback_hits['count']}")
./backend/test_v7_recommendation.py:137:print(f"  Heuristic fallback hits            : {_fallback_hits['count']}")
./backend/test_v7_recommendation.py:140:if _fallback_hits["ids"]:
./backend/test_v7_recommendation.py:141:print(f"  Fallback IDs                       : {sorted(set(_fallback_hits['ids']))}")
./backend/test_v7_recommendation.py:143:print("  Fallback IDs                       : NONE — 100% ML path used for all scored materials")
./backend/utils.py:34:fallback of 5 % of the initial cost is used.
./backend/verify_report_consistency.py:110:required_fields = ["model_loaded", "dataset_loaded", "dataset_rows", "dataset_columns", "feature_count", "fallback_predictions", "average_confidence", "cross_validation_score", "recommendation_engine_status"]
./backend/ml/prepare_dataset.py:75:# Try fallback just in case the dataset has varying paths
