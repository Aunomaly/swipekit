# SwipeKit

Fast feedback through swiping. Two demos in one app:

- **DesignSwipe** — Upload designs, share a link. Reviewers swipe left (reject), right (approve), or up (annotate with full canvas markup, pins, and reference images).
- **SwipeSurvey** — Create yes/no questions, share a link. Recipients swipe left (no) or right (yes). Instant results.

## Getting Started

```bash
npm install
npm run dev
```

## Deploy to Vercel

1. Push to GitHub
2. Go to [vercel.com/new](https://vercel.com/new)
3. Import your repo
4. Vercel auto-detects Vite — just click **Deploy**

No environment variables or build config needed.

## Project Structure

```
src/
  App.jsx                              # Landing page + mode router
  main.jsx                             # Entry point
  styles/
    global.css                         # Minimal reset
  components/
    shared/
      constants.js                     # Colors, fonts, sample data
      Icons.jsx                        # All SVG icon components
      index.js                         # Barrel export
    design-review/
      DesignSwipeCard.jsx              # Swipeable image card (left/right/up)
      AnnotationOverlay.jsx            # Canvas drawing + pins + ref images
      DesignResults.jsx                # Review summary with expandable markup
      DesignReviewApp.jsx              # Full design review flow orchestrator
    survey/
      SurveySwipeCard.jsx              # Swipeable question card (left/right)
      SurveyApp.jsx                    # Full survey flow orchestrator
```

## Tech Stack

- **Vite** + **React**
- Zero external UI libraries — all custom components
- HTML5 Canvas for annotation drawing
- CSS-in-JS (inline styles) with shared design tokens
