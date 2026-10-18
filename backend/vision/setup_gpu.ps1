$ErrorActionPreference = 'Stop'
$backendDir = Split-Path -Parent $PSScriptRoot
$trainingPython = Join-Path $backendDir '.venv-training\Scripts\python.exe'

function Assert-Success([string]$Step) {
    if ($LASTEXITCODE -ne 0) { throw "$Step failed (exit $LASTEXITCODE)." }
}

if (-not (Test-Path -LiteralPath $trainingPython)) {
    py -3.12 -m venv (Join-Path $backendDir '.venv-training')
    Assert-Success 'Create Python 3.12 environment'
}
& $trainingPython -m pip install --upgrade pip --timeout 120
Assert-Success 'Update pip'
& $trainingPython -m pip install 'https://download.pytorch.org/whl/cu124/torch-2.5.1%2Bcu124-cp312-cp312-win_amd64.whl' 'https://download.pytorch.org/whl/cu124/torchvision-0.20.1%2Bcu124-cp312-cp312-win_amd64.whl' --timeout 120 --retries 5 --resume-retries 20
Assert-Success 'Install CUDA PyTorch'
& $trainingPython -m pip install -r (Join-Path $PSScriptRoot 'requirements-gpu.txt') --timeout 120
Assert-Success 'Install training and notebook dependencies'
& $trainingPython -m ipykernel install --sys-prefix --name blueprint-gpu --display-name 'Blueprint GPU (Python 3.12)'
Assert-Success 'Install notebook kernel'
& $trainingPython -c "import torch, ultralytics; assert torch.cuda.is_available(), 'CUDA unavailable'; x=torch.ones((32,32),device='cuda'); print('GPU:',torch.cuda.get_device_name(0)); print('CUDA computation:',(x@x)[0,0].item()); print('Ultralytics:',ultralytics.__version__)"
Assert-Success 'Verify GPU computation'
Write-Host "Select this notebook interpreter in VS Code: $trainingPython"
