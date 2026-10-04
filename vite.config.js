// Vite is the tool that runs our local dev server and builds the site.
// The React plugin teaches Vite how to understand React (JSX) files.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // "base" is the folder the site lives under on the web.
  // GitHub Pages hosts it at https://uhkil.github.io/soneriakhil-wedding-site/,
  // so the built site needs that folder name. Locally ("npm run dev") it's
  // just "/", so http://localhost:5173 keeps working.
  // (If we later use a custom domain like soneriakhil.com, change this to '/'.)
  base: command === 'build' ? '/soneriakhil-wedding-site/' : '/',
}))
