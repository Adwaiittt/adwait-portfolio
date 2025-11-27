# Portfolio — Adwait

A terminal-style neon portfolio with animated background.

## Preview

```powershell
cd website
python -m http.server 8000
# open http://localhost:8000
```

## Features

- **Terminal aesthetic:** CLI-style prompts, monospace font, neon green accent
- **Animated background:** Matrix-style falling characters
- **Typing effect:** Name cycles through roles
- **Smooth scrolling:** Navigation links scroll smoothly
- **Responsive:** Mobile-friendly layout

## Customize

Edit `index.html` to change:
- Name and bio
- Project titles and links
- Contact email and social links

Edit `css/styles.css` to tweak:
- Colors (`:root` variables at top)
- Font sizes
- Spacing

Edit `js/script.js` to modify:
- Names that cycle in hero
- Matrix animation speed
- Typing effect speed

## Deploy

Push to GitHub and enable Pages:
- Settings → Pages → Deploy from a branch → `main` branch, `/root` folder

Or use Netlify/Vercel pointing to the `website/` folder.
