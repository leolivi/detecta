# Cursor Tracker Extension – Strukturplan

## Projektziel

Mein Ziel ist es, eine Web Extension für Chrome zu entwickeln, die Tracking-
Mechanismen in Echtzeit visualisiert. Sie nutzt die chrome.webRequest API
zum Monitoring von HTTP-Requests und erkennt URL Tracking Parameter
sowie Ad Services im Hintergrund. Die Extension visualisiert erkanntes Tra-
cking durch kontextabhängige Cursor-Änderungen beim Hover über getrackte
Elemente (z.B. Links mit Tracking-Parametern). Ausserdem enthält sie einen
Service Worker als Hintergrundskript und ein Benutzerinterface zur Darstellung
der gesammelten Daten.

Die Basis: Vite React Extension Template.

---

## MVP

1. Vite + React Extension Template aufsetzen.
2. Service Worker implementieren, der Network Requests sammelt.
3. tracker.json von DuckDuckGo Tracker Radar ins Repo einbinden.
4. Network Requests mit tracker.json abgleichen (erste Version, einfache Domain-Matches).
5. Counter System im Service Worker implementieren.
6. Content Script implementieren, das:
   - URL-Parameter (URL Decoration / Attribution) erkennt
   - Tracking Pixels, Iframes, Widgets, Third-Party Scripts und Links im DOM zählt
7. Kommunikation zwischen Service Worker <-> Content Script via `chrome.runtime.sendMessage` / Listener
8. UI mit React + ShadCN Komponenten:
   - Chart zur Visualisierung der Tracking-Daten
   - Unterscheidung nach TrackingMethod & TrackerPurpose

---

## Architektur

### 1. Service Worker

- Überwacht Network Requests (`chrome.webRequest.onBeforeRequest`)
- Prüft Requests gegen `tracker.json`
- Speichert gezählte Requests pro Domain
- Sammelt ggf. Meta-Daten (Request-ID, Method, Tab-ID)
- Message-Handler für Content Script Anfragen

### 2. Content Script

- Analysiert DOM für:
  - Tracking Pixels (`<img>` mit 1x1, bekannte Track-URLs)
  - Tracking Iframes (`<iframe>` mit externen Domains)
  - Social Media Widgets
  - Third-Party Scripts
  - Links mit Tracking Parametern
- Erkennt URL Decoration & Attribution Tracker (über URL-Parameter)
- Sendet Ergebnisse an Service Worker oder direkt an UI

### 3. Dashboard / UI

- Zeigt Glossary zu Cursor-Bedeutungen
- Enthält ein Dashboard mit dem Tracking Counts
