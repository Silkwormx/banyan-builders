# Banyan Builders

The live site on `main` is the static writing demo. This branch is an **unpublished review draft** of The Colony. It is not merged, and it does not change GitHub Pages.

## The Colony

Building a new world. Bringing the same old problems.

Open the draft locally from this folder:

```bash
python3 -m http.server 43123 --bind 127.0.0.1
```

Then open http://127.0.0.1:43123

Home is the approved dusk panorama. Workshop, Greenhouse, Cinema, and Treehouse are one short loop: sunlight, dusty meltwater, a paid filter, and a garden that refuses raw regolith. Demo ANTS are a browser counter with no money value. Sources separates measurements, the toy, and the fiction.

Pictures in `assets/` were supplied for this review. They are not claimed as public-domain, and this draft is not a release of those rights.

The earlier writing demo is unchanged in purpose and lives at `writing/index.html` on this branch only. The published Pages site still serves the writing demo from `main`.

## Earlier writing demo, on main

Play the published demo at the GitHub Pages project path `/banyan-builders/` once Pages is serving `main`. Asset links there are relative.

From a checkout of `main`:

```bash
python3 -m http.server 43123 --bind 127.0.0.1
```

No install is required. The approved source passed 48 Playwright checks before publication: Chromium and WebKit, desktop and phone. Those test files are not part of the site.

The red bough, Nim's Rain Porch, is one writing build. Drafts stay in the browser. The optional wallet control can read an injected provider. It does not choose a chain or a token, and it does not send a transaction, sign a message, or read a balance.

`writing/img/tile02.webp` through `tile09.webp` on this branch are the same byte copies as `img/` on `main`. Checksums are in `writing/img/SOURCE-MAP.txt`.

Text is set in Andika (SIL Open Font License). See `fonts/Andika-OFL-NOTE.txt`.

## Limits

- Static files. No package publish, mint, or payment.
- Demo ANTS in The Colony are not money and not a launched coin.
- One playable bough in the writing demo. The other seven paintings open a preview and do not save a draft.
- Saving is `localStorage` on this device. There is no account and no upload.
- The writing demo arranges lines you wrote. It does not call an AI model, and it does not turn text into a new picture or a 3D scene.
- Wallet status is not a balance, a vote, a burn, or a payout. Founding-member voting and any NFT project are described as proposals. The editor keeps the final decision. No financial right is implemented.
- In the writing demo, copy uses the clipboard when the browser allows it. Otherwise the full text is selected, and download still works.
