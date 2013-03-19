<?php namespace ntz;
/*
Plugin Name: Ntz Youtube Playlist Embed
Version: 0.1
Description: Easily embed youtube playlists on your WordPress site
Author: Ionuț Staicu
*/
class YoutubeEmbeds{
  protected $url_regex;
  public function __construct(){
    $this->url_regex = '~\b((?:[a-z][\w-]+:(?:/{1,3}|[a-z0-9%])|www\d{0,3}[.]|[a-z0-9.\-]+[.][a-z]{2,4}/)(?:[^\s()<>]+|\(([^\s()<>]+|(\([^\s()<>]+\)))*\))+(?:\(([^\s()<>]+|(\([^\s()<>]+\)))*\)|[^\s`!()\[\]{};:\'".,<>?«»“”‘’]))~';

    add_action('init', array( $this, 'add_shortcodes' ) );
    add_action('wp_enqueue_scripts', array( $this, 'register_assets' ) );
  }

  public function add_shortcodes(){
    add_shortcode( 'yt_playlist', array( $this, 'yt_playlist' ) );
  } // add_shortcodes

  public function yt_playlist( $atts ){
    extract( shortcode_atts( array(
      "id" => false
    ), $atts ) );
    if( !$id ){ return false; }
    $id = html_entity_decode( $id );
    preg_match ( $this->url_regex, $id, $detect_url );
    if( !is_array( $detect_url ) || empty( $detect_url ) ){
      //  TODO: make this work without full url? 
    }else {
      $url = parse_url( $id );
      parse_str( $url['query'], $query );
      wp_enqueue_style( 'youtube-playlist' );
      wp_enqueue_script( 'youtube-playlist' );
      // http://gdata.youtube.com/feeds/api/playlists/{$query['list']}/?v=2&alt=json&feature=plc
      ob_start();
      ?>
      <div class="youtube-playlist" data-youtube-list-id="<?php echo $query['list'] ?>">
        <div class="preview"></div>
        <div class="pagination"></div>
        <div class="list"></div>
        <div class="templates">


          <script type="text/template" id="yp-playlist-big-player">
            <div class="title"><%= title %></div>
            <div class="subtitle"><%= subtitle %></div>
            <div class="embed" data-youtube-id="<%= youtube_id %>"></div>
          </script><!-- /#yp-playlist-big-player template -->


          <script type="text/template" id="yt-playlist-single-element">
            <div class="preview">
              <div class="thumb">
                <img src="<%= thumb %>">
                <span class="duration"><%= duration %></span>
              </div>
              <div class="title"><%= title %></div>
              <div class="subtitle"><%= subtitle %></div>
            </div>
          </script><!-- /#yt-playlist-single-element template -->


          <script type="text/template" id="yt-playlist-pagination">
            
          </script><!-- /#yt-playlist-pagination template -->

        </div>
      </div>
      <?php 
      $markup = ob_get_clean();
      return $markup;
    }
  } // yt_playlist


  public function register_assets(){
    wp_register_style( 'youtube-playlist', plugins_url( 'assets/youtube-playlist.css' , __FILE__ ) , array(), 1, 'all' );
    wp_register_script( 'youtube-playlist', plugins_url( 'assets/youtube-playlist.js' , __FILE__ ) , array( 'backbone', 'underscore', 'jquery' ), 'version', 'true' );
  } // register_assets
}//YoutubeEmbeds


new YoutubeEmbeds();