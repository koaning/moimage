"""
ImageClipboardWidget - A reusable widget for copying images to clipboard.

Part of the Moimage package - focused on image processing and manipulation widgets 
for use in Jupyter, Marimo, and other Python notebook environments.
"""

from pathlib import Path
import traitlets
import anywidget


class ImageClipboardWidget(anywidget.AnyWidget):
    """
    A widget for copying images to the system clipboard.
    
    Features:
    - Copy images from base64 data URLs, regular URLs, or file paths
    - Modern Clipboard API with fallback support
    - Visual feedback for copy operations
    - Cross-browser compatibility
    - Works with any image source
    """
    
    # Load JavaScript from static file
    _esm = Path(__file__).parent / "static" / "js" / "image_clipboard_widget.js"
    
    # Widget traits
    image_src = traitlets.Unicode("").tag(sync=True)
    clipboard_status = traitlets.Unicode("").tag(sync=True)
    
    def __init__(self, image_src: str = "", **kwargs):
        """
        Initialize the ImageClipboardWidget.
        
        Args:
            image_src: Image source - can be base64 data URL, regular URL, or file path
            **kwargs: Additional widget parameters
        """
        super().__init__(image_src=image_src, **kwargs)
    
    def set_image(self, image_src: str):
        """Set the image source for clipboard operations."""
        self.image_src = image_src
    
    @property
    def image(self) -> str:
        """Standardized output image property for widget chaining."""
        return self.image_src

    def get_clipboard_info(self) -> dict:
        """
        Get information about the clipboard configuration.

        Returns:
            Dictionary with clipboard parameters and status
        """
        return {
            'has_image': bool(self.image_src),
            'clipboard_status': self.clipboard_status,
            'ready_for_copy': bool(self.image_src),
            'clipboard_api_supported': True,  # Will be updated by JS
        }
