var youtubeTag = document.createElement('script');
youtubeTag.src = "//www.youtube.com/iframe_api";
var firstScriptTag = document.getElementsByTagName('script')[0];
firstScriptTag.parentNode.insertBefore(youtubeTag, firstScriptTag);

var YT_Playlist = {
  App        : null,
  Views      : {},
  Model      : null,
  Collection : null,
  Router     : {},
  Routes     : {},
  parseURL   : function(url) {
    var a =  document.createElement('a');
    a.href = url;
    return {
      source: url,
      protocol: a.protocol.replace(':',''),
      host: a.hostname,
      port: a.port,
      query: a.search,
      params: (function(){
        var ret = {},
            seg = a.search.replace(/^\?/,'').split('&'),
            len = seg.length, i = 0, s;
        for (;i<len;i++) {
            if (!seg[i]) { continue; }
            s = seg[i].split('=');
            ret[s[0]] = s[1];
        }
        return ret;
      })(),
      file: (a.pathname.match(/\/([^\/?#]+)$/i) || [,''])[1],
      hash: a.hash.replace('#',''),
      path: a.pathname.replace(/^([^\/])/,'/$1'),
      relative: (a.href.match(/tp:\/\/[^\/]+(.+)/) || [,''])[1],
      segments: a.pathname.replace(/^\//,'').split('/')
    };
  }
};

jQuery(document).ready(function($){
  var vent = _.extend({}, Backbone.Events);

  YT_Playlist.Model = Backbone.Model.extend({
    defaults : {
      youtube_id : '',
      thumbs     : [],
      duration   : '',
      title      : '',
      subtitle   : '',
      youtube_url: '',
      description: '',
      excerpt    : ''
    }
  });

  YT_Playlist.Collection = Backbone.Collection.extend({
    model: YT_Playlist.Model
  });

  YT_Playlist.Router = Backbone.Router.extend({
    routes : {
      '' : 'index',
      'video/:query' : 'show'
    }

    ,index: function(){
      vent.trigger( 'loadMovie', null );
    }//index

    ,show: function( videoID ){
      vent.trigger( 'loadMovie', videoID );
    }//show
  });


  YT_Playlist.Views.Playlist = Backbone.View.extend({
    el : '#yt-playlist'
   ,initialize: function( items ){
      this.collection = new YT_Playlist.Collection( items );

      vent.on( 'loadMovie', this.loadMovie, this );
      this.render();
    }//initialize

    ,loadMovie: function( videoID ){
      if( !videoID ){
        $('.yt-playlist-item:first > a').trigger('faux-click');
      }else {
        $('.yt-playlist-item > a').filter(function(){
          return $(this).data('youtube-id') == videoID;
        }).first().trigger('faux-click');
      }
    }//loadMovie

    ,render: function(){

      _.each( this.collection.models, function( item ){
        this.renderItem( item );
      }, this);

      return this;
    }//render


    ,renderItem: function( item ){
      var itemView = new YT_Playlist.Views.PlaylistItem({
        model: item
      });

      this.$el.append( itemView.render().el );
    }//renderItem
  });

  YT_Playlist.Views.PlaylistItem = Backbone.View.extend({
    template : $('#yt-playlist-item').html()
    ,className : 'yt-playlist-item'
    ,events : {
      'click > a'      : 'loadMovie',
      'faux-click > a' : 'loadMovie'
    }
    ,initialize: function(){

    }//initialize

    ,render: function(){
      var tmpl = _.template( this.template );
      this.$el.html( tmpl( this.model.toJSON() ) );
      return this;
    }//render

    ,loadMovie: function( e ){
      e.preventDefault();
      var tpl = $('#yp-playlist-big-player').html();

      var bigView = $('.embed', tpl),
          movieContainerID = 'video-' + Math.round( Math.random() * 1000000 );

      var parsedTemplate =  _.template( tpl, {
        title      : this.model.get('title'),
        description: this.model.get('description'),
        embed_id   : movieContainerID
      });
      
      $('.bigView').empty().append(parsedTemplate);

      var playerVars = $.extend({
          enablejsapi   : 1,
          autohide      : 2,
          iv_load_policy: 3,
          modestbranding: true,
          origin        : window.location.origin,
          rel           : 0,
          showinfo      : 0,
          theme         : 'light',
          color         : 'white',
          autoplay      : ( e.type == 'click' ? 1 : 0 )
        }, {});

      var youtubeID = $(e.currentTarget).data('youtube-id');

      player = new YT.Player( movieContainerID, {
        height    : '100%',
        width     : '100%',
        videoId   : youtubeID,
        playerVars: playerVars,
        events    : {}
      });

      YT_Playlist.Routes.navigate( 'video/' + youtubeID );

      if( e.type == 'click' ){
        $('body, html').animate({
          scrollTop:0
        });
      }
      
      $( e.currentTarget ).parent().addClass('active').siblings().removeClass('active');
    }//loadMovie
  });

});



jQuery(document).ready(function($){
  var youtubeReadyTimer;
  function onYoutubeReady() {
    var playlistURL = $('div[data-youtube-list-id]').data('youtube-list-id');

    $.getJSON(playlistURL, function(json){
      var items = json.feed.entry.map( function( e ){
        var duration = e.media$group.yt$duration.seconds,
            minutes  = Math.floor( duration / 60 ),
            seconds  = duration - minutes * 60;

        duration = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);
        var url = YT_Playlist.parseURL( e.link[0].href ),
            description = e.media$group.media$description.$t;

        return {
          youtube_id: url.params.v,
          youtube_url: e.link[0].href,
          thumbs     : e.media$group.media$thumbnail,
          duration   : duration,
          title      : e.title.$t,
          excerpt    : description.substr(0, description.lastIndexOf( ' ', 100 ) ) + ' &#0133;',
          description: description.replace( /\r?\n/g, "<br>")
        };
      } );
      YT_Playlist.App = new YT_Playlist.Views.Playlist( items );

      YT_Playlist.Routes = new YT_Playlist.Router();
      Backbone.history.start();
    });

  };//onYoutubeReady

  youtubeReadyTimer = window.setInterval( function(){
    if( typeof YT != 'undefined' ){
      window.clearInterval( youtubeReadyTimer );
      onYoutubeReady();
    }
  }, 100);

});



function str_pad_left(string, pad, length) {
  return ( new Array(length + 1).join( pad ) + string ).slice( -length );
}
