const fs = require('fs');
const path = require('path');

const rendererDir = path.join(__dirname, '..', 'desktop', 'renderer');
const html = fs.readFileSync(path.join(rendererDir, 'index.html'), 'utf8');

// Store Preview
let storeHtml = html
  .replace('nav-item active" data-page="dashboard"', 'nav-item" data-page="dashboard"')
  .replace('nav-item" data-page="store"', 'nav-item active" data-page="store"')
  .replace('id="page-heading">System Dashboard</h1>', 'id="page-heading">1-Click Tool Store</h1>')
  .replace('page active" id="page-dashboard"', 'page" id="page-dashboard"')
  .replace('page" id="page-store"', 'page active" id="page-store"');

fs.writeFileSync(path.join(rendererDir, 'store-preview.html'), storeHtml);

// Runner Preview
let runnerHtml = html
  .replace('nav-item active" data-page="dashboard"', 'nav-item" data-page="dashboard"')
  .replace('nav-item" data-page="runner"', 'nav-item active" data-page="runner"')
  .replace('id="page-heading">System Dashboard</h1>', 'id="page-heading">Console Runner & Sandbox</h1>')
  .replace('page active" id="page-dashboard"', 'page" id="page-dashboard"')
  .replace('page" id="page-runner"', 'page active" id="page-runner"');

fs.writeFileSync(path.join(rendererDir, 'runner-preview.html'), runnerHtml);

console.log('Created store-preview.html and runner-preview.html');
