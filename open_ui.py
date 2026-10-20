#!/usr/bin/env python3
"""Open the TinyC pipeline inspector in your default browser.

Place this file in the project root, next to main.py and the ui/ folder:
    python open_ui.py
"""
import pathlib
import webbrowser

index = pathlib.Path(__file__).resolve().parent / "ui" / "index.html"
if not index.exists():
    raise SystemExit(f"Cannot find {index}. Copy the ui/ folder next to this script.")
webbrowser.open(index.as_uri())
print(f"Opened {index}")
