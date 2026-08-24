const ncc = require('@vercel/ncc');
const fs = require('fs');
const path = require('path');

async function build() {
    const { code, assets } = await ncc(path.join(__dirname, 'index.js'), {
        minify: false
    });

    const fixedCode = code.replace(
        /if\s*\(\/.*?\/i?\.exec\(urlStr\)\)\s*\{\s*urlStr\s*=\s*new\s+URL\(urlStr\)\.toString\(\);\s*\}/g,
        ''
    ).replace(
        /(method:\s*request\.method,)/,
        "$1 maxHeaderSize: 5*1024*1024,"
    );

    const outDir = path.join(__dirname, 'dist');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir);

    fs.writeFileSync(path.join(outDir, 'index.js'), fixedCode);

    // Copy our small, independent patch.js in next to the bundled service, so
    // it physically ships INSIDE the packaged .wgt and is served 100% locally
    // (the main TizenTube userScript itself still comes from Reis's CDN, so it
    // keeps getting upstream updates -- only this personal patch is local).
    fs.copyFileSync(path.join(__dirname, 'patch.js'), path.join(outDir, 'patch.js'));
    console.log('Copied patch.js -> ' + path.join(outDir, 'patch.js'));

    // index.js unconditionally does require('../../dist/service.js') at the
    // bottom (the DIAL/casting server, built separately from the repo-root
    // service/ folder). That path resolves to standalone/dist/service.js at
    // runtime. If it's missing, requiring it throws immediately and the WHOLE
    // background service crashes on startup before the Express proxy/injector
    // ever starts listening -- this is very likely why the app has "installed
    // but the background service never starts" for you before. Build
    // repo-root service/ first (cd service && npm install && npx rollup -c
    // rollup.config.js), THEN run this script.
    const dialServiceSrc = path.join(__dirname, '../../dist/service.js');
    const standaloneDistDir = path.join(__dirname, '../dist');
    const dialServiceDest = path.join(standaloneDistDir, 'service.js');
    if (fs.existsSync(dialServiceSrc)) {
        if (!fs.existsSync(standaloneDistDir)) fs.mkdirSync(standaloneDistDir, { recursive: true });
        fs.copyFileSync(dialServiceSrc, dialServiceDest);
        console.log('Copied ' + dialServiceSrc + ' -> ' + dialServiceDest);
    } else {
        console.warn(
            'WARNING: ' + dialServiceSrc + ' was not found, so it was NOT copied to ' + dialServiceDest + '.\n' +
            'standalone/service/index.js unconditionally requires this file -- without it, the ' +
            'packaged app\'s background service will crash immediately on launch. Build it first:\n' +
            '  cd service && npm install && npx rollup -c rollup.config.js\n' +
            '...then re-run this build.'
        );
    }
}

build();