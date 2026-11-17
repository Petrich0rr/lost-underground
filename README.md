# Lost Underground

A standalone game page. Not connected to any real estate site.

She is lost in the ruins and dungeons below ground, in old cellars and
underground bars. Help her jump the rubble and barrels and find the way
out and up.

## Play

Space, click or tap to jump. Score and best score are saved in the
browser. No build step.

## Files

- `index.html` — the page
- `game.js` — the game (canvas, same jump physics as the first runner)
- `assets/` — avatar frames, obstacle sprites and fireworks

## Deploy (when Erika confirms the repo name)

1. Create a new GitHub repo for this folder only, e.g. `lost-underground`.
2. Push `index.html`, `game.js` and `assets/` to its `main` branch.
3. In Cloudflare, create a new Pages project, Connect to Git, pick that
   repo, production branch `main`, framework preset None / static,
   build command empty, build output directory `/` (the site root).
4. That gives a separate `*.pages.dev` link, with no link to erikama.ca.

## Notes

- Do NOT add this to the erikama.ca repo (Petrich0rr/erika-ma-real-estate).
  That was tried by mistake on Nov 17, 2026 and reverted the same day.
- No coins, stars, hearts or diamonds. No dashes in the game text.
