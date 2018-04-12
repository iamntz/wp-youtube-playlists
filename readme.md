## Broken plugin

Due to Youtube API changes, this plugin no longer works. Maybe I'll fix it sometime in the future (PR welcome!), but you'd better search for other alternatives.

-----

### Embed Youtube Playlist on WordPress posts

`[yt_playlist id="http://www.youtube.com/playlist?list=PLAFF87E4DC940D286"]`

[screenshot](http://img.iamntz.com/jing/2013-03-19_19h22_43.png)

### Todo:
1. improve CSS
1. improve description formatting
1. add pagination for playlists with many items


### Tips & Tricks:

You can disable built in JS or CSS by deregistering corresponding `youtube-playlist` handle (you must call these on `wp_enqueue_scripts` hook!).

```PHP
<?php 
  wp_deregister_script( 'youtube-playlist' );
  wp_deregister_style( 'youtube-playlist' );
?>
```

[wp_deregister_script](http://codex.wordpress.org/Function_Reference/wp_deregister_script)
[wp_deregister_style](http://codex.wordpress.org/Function_Reference/wp_deregister_style)
