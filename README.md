# ▶️ TizenTube ( with Vanced legacy icon )

<p align="center">
    <img width="600px" src=".github/assets/TizenTube Standalone Banner.png">
</p>

Download from [here](https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/releases/download/fixes/TizenTube_userScript.wgt) ( it can be installed besides the official TizenTube because it has different packageID and a different icon ).

This Standalone verion is forked from 2.0.1 Version.

It receives updates from [here]([url](https://cdn.jsdelivr.net/npm/@shadowtube/tizentube-noanimations/dist/userScript.js)) ( I own this file and it's up-to-date ).

I could fix "pause" and "play" buttons on Tizen 4.0 legacy TV with exact same remote in the attached photo ( the last line from the bottom ).
<img  width="300px" src=".github/assets/Samsung_TV_Remote.png">

Note: My Samsung TV model is: ua49n5300 49 inch ( this fork only tested on Tizen 4.0 )

Reasons to install this fork:
I added these toggle options to [Reis's userScript.js]([url](https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js)):
1- Refresh page 'F5' ( press on it after making changes in toggle options ).
2- Changed code of "Adblock" to modify the response of json parsing of adPlacement
Credits: [VaccumTube](https://github.com/shy1132/VacuumTube/blob/main/src/preload/modules/adblock.js)
3- Changed code of "SponserBlock" to make segment colors doesn't disappear when seeking the video on progress bar + when "auto-skip" toggle option is enabled for a specific category, when come back to the same segment is asks for confirmation and doesn't auto-skip in the second time for the single segment + SponserBlock works when being in the range time of the segment ( no need watch the video normally to skip the sponser ) ; so it means that if you seeked the video time to the time in the range of the segment SponserBlock will work perfectly + when it skip an "Ending/credits" in the end of the video it auto-plays to the next video instead of re-playing the same video.
Credits: [VaccumTube](https://github.com/shy1132/VacuumTube/blob/main/src/preload/modules/sponsorblock.js)
4- Splitted "Fix UI" option to 6 options:
	- Disable limited-memory mode(restart app)
	- Full-animation app quality(restart app)
	- Enable list animations(restart app)
	- Enable long press(restart app)
	- Remove app-quality class (breaks subtitle sync, restart)
	- Keep app-quality class (re-adds it if removed, overrides)
5- Being able to choose the client for user-agent spoofing:
	- OFF (no spoofing)
	- Tizen 4.0 (Samsung 2018)
	- Sony SOV38 (Android 10)
	- Chromecast (Android 14)
	- TCL Smart TV Pro (Android 12)
	- Amazon AFTMM (Android 7.1.2)
6- Disable animations ( windows transitions ).
7- Seek with 1 tap ( seek 10+/10- without showing the annoying UI with just a single tap ).
8- Black Amoled theme.
Credits: [axotube](https://github.com/TizenDroid/axotube) | [here](https://raw.githubusercontent.com/TizenDroid/axotube/refs/heads/main/dist/userScript.js) | [here](https://cdn.jsdelivr.net/gh/TizenDroid/axotube/dist/userScript.js)
9- "pause" + "play" buttons works on Tizen 4.0 legacy Remote.

Notes: I could make subtitles sync work again!
Steps to fix broken subtitle sync:
- Enable these options in "Fix UI": Disable limited-memory mode + Full-animation app quality + Enable list animations + Enable long press + Keep app-quality class.
- Enable "Tizen 4.0 (Samsung 2018)" from "user-agent spoofing".

## ⚠️ Disclaimer

**This project is NOT affiliated, associated, authorized, endorsed by, or in any way officially connected with Samsung, Tizen, or YouTube.**

Credits goes to [Reis](https://github.com/reisxd/TizenTube) the Header of this project for doing the hard parts.
