const path = require('path')

const path_prefix=__dirname
module.exports={
  maxFontSize:10000000,
  imageUrls:["images/polominta_light.png","images/fiatalok_light.png"],
  path_prefix,
  song_dir: path.join(path_prefix,"./songs"),
  songinport_dir:path.join(path_prefix,"../../songimport"),
  music_dir:path.join(path_prefix,"./music"),
  images_dir:path.join(path_prefix,"./images"),
  talkmusic_dir:path.join(path_prefix,"./talkmusic"),
  talks_path:path.join(path_prefix,"./talks.json"),
  songorder_path:path.join(path_prefix,"setup_window/songorder.txt"),
  client_dir:path.join(path_prefix,"../../client-static"),
  port:8000
}
