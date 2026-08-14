# Matematyczny ogród

Interaktywne laboratorium p5.js dla dzieci z siedmioma dużymi wizualizacjami:
złoty kąt słonecznika, zbiór Mandelbrota, spiralę Fibonacciego, orbity 3D
przestrzenną helisę liczb pierwszych, atlas sześciu pięknych równań 2D i 3D
oraz samochodzik na wstędze Möbiusa sterowany strzałkami na komputerze lub przechyleniem telefonu na urządzeniu mobilnym.

Wizualizacja liczb pierwszych korzysta ze statycznej listy pierwszych 1000
wartości z OEIS A000040 — podczas animacji nie jest uruchamiany algorytm sita.

## Uruchomienie lokalne

Wymagany jest Node.js 22.13 lub nowszy.

```bash
npm install
npm run dev
```

Następnie otwórz adres podany w terminalu (zwykle `http://localhost:5173`).

## Sprawdzenie wersji produkcyjnej

```bash
npm run build
npm test
```

Najważniejszy kod eksperymentu znajduje się w `app/MathGarden.tsx`, a wygląd
w `app/globals.css`.

## Publikacja na GitHub Pages

Repozytorium zawiera workflow `.github/workflows/deploy-pages.yml`. Po każdym
pushu do gałęzi `main` instaluje on zależności, tworzy statyczną wersję strony
i publikuje ją przez GitHub Pages. Ścieżka bazowa jest wykrywana automatycznie
zarówno dla zwykłego repozytorium projektu, jak i repozytorium
`<użytkownik>.github.io`.

Po pierwszym opublikowaniu repozytorium na GitHubie:

1. Otwórz `Settings` → `Pages`.
2. W sekcji `Build and deployment` ustaw `Source` na `GitHub Actions`.
3. Otwórz `Actions` i uruchom `Deploy GitHub Pages`, jeśli workflow nie ruszył
   automatycznie po pierwszym pushu.

> **Ważne:** GitHub Pages z prywatnego repozytorium wymaga planu GitHub Pro,
> Team albo Enterprise. Sama strona Pages pozostaje publiczna także wtedy, gdy
> kod źródłowy znajduje się w prywatnym repozytorium. Na darmowym planie użyj
> publicznego repozytorium albo wybierz inną usługę hostingową.

Statyczny build można sprawdzić lokalnie poleceniami:

```bash
npm run build:pages
npm run preview:pages
```
