## Learnings:

1.  ES-Module Import Fehler im Background Script
    Imports funktionieren im Service Worker nur, wenn: - in der manifest.json `"type": "module"` gesetzt ist - im Vite Build das Format auf ESM konfiguriert wird

    -> Gilt **NUR** für das Background/Service-Worker-Bundle!

2.  Modul-Import Fehler im Content Script
    Content Scripts unterstützen keine nativen ES-Module.
    Damit Imports trotzdem funktionieren, muss das Build über das `crx-Package` laufen, das die Bundles entsprechend transformiert.

3.  Chrome Event Listener dürfen nicht `async` sein
    chrome.\* Listener dürfen kein `async/await` direkt im Listener haben, da Chrome keine Promise-basierten Listener akzeptiert.
    Das hier geht nicht:

```ts
chrome.tabs.onUpdated.addListener(async () => { ... });
```

**Fix:**
Verwendung einer Wrapper-Arrow Function:

```ts
chrome.tabs.onUpdated.addListener((...args) => {
  (async () => {
    // ...
  })();
});
```

Oder outsource die Async Function und integriere sie in der Listener Function.

4. Tracking-Parameter nicht erkannt
   URLSearchParams matched Keys exakt, also "utm*" findet keine "utm_source" Parameter.
   **Fix:** Prefix-Matching nutzen: `key.startsWith("utm*")`

5. Leere Parameterliste beim Messaging
   Die an den Content Script gesendete params-Liste war leer, weil die Filterbedingung ebenfalls auf exakte Namen geprüft hat.
   **Fix:** auch hier die Prefix-Logik verwenden und gefundene Keys korrekt sammeln.

6. Doppelungen in der URL-Tracking-Detection
   Wenn das Content Script bei jeder Seite mehrfach ausgelöst wird, können duplicate URL-Tracking-Meldungen entstehen.
   **Grund:** Content Scripts werden standardmässig in allen Frames ausgeführt und können bei jedem Lifecycle-Event mehrfach ausgelöst werden.
   **Lösung:**
   Setze im manifest.json für das Content Script:

```json
"run_at": "document_idle",
"run_at": "document_idle" // Das Script startet erst, wenn die Seite vollständig geladen ist, und vermeidet unnötige frühzeitige Aufrufe.
 "all_frames": false // Das Script wird nur im Top-Level-Frame ausgeführt und nicht in iFrames, wodurch Duplikate minimiert werden.
```

7. Im Verlaufe des Projekts fällt mir immer mehr auf, je mehr Tracking Methoden ich verarbeite, dass viele davon nicht direkt mit dem Cursor ansteuerbar sind. Aktuell packe ich darum alle gefundenen Tracker, die keine konkrete Position haben in Notifications. Das ist nicht die endgültige Lösung, denn aktuell gibt es dadurch ein Notification Spam. Und der Sinn mit dem Cursor-Hover rückt in den Hintergrund. Eine Lösung muss noch gefunden werden.

8. Für die Migration der DuckDuckGo-Tracker-Radar Daten habe ich ein eigenes Extraktionsprojekt mit wöchentlichem Cron-Job über GitHub Actions aufgebaut. Vorteil: Ich behalte Kontrolle über Struktur, Updates und die Qualität der Daten und halte das Hauptprojekt schlank und flexibel. Anfangs gab es Probleme, weil ich die Struktur im Zwischenrepo festgelegt hatte, doch die Organisation direkt im Detecta-Projekt macht es dynamischer und vermeidet Hardcoding, wie ich später gemerkt habe. Herausfordernd war vor allem auch, die komplexe Tracker-Radar Struktur in mein eigenes Projekt zu überführen und hier brauchbar aufzubrereiten.

9. Die Parameter verändern sich nicht so häufig wie die Tracking Domains. Sie sind relativ konstant. Um weitere grosse Files zu vermeiden und das Projekt möglichst schlank zu halten, habe ich mich darum dafür entschieden, die Parameter erstmal zu hardcoden. Als Datengrundlage habe ich 3 UTM-Listen-Quellen gefunden, von denen ich dann mit Hilfe eines AI-Promts die wichtigsten herausgezogen und in meine Kategorien eingefügt habe.

10. Ich habe festgestellt, dass das reine exakte Matching von Domains schnell zu ungewollten Ergebnissen führt. So kommt es zu False Positives und False Negatives. Um dieses Problem zu beheben, nutze ich jetzt nicht nur ein Exact- Matching, sondern auch ein Suffix- und Teilstring-Matching. So wird die Logik robuster und genauer:

```ts
const trackerInfo = TRACKING_DOMAINS.find((t) => {
  if (url.hostname === t.domain) return true;
  if (url.hostname.endsWith("." + t.domain)) return true;
  if (url.hostname.includes(t.domain)) return true;
  return false;
});
```

11. Viele Ad-Netzwerke liefern Werbung über mehrere Ebenen von iFrames. Das DOM alleine sieht nur das äußerste <iframe>. Viele Tracking-Skripte sind tief verschachtelt und werden von einem normalen Content Script nicht gesehen. z.B.: `iframe → iframe → iframe → safeframe → actual ad a href`

Die Erkenntnis: Diese verschachtelten Ad-iFrames können nur über die Network-Tracking-Events des Service Workers aufgedeckt werden. Die Domainliste allein reicht nicht, erst die Kombination aus Network-Events + DOM-Analyse macht diese verschachtelten Werbe-iFrames sichtbar. Also prüfe ich nun im Content-Script (innerhalb von `chrome.runtime.onMessage.addListener`) zusätzlich, ob API Abfragen im Service Worker mit iFrames im DOM übereinstimmen. So können selbst verschachtelte

12. Tailwind CSS funktioniert nicht einfach so in Chrome Extensions, weil Manifest V3 Build-Systeme, PostCSS und Shadow DOM manchmal Probleme machen.
    _Lösung:_
    Tailwind und PostCSS korrekt konfigurieren (tailwind.config.js, postcss.config.js).
    Downgrade auf Tailwind v3 hat geholfen, da v3 stabiler mit Extensions zusammenarbeitet.
    Learning: Man darf nicht einfach React + Tailwind konfigurieren, ohne die Extension-Spezifikationen zu berücksichtigen.

13. Zähler wurden nicht korrekt hochgezählt, weil:

    - Mehrfachzählungen ohne Deduplication
    - Verschachtelte Events schwer nachzuvollziehen
    - Vermischung aus Content Script und Service Worker

Darum habe ich das Projekt ganz neu aufgesetzt, Verantwortungen klar und sauber getrennt, den Count von Anfang an sauber gespeichert und priorisiert. Learning: Den Zähler immer von ANFANG an sauber einführen und Verantwortlichkeiten klar trennen, vor allem zwischen DOM- und Network-Ereignissen.

14. Custom cursors oder Hover-Effekte funktionieren nicht zuverlässig bei iFrames in Chrome, vor allem bei Cross-Origin. <iframe> ist ein eigenes Dokument → CSS/JS vom Host-Dokument wirkt nur eingeschränkt. Der Overlay-Ansätze verhindern Klicks auf den Link → schlechte UX.

_Lösung / Lern:_

- Outline, Rahmen oder Badge als visuelles Signal verwenden.
- Cursor-Change auf <iframe> selbst funktioniert nicht zuverlässig.
  -> Lern: Bei Cross-Origin iFrames müssen visuelle Hinweise außerhalb des iFrames erfolgen. Cursor und Hover sind browserseitig limitiert.

15. Die Persistenz der Tracker Daten war so ziemlich die grösste Herausforderung im Projekt.

_Problem 1: Content Script stirbt, Service Worker lebt weiter_

- Browser entlädt Content Script nach Inaktivität
- Service Worker sammelt weiter Network-Requests
- Popup bekommt inkonsistente Daten

_Problem 2: Refresh-Button funktioniert nicht zuverlässig_

- isRefreshing Timeout war zu statisch
- chrome.tabs.reload() garantiert nicht, dass onUpdated complete feuert

_Problem 3: Overengineering Service Worker_

- Daten doppelt in Memory & Storage → Komplexität unnötig
- Fehleranfällig

Mit folgendem Vorgehen konnte ich die Persistenzprobleme verringern:

- Memory-first: Service Worker hält Cache in Maps
- Storage als Fallback: Nur zur Wiederherstellung, nicht für jede Änderung
- Content Script meldet DOM-Events / Pixel / IFrames, Service Worker trackt Network Events
- Popup fragt Service Worker ab → konsistente Daten

Die Trennung zwischen persistentem Service Worker (der immer läuft) und flüchtigem Content Script (das jederzeit beendet werden kann) ist entscheidend, damit die Tracker-Daten zuverlässig bleiben.
