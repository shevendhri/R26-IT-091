# Floor-plan experiment evidence

Keep results.csv, args.yaml, aggregate precision/recall curves, confusion matrices,
and results plots for old and new runs. Label each run with its dataset version,
class definitions, split, model, resolution, software versions and code commit.
Scores from the original two-class, faulty four-class, and corrected four-class
runs are not controlled comparisons because their annotations differ.

Keep the original data externally and document its origin/license and split.
Keep best checkpoints in separate durable storage with SHA-256 checksums; the
application requires backend/runs/blueprint_clean_gpu/weights/best.pt locally.
Ignoring a checkpoint does not delete it or provide a remote backup.

Preserve historical code through Git commits/tags (or the recovery archives for
uncommitted versions). Do not restore obsolete scripts into the active workflow.
Old notebooks can be retained as clearly labelled historical records; review their
outputs for private paths or data before committing.

Dataset archives, generated labels, environments, weights and personal prediction
folders are ignored. Small aggregate experiment artifacts remain eligible for Git.
Existing tracked data is not affected by ignore rules. The material-recommendation
CSV/database files were intentionally left unchanged by this analyzer cleanup.

The old baseline batch-preview images were already tracked before these rules.
Review dataset permissions before publishing them. If sensitive content has already
been pushed, ignoring or untracking it does not remove it from repository history.
