import tempfile
import unittest
from pathlib import Path
from PIL import Image
from convert_cubicasa_svg_to_coco import extract

class ConversionTests(unittest.TestCase):
    def test_semantic_boundaries_coordinate_frame_and_duplicates(self):
        with tempfile.TemporaryDirectory() as directory:
            p = Path(directory)
            Image.new("RGB", (200,100)).save(p/"F1_scaled.png")
            # Viewport deliberately differs from raster coordinate frame.
            (p/"model.svg").write_text('''<svg width="999" height="999">
              <g transform="translate(10,0)">
                <g class="Space Bedroom"><polygon points="0,0 80,0 80,60 0,60"/>
                  <g class="DimensionMark"><polygon points="2,2 3,2 3,3"/></g>
                </g>
                <g class="Wall"><polygon points="0,0 80,0 80,2 0,2"/>
                  <g class="Door"><polygon points="20,0 30,0 30,2 20,2"/>
                    <g class="PanelArea"><polygon points="20,0 30,0 30,1"/></g>
                  </g>
                </g>
                <g class="Window"><polygon points="40,0 50,0 50,2 40,2"/></g>
                <g class="Window"><polygon points="40,0 50,0 50,2 40,2"/></g>
                <g class="Space Outdoor"><polygon points="90,0 100,0 100,50"/></g>
              </g></svg>''')
            boxes=extract(p/"model.svg",100,50)
            self.assertEqual([t for t,b in boxes],["Room","Wall","Door","Window"])
            self.assertEqual(boxes[0][1],[5.,0.,40.,30.])
            self.assertEqual(boxes[2][1],[15.,0.,5.,1.])
            self.assertEqual(len(extract(p/"model.svg",100,50,include_outdoor=True)),5)

if __name__ == "__main__": unittest.main()
