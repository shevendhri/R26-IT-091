import os
import json
import shutil
import random

def convert_coco_to_yolo():
    print("Preparing YOLO dataset from CubiCasa5K COCO files...")

    # Configuration
    base_dir = os.path.dirname(os.path.abspath(__file__))
    output_dir = os.path.join(base_dir, "datasets", "blueprints_large")
    coco_dir = r"C:\Users\ASUS\Downloads\Blueprints\cubicasa5k_coco"
    images_base_dir = r"C:\Users\ASUS\Downloads\Blueprints\cubicasa5k"
    
    # limits so it runs quickly locally on a normal PC
    train_limit = 800
    val_limit = 200

    # Ensure output directories exist
    splits = ["train", "val"]
    for split in splits:
        os.makedirs(os.path.join(output_dir, split, "images"), exist_ok=True)
        os.makedirs(os.path.join(output_dir, split, "labels"), exist_ok=True)

    def process_split(json_name, split_folder, limit):
        json_path = os.path.join(coco_dir, json_name)
        if not os.path.exists(json_path):
            print(f"File not found: {json_path}")
            return []

        with open(json_path, 'r') as f:
            data = json.load(f)

        categories = {cat['id']: idx for idx, cat in enumerate(data['categories'])}
        cat_names = [cat['name'] for cat in data['categories']]

        # Map image id to annotations
        img_to_anns = {}
        if 'annotations' in data:
            for ann in data['annotations']:
                img_id = ann['image_id']
                if img_id not in img_to_anns:
                    img_to_anns[img_id] = []
                img_to_anns[img_id].append(ann)

        # Shuffle images so we get a good random subset
        images = list(data.get('images', []))
        random.seed(42)
        random.shuffle(images)
        images = images[:limit]

        processed_count = 0
        for img in images:
            img_id = img['id']
            img_w = img['width']
            img_h = img['height']
            
            # Extract real local path from the Kaggle path string
            # e.g. "/kaggle/input/cubicasa5k/cubicasa5k/cubicasa5k/high_quality_architectural/333/F1_original.png"
            # It maps to C:\Users\ASUS\Downloads\Blueprints\cubicasa5k\cubicasa5k\high_quality_architectural\333\F1_original.png
            file_name = img['file_name']
            
            # Quick string manipulation to find the proper subpath
            # It starts with "cubicasa5k/high_quality..." or similar. We split at "cubicasa5k/cubicasa5k/"
            if "cubicasa5k/cubicasa5k/" in file_name:
                relative_path = file_name.split("cubicasa5k/cubicasa5k/")[1]
            elif "cubicasa5k/" in file_name:
                relative_path = file_name.split("cubicasa5k/")[1]
            else:
                relative_path = file_name
            
            # The structure is nested nicely
            src_image_path = os.path.join(images_base_dir, "cubicasa5k", relative_path).replace("\\", "/")
            if not os.path.exists(src_image_path):
                # Try fallback just in case the dataset has varying paths
                src_image_path = os.path.join(images_base_dir, relative_path).replace("\\", "/")
                
            if not os.path.exists(src_image_path):
                # Skip if image truly doesn't exist locally
                continue

            # Copy image
            dst_image_name = f"{split_folder}_{img_id}.png"
            dst_image_path = os.path.join(output_dir, split_folder, "images", dst_image_name)
            shutil.copy2(src_image_path, dst_image_path)

            # Write YOLO labels
            annotations = img_to_anns.get(img_id, [])
            label_name = f"{split_folder}_{img_id}.txt"
            label_path = os.path.join(output_dir, split_folder, "labels", label_name)
            
            with open(label_path, 'w') as lf:
                for ann in annotations:
                    cat_id = ann['category_id']
                    if cat_id not in categories:
                        continue
                        
                    yolo_class_id = categories[cat_id]
                    # COCO bbox: [x_min, y_min, width, height]
                    bx, by, bw, bh = ann['bbox']
                    
                    # YOLO format: [classx, x_center, y_center, width, height] normalized!
                    x_center = (bx + bw / 2.0) / img_w
                    y_center = (by + bh / 2.0) / img_h
                    w_norm = bw / img_w
                    h_norm = bh / img_h
                    
                    # Make sure values are between 0 and 1
                    x_center = max(0.0, min(1.0, x_center))
                    y_center = max(0.0, min(1.0, y_center))
                    w_norm = max(0.0, min(1.0, w_norm))
                    h_norm = max(0.0, min(1.0, h_norm))
                    
                    lf.write(f"{yolo_class_id} {x_center:.6f} {y_center:.6f} {w_norm:.6f} {h_norm:.6f}\n")
                    
            processed_count += 1

        print(f"Processed {processed_count} images for {split_folder}.")
        return cat_names

    # Run processing
    train_cats = process_split('train_coco_pt.json', 'train', train_limit)
    val_cats = process_split('val_coco_pt.json', 'val', val_limit)

    categories = train_cats if train_cats else val_cats
    
    # Write data.yaml directly
    data_yaml_path = os.path.join(output_dir, "data.yaml")
    with open(data_yaml_path, 'w') as f:
        f.write(f"path: {os.path.abspath(output_dir).replace(chr(92), '/')}\n")
        f.write("train: train/images\n")
        f.write("val: val/images\n\n")
        f.write("names:\n")
        for i, name in enumerate(categories):
            f.write(f"  {i}: {name}\n")
            
    print(f"\nDataset preparation complete! Configuration saved to: {data_yaml_path}")

if __name__ == "__main__":
    convert_coco_to_yolo()
