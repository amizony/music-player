var albumPicasso = {
  name: 'The Colors',
  artist: 'Pablo Picasso',
  label: 'Cubism',
  year: '1881',
  albumArtUrl: '/images/album-placeholder.png',
  songs: [
  { name: 'Blue', length: '4:26' },
  { name: 'Green', length: '3:14' },
  { name: 'Red', length: '5:01' },
  { name: 'Pink', length: '3:21'},
  { name: 'Magenta', length: '2:15'}
  ]
};

var albumMarconi = {
  name: 'The Telephone',
  artist: 'Guglielmo Marconi',
  label: 'EM',
  year: '1909',
  albumArtUrl: '/images/album-placeholder.png',
  songs: [
  { name: 'Hello, Operator?', length: '1:01' },
  { name: 'Ring, ring, ring', length: '5:01' },
  { name: 'Fits in your pocket', length: '3:21'},
  { name: 'Can you hear me now?', length: '3:14' },
  { name: 'Wrong phone number', length: '2:15'}
  ]
};

var currentlyPlayingSong = null;

var createSongRow = function(songNumber, songName, songLength) {
  var template =
  '<tr>'
  + '  <td class="col-md-1 song-number" data-song-number="' + songNumber + '">' + songNumber + '</td>'
  + '  <td class="col-md-9">' + songName + '</td>'
  + '  <td class="col-md-2">' + songLength + '</td>'
  + '</tr>'
  ;

  var $row = $(template);

  var onHover = function(event) {
    var songNumberCell = $(this).find('.song-number');
    var songNumber = songNumberCell.data('song-number');
    if (songNumber !== currentlyPlayingSong) {
      songNumberCell.html('<a class="album-song-button"><i class="fa fa-play"></i></a>');
    }
  };

  var offHover = function(event) {
    var songNumberCell = $(this).find('.song-number');
    var songNumber = songNumberCell.data('song-number');
    if (songNumber !== currentlyPlayingSong) {
      songNumberCell.html(songNumber);
    }
  };

  var clickHandler = function(event) {
    var songNumber = $(this).data('song-number');

    if (currentlyPlayingSong !== null) {
      currentlyPlayingCell = $('.song-number[data-song-number="' + currentlyPlayingSong + '"]');
      currentlyPlayingCell.html(currentlyPlayingSong);
    }

    if (currentlyPlayingSong !== songNumber) {
      $(this).html('<a class="album-song-button"><i class="fa fa-pause"></i></a>');
      currentlyPlayingSong = songNumber;
    } else if (currentlyPlayingSong === songNumber) {
      $(this).html('<a class="album-song-button"><i class="fa fa-play"></i></a>');
      currentlyPlayingSong = null;
    }
  };

  $row.find('.song-number').click(clickHandler);
  $row.hover(onHover, offHover);
  return $row;
};

var changeAlbumView = function(album) {
  var $albumTitle = $('.album-title');
  $albumTitle.text(album.name);

  var $albumArtist = $('.album-artist');
  $albumArtist.text(album.artist);

  var $albumMeta = $('.album-meta-info');
  $albumMeta.text(album.year + " on " + album.label);

  var $albumImage = $('.album-image img');
  $albumImage.attr('src', album.albumArtUrl);

  var $songList = $(".album-song-listing");
  $songList.empty();
  var songs = album.songs;
  for (var i = 0; i < songs.length; i++) {
    var songData = songs[i];
    var $newRow = createSongRow(i + 1, songData.name, songData.length);
    $songList.append($newRow);
  }
};

var updateSeekPercentage = function($seekBar, event) {
  var barWidth = $seekBar.width();
  var offsetX = event.pageX - $seekBar.offset().left;
  var offsetXPercent = (offsetX  / barWidth) * 100;
  offsetXPercent = Math.max(0, offsetXPercent);
  offsetXPercent = Math.min(100, offsetXPercent);

  var percentageString = offsetXPercent + '%';
  $seekBar.find('.fill').width(percentageString);
  $seekBar.find('.thumb').css({left: percentageString});
};

var setupSeekBars = function() {
  $seekBars = $('.player-bar .seek-bar');
  $seekBars.click(function(event) {
    updateSeekPercentage($(this), event);
  });
  $seekBars.find('.thumb').mousedown(function(event){
    var $seekBar = $(this).parent();
    $seekBar.addClass('no-animate');
    $('.player-bar').bind('mousemove.thumb', function(event){
      updateSeekPercentage($seekBar, event);
      console.log('X pos: ' + event.pageX);
      console.log('Y pos: ' + event.pageY);
    });
    $('.album-container').bind('mousemove.thumb', function() {
      $seekBar.removeClass('no-animate');
      $('.player-bar').unbind('mousemove.thumb');
      $('.player-bar').unbind('mouseup.thumb');
    })
    $('.player-bar').bind('mouseup.thumb', function(){
      $seekBar.removeClass('no-animate');
      $('.player-bar').unbind('mousemove.thumb');
      $('.player-bar').unbind('mouseup.thumb');
    });
  });
};
 
 var followMouse = function() {
  $(document).bind('mousemove.thumb', function(event){
    console.log('X pos: ' + event.pageX);
    console.log('Y pos: ' + event.pageY);
 });
};

if (document.URL.match(/\/album.html/)) {
  $(document).ready(function() {
    var rand = Math.random();
    if (rand > .5) {
      changeAlbumView(albumPicasso);
    } else {
      changeAlbumView(albumMarconi);
    }
    setupSeekBars();
    //followMouse();
  });
}