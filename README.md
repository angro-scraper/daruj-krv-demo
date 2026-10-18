# Daruj krv demonstraciona aplikacija

Javni klikabilni demo aplikacije za dobrovoljno davanje krvi i administrativnog portala Zavoda.

- Aplikacija davaoca: `/`
- Portal Zavoda: `/admin/`

Svi podaci su demonstracioni. Ovaj repozitorijum ne sadrži stvarne medicinske evidencije, stvarne zalihe niti produkcione integracije.

## Lokalni pregled

Otvorite `index.html` u pregledaču ili pokrenite bilo koji statički HTTP server iz korena repozitorijuma.

## Render

`render.yaml` definiše Render Static Site objavu. Nakon povezivanja repozitorijuma na Renderu, objavljuje se koren repozitorijuma, a administrativni portal je dostupan na putanji `/figma-preview/`.

Za zajednički sintetički demo (portal, aplikacija davaoca i prijem) u Render servisu mora biti podešena šifrovana promenljiva okruženja `VITE_DEMO_ACCESS_CODE`. Javni API endpoint se podešava tokom build-a kroz `render.yaml`; pristupni kod se nikad ne čuva u Git-u. Bez oba podešavanja portal ostaje jasno označen kao lokalni Figma demo i ne prikazuje lažnu povezanost.
