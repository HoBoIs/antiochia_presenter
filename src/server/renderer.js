// This file is required by the index.html file and will
// be executed in the renderer process for that window.
// All of the Node.js APIs are available in this process.

process.stdout.write('Starting render...'+'\n')
const server = require('./server.js')
var songs = require('./songs.js')
var thanks = require('./thanks.js')
var musics = require('./musics.js')
const config = require('./config.js')
var talks = require(config.talks_path)
const fs = require('fs')
const path = require('path')

const NOMUSIC = '-'
const NOIMAGE = '-'

const errors = talks.map(talk => (
  ((
    talk.music === NOMUSIC ||
    (
      talk.music != '' &&
      fs.existsSync(path.join(config.talkmusic_dir, talk.music))
    )
  ) ? '' : `Music file missing for: ${talk.title} <br />`) +
  ((
    !('image' in talk) ||
    (
      talk.image != '' &&
      fs.existsSync(path.join(config.images_dir, talk.image))
    )||(talk.image===NOIMAGE)
  ) ? '' : `Image file missing for: ${talk.title}  ${talk.image!="-"}<br />`)
)).join('')
process.stdout.write('Starting errors...'+'\n')

if (errors !== '') {
  document.body.innerHTML = /* html */`
    <style>
      body {
        display: flex;
        justify-content: center;
        align-items: center;
      }

      div {
        color: red;
        font-size: 4vw;
      }
    </style>
    <div>
      ${errors}
    </div>
  `
}

process.stdout.write("1\n")
var titleList = songs.map((s) => s.titles[0]).join(';')
process.stdout.write("2\n")
var musicList = musics.join(';')
var talkList = talks.map(t => `${t.name} - ${t.title}`).join(';')
server.wss.on('connection', client => {
  client.send('SONGS:' + titleList)
  client.send('TALKS:' + talkList)
  client.send('MUSICS:' + musicList)
})

const status = {
  title: '',
  talk: undefined,
  number: 0,
  fontSize: 40,
  state: 'song',
  music: NOMUSIC
}

const outerContainer = document.getElementById('outerContainer')
const innerContainer = document.getElementById('innerContainer')
const desiredWidthRatio = 9 / 10
const maxHeightRatio = 9 / 10
let margin = { t: 0, b: 0, l: 0, r: 0 }

const talkContainer = document.getElementById('talkContainer')
const talkTitle = document.getElementById('talkTitle')
const talkName = document.getElementById('talkName')
const tmAudio = document.getElementById('tmAudio')

const setMargins = () => {
  window.document.body.style.top = `${margin.t}%`
  window.document.body.style.bottom = `${margin.b}%`
  window.document.body.style.left = `${margin.l}%`
  window.document.body.style.right = `${margin.r}%`
}

setMargins()
var prew=Date.now()
var start
var ptime=0
const handleMessage = m => {
  prew=start
  start=Date.now()
  process.stdout.write(m+'\n')
  if (m.startsWith('PREV:')) {
    status.number--
  } else if (m.startsWith('NEXT:')) {
    status.number++
  } else if (m.startsWith('SONG:')) {
    status.state = 'song'
    status.number = 0
    status.title = m.substring(5)
    ptime=0
  } else if (m.startsWith('TALK:')) {
    status.state = 'talk'
    status.talk = talks.filter(t => `${t.name} - ${t.title}` === m.substring(5))[0]
  } else if (m.startsWith('PLAY:')) {
    if (status.talk.music !== NOMUSIC) {
      process.stdout.write('playing'+'\n')
      tmAudio.play()//zene után köszönjük
      tmAudio.ended=function(event){ renderThanks()}
    }
  } else if (m.startsWith('THANKS:')) {
    renderThanks()
  } else if (m.startsWith('INVERT:')) {
    if (document.body.classList.contains('invert')) {
      document.body.classList.remove('invert')
    } else {
      document.body.classList.add('invert')
    }
  } else if (m.startsWith('MARGIN:')) {
    if (m[7] === 'x') {
      margin.t = 0
      margin.b = 0
      margin.l = 0
      margin.r = 0
    } else {
      const side = m[7]
      process.stdout.write(side+'\n')
      const direction = m[9] === '+' ? 1 : -1

      margin[side] = Math.max(0, Math.min(margin[side] + (1 * direction), 100))
    }

    setMargins()

    // window.document.body.style.height = `${100 - margin}%`
  } else if (m.startsWith("PLAYMUSIC:")){
    if (status.music !== NOMUSIC) {
      tmAudio.src = status.music;
      tmAudio.currentTime = ptime
      tmAudio.play()
    }
  } else if (m.startsWith('PAUSEMUSIC:')){
    ptime = tmAudio.currentTime
    tmAudio.pause()
  } else if (m.startsWith('STOPMUSIC:')){
    tmAudio.pause()
    tmAudio.currentTime = 0
    ptime=0
  } else if (m.startsWith('SOUNDDOWN:')){
    if (tmAudio.volume<0.11) {
      tmAudio.volume=0.1
    }else{
      tmAudio.volume=tmAudio.volume-0.10
    }
  } else if (m.startsWith('SOUNDUP:')){
    if (tmAudio.volume>0.90) {
      tmAudio.volume=1.00
    }else{
      tmAudio.volume=tmAudio.volume+0.10
    }
  } else if (m.startsWith('MUSIC:')) {
    status.state = 'music'
    status.music = path.join( config.music_dir,musics.filter(t => t === m.substring(6))[0])
  } else if (m.startsWith('REFRESHDB:')) {
    refreshdb()
  }
    millis=-Date.now()+start
    //process.stdout.write(`seconds elapsed = ${millis / 1000}`+"\n")
  // else if (m.startsWith('MARGINDOWN:')) {
  //   margin = Math.max(margin - 5, 0)
  //   window.document.body.style.height = `${100 - margin}%`
  // }
}

function refreshdb() {
  /*songs = require('./songs.js')
  thanks = require('./thanks.js')
  musics = require('./musics.js')
  talks = require('./talks.json')
  musicList = musics.join(';')
  talkList = talks.map(t => `${t.name} - ${t.title}`).join(';')
  */
  process.stdout.write(location+"=host\n")
  location.reload(true)
}
const adjustFontSize = () => {
  const widthRatio = () => innerContainer.clientWidth / outerContainer.clientWidth
  const heightRatio = () => innerContainer.clientHeight / outerContainer.clientHeight

  innerContainer.style.fontSize = `${status.fontSize}px`
  minS=1
  maxS=config.maxFontSize

  while (
    minS+1<maxS
  ) {
      status.fontSize = (minS+maxS)/2
      innerContainer.style.fontSize = `${status.fontSize}px`
      if(
    	Math.abs(widthRatio() - desiredWidthRatio) > 0.05 &&
    	heightRatio() < maxHeightRatio &&
    	widthRatio() < desiredWidthRatio&&
    	status.fontSize < config.maxFontSize
      ){
        minS=status.fontSize
      }else{
        maxS=status.fontSize
      }
  }
  process.stdout.write('beep\n')
}
const renderSong = () => {
  if (status.title === '') {
    return
  }

  talkContainer.style.display = 'none'
  tmAudio.pause()
  tmAudio.src = ''
  outerContainer.style.display = 'flex'

  const currentSectionCount = songs.filter(s => s.titles[0] === status.title)[0].sections.length

  if (status.number < 0) {
    innerContainer.textContent = ''
    if (status.number < -1) {
	//TODO prev song
        let i=0
        while (songs.length>i&&(!(songs[i].titles[0]===status.title))){
          i++;
        }
        if (i==0){
          status.title = songs[songs.length-1].titles[0]
        }else{
          status.title = songs[i-1].titles[0]
        }
        currentSc = songs.filter(s => s.titles[0] === status.title)[0].sections.length
        status.number = currentSc-1
        renderSong()
    }
  } else if (status.number >= currentSectionCount) {
    if (status.number==currentSectionCount){
      cnt=config.imageUrls.length
      
      index=Math.floor(Math.random() * cnt)
      innerContainer.innerHTML =" <img src=\""+config.imageUrls[index]+"\" style=\" height:100%;\" > " 
    }else{
    let i=0;
    while (songs.length>i&&(!(songs[i].titles[0]===status.title))){
        i++;
    }
    if (i+1!=songs.length){
      status.title = songs[i+1].titles[0]
    }
    else{
      status.title = songs[0].titles[0]
    }
    status.number = 0
    renderSong()
    }
  } else {//inerHTML tud formázást
    innerContainer.innerHTML = songs.find(s => s.titles[0] === status.title).sections[status.number].trim()
    adjustFontSize()
  }
}

const renderTalk = () => {
  outerContainer.style.display = 'none'
  talkContainer.style.display = 'flex'

  if (status.talk.music !== NOMUSIC) {
    tmAudio.src = path.join(config.talkmusic_dir,status.talk.music)
  }

  // if (status.talk.image !== NOIMAGE) {

  // }

  if ('image' in status.talk && status.talk.image != "-" && status.talk.image !="") {
    talkContainer.style.backgroundImage = `url(`+path.join(config.images_dir, status.talk.image)+`)`
    talkTitle.innerText = ''
    talkName.innerText = ''
  } else {
    talkContainer.style.backgroundImage = ''
    talkTitle.innerText = status.talk.title
    talkName.innerText = status.talk.name
  }
}

const renderThanks = () => {
  talkContainer.style.display = 'none'
  outerContainer.style.display = 'flex'

  let thanksText = thanks[status.talk.thanks.id]

  for (let i = 0; i < status.talk.thanks.names.length; i++) {
    thanksText = thanksText.replace(`%name${i}%`, status.talk.thanks.names[i])
  }

  innerContainer.textContent = thanksText

  adjustFontSize()
}
tmAudio.addEventListener('ended', renderThanks)
window.renderThanks = renderThanks
document.body.addEventListener('keydown', e => {
  if (e.key === 'T' && e.ctrlKey && e.shiftKey) {
    renderThanks()
  }
})

let previousRemoteAddress = ''
let previousActionTime = 0

server.subscribe((m, ws) => {
  if (
    ws._socket.remoteAddress !== previousRemoteAddress &&
    Date.now() - previousActionTime < 3000
  ) {
    return
  }

  previousRemoteAddress = ws._socket.remoteAddress
  previousActionTime = Date.now()

  handleMessage(m)

  if (status.state === 'song') {
    renderSong()
  } else if (status.state === 'talk' && m !== 'PLAY:' && m !== 'THANKS:') {
    renderTalk()
  } else if (status.state === 'music'){
    outerContainer.style.display = 'none'
    talkContainer.style.display = 'none'
  }
})
//process.stdout.write(status.music)
const ipcRenderer = require('electron').ipcRenderer;
ipcRenderer.on('refreshdb', function (ev, data) {
  refreshdb()
  process.stdout.write('Refreshing...'+'\n')
})
