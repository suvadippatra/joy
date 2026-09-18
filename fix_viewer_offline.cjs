const fs = require('fs');
let c = fs.readFileSync('src/pages/CBTViewer.tsx', 'utf8');

const oldFetch = `          if (isLocal) {
            html = (await localforage.getItem(test.id + '_html')) as string;
          } else {
            const res = await fetch(urlOrHtml);
            html = await res.text();
          }`;
          
const newFetch = `          const cachedHtml = await localforage.getItem(test.id + '_html');
          if (cachedHtml) {
            html = cachedHtml as string;
          } else if (isLocal) {
            html = ''; // Should have been cached, fallback
          } else {
            const res = await fetch(urlOrHtml);
            html = await res.text();
          }`;

c = c.replace(oldFetch, newFetch);
fs.writeFileSync('src/pages/CBTViewer.tsx', c);
console.log('Fixed CBTViewer offline capability');
