"""
ImageUploadWidget - A widget for uploading images via drag & drop, file picker, or clipboard paste.

Part of the Moimage package - focused on image processing and manipulation widgets 
for use in Jupyter, Marimo, and other Python notebook environments.
"""

from pathlib import Path
from typing import Union, Optional
import traitlets
from .image_widget import ImageWidget


class ImageUploadWidget(ImageWidget):
    """
    A widget for uploading images with multiple input methods.
    
    Inherits from ImageWidget and adds upload capabilities:
    - Drag and drop file upload
    - Click to browse file picker
    - Click and paste from clipboard (Ctrl+V/Cmd+V)
    - File validation and status feedback
    - Preview display using inherited ImageWidget functionality
    """
    
    # Load JavaScript from static file
    _esm = Path(__file__).parent / "static" / "js" / "image_upload_widget.js"
    
    # Additional widget traits for upload functionality
    upload_status = traitlets.Unicode("").tag(sync=True)
    filename = traitlets.Unicode("").tag(sync=True)
    file_size = traitlets.Int(0).tag(sync=True)
    is_focused = traitlets.Bool(False).tag(sync=True)
    
    def __init__(self, **kwargs):
        """
        Initialize the ImageUploadWidget.
        
        Args:
            **kwargs: Additional widget parameters
        """
        # Don't pass image parameter to parent, start empty for upload
        super().__init__(image=None, **kwargs)
    
    def clear_upload(self):
        """Clear the uploaded image and reset status."""
        self.src = ""
        self.filename = ""
        self.file_size = 0
        self.upload_status = ""
        self.width = 0
        self.height = 0
        self.format = ""
    
    def get_upload_info(self) -> dict:
        """
        Get information about the current upload status.

        Returns:
            Dictionary with upload parameters and status
        """
        return {
            'has_image': bool(self.src),
            'filename': self.filename,
            'file_size': self.file_size,
            'upload_status': self.upload_status,
            'is_focused': self.is_focused,
            'ready_for_upload': True,
        }
