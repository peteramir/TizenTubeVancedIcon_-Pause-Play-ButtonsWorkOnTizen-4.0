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

            client.Page.setBypassCSP({ enabled: true });

            // Navigate via the page's OWN JavaScript (window.location.href) instead
            // of CDP's Page.navigate(), AND re-register the hardware keys immediately
            // before that navigation, in the same synchronous execution -- this
            // exactly mirrors TizenBrew's own proven-working pattern (see
            // tizenbrew-ui/src/components/WebSocketClient.js, handleCanLaunchModules
            // and the LaunchModule case): every single time it navigates, it first
            // loops over tizen.tvinputdevice.registerKey() for that module's keys,
            // then immediately sets location.href, right next to each other, in the
            // SAME script. TizenBrew's own debugger.js (service-nextgen/service/
            // utils/debugger.js) never calls CDP's Page.navigate() at all -- it only
            // listens for Runtime.executionContextCreated and injects scripts; all
            // navigation is done by the debug-launched app's own page script. Our
            // previous version registered keys once, early, in index.html, long
            // before the eventual navigation, in a completely different moment/
            // context -- this replicates the tight register-then-navigate coupling
            // instead, which is the strongest lead we have for why TizenBrew's
            // buttons work and ours previously didn't.
            const keysToRegister = [
                'ColorF0Red', 'ColorF1Green', 'ColorF2Yellow', 'ColorF3Blue',
                'MediaPlayPause', 'MediaPlay', 'MediaPause', 'MediaStop',
                'MediaFastForward', 'MediaRewind', 'MediaTrackNext', 'MediaTrackPrevious'
            ];
            const navigateUrl = `https://youtube.com/tv?additionalDataUrl=http%3A%2F%2Flocalhost%3A8085%2Fdial%2Fapps%2FYouTube${args ? `&${args}` : ''}`;
            const navigateExpr = `
                (function () {
                    var keys = ${JSON.stringify(keysToRegister)};
                    for (var i = 0; i < keys.length; i++) {
                        try { tizen.tvinputdevice.registerKey(keys[i]); } catch (e) { /* not supported on this key/device, skip it */ }
                    }
                    window.location.href = ${JSON.stringify(navigateUrl)};
                })();
            `;
            client.Runtime.evaluate({ expression: navigateExpr });
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