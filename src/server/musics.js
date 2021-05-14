const fs = require('fs')
const conf=require('./config')
const path = require('path')
const { Console } = require('console');
const folder = conf.music_dir
// const folder = 'jubileum'
// const folder = 'mass'
//myConsole=new Console({ stdout: output, stderr: errorOutput }) 
const musics = []
fs.readdirSync(folder).forEach((file)=> {
//myConsole.log('asd')
  try{
    musics.push(file)
  }catch(error){
//Ha 1 dal érvénytelen ne omoljon össze
  }
})
module.exports = musics
