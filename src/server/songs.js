const fs = require('fs')
const path = require('path')
const config=require('./config')
const folder = config.song_dir
// const folder = 'jubileum'
// const folder = 'mass'

const songs = []
fs.readdirSync(folder).forEach((file)=> {
  try{
    songs.push(require(path.join(folder, file)))

    if ("0"<=file[0]&&file[0]<="9"){//sorszám eléírása
      songs[songs.length-1].titles[0]=file[0]+file[1]+file[2]+songs[songs.length-1].titles[0]
    }
    if (file.includes("#")){
	songs[songs.length-1].titles[0]+="\n\r"+file.replace(".js","").replace(/.*#/,"#")
	process.stdout.write(songs[songs.length-1].titles[0]+"\n")
    }
  }catch(error){
      process.stdout.write(error.message+" in "+file+"\n")
//Ha 1 dal érvénytelen ne omoljon össze
  }
})
module.exports = songs
