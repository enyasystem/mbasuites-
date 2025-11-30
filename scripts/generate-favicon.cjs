const fs = require('fs');
const path = require('path');
const pngToIcoRaw = require('png-to-ico');
const pngToIco = pngToIcoRaw && pngToIcoRaw.default ? pngToIcoRaw.default : pngToIcoRaw;

const input = path.join(__dirname, '..', 'public', 'mba_suites_logo_transperent1.png');
const output = path.join(__dirname, '..', 'public', 'favicon.ico');

pngToIco(input)
  .then(buf => {
    fs.writeFileSync(output, buf);
    console.log('favicon.ico created at', output);
  })
  .catch(err => {
    console.error('Error creating favicon:', err);
    process.exit(1);
  });
