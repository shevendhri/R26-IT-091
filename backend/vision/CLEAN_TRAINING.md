# Clean blueprint training

Use PowerShell from `D:\R26-IT-091\R26-IT-091\backend`.
Use `.venv-training`, not `testgpu` or the system Python.

## Changes

- The SVG converter reads only direct semantic boundary polygons, never dimension marks, door panels, or window glass.
- Coordinates use the F1_scaled raster frame, matching the official CubiCasa loader; SVG viewport dimensions are not used for scaling.
- Explicit Outdoor spaces are excluded from Room. Doors describe openings, not swing arcs. All indoor space types share Room.
- Exact duplicate boxes are removed; malformed samples are rejected with reasons in audit.json.
- New data uses official disjoint train/val/test splits and checks image hashes across splits. Test images are reserved for final evaluation.
- Old datasets and model checkpoints remain unchanged. The old notebook is a historical record; use train_blueprints_clean.ipynb.

## Dataset

`datasets/blueprints_clean_v2/data.yaml` is the new configuration.
`audit.json` records source paths, counts, hashes and rejected samples.
`previews/` contains separate Wall, Door, Window and Room panels for 24 plans.
The first build attempt in blueprints_clean_v1 is incomplete and must not be used.

To rebuild later, use a NEW output directory (existing directories are refused):

```powershell
& .\.venv-training\Scripts\python.exe .\ml\prepare_clean_blueprints.py --output .\datasets\blueprints_clean_v3
```

## Run

Do not start another GPU job while the current job is running.

```powershell
# Small diagnostic: train and validation intentionally use the same 16 plans.
# This measures ability to learn the examples, NOT generalization.
& .\.venv-training\Scripts\python.exe .\vision\train_blueprints.py --sanity --epochs 40

# Full experiment: fresh pretrained YOLOv8n, 960px, batch 1, 80 epochs,
# early stopping patience 25. Results use a fresh incremented run directory.
& .\.venv-training\Scripts\python.exe .\vision\train_blueprints.py --epochs 80
```

Training uses no mosaic, modest scale/translation, and limited brightness changes.
This is an experiment, not a promise of a particular accuracy. If GPU memory is
insufficient, retry a fresh run with `--imgsz 800`; do not change settings mid-run.

## Monitor and interpret

Read `runs/blueprint_clean_gpu*/results.csv` and saved validation overlays.
Check per-class recall and AP, not only overall mAP. A higher clean-data score
cannot be compared directly with the old score because the labels changed.
After model selection, use the commented test-evaluation cell in the clean
notebook. Keep test results separate from validation and sanity results.
Also test representative user-uploaded plans before connecting the analyzer.

Some source images include neighboring apartments that CubiCasa does not label.
Bounding boxes also approximate irregular rooms/walls. These remain limitations;
review failures before deciding on crops, more data or segmentation.

Reference coordinate convention:
https://github.com/CubiCasa/CubiCasa5k/blob/master/floortrans/loaders/svg_loader.py

## Background run started in this session

The 40-epoch sanity run completed in about five minutes of recorded training
 time. Its same-image AP50 was 32.4% overall (Room 73.4%, Door 8.1%).
This is only a diagnostic: the model learned rooms but has not established
adequate opening detection or generalization.

The full 80-epoch experiment was then launched separately. Monitor it from
PowerShell in backend:

```powershell
Get-Content .\runs\clean_gpu_stdout.log -Tail 20 -Wait
# In another terminal, check errors if progress stops:
Get-Content .\runs\clean_gpu_stderr.log -Tail 30
```

`runs/clean_gpu_process_id.txt` records the launcher's process ID for this run.
Do not run the notebook training cell concurrently. Keep the machine awake and
connected to power. An epoch count alone does not establish model quality.
