// The TizenBrew-way of TizenTube. Uses CDP and SDB to inject the userscript.

const adbhost = require('adbhost');
const CDP = require('chrome-remote-interface');
const fetch = require('node-fetch');


var isConnecting = false;
const isTizen3 = tizen.systeminfo.getCapability('http://tizen.org/feature/platform.version').startsWith('3.0');

function connectToDebugger(host, port, args) {
    fetch(`http://${host}:${port}`).then(_ => {
        CDP({ host, port, local: true }, client => {
            isConnecting = false;
            client.Runtime.enable();
            client.Page.enable();

            client.on('Runtime.executionContextCreated', m => {
                // TizenBrew's own changelog notes it now "injects user scripts by
                // appending a script element to the document head", rather than
                // evaluating the raw script text via CDP like we were doing before.
                // We do the same here: Runtime.evaluate only runs a tiny bootstrap
                // that creates real <script src> elements, so the userScript/patch
                // run as genuine page scripts in the real main-world execution
                // context -- like any other script tag on the page -- instead of
                // whatever context executionContextCreated happened to hand us.
                // This is the most likely reason our keydown listeners (Play/Pause
                // fallback, animations toggle) weren't receiving real hardware key
                // events even though the main script otherwise clearly ran fine.
                const bootstrap = `
                    (function () {
                        var main = document.createElement('script');
                        main.src = 'https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js?ver=${Date.now()}';
                        main.async = false;
                        document.head.appendChild(main);
                        var patch = document.createElement('script');
                        patch.src = 'http://localhost:8099/tizentube/patch.js?ver=${Date.now()}';
                        patch.async = false;
                        document.head.appendChild(patch);
                    })();
                `;
                client.Runtime.evaluate({ expression: bootstrap, contextId: m.context.id });
            });

            client.Page.navigate({ url: `https://youtube.com/tv?additionalDataUrl=http%3A%2F%2Flocalhost%3A8085%2Fdial%2Fapps%2FYouTube${args ? `&${args}` : ''}` });

            client.Page.setBypassCSP({ enabled: true });
        })
    }).catch(e => {
        return setTimeout(() => connectToDebugger(host, port, args), 100);
    })
}

function canConnectToDaemon() {
    return fetch('http://127.0.0.1:8001/api/v2/').then(res => res.json())
        .then(json => {
            return { canConnectToDaemon: (json.device.developerIP === '127.0.0.1' || json.device.developerIP === '1.0.0.127') && json.device.developerMode === '1', ip: json.device.ip, isConnecting }
        }).catch(e => {
            return canConnectToDaemon();
        });
}

function startDebugger(args) {
    return canConnectToDaemon().then(res => {
        if (!res.canConnectToDaemon) return false;
        const client = adbhost.createConnection({ host: '127.0.0.1', port: 26101 });

        client._stream.on('connect', () => {
            const packageId = tizen.application.getAppInfo().packageId;
            isConnecting = true;
            const shellCmd = client.createStream(`shell:0 debug ${packageId}.TizenTubeStandalone${isTizen3 ? ' 0' : ''}`);
            shellCmd.on('data', (data) => {
                const dataString = data.toString();
                if (dataString.includes('debug')) {
                    const port = Number(dataString.substr(dataString.indexOf(':') + 1, 6).replace(' ', ''));
                    connectToDebugger(res.ip, port, args);
                    setTimeout(() => client._stream.end(), 1000);
                }
            });
        });

        return true;
    });
}

module.exports = {
    startDebugger,
    canConnectToDaemon
};