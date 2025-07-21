"""
ImageDownloadWidget - A reusable widget for downloading images.

Part of the Moimage package - focused on image processing and manipulation widgets 
for use in Jupyter, Marimo, and other Python notebook environments.
"""

from pathlib import Path
import traitlets
import anywidget


class ImageDownloadWidget(anywidget.AnyWidget):
    """
    A widget for downloading images from various sources.
    
    Features:
    - Download images from base64 data URLs, regular URLs, or file paths
    - Configurable filename and format
    - Clean, simple interface with download button
    - Works with any image source
    """
    
    # Load JavaScript from static file
    _esm = Path(__file__).parent / "static" / "js" / "image_download_widget.js"
    
    # Widget traits
    image_src = traitlets.Unicode("").tag(sync=True)
    filename = traitlets.Unicode("image").tag(sync=True)
    format = traitlets.Unicode("png").tag(sync=True)
    download_status = traitlets.Unicode("").tag(sync=True)
    
    def __init__(self, image_src: str = "", filename: str = "image", format: str = "png", **kwargs):
        """
        Initialize the ImageDownloadWidget.
        
        Args:
            image_src: Image source - can be base64 data URL, regular URL, or file path
            filename: Base filename for downloaded file (without extension)
            format: Image format for download (png, jpg, webp, etc.)
            **kwargs: Additional widget parameters
        """
        super().__init__(image_src=image_src, filename=filename, format=format, **kwargs)
    
    def set_image(self, image_src: str):
        """Set the image source for download."""
        self.image_src = image_src
    
    def set_filename(self, filename: str):
        """Set the filename for download."""
        self.filename = filename
    
    def set_format(self, format: str):
        """Set the image format for download."""
        self.format = format
    
    @property
    def image(self) -> str:
        """Standardized output image property for widget chaining."""
        return self.image_src

    def get_download_info(self) -> dict:
        """
        Get information about the download configuration.

        Returns:
            Dictionary with download parameters and status
        """
        return {
            'has_image': bool(self.image_src),
            'filename': self.filename,
            'format': self.format,
            'full_filename': f"{self.filename}.{self.format}",
            'download_status': self.download_status,
            'ready_for_download': bool(self.image_src),
        }
