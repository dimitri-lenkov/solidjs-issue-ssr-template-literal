import express from 'express';
import fs from 'node:fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { generateHydrationScript } from 'solid-js/web';

/* --------------------------------------------------
   Options                                         */

const base = process.env.BASE || '/'; // Route ssr is served under.
const isProduction = process.env.NODE_ENV === 'production'; // Node.js environment
const ssr_port = process.env.SSR_PORT ? // express listen port
      parseInt(process.env.SSR_PORT, 10) :
      8080;

/* --------------------------------------------------
   Production assets                               */

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const web_ui_dir = path.resolve(__dirname);
const dist_dir = path.resolve(web_ui_dir, './dist');

const templateHtml = isProduction
      ? await fs.readFile(path.resolve(dist_dir, './client/index.html'), 'utf-8')
      : '';

const ssrManifest = isProduction
      ? await fs.readFile(path.resolve(dist_dir, './client/ssr-manifest.json'), 'utf-8')
      : undefined;


/* --------------------------------------------------
   express HTTP server                             */

const app = express();
app.disable('x-powered-by');

/* --------------------------------------------------
   Middleware                                      */

let vite; // This is only set in development.

if (!isProduction) {
  const { createServer } = await import('vite');
  vite = await createServer({
    server: { middlewareMode: true },
    appType: 'custom',
    base
  });
  app.use(vite.middlewares);
} else {
  const compression = (await import('compression')).default;
  const sirv = (await import('sirv')).default;
  app.use(compression());
  app.use(base, sirv(path.resolve(dist_dir, './client'), { extensions: [] }));
}


/* --------------------------------------------------
   Serve HTML                                      */

app.use('*', async (req, res) => {
  try {
    const url = req.originalUrl.replace(base, '');

    let template;
    let render;

    if (!isProduction) {
      // Always read fresh template in development
      template = await fs.readFile(path.resolve(web_ui_dir, './index.html'), 'utf-8')
      template = await vite.transformIndexHtml(url, template)
      render = (await vite.ssrLoadModule(path.resolve(web_ui_dir, './src/entry-server.tsx'))).render
    } else {
      template = templateHtml
      render = (await import(path.resolve(dist_dir, './entry-server.js'))).render
    }

    // ~ ~ ~
    const rendered = await render();
    const head = (rendered.head ?? '') + generateHydrationScript();
    const html = template
          .replace(`<!--app-head-->`, head)
          .replace(`<!--app-html-->`, rendered.html ?? '');
    res.status(200).set({ 'Content-Type': 'text/html' }).end(html)

  } catch (e) {
    vite?.ssrFixStacktrace(e)
    console.log(e.stack)
    res.status(500).end(e.stack)
  }
})


/* --------------------------------------------------
   Start HTTP server                               */

app.listen(ssr_port, () => {
  console.log(`[server.js]: Listening on: 127.0.0.1:${ssr_port}`)
})
