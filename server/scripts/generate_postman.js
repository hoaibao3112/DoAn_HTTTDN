import fs from 'fs';
import path from 'path';

// Load our app and routes
const m = await import('../src/app.js');
const app = m.default;

const routes = [];
function printRoutes(layer, pathAcc) {
  if (layer.route) {
    routes.push({
      method: Object.keys(layer.route.methods)[0].toUpperCase(),
      path: pathAcc + layer.route.path
    });
  } else if (layer.name === 'router' && layer.handle.stack) {
    layer.handle.stack.forEach(function(stackItem) {
      let regexSource = layer.regexp.source
        .replace('^\\\\/', '/')
        .replace('\\\\/?(?=\\\\/|$)', '')
        .replace('^', '')
        .replace('?(?=\\\\/|$)', '')
        .replace('\\\\', '');
      let childPath = pathAcc + (regexSource === '^\\/' ? '' : regexSource);
      printRoutes(stackItem, childPath);
    });
  }
}
app._router.stack.forEach(l => printRoutes(l, ''));

const collection = {
  info: {
    name: "Offline Bookstore API (Auto-Generated)",
    schema: "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  item: routes.map((r, i) => {
    // Generate simple items
    return {
      name: `[${r.method}] ${r.path.replace(/\\\\/g, '')}`,
      request: {
        method: r.method,
        header: [
          { key: "Authorization", value: "Bearer {{token}}", type: "text" },
          { key: "Content-Type", value: "application/json", type: "text" }
        ],
        url: {
          raw: `http://localhost:5000${r.path.replace(/\\\\/g, '')}`,
          host: ["http://localhost:5000"],
          path: r.path.replace(/\\\\/g, '').split('/').filter(p => p !== '')
        }
      }
    };
  })
};

fs.writeFileSync('Bansach_API_Postman.json', JSON.stringify(collection, null, 2));
console.log('✅ Generated Postman Collection: Bansach_API_Postman.json');
process.exit(0);
