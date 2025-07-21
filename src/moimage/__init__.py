"""
Moimage - A modern image widget for Jupyter notebooks and Python environments.

Focused on image processing and manipulation widgets for use in Jupyter, Marimo, and other
Python notebook environments.
"""

from .image_widget import ImageWidget
from .image_outline_widget import ImageOutlineWidget
from .image_download_widget import ImageDownloadWidget
from .image_clipboard_widget import ImageClipboardWidget
from .image_upload_widget import ImageUploadWidget

__version__ = "0.1.0"

__all__ = [
    "ImageWidget",
    "ImageOutlineWidget", 
    "ImageDownloadWidget",
    "ImageClipboardWidget",
    "ImageUploadWidget",
]
