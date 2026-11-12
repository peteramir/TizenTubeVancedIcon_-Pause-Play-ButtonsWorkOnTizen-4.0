// TizenTube personal patch: Play/Pause fallback and SponsorBlock cleanup.
(function () {
    function init() {
        console.log('[TizenTube patch] loaded, listening for keydown');

        document.addEventListener('keydown', function (evt) {
            if (evt.keyCode === 415) {
                // Dedicated "Play" key fallback.
                var video = document.querySelector('video');
                if (video && video.paused) video.play();
            } else if (evt.keyCode === 19) {
                // Dedicated "Pause" key fallback.
                var video2 = document.querySelector('video');
                if (video2 && !video2.paused) video2.pause();
            }
        }, true);

        // Mitigate a real memory leak in the stock SponsorBlock handler
        // (window.sponsorblock, from the bundled userScript).
        // Its own hashchange listener only calls .destroy() when going from
        // one video straight to ANOTHER video (a new ?v= id) -- not when
        // leaving a video back to the browse/home screen, where the hash no
        // longer has a videoID at all. We complement it here instead of
        // touching that code: window.sponsorblock is a global it already
        // exposes, and .destroy() is a method it already wrote and calls
        // safely elsewhere. Mirrors the same hash-parsing logic exactly so
        // "no videoID" is detected the same way it detects "has one".
        window.addEventListener('hashchange', function () {
            try {
                var newURL = new URL(location.hash.substring(1), location.href);
                var videoID = newURL.search.replace('?v=', '').split('&')[0];
                if (!videoID && window.sponsorblock) {
                    window.sponsorblock.destroy();
                    window.sponsorblock = null;
                }
            } catch (e) { }
        }, false);
    }

    if (document.body) {
        init();
    } else {
        document.addEventListener('DOMContentLoaded', init);
    }
})();
