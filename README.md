# Banyan Builders

Build a thought. Create a world.

Play this static demo in the browser from the GitHub Pages project path `/banyan-builders/`. The page links its stylesheet, script, pictures, and fonts with relative paths (`styles.css`, `js/app.js`, `img/…`, `fonts/…`), so they load under that subpath.

A private adult writing demo. One bough is playable. Seven are future previews. Drafts stay in this browser and are not submitted anywhere.

## Run locally

From this folder:

```bash
python3 -m http.server 43123 --bind 127.0.0.1
```

Open http://127.0.0.1:43123

No install is required to use the demo. To try the `/banyan-builders/` subpath locally, serve the parent folder and open `/banyan-builders/`.

The approved source passed 48 Playwright checks before this publication: Chromium and WebKit, each on a desktop window and a phone-sized window (Pixel 7 and iPhone 13), including a 1440×900 home fit. Those test files and preview screenshots are not part of this site.

## What you can do

The red bough, Nim's Rain Porch, is one writing build in four pages: The Job, Idea Box, Sketchbook, and Build & Try. You keep the wording. Suggestion cards are optional. The last page can copy or download the full text, and it shows a preset picture that does not change with what you write.

An adult wallet control on Home and About can read a connection from a standard injected provider (`window.ethereum`). It does not choose a chain or a token, and it does not send a transaction, sign a message, or read a balance.

## Pictures

`img/tile02.webp` through `img/tile09.webp` are byte copies of the reading app's paintings in the order immediately after `tile01.webp` (the gong picture, which is not included): red, coral, orange, yellow, green, light blue, dark blue, purple. Checksums are in `img/SOURCE-MAP.txt`.

The approved builder portrait is `img/banyan_home_hero.jpg` (1280×720). It is not one of the eight bell paintings.

Text is set in Andika (SIL Open Font License). See `fonts/Andika-OFL-NOTE.txt`.

## Limits

- Static GitHub Pages copy of the demo. No package publish, mint, or payment.
- One playable bough. The other seven paintings open a preview page and do not save a draft.
- Saving is `localStorage` on this device. There is no account and no upload.
- The template arranges lines you wrote. It does not call an AI model, and it does not turn text into a new picture or a 3D scene.
- Wallet status is not a balance, a vote, a burn, or a payout. Founding-member voting and any NFT project are described as proposals. The editor keeps the final decision. No financial right is implemented.
- Copy uses the clipboard when the browser allows it. Otherwise the full text is selected for Ctrl/Command+C, and Download still works.
