const fs = require('fs');
let c = fs.readFileSync('src/index.css', 'utf8');

const lightStars = `
.light .stars1 {
  background-image: radial-gradient(1px 1px at 20px 30px, rgba(100, 100, 200, 0.3), rgba(0,0,0,0)), 
                    radial-gradient(1px 1px at 40px 70px, rgba(100, 100, 200, 0.25), rgba(0,0,0,0)), 
                    radial-gradient(1px 1px at 90px 40px, rgba(100, 100, 200, 0.4), rgba(0,0,0,0)), 
                    radial-gradient(1px 1px at 130px 80px, rgba(100, 100, 200, 0.3), rgba(0,0,0,0)), 
                    radial-gradient(1px 1px at 160px 120px, rgba(100, 100, 200, 0.3), rgba(0,0,0,0));
}
.light .stars2 {
  background-image: radial-gradient(1.5px 1.5px at 10px 10px, rgba(100, 100, 200, 0.4), rgba(0,0,0,0)), 
                    radial-gradient(1.5px 1.5px at 150px 150px, rgba(100, 100, 200, 0.35), rgba(0,0,0,0)), 
                    radial-gradient(1.5px 1.5px at 60px 100px, rgba(100, 100, 200, 0.5), rgba(0,0,0,0)), 
                    radial-gradient(1.5px 1.5px at 220px 250px, rgba(100, 100, 200, 0.35), rgba(0,0,0,0));
}
.light .stars3 {
  background-image: radial-gradient(2px 2px at 100px 100px, rgba(100, 100, 200, 0.5), rgba(0,0,0,0)), 
                    radial-gradient(2px 2px at 250px 50px, rgba(100, 100, 200, 0.45), rgba(0,0,0,0)), 
                    radial-gradient(2px 2px at 300px 300px, rgba(100, 100, 200, 0.5), rgba(0,0,0,0));
}
`;

c = c + lightStars;
fs.writeFileSync('src/index.css', c);
console.log('Fixed css');
