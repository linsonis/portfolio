# personal-portfolio

Portfolio site styled as a Hyprland desktop (Catppuccin, tiling windows, terminal text). Plain HTML, CSS and JS with no build step.

## Files

| file | what it is |
| --- | --- |
| `index.html` | markup for both workspaces and the status bar |
| `style.css` | Catppuccin tokens (4 flavors), window and bar styles |
| `app.js` | workspaces, project list, theme and wallpaper menus, clock, first-launch sequence |
| `projects.js` | project data. Edit this to change the project list |
| `fonts/` | self-hosted JetBrains Mono |
| `wallpapers/`, `wallpapers.js` | wallpaper images and the list that feeds the dropdown |
| `tests/` | Playwright smoke tests |

## Run it

```sh
npm run dev      # http://localhost:8000
```

## Test it

```sh
npm install
npx playwright install chromium
npm test         # also writes screenshots to tests/shots/
```
