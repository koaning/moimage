"""
ImageOutlineWidget - A widget for applying edge detection and outline effects to images.

Part of the Moimage package - focused on image processing and manipulation widgets 
for use in Jupyter, Marimo, and other Python notebook environments.
"""

from pathlib import Path
from typing import Union, Optional
import traitlets
from .image_widget import ImageWidget


class ImageOutlineWidget(ImageWidget):
    """
    A widget for applying outline/glow effects around image shapes.
    
    Inherits from ImageWidget and adds outline processing capabilities:
    - Creates outline/glow effects around non-transparent pixels
    - Perfect for PNG images with transparent backgrounds  
    - Configurable outline width and color
    - Canvas-based image processing with alpha channel detection
    """
    
    # Load JavaScript from static file
    _esm = Path(__file__).parent / "static" / "js" / "image_outline_widget.js"
    
    # Additional widget traits for outline functionality
    outline_width = traitlets.Int(10, min=1, max=50).tag(sync=True)
    outline_color = traitlets.Unicode("#FFFFFF").tag(sync=True)
    background_color = traitlets.Unicode("#f9f9f9").tag(sync=True)
    processed_image_src = traitlets.Unicode("").tag(sync=True)
    
    def __init__(self, image: Optional[Union[str, Path]] = None, **kwargs):
        """
        Initialize the ImageOutlineWidget.
        
        Args:
            image: Image source - can be a file path, URL, or PIL Image object
            **kwargs: Additional widget parameters including outline_width and outline_color
        """
        super().__init__(image, **kwargs)
    
    def reset_outline(self):
        """Reset to the original image without outline."""
        self.processed_image_src = self.src
    
    def to_pil(self):
        """
        Convert the processed outlined image to a PIL Image object.
        
        Returns:
            PIL Image object of the processed image with outline,
            or None if no processed image is available.
        """
        if not self.processed_image_src:
            return None
            
        try:
            import base64
            import io
            from PIL import Image
            
            # Extract base64 data from data URL
            if self.processed_image_src.startswith('data:image/'):
                # Remove the data URL prefix (e.g., "data:image/png;base64,")
                header, base64_data = self.processed_image_src.split(',', 1)
                
                # Decode base64 data
                image_data = base64.b64decode(base64_data)
                
                # Create PIL Image from bytes
                image_buffer = io.BytesIO(image_data)
                pil_image = Image.open(image_buffer)
                
                # Convert to RGBA if it isn't already (to preserve transparency)
                if pil_image.mode != 'RGBA':
                    pil_image = pil_image.convert('RGBA')
                
                return pil_image
                
        except Exception as e:
            raise ValueError(f"Failed to convert processed image to PIL: {e}")
        
        return None

    @property
    def image(self) -> str:
        """Standardized output image property for widget chaining."""
        return self.processed_image_src if self.processed_image_src else self.src

    def get_outline_info(self) -> dict:
        """
        Get information about the current outline settings.

        Returns:
            Dictionary with outline parameters and processing status
        """
        return {
            'outline_width': self.outline_width,
            'outline_color': self.outline_color,
            'background_color': self.background_color,
            'has_processed_image': bool(self.processed_image_src),
            'processing_enabled': bool(self.src),
        }
