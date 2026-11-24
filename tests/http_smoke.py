"""Check production routing, caching and security headers."""
import gzip
import os
import re
from urllib.request import Request, urlopen
from urllib.error import HTTPError

base = os.environ.get("BASE_URL", "http://127.0.0.1:18081")
with urlopen(base + "/") as response:
    html = response.read().decode()
    assert response.status == 200
    assert "no-store" in response.headers["Cache-Control"]
    assert "script-src 'self'" in response.headers["Content-Security-Policy"]
    assert response.headers["X-Content-Type-Options"] == "nosniff"

for path in ["/index.html", "/ruta/de/prueba"] + re.findall(r'(?:src|href)="([^"]+\.(?:js|css))"', html):
    with urlopen(base + "/" + path.lstrip("/")) as response:
        assert response.status == 200
        assert response.headers["X-Frame-Options"] == "DENY"
        assert response.headers["Content-Security-Policy"]
        if re.search(r"-[a-zA-Z0-9]{8}\.(js|css)$", path):
            assert "immutable" in response.headers["Cache-Control"], path

for path, expected in [("/missing.js", 404), ("/.git/config", 403)]:
    try:
        urlopen(base + path)
    except HTTPError as error:
        assert error.code == expected, (path, error.code)
        assert error.headers["X-Content-Type-Options"] == "nosniff"
    else:
        raise AssertionError(f"{path} unexpectedly served")
with urlopen(base + "/healthz") as response:
    assert response.read().strip() == b"ok"

scripts = re.findall(r'src="([^"]+\.js)"', html)
assert scripts, "No JavaScript entry points in index"
with urlopen(Request(base + "/" + scripts[0].lstrip("/"), headers={"Accept-Encoding": "gzip"})) as response:
    assert response.headers["Content-Encoding"] == "gzip"
    assert "Accept-Encoding" in response.headers["Vary"]
    assert len(gzip.decompress(response.read())) > 1024
