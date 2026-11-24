"""Verify installed cache, full offline dictionary and automated accessibility."""
import os
import json
from pathlib import Path
from playwright.sync_api import sync_playwright, expect

url = os.environ.get("BASE_URL", "http://127.0.0.1:18081")
axe = Path(os.environ["AXE_PATH"]).read_text(encoding="utf-8")
with sync_playwright() as playwright:
    browser = playwright.chromium.launch()
    context = browser.new_context(viewport={"width": 375, "height": 812}, reduced_motion="reduce")
    page = context.new_page()
    page.goto(url)
    expect(page.get_by_role("status")).to_contain_text("Juego iniciado", timeout=30000)
    page.wait_for_function("navigator.serviceWorker.controller !== null", timeout=60000)
    manifest = page.request.get(url + "/manifest.webmanifest").json()
    assert manifest["display"] == "standalone"
    for icon in manifest["icons"]:
        response = page.request.get(url + "/" + icon["src"])
        assert response.ok and response.body().startswith(b"\x89PNG\r\n\x1a\n")
    for scheme in ("light", "dark"):
        page.emulate_media(color_scheme=scheme)
        page.evaluate(axe)
        result = page.evaluate("""async () => await axe.run({runOnly: {type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']}})""")
        violations = [{"id": v["id"], "nodes": [n["target"] for n in v["nodes"]]} for v in result["violations"]]
        assert not violations, json.dumps(violations, ensure_ascii=False)
    context.set_offline(True)
    page.reload(wait_until="domcontentloaded")
    expect(page.get_by_role("status")).to_contain_text("Juego iniciado", timeout=30000)
    expect(page.get_by_text("Diccionario reducido:", exact=False)).to_have_count(0)
    page.locator("#dificultad").select_option(label="Palabras largas (11–14)")
    page.get_by_role("button", name="Nueva partida").click()
    expect(page.get_by_role("status")).to_contain_text("Juego iniciado")
    assert 11 <= page.locator(".palabra span").count() <= 14
    page.locator(".teclado button").nth(0).click()
    expect(page.locator(".teclado button").nth(0)).to_be_disabled()
    browser.close()
