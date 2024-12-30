import os
from setuptools import setup, find_packages


base_packages = [
    "anywidget>=0.9.2", 
    "scikit-image",
]

def read(fname):
    return open(os.path.join(os.path.dirname(__file__), fname)).read()


setup(
    name="moimage",
    version="0.0.1",
    description="Collection of widgets for doing 'image stuff' in Marimo.",
    author="Vincent D. Warmerdam",
    packages=find_packages(exclude=["notebooks"]),
    package_data={"moimage": ["static/*.js", "static/*.css"]},
    long_description=read("readme.md"),
    long_description_content_type="text/markdown",
    install_requires=base_packages,
    classifiers=[
        "Intended Audience :: Developers",
        "Intended Audience :: Science/Research",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Topic :: Scientific/Engineering",
    ],
    license_files=["LICENSE"],
)
