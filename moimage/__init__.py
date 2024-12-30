from typing import List
from pathlib import Path
import anywidget
import traitlets


class SuperPixelWidget(anywidget.AnyWidget):
    """Initialize an annotation widget based on superpixels widget."""
    _esm = Path(__file__).parent / 'static' / 'superpixel.js'
    _css = Path(__file__).parent / 'static' / 'superpixel.css'
    selection = traitlets.List().tag(sync=True)
    shapes = traitlets.List().tag(sync=True)

    def __init__(self, shapes, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.shapes = shapes


