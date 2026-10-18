# Blueprint GPU notebook

Use `backend/.venv-training/Scripts/python.exe` for `train_blueprints.ipynb`.
In VS Code choose **Select Kernel > Python Environments**, select that interpreter,
restart the kernel, then run the cells in order. The first cell verifies CUDA and
executes a GPU operation. The final cell starts training.

The environment uses Python 3.12 and CUDA 12.4 PyTorch wheels. To recreate it,
run `powershell -ExecutionPolicy Bypass -File .\vision\setup_gpu.ps1` from
`backend` in PowerShell. The script verifies an actual GPU computation after
installation. Alternatively, run these commands:

```powershell
py -3.12 -m venv .venv-training
& .\.venv-training\Scripts\python.exe -m pip install torch==2.5.1 torchvision==0.20.1 --index-url https://download.pytorch.org/whl/cu124
& .\.venv-training\Scripts\python.exe -m pip install -r vision\requirements-gpu.txt
& .\.venv-training\Scripts\python.exe -m ipykernel install --sys-prefix --name blueprint-gpu --display-name "Blueprint GPU (Python 3.12)"
```

The notebook uses YOLOv8m at 640 pixels, batch size 1, GPU 0, and zero data-loader
workers. Results go into a new `backend/runs/blueprint_model_gpu*` directory.
It stops with an error if CUDA is unavailable instead of silently using the CPU.

References: [PyTorch CUDA wheel versions](https://pytorch.org/get-started/previous-versions/)
and [Ultralytics training settings](https://docs.ultralytics.com/modes/train/).
