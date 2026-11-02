// Vite is the tool that runs our local dev server and builds the site.
// The React plugin teaches Vite how to understand React (JSX) files.
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ command }) => ({
  plugins: [react()],

  // "base" is where the built site's files are found, relative to the page.
  // './' (relative) means the site works wherever it's hosted: at the root of
  // its own domain (https://soneriandakhil.com/) or in a folder (like the old
  // https://akhilpatel.me/soneriakhil-wedding-site/). It's a single page, so
  // relative paths are always correct. Locally ("npm run dev") it's just "/".
  base: command === 'build' ? './' : '/',
}))
