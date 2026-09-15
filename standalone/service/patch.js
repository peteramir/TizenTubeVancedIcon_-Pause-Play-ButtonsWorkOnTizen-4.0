// TizenTube personal patch (peteramir)
// -------------------------------------------------------------------------
// Loaded LOCALLY, as a second <script> tag AFTER the official TizenTube
// userScript (which is still fetched from Reis's CDN so it keeps getting
// upstream updates/fixes automatically). This file is deliberately plain,
// dependency-free JS that does NOT touch or rely on TizenTube's internal
// functions/variables, so future upstream changes can't break it.
//
// Features:
//   1) Dedicated Play/Pause key fallback (some Tizen 4.0 remotes send
//      MediaPlay/MediaPause instead of the combined MediaPlayPause toggle,
//      which the stock Leanback UI doesn't always listen for).
//   2) "Instant Animations" - near-zero animation/transition duration
//      instead of removing animations outright, toggled with the Yellow
//      remote button (unused elsewhere in TizenTube), persisted locally.
// -------------------------------------------------------------------------
(function () {
    var STORAGE_KEY = 'ttPatch_instantAnimations';

    function isInstantAnimationsEnabled() {
        try {
            return localStorage.getItem(STORAGE_KEY) === '1';
        } catch (e) {
            return false;
        }
    }

    function setInstantAnimationsEnabled(enabled) {
        try {
            localStorage.setItem(STORAGE_KEY, enabled ? '1' : '0');
        } catch (e) { }
    }

    var instantAnimStyle = null;
    function applyInstantAnimations(enabled) {
        if (enabled) {
            if (!instantAnimStyle) {
                instantAnimStyle = document.createElement('style');
                instantAnimStyle.id = 'tt-patch-instant-animations';
                // Near-zero (not zero, not "none") so end-states like the
                // background dimming behind the recommendations panel still
                // get applied, and code waiting on transitionend/animationend
                // still fires -- see PATCH_NOTES_AR.md for the full reasoning.
                instantAnimStyle.textContent =
                    '*, *::before, *::after {' +
                    'transition-duration: 0.01ms !important;' +
                    'transition-delay: 0s !important;' +
                    'animation-duration: 0.01ms !important;' +
                    'animation-delay: 0s !important;' +
                    '-webkit-transition-duration: 0.01ms !important;' +
                    '-webkit-transition-delay: 0s !important;' +
                    '-webkit-animation-duration: 0.01ms !important;' +
                    '-webkit-animation-delay: 0s !important;' +
                    'scroll-behavior: auto !important;' +
                    '}';
            }
            if (!instantAnimStyle.parentNode) {
                document.head.appendChild(instantAnimStyle);
            }
        } else if (instantAnimStyle && instantAnimStyle.parentNode) {
            instantAnimStyle.parentNode.removeChild(instantAnimStyle);
        }
    }

    function showPatchToast(text) {
        try {
            var toast = document.createElement('div');
            toast.textContent = text;
            toast.style.cssText =
                'position:fixed;bottom:60px;left:50%;transform:translateX(-50%);' +
                'background:rgba(20,20,20,0.92);color:#fff;padding:14px 28px;' +
                'border-radius:8px;font-family:Roboto,Arial,sans-serif;' +
                'font-size:28px;z-index:999999;pointer-events:none;';
            document.body.appendChild(toast);
            setTimeout(function () {
                if (toast.parentNode) toast.parentNode.removeChild(toast);
            }, 1800);
        } catch (e) { }
    }

    function init() {
        console.log('[TizenTube patch] loaded, listening for keydown');

        // Apply the saved preference as soon as <body> exists.
        applyInstantAnimations(isInstantAnimationsEnabled());

        document.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 405) {
                // Yellow button - unused elsewhere in TizenTube's own hotkeys
                // (Red=403 opens the app menu, Blue=406 opens speed settings).
                var next = !isInstantAnimationsEnabled();
                setInstantAnimationsEnabled(next);
                applyInstantAnimations(next);
                showPatchToast('Instant Animations: ' + (next ? 'ON' : 'OFF'));
            } else if (evt.keyCode === 415) {
                // Dedicated "Play" key fallback.
                var video = document.querySelector('video');
                if (video && video.paused) video.play();
            } else if (evt.keyCode === 19) {
                // Dedicated "Pause" key fallback.
                var video2 = document.querySelector('video');
                if (video2 && !video2.paused) video2.pause();
            }
        }, true);
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
