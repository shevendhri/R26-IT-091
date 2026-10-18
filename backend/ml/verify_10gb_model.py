import os
import sys
import numpy as np

BACKEND_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
sys.path.insert(0, BACKEND_DIR)

from train_materials import (
    build_name_to_id_map, load_csv_dataset, generate_csv_bridge_samples,
    generate_synthetic_samples, generate_guaranteed_coverage, build_default_targets, CSV_PATH
)
from sklearn.ensemble import RandomForestClassifier

def verify_model():
    print("Gathering data...")
    name_to_id, id_to_group, mats = build_name_to_id_map()
    X_csv, y_csv = load_csv_dataset(CSV_PATH, name_to_id, id_to_group, mats)
    
    default_targets = build_default_targets(mats)
    n_outputs = 5
    group_defaults = {g: default_targets.get(g, 119) for g in range(n_outputs)}
    X_bridge, y_bridge = generate_csv_bridge_samples(CSV_PATH, id_to_group, mats, group_defaults)
    
    X_syn, y_syn = generate_synthetic_samples(mats, n_per_material=400)
    X_cov, y_cov = generate_guaranteed_coverage(mats, id_to_group, min_appearances=800)
    
    arrays_X = [a for a in [X_csv, X_bridge, X_syn, X_cov] if len(a) > 0]
    arrays_y = [a for a in [y_csv, y_bridge, y_syn, y_cov] if len(a) > 0]
    X_all = np.vstack(arrays_X)
    y_all = np.vstack(arrays_y)
    
    print(f"Total samples: {len(X_all)}")
    
    from sklearn.model_selection import train_test_split
    X_train, X_test, y_train, y_test = train_test_split(X_all, y_all, test_size=0.15, random_state=42)
    
    print("Training model to inspect in memory...")
    model = RandomForestClassifier(
        n_estimators=300,
        max_depth=None,
        min_samples_split=2,
        min_samples_leaf=1,
        class_weight="balanced_subsample",
        random_state=42,
        n_jobs=-1,
    )
    model.fit(X_train, y_train)
    
    print("=== INSPECTION RESULTS ===")
    print(f"Model class: {type(model).__name__}")
    print(f"Number of estimators: {model.n_estimators}")
    print(f"max_depth setting: {model.max_depth}")
    
    total_nodes = 0
    node_counts = []
    
    # model.estimators_ is a list of DecisionTreeClassifier if single output
    # For multi-output, it's a list of estimators. Wait, for multi-output random forest,
    # model.estimators_ is a list of estimators (trees). Each tree can be a multi-output tree,
    # or it trains separate forests per output? Scikit-learn trains one multi-output tree per estimator.
    
    for estimator in model.estimators_:
        n_nodes = estimator.tree_.node_count
        node_counts.append(n_nodes)
        total_nodes += n_nodes
        
    avg_nodes = np.mean(node_counts)
    min_nodes = np.min(node_counts)
    max_nodes = np.max(node_counts)
    
    print(f"Node count per tree (average): {avg_nodes:.1f}")
    print(f"Node count per tree (min): {min_nodes}")
    print(f"Node count per tree (max): {max_nodes}")
    print(f"Total nodes across all trees: {total_nodes}")
    
    # Estimate serialized size: each node takes approx 40 bytes in scipy/sklearn tree._tree.Node struct
    # Plus value array, which for multi-output is shape (n_nodes, n_outputs, max_classes)
    n_outputs = y_train.shape[1]
    
    # Calculate value array size
    total_value_elements = 0
    for estimator in model.estimators_:
        # value array shape is (n_nodes, n_outputs, max_n_classes)
        total_value_elements += estimator.tree_.value.size
    
    bytes_per_node_struct = 40
    bytes_per_value = 8 # float64
    
    estimated_size_bytes = (total_nodes * bytes_per_node_struct) + (total_value_elements * bytes_per_value)
    print(f"Total nodes size: {total_nodes * bytes_per_node_struct / (1024**2):.2f} MB")
    print(f"Total value array size: {total_value_elements * bytes_per_value / (1024**3):.2f} GB")
    print(f"Estimated minimum serialized size contribution by the forest: {estimated_size_bytes / (1024**3):.2f} GB")
    
    # Verify if training data is accidentally included
    data_included = False
    for k in vars(model):
        if 'X' in k or 'data' in k:
            data_included = True
    print(f"Training data accidentally included: {data_included}")

if __name__ == '__main__':
    verify_model()
