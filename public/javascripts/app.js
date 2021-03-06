(function(/*! Brunch !*/) {
  'use strict';

  var globals = typeof window !== 'undefined' ? window : global;
  if (typeof globals.require === 'function') return;

  var modules = {};
  var cache = {};

  var has = function(object, name) {
    return ({}).hasOwnProperty.call(object, name);
  };

  var expand = function(root, name) {
    var results = [], parts, part;
    if (/^\.\.?(\/|$)/.test(name)) {
      parts = [root, name].join('/').split('/');
    } else {
      parts = name.split('/');
    }
    for (var i = 0, length = parts.length; i < length; i++) {
      part = parts[i];
      if (part === '..') {
        results.pop();
      } else if (part !== '.' && part !== '') {
        results.push(part);
      }
    }
    return results.join('/');
  };

  var dirname = function(path) {
    return path.split('/').slice(0, -1).join('/');
  };

  var localRequire = function(path) {
    return function(name) {
      var dir = dirname(path);
      var absolute = expand(dir, name);
      return globals.require(absolute, path);
    };
  };

  var initModule = function(name, definition) {
    var module = {id: name, exports: {}};
    cache[name] = module;
    definition(module.exports, localRequire(name), module);
    return module.exports;
  };

  var require = function(name, loaderPath) {
    var path = expand(name, '.');
    if (loaderPath == null) loaderPath = '/';

    if (has(cache, path)) return cache[path].exports;
    if (has(modules, path)) return initModule(path, modules[path]);

    var dirIndex = expand(path, './index');
    if (has(cache, dirIndex)) return cache[dirIndex].exports;
    if (has(modules, dirIndex)) return initModule(dirIndex, modules[dirIndex]);

    throw new Error('Cannot find module "' + name + '" from '+ '"' + loaderPath + '"');
  };

  var define = function(bundle, fn) {
    if (typeof bundle === 'object') {
      for (var key in bundle) {
        if (has(bundle, key)) {
          modules[key] = bundle[key];
        }
      }
    } else {
      modules[bundle] = fn;
    }
  };

  var list = function() {
    var result = [];
    for (var item in modules) {
      if (has(modules, item)) {
        result.push(item);
      }
    }
    return result;
  };

  globals.require = require;
  globals.require.define = define;
  globals.require.register = define;
  globals.require.list = list;
  globals.require.brunch = true;
})();
require.register("scripts/album", function(exports, require, module) {
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
});

;require.register("scripts/app", function(exports, require, module) {
// old jquery code no longer required
//require('./landing');
//require('./collection');
//require('./album');
//require('./profile');


// shuffle an array
function shuffle(o) {
  for (var j, x, i = o.length; i; j = Math.floor(Math.random() * i), x = o[--i], o[i] = o[j], o[j] = x);
    return o;
};


blocJams = angular.module('BlocJams', ['ui.router']);


// ------------------------------
// Navigation

blocJams.config(['$stateProvider', '$locationProvider', function($stateProvider, $locationProvider) {
  $locationProvider.html5Mode(true);

  $stateProvider.state('landing', {
    url: '/',
    controller: 'Landing.controller',
    templateUrl: '/templates/landing.html'
  });

  $stateProvider.state('collection', {
    url: '/collection',
    controller: 'Collection.controller',
    templateUrl: '/templates/collection.html'
  });

  $stateProvider.state('album', {
    url: '/album?name',
    templateUrl: '/templates/album.html',
    controller: 'Album.controller'
  });

  $stateProvider.state('profile', {
    url: '/profile',
    templateUrl: '/templates/profile.html',
    controller: 'Profile.controller'
  });
}]);


// ------------------------------
// Albums

var albumArtUrls = [
  '/images/album-placeholders/album-1.jpg',
  '/images/album-placeholders/album-2.jpg',
  '/images/album-placeholders/album-3.jpg',
  '/images/album-placeholders/album-4.jpg',
  '/images/album-placeholders/album-5.jpg',
  '/images/album-placeholders/album-6.jpg',
  '/images/album-placeholders/album-7.jpg',
  '/images/album-placeholders/album-8.jpg',
  '/images/album-placeholders/album-9.jpg'
];
shuffle(albumArtUrls);

var albumPicasso = {
  name: 'The Colors',
  artist: 'Pablo Picasso',
  label: 'Cubism',
  year: '1881',
  albumArtUrl: albumArtUrls[1],
  songs: [
    { name: 'Blue', length: 161.71, audioUrl: '/music/placeholders/blue' },
    { name: 'Green', length: 103.96, audioUrl: '/music/placeholders/green' },
    { name: 'Red', length: 268.45, audioUrl: '/music/placeholders/red' },
    { name: 'Pink', length: 153.14, audioUrl: '/music/placeholders/pink' },
    { name: 'Magenta', length: 374.22, audioUrl: '/music/placeholders/magenta' }
  ]
};
var albumMarconi = {
  name: 'The Telephone',
  artist: 'Guglielmo Marconi',
  label: 'EM',
  year: '1909',
  albumArtUrl: albumArtUrls[2],
  songs: [
  { name: 'Hello, Operator?', length: 161.71, audioUrl: '/music/placeholders/blue' },
  { name: 'Ring, ring, ring', length: 103.96, audioUrl: '/music/placeholders/green' },
  { name: 'Fits in your pocket', length: 268.45, audioUrl: '/music/placeholders/red' },
  { name: 'Can you hear me now?', length: 153.14, audioUrl: '/music/placeholders/pink' },
  { name: 'Wrong phone number', length: 374.22, audioUrl: '/music/placeholders/magenta' }
  ]
};
var albumTSFH = {
  name: 'Illusions',
  artist: 'Thomas J. Bergersen',
  label: 'Orchestral',
  year: '2011',
  albumArtUrl: albumArtUrls[3],
  songs: [
  { name: 'Aura', length: 161.71, audioUrl: '/music/placeholders/blue' },
  { name: 'Starvation', length: 103.96, audioUrl: '/music/placeholders/green' },
  { name: 'Dreammaker', length: 268.45, audioUrl: '/music/placeholders/red' },
  { name: 'Hurt', length: 153.14, audioUrl: '/music/placeholders/pink' },
  { name: 'Ocean Princess', length: 374.22, audioUrl: '/music/placeholders/magenta' },
  { name: 'Gift of Life', length: 161.71, audioUrl: '/music/placeholders/blue' },
  { name: 'Rada', length: 103.96, audioUrl: '/music/placeholders/green' },
  { name: 'A Place In Heaven', length: 268.45, audioUrl: '/music/placeholders/red' },
  { name: 'Merchant Prince', length: 153.14, audioUrl: '/music/placeholders/pink' },
  { name: 'Promise', length: 374.22, audioUrl: '/music/placeholders/magenta' }
  ]
};


// ------------------------------
// Controllers

blocJams.controller('Landing.controller', ['$scope', function($scope) {

  $scope.title = 'Bloc Jams';
  $scope.subText = 'Turn the music up!';

  $scope.albumURLs = angular.copy(albumArtUrls);

  $scope.titleClicked = function() {
    shuffle($scope.albumURLs);
  };

  $scope.subTextClicked = function() {
    $scope.subText += '!';
  };
}]);


blocJams.controller('Collection.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {

  $scope.albums = [];

  // populating the collection page with randoms albums
  for (var i = 0; i < 33; i++) {
    var rand = Math.random();
    if (rand < 0.34) {
      $scope.albums.push(angular.copy(albumPicasso));
    } else if (rand < 0.67) {
      $scope.albums.push(angular.copy(albumMarconi));
    } else {
      $scope.albums.push(angular.copy(albumTSFH));
    }
  };

  $scope.playAlbum = function(album) {
    SongPlayer.setSong(album, album.songs[0]);
  };

}]);


blocJams.controller('Album.controller', ['$scope', 'SongPlayer', '$stateParams', function($scope, SongPlayer, $stateParams) {
  
  // displaying the right album
  var al = $stateParams.name;
  switch (al) {
    case 'The Colors':
      $scope.album = angular.copy(albumPicasso);
      break;
    case 'The Telephone':
      $scope.album = angular.copy(albumMarconi);
      break;
    case 'Illusions':
      $scope.album = angular.copy(albumTSFH);
      break;
    default:
      $scope.album = angular.copy(albumPicasso);
  };

  // selecting the displayed album in song player if no current album or no current song
  SongPlayer.setAlbum($scope.album);

  // icon display in song table
  var hoveredSong = null;
  $scope.onHoverSong = function(song) {
    hoveredSong = song;
  };
  $scope.offHoverSong = function(song) {
    hoveredSong = null;
  };
  $scope.getSongState = function(song) {
    if (song === SongPlayer.currentSong && SongPlayer.playing) {
      // pause button when playing
      return 'playing';
    }
    else if (song === hoveredSong) {
      // play button when hovered
      return 'hovered';
    }
    // song number else
    return 'default';
  };

  // play and pause for the song table
  $scope.playSong = function(song) {
    SongPlayer.setSong($scope.album, song);
  };
  $scope.pauseSong = function(song) {
    SongPlayer.pause();
  };
}]);


blocJams.controller('PlayerBar.controller', ['$scope', 'SongPlayer', function($scope, SongPlayer) {

  $scope.songPlayer = SongPlayer;

  // icon display for the volume
  $scope.volumeClass = function() {
    return {
      'fa-volume-off': SongPlayer.volume == 0,
      'fa-volume-down': SongPlayer.volume <= 70 && SongPlayer.volume > 0,
      'fa-volume-up': SongPlayer.volume > 70
    }
  };

  // mute/unmute volume on volume icon click
  $scope.mute = function() {
    if (SongPlayer.volume > 0) {
      $scope.previousVolume = SongPlayer.volume;
      SongPlayer.setVolume(0);
    } else {
      var newVolume = $scope.previousVolume || 50;
      SongPlayer.setVolume(newVolume);
    }
  };

  // update playtime of current song
  SongPlayer.onTimeUpdate(function(event, time) {
    if (!SongPlayer.currentSong) {
      time = NaN;
    }
    $scope.$apply(function() {
      $scope.playTime = time;
    });
  });

  SongPlayer.onSongEnded(function(event) {
    SongPlayer.next();
  });

}]);


blocJams.controller('Profile.controller', ['$scope', function($scope) {

}]);


// ------------------------------
// Service

blocJams.service('SongPlayer', ['$rootScope', function($rootScope) {

  var currentSoundFile = null;

  // index of song for previous and next functions
  var trackIndex = function(album, song) {
    return album.songs.indexOf(song);
  };
  
  return {
    currentSong: null,
    currentAlbum: null,
    playing: false,
    volume: 90,

    play: function() {
      if (!this.currentSong && this.currentAlbum) {
        // when album selected but no song, start with the first song
        this.setSong(this.currentAlbum, this.currentAlbum.songs[0]);
      }
      if (this.currentSong) {
        this.playing = true;
        currentSoundFile.play();
      }
    },
    pause: function() {
      this.playing = false;
      currentSoundFile.pause();
    },
    stop: function () {
      this.playing = false;
      currentSoundFile.stop();
      this.currentSong = null;
    },
    next: function() {
      // next song without looping on the album
      if ( this.currentSong ) {
        var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
        currentTrackIndex++;
        if (currentTrackIndex >= this.currentAlbum.songs.length) {
          this.stop();
        } else {
          var song = this.currentAlbum.songs[currentTrackIndex];
          this.currentSong = song;
          this.setSong(this.currentAlbum, song);
        }
      }
    },
    previous: function() {
      // previous song without looping on the album
      if ( this.currentSong ) {
        var currentTrackIndex = trackIndex(this.currentAlbum, this.currentSong);
        currentTrackIndex--;
        if (currentTrackIndex < 0) {
          this.stop();
        } else {
          var song = this.currentAlbum.songs[currentTrackIndex];
          this.currentSong = song;
          this.setSong(this.currentAlbum, song);
        }
      }
    },
    setVolume: function(volume) {
      if(currentSoundFile){
        currentSoundFile.setVolume(volume);
      }
      this.volume = volume;
    },
    setSong: function(album, song) {
      // selecting an album and song and playing it
      if (currentSoundFile) {
        currentSoundFile.stop();
      }
      this.currentAlbum = album;
      this.currentSong = song;

      currentSoundFile = new buzz.sound(song.audioUrl, {
        formats: [ 'mp3' ],
        preload: true
      });
      currentSoundFile.setVolume(this.volume);

      currentSoundFile.bind('ended', function(e) {
        $rootScope.$broadcast('sound:ended');
      });
      
      currentSoundFile.bind('timeupdate', function(e){
        $rootScope.$broadcast('sound:timeupdate', this.getTime());
      });

      this.play();
    },
    setAlbum: function(album) {
      // !this.currentAlbum -> !this.currentSong
      if (!this.currentSong) {
        this.currentAlbum = album;
      }
    },
    seek: function(time) {
      if(currentSoundFile) {
        currentSoundFile.setTime(time);
      }
    },
    onTimeUpdate: function(callback) {
      return $rootScope.$on('sound:timeupdate', callback);
    },
    onSongEnded: function(callback) {
      return $rootScope.$on('sound:ended', callback);
    }
  };
}]);


// ------------------------------
// Directive

blocJams.directive('slider', ['$document', function($document){

  var calculateSliderPercentFromMouseEvent = function($slider, event) {
    // calculate the position of the mouse on the slider
    var offsetX =  event.pageX - $slider.offset().left;
    var sliderWidth = $slider.width();
    var offsetXPercent = (offsetX  / sliderWidth);
    offsetXPercent = Math.max(0, offsetXPercent);
    offsetXPercent = Math.min(1, offsetXPercent);
    return offsetXPercent;
  };

  var numberFromValue = function(value, defaultValue) {
    if (typeof value === 'number') {
      return value;
    }
    if(typeof value === 'undefined') {
      return defaultValue;
    }
    if(typeof value === 'string') {
      return Number(value);
    }
  };

  return {
    templateUrl: '/templates/directives/slider.html',
    replace: true,
    restrict: 'E',
    scope: {
      onChange: '&'
    },
    link: function(scope, element, attributes) {
      scope.value = 0;
      scope.max = 100;
      var $seekBar = $(element);

      // monitor the changes on value and max and apply then when detected
      attributes.$observe('value', function(newValue) {
        scope.value = numberFromValue(newValue, 0);
      });
      attributes.$observe('max', function(newValue) {
        scope.max = numberFromValue(newValue, 100) || 100;
      });

      var percentString = function () {
        var value = scope.value || 0;
        var max = scope.max || 100;
        percent = value / max * 100;
        return percent + '%';
      };

      scope.fillStyle = function() {
        return {width: percentString()};
      };

      scope.thumbStyle = function() {
        return {left: percentString()};
      };

      scope.onClickSlider = function(event) {
        // editing slider when cliked (and with mouseup)
        var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
        scope.value = percent * scope.max;
        notifyCallback(scope.value);
      };
      scope.trackThumb = function() {
        // editing slider with mouse movement when mousedown
        $document.bind('mousemove.thumb', function(event){
          // monitoring the mouse movemement and updating the slider bar
          var percent = calculateSliderPercentFromMouseEvent($seekBar, event);
          scope.$apply(function(){
            scope.value = percent * scope.max;
            notifyCallback(scope.value);
          });
        });

        $document.bind('mouseup.thumb', function(){
          // stop monitoring the mouse movement
          $document.unbind('mousemove.thumb');
          $document.unbind('mouseup.thumb');
        });
      };
      var notifyCallback = function(newValue) {
        // notify when changes are made
        if (typeof scope.onChange === 'function') {
          scope.onChange({niceValue: newValue});
        }
      };
    }
  };
}]);


// ------------------------------
// Filter

blocJams.filter('TimeCode', function(){
  return function(seconds) {
    seconds = Number.parseFloat(seconds);

    // returned when no time is provided.
    if (Number.isNaN(seconds)) {
      return '-:--';
    }

    // make it a whole number
    var wholeSeconds = Math.floor(seconds);

    // calculating minutes and seconds
    var minutes = Math.floor(wholeSeconds / 60);
    var remainingSeconds = wholeSeconds % 60;

    // building output
    var output = minutes + ':';
    if (remainingSeconds < 10) {
      // zero pad seconds, so 9 seconds should be :09
      output += '0';
    }
    output += remainingSeconds;

    return output;
  }
});
});

;require.register("scripts/collection", function(exports, require, module) {
var buildAlbumThumbnail = function() {
    var template =
        '<div class="collection-album-container col-md-2">'
	  + '  <div class="collection-album-image-container">'
      + '    <img src="/images/album-placeholder.png"/>'
	  + '  </div>'
      + '  <div class="caption album-collection-info">'
      + '    <p>'
      + '      <a class="album-name" href="/album.html"> Album Name </a>'
      + '      <br/>'
      + '      <a href="/album.html"> Artist name </a>'
      + '      <br/>'
      + '      X songs'
      + '      <br/>'
      + '    </p>'
      + '  </div>'
      + '</div>';
 
   return $(template);
 };
 
 var buildAlbumOverlay = function(albumURL) {
    var template =
        '<div class="collection-album-image-overlay">'
      + '  <div class="collection-overlay-content">'
      + '    <a class="collection-overlay-button" href="' + albumURL + '">'
      + '      <i class="fa fa-play"></i>'
      + '    </a>'
      + '    &nbsp;'
      + '    <a class="collection-overlay-button">'
      + '      <i class="fa fa-plus"></i>'
      + '    </a>'
      + '  </div>'
      + '</div>'
      ;
    return $(template);
  };
 
 var updateCollectionView = function() {
   var $collection = $(".collection-container .row");
   $collection.empty();
 
   for (var i = 0; i < 33; i++) {
     var $newThumbnail = buildAlbumThumbnail();
     $collection.append($newThumbnail);
   }
   var onHover = function(event) {
      $(this).append(buildAlbumOverlay("/album.html"));
   };
   $collection.find('.collection-album-image-container').hover(onHover);
   
   
   var offHover = function(event) {
      $(this).find('.collection-album-image-overlay').remove();
   };
   $collection.find('.collection-album-image-container').hover(onHover, offHover);
 };

if (document.URL.match(/\/collection.html/)) {
   // Wait until the HTML is fully processed.
   $(document).ready(function() {
     updateCollectionView();
   });
 }
});

;require.register("scripts/landing", function(exports, require, module) {
 $(document).ready(function() { 
    $('.hero-content h3').click(function(){
      var subText = $(this).text();
       $(this).text(subText + " !");
    });
 
   var onHoverAction = function(event) {
     console.log('Hover action triggered.');
     $(this).animate({'margin-top': '10px'});
   };
 
   var offHoverAction = function(event) {
     console.log('Off-hover action triggered.');
     $(this).animate({'margin-top': '0px'});
   };
 
    $('.selling-points .point').hover(onHoverAction, offHoverAction);
  });
});

;require.register("scripts/profile", function(exports, require, module) {
// holds the name of our tab button container for selection later in the function
var tabsContainer = ".user-profile-tabs-container"
var selectTabHandler = function(event) {
};
var tabsContainer = ".user-profile-tabs-container"
var selectTabHandler = function(event) {
	$tab = $(this);
	$(tabsContainer + " li").removeClass('active');
	$tab.parent().addClass('active');
	selectedTabName = $tab.attr('href');
	console.log(selectedTabName);
	$(".tab-pane").addClass('hidden');
	$(selectedTabName).removeClass('hidden');
	event.preventDefault();
};

if (document.URL.match(/\/profile.html/)) {
	$(document).ready(function() {
		var $tabs = $(tabsContainer + " a");
		$tabs.click(selectTabHandler);
		$tabs[0].click();
	});
}
});

;
//# sourceMappingURL=app.js.map