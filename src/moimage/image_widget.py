"""
ImageWidget - A modern image widget for displaying and manipulating images in notebooks.

Part of the Moimage package - focused on image processing and manipulation widgets 
for use in Jupyter, Marimo, and other Python notebook environments.
"""

import base64
import io
from pathlib import Path
from typing import Union, Optional

import anywidget
import traitlets
from PIL import Image


class ImageWidget(anywidget.AnyWidget):
    """
    A widget for displaying images with metadata information.
    
    Supports loading images from:
    - File paths
    - URLs
    - PIL Image objects
    - Base64 encoded data
    """
    
    # Load JavaScript from static file
    _esm = Path(__file__).parent / "static" / "js" / "image_widget.js"
    
    # Widget traits (synchronized with JavaScript)
    src = traitlets.Unicode("").tag(sync=True)
    width = traitlets.Int(0).tag(sync=True)
    height = traitlets.Int(0).tag(sync=True)
    format = traitlets.Unicode("").tag(sync=True)
    
    def __init__(self, image: Optional[Union[str, Path, Image.Image]] = None, **kwargs):
        """
        Initialize the ImageWidget.
        
        Args:
            image: Image source - can be a file path, URL, PIL Image object, or base64 data URL
            **kwargs: Additional widget parameters
        """
        super().__init__(**kwargs)
        
        if image is not None:
            self.load_image(image)
    
    def load_image(self, image: Union[str, Path, Image.Image]) -> None:
        """
        Load an image from various sources.
        
        Args:
            image: Image source - file path, URL, PIL Image object, or base64 data URL
        """
        if isinstance(image, (str, Path)):
            image_str = str(image)
            if image_str.startswith('data:image/'):
                self._load_from_base64(image_str)
            elif Path(image).exists():
                self._load_from_file(Path(image))
            elif image_str.startswith(('http://', 'https://')):
                self._load_from_url(image_str)
            else:
                raise ValueError(f"Image file not found or invalid format: {image}")
        elif isinstance(image, Image.Image):
            self._load_from_pil(image)
        else:
            raise TypeError(f"Unsupported image type: {type(image)}")
    
    def _load_from_file(self, file_path: Path) -> None:
        """Load image from a local file."""
        try:
            with Image.open(file_path) as img:
                # Convert to base64 for display
                buffer = io.BytesIO()
                img_format = img.format or 'PNG'
                img.save(buffer, format=img_format)
                img_data = base64.b64encode(buffer.getvalue()).decode()
                
                # Update widget properties
                self.src = f"data:image/{img_format.lower()};base64,{img_data}"
                self.width = img.width
                self.height = img.height
                self.format = img_format
                
        except Exception as e:
            raise ValueError(f"Failed to load image from {file_path}: {e}")
    
    def _load_from_url(self, url: str) -> None:
        """Load image from a URL."""
        # For URLs, we'll let the browser handle loading
        self.src = url
        # Format and dimensions will be updated by JavaScript when loaded
    
    def _load_from_base64(self, data_url: str) -> None:
        """Load image from a base64 data URL."""
        try:
            # Extract the base64 data from the data URL
            if ',' not in data_url:
                raise ValueError("Invalid data URL format")
            
            header, base64_data = data_url.split(',', 1)
            
            # Decode the base64 data
            image_data = base64.b64decode(base64_data)
            
            # Open the image with PIL to get dimensions and format
            image_buffer = io.BytesIO(image_data)
            with Image.open(image_buffer) as img:
                # Update widget properties
                self.src = data_url  # Use the original data URL
                self.width = img.width
                self.height = img.height
                self.format = img.format or 'PNG'
                
        except Exception as e:
            raise ValueError(f"Failed to load base64 image: {e}")
    
    def _load_from_pil(self, pil_image: Image.Image) -> None:
        """Load image from a PIL Image object."""
        try:
            # Convert to base64 for display
            buffer = io.BytesIO()
            img_format = pil_image.format or 'PNG'
            pil_image.save(buffer, format=img_format)
            img_data = base64.b64encode(buffer.getvalue()).decode()
            
            # Update widget properties
            self.src = f"data:image/{img_format.lower()};base64,{img_data}"
            self.width = pil_image.width
            self.height = pil_image.height
            self.format = img_format
            
        except Exception as e:
            raise ValueError(f"Failed to load PIL image: {e}")
    
    @property
    def image(self) -> str:
        """Standardized output image property for widget chaining."""
        return self.src
    
    def get_image_info(self) -> dict:
        """
        Get information about the currently loaded image.

        Returns:
            Dictionary with image metadata
        """
        return {
            'width': self.width,
            'height': self.height,
            'format': self.format,
            'has_image': bool(self.src),
            'is_url': self.src.startswith('http') if self.src else False,
            'is_base64': self.src.startswith('data:') if self.src else False,
        }
