# Chapter 5: Results and Discussion

## 5.1 Dataset Overview
The generation pipeline successfully produced 80 unique building scenarios. The dataset demonstrated an overall average Hybrid Score of **43.65**, an average sustainability score of **57.73**, and an average pipeline execution time of **5409.35** ms. Detailed dataset statistics can be found in Table 1 (`overall_dataset_statistics.md`).

## 5.2 Score Distributions
The distributions of the evaluation metrics showcase the system's scoring behavior. As illustrated in **Figure 1** (`score_distributions.png`) and **Figure 2** (`score_comparison_boxplot.png`), the Engineering Score remains highly deterministic, while the ML Score provides a wider variance based on layout fluidity.

## 5.3 Building Type Analysis
Performance varies significantly across building typologies. **Figure 5** (`building_type_comparison.png`) and **Table 2** (`building_type_performance.md`) highlight these differences. For instance, Hospitals and Hotels exhibit more complex spatial requirements compared to simple Residential layouts, which is reflected in their respective placement success rates and functional coverage (**Table 11: furniture_placement_statistics.md**).

## 5.4 Budget and Climate Adaptability
The system dynamically scales material quality and structural complexity based on financial constraints. **Figure 6** (`budget_comparison.png`) demonstrates the variation in scores across budget tiers. Furthermore, environmental adaptability is validated in **Figure 7** (`climate_comparison.png`), proving the algorithm's capability to adjust recommendations for diverse Sri Lankan geoclimatic zones.

## 5.5 Execution Efficiency
Computational efficiency is critical for real-time generative design. The runtime distribution (**Figure 3: runtime_distribution.png**) and runtime statistics (**Table 6: runtime_statistics.md**) show that the system generates complete building pipelines well within acceptable interactive thresholds.

## 5.6 Sustainability and Material Optimization
Sustainability remains a core objective. **Figure 4** (`sustainability_distribution.png`) and **Table 10** (`average_sustainability_scores.md`) demonstrate high environmental compliance. The algorithm's material selection diversity is further summarized in **Table 12** (`material_recommendation_frequencies.md`), which catalogs the frequency of structural and finishing materials applied across the dataset.

## 5.7 Correlation Analysis
A Pearson correlation heatmap (**Figure 9: correlation_heatmap.png**) was generated to investigate relationships between metrics. The analysis indicates significant correlations between structural complexity (space utilization) and runtime, as well as between budget tiers and overall sustainability scores.

## 5.8 Discussion of Top and Bottom Performers
The top 10 (**Table 7: top_10_scenarios.md**) and bottom 10 scenarios (**Table 8: bottom_10_scenarios.md**) were analyzed. Lower-scoring scenarios typically involved highly constrained footprints combined with extreme budget limitations, which forced the placement algorithm into suboptimal furniture densities. Conversely, high-scoring scenarios exhibited harmonious proportions that easily satisfied both ML aesthetic heuristics and engineering constraints.
