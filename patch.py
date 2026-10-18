import os

file_path = r"c:\Users\ASUS\Desktop\Material specification\frontend\src\app\workspace\page.js"

with open(file_path, "r", encoding="utf-8") as f:
    lines = f.readlines()

# 1. Add import
for i, line in enumerate(lines):
    if "import Footer from" in line:
        lines.insert(i + 1, "import Building3DModel from '@/components/Building3DModel';\n")
        break

# 2. Find and replace canvas controls state
start_controls = -1
for i, line in enumerate(lines):
    if "// ── 3D RENDER CANVAS CONTROLS ──" in line:
        start_controls = i
        break

if start_controls != -1:
    lines[start_controls] = "  // ── 3D TRUE MODEL CONTROLS ──\n"
    lines[start_controls+1] = "  // Handled by OrbitControls\n"
    lines[start_controls+2] = "\n"
    lines[start_controls+3] = "\n"
    lines[start_controls+4] = "\n"

# 3. Remove draw3DLayout
start_drawer = -1
end_drawer = -1
for i, line in enumerate(lines):
    if "// ── 3D CANVAS DRAWER ──" in line:
        start_drawer = i
    if start_drawer != -1 and "// ── RENDER HELPER ACTIONS ──" in line:
        end_drawer = i
        break

if start_drawer != -1 and end_drawer != -1:
    # Delete lines from start_drawer to end_drawer (exclusive)
    del lines[start_drawer:end_drawer]

# 4. Replace Step 7 rendering logic
start_step7 = -1
for i, line in enumerate(lines):
    if "{/* 3D Canvas Visualizer */}" in line:
        start_step7 = i
        break

if start_step7 != -1:
    end_step7 = start_step7
    while "COMPILE ENGINEERING REPORT" not in lines[end_step7]:
        end_step7 += 1
    
    # We want to replace from start_step7 to end_step7 - 3 (to keep the buttons)
    replacement = """                {/* 3D TRUE MODEL VISUALIZER */}
                <div style={{ background: '#020617', border: '1px solid #1e293b', borderRadius: '24px', position: 'relative', overflow: 'hidden', height: '600px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <div className="scan-line" style={{ height: '3px' }}></div>
                  <div style={{ position: 'absolute', inset: 0, zIndex: 10 }}>
                    <Building3DModel blueprint={blueprint} threeDMode={threeDMode} />
                  </div>
                  <div style={{ position: 'absolute', bottom: '20px', left: '20px', zIndex: 20, pointerEvents: 'none' }}>
                    <div style={{ fontSize: '0.65rem', fontWeight: 900, color: '#fff', background: 'rgba(0,0,0,0.5)', padding: '5px 10px', borderRadius: '4px' }}>
                      Drag to rotate • Scroll to zoom
                    </div>
                  </div>
                </div>

                {/* Info Panel */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
                  <div className="glass-panel" style={{ padding: '2rem', background: 'rgba(0,0,0,0.2)' }}>
                    <span className="tech-label">3D INTERACTIVE SPACE</span>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6, marginTop: '1rem' }}>
                      You are now navigating a true 3D projection of the generated blueprint. 
                    </p>
                    <ul style={{ fontSize: '0.8rem', color: '#fff', marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <li><span style={{ color: 'var(--eco-glow)' }}>Massing:</span> Spatial zoning & volume</li>
                      <li><span style={{ color: 'var(--blueprint-blue)' }}>Layout:</span> Wireframe structural walls</li>
                      <li><span style={{ color: 'var(--warn-amber)' }}>Facade:</span> Solid architectural shell</li>
                    </ul>
                  </div>

"""
    # Find the button div before "COMPILE ENGINEERING REPORT"
    # Actually we just replace start_step7 up to the line containing <div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto' }}>
    btn_start = start_step7
    while "<div style={{ display: 'flex', gap: '1.5rem', marginTop: 'auto' }}>" not in lines[btn_start]:
        btn_start += 1

    del lines[start_step7:btn_start]
    lines.insert(start_step7, replacement)

with open(file_path, "w", encoding="utf-8") as f:
    f.writelines(lines)
