"""Static dev server for the demo with caching disabled.

python -m http.server sends no cache headers, so browsers happily reuse a
stale copy of index.html between edits. This one sets Cache-Control: no-store
on every response so a plain reload always shows the latest file.
"""
import os
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, must-revalidate")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()

    def log_message(self, fmt, *args):  # quieter log: skip the 304/asset noise
        if args and str(args[1]) in ("200", "404"):
            super().log_message(fmt, *args)


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else int(os.environ.get("PORT", 8765))
    root = Path(__file__).resolve().parent
    handler = partial(NoCacheHandler, directory=str(root))
    print(f"Serving {root} on http://localhost:{port} (no-cache)")
    ThreadingHTTPServer(("", port), handler).serve_forever()
