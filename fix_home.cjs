const fs = require('fs');
let c = fs.readFileSync('src/pages/Home.tsx', 'utf8');

c = c.replace(
  '<main className="flex-1 w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-8 mx-auto xl:max-w-[90rem]">',
  '<main className="w-full p-4 sm:p-6 lg:p-8 flex flex-col gap-8 mx-auto xl:max-w-[90rem] mb-12">'
);

fs.writeFileSync('src/pages/Home.tsx', c);
console.log('Fixed home');
