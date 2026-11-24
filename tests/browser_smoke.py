"""Exercise the same browser flow against a native or containerized build."""
import os
from playwright.sync_api import sync_playwright, expect

url = os.environ.get("BASE_URL", "http://127.0.0.1:18081")
with sync_playwright() as playwright:
    for name in os.environ.get('BROWSERS', 'chromium').split(','):
        name = name.strip()
        if name not in ('chromium', 'firefox', 'webkit'):
            raise ValueError(f'Unsupported browser: {name}')
        print(f'Testing {name}', flush=True)
        browser = getattr(playwright, name).launch()
        for viewport in ({"width": 1280, "height": 800}, {"width": 375, "height": 812}):
            page = browser.new_page(viewport=viewport)
            errors = []
            page.on("pageerror", lambda error: errors.append(str(error)))
            page.on("console", lambda message: errors.append(message.text) if message.type == "error" else None)
            page.goto(url, wait_until="networkidle")
            expect(page.get_by_role("heading", name="Ahorcado en español")).to_be_visible()
            expect(page.get_by_role("status")).to_contain_text("Juego iniciado", timeout=30000)
            expect(page.get_by_text("Diccionario reducido:", exact=False)).to_have_count(0)
            keys = page.locator(".teclado button")
            expect(keys).to_have_count(27)
            expect(page.locator(".estado-fila")).to_contain_text("Fallos: 0/7")
            page.locator("#intento").fill("1")
            page.get_by_role("button", name="Probar").click()
            expect(page.get_by_role("status")).to_contain_text("válida")
            page.locator("#intento").fill("n")
            page.get_by_role("button", name="Probar").click()
            expect(keys.nth(13)).to_be_disabled()
            expect(keys.nth(14)).to_be_enabled()
            for index in range(27):
                key = keys.nth(index)
                if key.is_enabled():
                    key.click()
            expect(page.locator(".estado-fila")).not_to_contain_text("En juego")
            expect(page.locator("#intento")).to_be_disabled()
            expect(page.locator(".palabra")).not_to_contain_text("_")
            total = sum(int(page.locator('[data-stat="' + stat + '"]').inner_text()) for stat in ("ganadas", "perdidas"))
            assert total == 1
            page.reload(wait_until="networkidle")
            expect(page.get_by_role("status")).to_contain_text("Juego iniciado", timeout=30000)
            assert sum(int(page.locator('[data-stat="' + stat + '"]').inner_text()) for stat in ("ganadas", "perdidas")) == 1
            page.locator("#dificultad").select_option(label="Palabras largas (11–14)")
            page.get_by_role("button", name="Nueva partida").click()
            expect(page.get_by_role("status")).to_contain_text("Juego iniciado")
            assert 11 <= page.locator(".palabra span").count() <= 14
            page.get_by_role("button", name="Reiniciar estadísticas").click()
            expect(page.locator('[data-stat="ganadas"]')).to_have_text("0")
            expect(page.locator('[data-stat="perdidas"]')).to_have_text("0")
            page.emulate_media(color_scheme="dark")
            assert page.locator("app-root").evaluate("(element) => getComputedStyle(element).colorScheme") == "dark"
            expect(page.locator(".estado-fila")).to_contain_text("Fallos: 0/7")
            expect(page.locator(".palabra")).to_contain_text("_")
            expect(keys.nth(13)).to_be_enabled()
            assert page.evaluate("document.documentElement.scrollWidth <= window.innerWidth"), "Horizontal overflow"
            assert not errors, errors
            page.close()
        browser.close()
