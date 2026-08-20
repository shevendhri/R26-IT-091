from ultralytics import YOLO
import os

def train_blueprint_model(data_yaml_path=r"datasets/blueprints/data.yaml", epochs=5):
    """
    Trains a YOLO model on a custom blueprint dataset.
    
    Before running this, ensure your dataset is structured like this:
    backend/
      datasets/
        blueprints/
          data.yaml  (Defines paths and class names like 'wall', 'door', 'window')
          train/
            images/ (your .jpg/.png blueprints)
            labels/ (your .txt YOLO annotation files)
          val/
            images/
            labels/
    """
    print(f"Initializing training using dataset configuration at: {data_yaml_path}")
    
    if not os.path.exists(data_yaml_path):
        print(f"Error: Could not find {data_yaml_path}. Please check your dataset folder structure.")
        return

    # Load a pre-trained YOLO model (using nano version for speed locally)
    model = YOLO('yolov8n.pt')

    # Train the model
    # Note: If you don't have a GPU, setting device='cpu' ensures it runs (though slower).
    results = model.train(
        data=data_yaml_path,
        epochs=epochs,
        imgsz=640,          # Resize images to 640x640 for training
        batch=8,            # Batch size (reduce if memory errors occur)
        device='cpu',       # Remove or set to '0' if you have an NVIDIA GPU (CUDA)
        project='runs',     # Where to save the output weights
        name='blueprint_model',
        exist_ok=True       # Overwrite runs if they already exist
    )
    
    print("\nTraining Complete!")
    print("Your trained model weights are saved at: backend/runs/blueprint_model/weights/best.pt")
    
if __name__ == "__main__":
    # Change epochs to a small number for quicker prototyping
    train_blueprint_model(epochs=5)
