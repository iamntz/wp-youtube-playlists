var YT_Playlist = {
  App        : null,
  Views      : {},
  Model      : null,
  Collection : null,
  Cache      : {
    views : []
  },
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
  YT_Playlist.Model = Backbone.Model.extend({
    defaults : {
      youtube_id: '',
      thumbs    : [],
      duration  : '',
      title     : '',
      subtitle  : ''
    }
  });

  YT_Playlist.Collection = Backbone.Collection.extend({
    model: YT_Playlist.Model
  });


  YT_Playlist.Views.Playlist = Backbone.View.extend({
    el : '#yt-playlist'
   ,initialize: function( items ){
      this.collection = new YT_Playlist.Collection( items );

      this.render();
    }//initialize

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
    ,initialize: function(){

      
    }//initialize

    ,render: function(){
      var tmpl = _.template( this.template );
      this.$el.html( tmpl( this.model.toJSON() ) );
      return this;
    }//render
  });

});


jQuery(document).ready(function($){
  var playlistURL = $('div[data-youtube-list-id]').data('youtube-list-id');
  $.getJSON(playlistURL, function(json){
    var items = json.feed.entry.map( function( e ){
      var duration = e.media$group.yt$duration.seconds,
          minutes  = Math.floor( duration / 60 ),
          seconds  = duration - minutes * 60;

      duration = str_pad_left(minutes, '0', 2) + ':' + str_pad_left(seconds, '0', 2);

      return {
        youtube_id: e.link[0].href,
        thumbs    : e.media$group.media$thumbnail,
        duration  : duration,
        title     : e.title.$t,
        subtitle  : e.media$group.media$description.$t
      };
    } );
    foo = new YT_Playlist.Views.Playlist( items );
  });
});


function str_pad_left(string, pad, length) {
  return ( new Array(length + 1).join( pad ) + string ).slice( -length );
}
