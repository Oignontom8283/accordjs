// framework/buildBot.ts
import { build as vitBuild } from 'vite';
import fs from 'fs';
import path from 'path';

export async function build(projectRoot: string) {
  await vitBuild({
    root: projectRoot, // racine du projet utilisateur
    plugins: [accordJsVitPlugin(path.join(projectRoot, 'src'))],
    build: {
      rollupOptions: {
        input: 'virtual:index', // on part de notre fichier virtuel
      },
      outDir: path.resolve(projectRoot, 'dist'), // sortie
    },
  });
}

function accordJsVitPlugin(sourceRoot: string) {
  return {
    name: 'accordjs',
    resolveId(id: string) {
      if (id === 'virtual:events' || id === 'virtual:index') return id;
    },
    load(id: string) {
      if (id === 'virtual:events') {
        const eventsDir = path.resolve(sourceRoot, 'events');
        const files = fs.readdirSync(eventsDir).filter(f => /\.(ts|js)$/.test(f));

        const imports = files
          .map((file, i) => `import event${i} from ${JSON.stringify('./events/' + file)};`)
          .join('\n');

        const registrations = files
          .map((_, i) => `client.on(event${i}.name, event${i}.execute);`)
          .join('\n');

        return `
          import client from './client.js';
          ${imports}
          export function registerEvents() {
            ${registrations}
          }
        `;
      }

      if (id === 'virtual:index') {
        return `
          import client from './client.js';
          import { registerEvents } from 'virtual:events';

          registerEvents();
          client.login(process.env.BOT_TOKEN);
        `;
      }
    },
  };
}
