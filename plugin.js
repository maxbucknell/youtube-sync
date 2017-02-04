/**
 * View multiple camera angles of a single event.
 *
 *
 *
 * @param object config
 * @example
 *   $('.videos').youtubeSync({
 *     options: {
 *       width: 1280,
 *       height: 720,
 *     },
 *     cameras: {
 *       '1': {
 *         id: 'H5jERhB0RbA',
 *         links: {
 *           2: [20, 40],
 *         },
 *         isDefault: true,
 *       },
 *       '2': {
 *         id: 'UDhJeS_l6UU',
 *         links: {
 *           1: [40, 70],
 *         },
 *       }
 *     }
 *  });
 *
 */
jQuery.fn.youtubeSync = (function () {
  var $ = jQuery;

  var defaultOptions = {
    width: '640',
    height: '390',
  };

  // Assume YouTube API is loaded already.
  function main (config) {
    // We only need to work on one element, so let's just make sure.
    var $container = this.eq(0);

    // Merge with default options.
    var options = getOptions(config.options);
    var cameras = config.cameras;

    // Shouldn't be using map here because we have a side effect.
    //
    // Don't care that much.
    var makeNewPlayer = makeNewPlayerConstructor($container, options);
    Object.keys(cameras).forEach(function (cameraName) {
      var camera = cameras[cameraName];
      var videoId = camera.id;
      var isDefault = !!camera.isDefault;

      var $element = makeNewPlayer(
        cameraName,
        videoId,
        isDefault
      );

      var $links = $element.children('.youtube-sync__player__links');
      var links = camera.links;

      Object.keys(links).forEach(function (destinationName) {
        var url = '#' + destinationName;
        var link = links[destinationName];

        var $link = $('<a />')
          .addClass('youtube-sync__links__link')
          .css({
            left: link[0] + '%',
            top: link[1] + '%',
          })
          .attr('href', url);

        $link.on('click', function (e) {
          e.preventDefault();

          var $target = $(e.target);
          var destinationName = $target.attr('href').slice(1);

          swapToCamera(destinationName);
        });

        $links.append($link);
      });
    });
  }

  function makeNewPlayerConstructor ($container, options) {
    return function makeNewPlayer (cameraName, videoId, isDefault) {
      var $element = makeElement(cameraName);
      var id = $element.data('iframeId');

      $container.append($element);

      var player = new YT.Player(id, {
        height: options.height,
        width: options.width,
        videoId: videoId,
        events: {
          onReady: onPlayerReady(cameraName, isDefault),
        }
      });

      $element.data('youtubePlayer', player);

      return $element;
    }
  }

  function onPlayerReady (cameraName, isDefault) {
    if (isDefault) {
      return function (e) {
        swapToCamera(cameraName);
      };
    } else {
      return Function.prototype;
    }
  }

  function makeElement (cameraName) {
    var id = getIdFromCameraName(cameraName);
    var $element = $('<div />')
      .addClass('youtube-sync__player')
      .attr('data-iframe-id', id)

    var $links = $('<div />')
      .addClass('youtube-sync__player__links');

    var $video = $('<b />')
      .attr('id', id);

    $element.append($video).append($links);

    return $element;
  }

  function getIdFromCameraName (cameraName) {
    return 'youtube-sync__' + cameraName;
  }

  function getOptions (options) {
    return $.extend({}, defaultOptions, options);
  }

  function swapToCamera (cameraName) {
    var destinationId = getIdFromCameraName(cameraName);
    var $new = $('[data-iframe-id=' + destinationId);
    var newPlayer = $new.data('youtubePlayer');

    var $old = $('.youtube-sync__player--active');
    if ($old.length !== 0) {
      $old.removeClass('youtube-sync__player--active');
      var oldPlayer = $old.data('youtubePlayer')
      oldPlayer.pauseVideo();
      var time = oldPlayer.getCurrentTime();
      newPlayer.seekTo(time);
    }

    $new.addClass('youtube-sync__player--active');
    newPlayer.playVideo();
  }

  return main;
})();
