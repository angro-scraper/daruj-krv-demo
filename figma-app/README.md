# Portal Zavoda — Figma interfejs

Ovaj direktorijum sadrži React/Vite interfejs preuzet iz korisnikovog ZIP-a „Premium redizajn administrativnog portala.zip“, sa povezanim `#portal/...` rutama.

- `npm ci` — instalacija zavisnosti.
- `npm run build:preview` — gradi zaseban pregled u `../dist/figma-preview/`.
- `npm run build:admin` — gradi glavni portal u `../dist/admin/`.
- `../dist/admin/operativno.html` — sačuvani prethodni prototip za funkcije koje još nisu prenete u Figma interfejs.

Akcije, nacrti, izveštaji i deo ostalih tokova trenutno koriste lokalno skladište pregledača. Demo nalozi i kontrola pristupa nisu produkciona autentikacija. E-pošta, MFA, pravi QR pristup, medicinski kartoni i spoljne API integracije zahtevaju zaseban serverski servis; interfejs ne tvrdi da ih je izvršio.
