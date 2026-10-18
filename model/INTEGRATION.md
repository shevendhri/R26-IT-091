# Quick startup (Windows)

Only two terminals are needed for the floor-plan analyzer and UDA checklist.

Terminal 1:
```powershell
cd C:\Users\User\Documents\GitHub\R26-IT-091\backend\node
npm.cmd start
```
This starts the local model service, waits for its health check, then starts Node.
An already-running healthy model service is reused and is not stopped by this
command. Ctrl+C stops only child services launched by this command.

Terminal 2:
```powershell
cd C:\Users\User\Documents\GitHub\R26-IT-091\frontend
$env:NEXT_PUBLIC_API_URL = "http://localhost:5000"
npm.cmd run dev
```
Open http://localhost:3000/plan-analyzer or
http://localhost:3000/plan-analyzer/uda-rules.
Do not start a separate model terminal or run training. MongoDB is required
only for saving analysis history. The separate materials backend is not started.
Advanced: npm.cmd run start:backend-only preserves the old Node-only command.
BLUEPRINT_PYTHON can override the interpreter path; MODEL_SERVICE_URL controls
where the model is checked (default http://127.0.0.1:8010).

---

# Run the integrated floor-plan analyzer

The detector uses backend/runs/blueprint_clean_gpu/weights/best.pt by default.
Set BLUEPRINT_MODEL_PATH to override it. No checkpoint copying is required.
Inference uses the complete uploaded image at 960 pixels, confidence 0.25,
IoU 0.7 and max_det 600. Class names come from the checkpoint and are normalized.

## Restart the services

Stop the old model server in its terminal with Ctrl+C, then from the repository:

```powershell
cd D:\R26-IT-091\R26-IT-091
& .\backend\.venv-training\Scripts\python.exe .\model\main.py
```

Keep that terminal open (port 8010). Restart the Node backend using its usual
command, and refresh the frontend. Node's MODEL_SERVICE_URL defaults to
http://localhost:8010. Existing saved analyses are historical; upload again to
get predictions from the new model.

The API dependencies were installed in .venv-training. For another machine,
install model/requirements-api.txt in the environment containing torch and
ultralytics before starting the service.

## What the result means

Counts, boxes, overlay labels and confidence come from the same clean model.
Room names are Room 1, Room 2, etc.; the detector does not classify room types.
Doors/windows associated with a room use approximate geometric overlap and
may be shared by adjacent rooms. Global counts count each detection once.
Room box sizes are pixels, not floor area measurements. The service does not
infer physical dimensions or regulatory compliance from these boxes.
The independent OCR drawing checklist is unchanged.

Invalid images return HTTP 422. Missing/incompatible checkpoints or inference
failures return HTTP 503 rather than fabricated detections. Empty detections
return zero counts and the input preview. Requests run outside the async event
loop; model inference is serialized to avoid concurrent predictor mutation.

## Verification

```powershell
& .\backend\.venv-training\Scripts\python.exe .\model\test_integration.py
```

This sends a real test image through the FastAPI endpoint, checks count/box
consistency, and checks invalid, empty and model-failure responses. The intentional
model-failure test logs a simulated missing-checkpoint exception.
