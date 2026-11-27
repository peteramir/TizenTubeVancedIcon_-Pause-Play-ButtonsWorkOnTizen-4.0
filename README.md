# ▶️ TizenTube ( with Vanced legacy icon )

<p align="center">
    <img width="600px" src=".github/assets/TizenTube Standalone Banner.png">
</p>

Download from [here](https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/releases/download/fixes/TizenTube.wgt) ( it can be installed besides the official TizenTube because it has a different package ID and a different icon ) | [How to install .wgt file](https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/blob/main/.github/assets/How_to_install_wgt_file_to_Samsung_Smart_Tv.md)

This standalone version is based on TizenTube [v2.0.1](https://github.com/reisxd/TizenTube/releases/tag/v2.0.1)

The app loads my own [UserScript](https://cdn.jsdelivr.net/npm/@shadowtube/tizentube-noanimations/dist/userScript.js) from this link, which I maintain and keep updated.

I could fix "pause" and "play" buttons on Tizen 4.0 legacy TV with exact same remote in the attached photo ( the last row from the bottom ).
[See the Samsung TV remote layout](.github/assets/Samsung_TV_Remote.png)

Note: My Samsung TV model is: ua49n5300 49 inch ( this fork only tested on Tizen 4.0 )

Reasons to install this fork ( can be installed beside the installed app since my fork have a different packageID + different icon ):
I added these toggle options to [Reis's userScript.js](https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js):

**1- Listing 3 videos in row for playlists.**

<img src="https://raw.githubusercontent.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/main/.github/assets/listing_3_videos_in_row_for_playlists.jpg" alt="Listing 3 videos in a row for playlists">

**2- When visiting a channel, only videos and playlists are displayed initially. You can still scroll down and select "Videos" to access sorting options such as "Most popular", while keeping the 3-videos-per-row layout.**

<img src="https://raw.githubusercontent.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/main/.github/assets/showing_only_videos_and_playlists_when_visiting_a_channel.jpg" alt="Showing only videos and 
playlists when visiting a channel">

**3- Seek with 1 tap ( seek 10+/10- without showing the annoying UI with just a single tap ).**
Notes:
- Seeking with 1 tap doesn't work when the video is paused ( I made it intentionally to be able to navigate between ending cards but you need to pause the video first ).
- I didn't like to make "ok" button to pause the video because I used to using "pause" and "play" buttons on the remote.
- If you're changing video settings, such as quality or playback speed, while the video is playing, you can still use the Left/Right buttons on the remote to seek forward or backward by 10 seconds.

*Play the video with volume ON to listen the audio*

https://github.com/user-attachments/assets/a3bf2067-8bd1-46e4-ad58-1272920859b3

Note: This Video recorded on pc with [VaccumTube](https://github.com/shy1132/VacuumTube) and just used my [userScript](https://cdn.jsdelivr.net/npm/@shadowtube/tizentube-noanimations/dist/userScript.js) + used this small python code to show the buttons on the screen when I tap on it [here](https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/blob/main/.github/assets/tizen40_remote_overlay.py). The same behaviour EXACTLY happends on Tizen 4.0 ( except that on Tizen 4.0 it doesn't need 2 clicks to open the video like the attached video ).

**4- change youtube icon to youtube premium or remove youtube icon completely.**

<img src="https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/blob/main/.github/assets/yt_premium_icon.jpg" alt="Youtube Premium icon">

**5- change background color of "Home","Library" icons + remove its background-color.**

<img src="https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/blob/main/.github/assets/sidebar_options_backgroundcolor.png" alt="Showing only videos and 
playlists when visiting a channel">

**6- Added refresh feed button**

https://github.com/user-attachments/assets/9aaaf58a-480e-43d5-9cb0-d2226c5c4b61

Note: This Video recorded on pc with [VaccumTube](https://github.com/shy1132/VacuumTube) and just used my [userScript](https://cdn.jsdelivr.net/npm/@shadowtube/tizentube-noanimations/dist/userScript.js) + used this small python code to show the buttons on the screen when I tap on it [here](https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/blob/main/.github/assets/tizen40_remote_overlay.py). The same behaviour EXACTLY happends on Tizen 4.0.

**7- "Fix Subtitle Sync": I added an option below "Turn off screen" option. It fixes subtitle synchronization issues by setting the subtitle container width to 66% of the TV screen.**
Notes:
- This option affects the currently playing video and the next video only.
- Use this option only when experiencing subtitle synchronization issues, as not all videos have this problem.
 
<img src="https://raw.githubusercontent.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/main/.github/assets/fix_subtitle_sync_for_the_current_video.png" width="800" alt="Fix Subtitle Sync">

Note: *Subtitle sync* problem happends because v2.0.1 uses the official youtube app as a wrapper and just injects the user-scripts on it ; any part of the app which needs storage it can't write on the internal storage of the TV, it needs to be specified first in the user-script to be save in javascript localstorage. If you tried using v.2.0.1 without any user-script you won't be able change the language of the interface because it won't be able to write on the internal storage. To solve this problem we need to use youtube.com/tv domain directly instead of depending on the official youtube app as a wrapper but this needs engineering and I can't do this step at the moment.

**8- change border color of focused video ( to be lighter to your eyes instead of using the solid white color ).**

<img src="https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/blob/main/.github/assets/focused_video_border_color.png" alt="Change border color of focused video">

**9- Remove the grey line which is on top of the thumbnail of playlist,mix videos.**

<img src="https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/blob/main/.github/assets/remove_the_line_above_playlists_and_mix_videos.png" width="800" alt="Fix Subtitle Sync">

**10- Splitted "Fix UI" option to 6 options** ( I recommend enabling only the first 4 options ) ( enabling "Fix UI" toggle option in [Reis's userScript](https://cdn.jsdelivr.net/npm/@foxreis/tizentube/dist/userScript.js) checks the first 5 options together ):

- Disable limited-memory mode.
- Full-animation app quality.
- Enable list animations.
- Enable long press.
- Remove app-quality class.
- Keep app-quality class.

**11- Being able to choose the client for user-agent spoofing:** ( haven't been tested this feature yet ).

- OFF (no spoofing).
- Tizen 4.0 (Samsung 2018).
- Sony SOV38 (Android 10).
- Chromecast (Android 14).
- TCL Smart TV Pro (Android 12).
- Amazon AFTMM (Android 7.1.2)

**12- Disable animations.**

Note: This option has two known drawbacks:
- Thumbnails and video titles load more slowly when navigating the home feed.
- Subtitle synchronization may experience noticeable delays.

Recommended: Keep this option disabled unless you prefer the reduced animations and accept these trade-offs.

**13- "pause" + "play" buttons works on Tizen 4.0 legacy Remote.**

you can see its code [here](https://github.com/peteramir/TizenTubeVancedIcon_-Pause-Play-ButtonsWorkOnTizen-4.0/blob/main/standalone/service/patch.js)

**14- Refresh page 'F5' ( press on it after making changes in toggle options ).**

**15- Restoring "Not interested" + "Don't recommend this channel" feature is still being developing...⏳**

**16- Black Amoled theme.**

Credits: [axotube](https://github.com/TizenDroid/axotube) | [userScript github](https://raw.githubusercontent.com/TizenDroid/axotube/refs/heads/main/dist/userScript.js) | [userScript cdn.jsdelivr](https://cdn.jsdelivr.net/gh/TizenDroid/axotube/dist/userScript.js).

**17- Changed code of "Adblock".**

Credits: [VacuumTube](https://github.com/shy1132/VacuumTube/blob/main/src/preload/modules/adblock.js).

**18- Black Amoled theme sidebar.**

**19- Modified SponsorBlock initialization to fix a memory leak.**

I also adapted and improved parts of VacuumTube's SponsorBlock implementation to introduce the following three enhancements:

- **Persistent segment colors when seeking:** SponsorBlock segment colors remain visible on the progress bar while seeking. Additionally, when auto-skip is enabled for a specific category, the same segment is automatically skipped again if the user seeks back into it, without requiring confirmation.

- **Skip segments immediately upon seeking into them:** SponsorBlock detects when the playback position enters a segment's time range and skips it immediately, without requiring the user to play through the video normally to reach that segment.

- **Improved end-screen handling:** When SponsorBlock skips an "Ending/Credits" segment at the end of a video, playback automatically advances to the next video instead of replaying the current one. (This behavior is supported by VacuumTube but does not work on Tizen 4.0.)

**Credits:** [VacuumTube](https://github.com/shy1132/VacuumTube/blob/main/src/preload/modules/sponsorblock.js) (original implementation adapted and improved).

## ⚠️ Disclaimer

**This is an independent, community-developed project and is not affiliated with, endorsed by, or officially associated with Samsung, Tizen, or YouTube.**

Send me a message on my [Telegram](https://t.me/username309x) and tell me if it helped you with your own Tizen 4.0.

Forks I appreciate its work: [axotube](https://github.com/TizenDroid/axotube) | [KrX3D](https://github.com/KrX3D/TizenTube).

A special thank to [VaccumTube](https://github.com/shy1132/VacuumTube) which without it I couldn't develop any of these new features. I depended totally on its DevTools and its console tab to test javascript code before moving it to TV.

Special thanks to [Reis](https://github.com/reisxd/TizenTube), the original author of TizenTube, for building the core project.
