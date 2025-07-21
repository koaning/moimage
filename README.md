# Moimage

A modern image widget for Jupyter notebooks and Python environments.

## Installation

Using UV (recommended):

```bash
uv add moimage
```

Or using pip:

```bash
pip install moimage
```

## Development Setup

1. Clone the repository:
```bash
git clone <repository-url>
cd moimage
```

2. Install with UV:
```bash
uv sync --dev
```

3. Install in development mode:
```bash
uv pip install -e .
```

## Usage

### Basic Image Display

```python
from moimage import ImageWidget
from PIL import Image

# Load image from file path
widget = ImageWidget("path/to/image.jpg")
display(widget)

# Load image from URL
widget = ImageWidget("https://example.com/image.png")
display(widget)

# Load from PIL Image object
pil_img = Image.open("image.jpg")
widget = ImageWidget(pil_img)
display(widget)

# Get image information
info = widget.get_image_info()
print(f"Image size: {info['width']}x{info['height']}")
```

### Image Processing with Modular Widgets

```python
from moimage import ImageOutlineWidget, ImageDownloadWidget, ImageClipboardWidget

# Create outline widget
outline_widget = ImageOutlineWidget(
    "https://example.com/image.jpg",
    outline_width=10,
    outline_color="#FF0000"
)

# Create utility widgets that automatically sync
download_widget = ImageDownloadWidget(
    image_src=outline_widget.processed_image_src,
    filename="outlined_image",
    format="png"
)

clipboard_widget = ImageClipboardWidget(
    image_src=outline_widget.processed_image_src
)

# In Marimo, these widgets automatically react to changes!
```

### Complete Marimo Example

```python
import marimo as mo
from moimage import ImageOutlineWidget, ImageDownloadWidget, ImageClipboardWidget

# Create widgets
outline = mo.ui.anywidget(ImageOutlineWidget("image.jpg"))
download = mo.ui.anywidget(ImageDownloadWidget(
    image_src=outline.value.processed_image_src
))
clipboard = mo.ui.anywidget(ImageClipboardWidget(
    image_src=outline.value.processed_image_src
))

# Display widgets - they automatically sync through Marimo's reactivity!
mo.hstack([outline, mo.vstack([download, clipboard])])
```

## Available Widgets

### Core Widget
- **ImageWidget**: Display images with metadata information
  - Supports file paths, URLs, and PIL Image objects
  - Shows image dimensions, format, and source type
  - Automatic base64 encoding for local files
  - Error handling for invalid images

### Processing Widgets
- **ImageOutlineWidget**: Apply outline/glow effects around image shapes
  - Creates outline effects around non-transparent pixels (perfect for PNGs)
  - Configurable outline width (1-50px) and color
  - Canvas-based processing with alpha channel detection
  - Inherits from ImageWidget for full image loading capabilities
  - Reset functionality to return to original image

### Utility Widgets
- **ImageDownloadWidget**: Download images from any source
  - Configurable filename and format (PNG, JPG, WebP)
  - Works with base64 data URLs and remote URLs
  - Cross-origin image handling with canvas conversion
  - Clean, simple interface

- **ImageClipboardWidget**: Copy images to system clipboard
  - Modern Clipboard API with fallback support
  - Handles base64 and remote images automatically
  - Visual feedback and error handling
  - Cross-browser compatibility

## Features

- Built on AnyWidget framework for seamless Jupyter integration
- Modern JavaScript/HTML frontend with Python backend
- Reactive state management with traitlets
- Extensible architecture for custom widgets
- TypeScript support for frontend development

## Creating Custom Widgets

```python
import anywidget
import traitlets

class MyCustomWidget(anywidget.AnyWidget):
    _esm = """
    function render({ model, el }) {
        // Your JavaScript rendering logic here
        let value = model.get("value");
        // ... create DOM elements and event handlers
    }
    export default { render };
    """
    
    value = traitlets.Unicode("").tag(sync=True)
```

## License

MIT License
