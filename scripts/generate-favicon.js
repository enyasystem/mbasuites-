const fs = require('fs');
const path = require('path');
const pngToIco = require('png-to-ico');

const input = path.join(__dirname, '..', 'public', 'mba_suites_logo_transparent.png');
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
