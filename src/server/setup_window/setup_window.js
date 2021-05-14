cfn=require('./conv_fname')
is=require('./importsong')
so=require('./songorder')
config=require('../config')
path=require('path')
fs=require('fs')
qrcode=require('qrcode')
let talks = require(config.talks_path)

const sofname=config.songorder_path

async function makeQR(ip){
    const res = await qrcode.toDataURL(ip);
    document.getElementById('adressqr').innerHTML=`<img src="${res}">`
}

function getSongList(){
    lines= (fs.readFileSync(sofname).toString()).split('\n')
    //while (lines[lines.length-1]==""){lines.pop()}
    for (i=0; i<lines.length-1;++i){
    if (lines[i][0]=="#") {
      lines[i+1]=lines[i]+"<br/>"+lines[i+1]
      lines[i]=""
      ++i;
    }
    }
    return lines.filter((x)=>x!="")
}

var songOrderlist=getSongList()
var to=0
var from=0


function showSongorderList(){
    strin=""
    str="<ol>"
    for (i=0; i<songOrderlist.length;++i){
    strin+=songOrderlist[i].replace("<br/>","\n")+"\n"
    if (i+1>=from && i<to){
      str+="<li> <b>"+songOrderlist[i]+"</b> </li>"
    }else{
      str+="<li>"+songOrderlist[i]+"</li>"
    }
    }
    str+="</ol>"
    document.getElementById('PsongorderList').innerHTML=str
    document.getElementById('songorderIn').innerHTML=strin
    document.getElementById('so_to').max=songOrderlist.length
    document.getElementById('so_to').min=1
    document.getElementById('so_to').value=songOrderlist.length
    document.getElementById('so_from').value=1
    document.getElementById('so_from').min=1
    document.getElementById('so_from').max=songOrderlist.length
}


function songordercall(){
  from=parseInt(document.getElementById('so_from').value)
  to=parseInt(document.getElementById('so_to').value)
  if (from>to) {
    return
  }
  fails=so.songorder(from,to,songOrderlist.map((x)=>x.replace(/.*<br\/>/,(x)=>{return `{${x}}`})))
  //process.stdout.write("Failed:"+fails+'\n')//TODO show user
  showSongorderList()
  refreshdb()

}
function importcall(){
    is.importsong(config.songinport_dir)
    refreshdb()
}
/*function validate(name){
      isgood=false
    fn=cfn.conv_fname(name)
      fs.readdirSync(config.song_dir).forEach((filename)=> {
    if (fn==filename){
      isgood=true}
      })
      return isgood;
}*/
function exportsongorder(){
    data=document.getElementById('songorderIn').value//.replace(/\n\s*\n*/,"\n")
    fs.writeFile(sofname, data, (err) => {
	if (err) throw err;
	to=from=0;
        songOrderlist=getSongList()
	showSongorderList();
    })
}

function newsongorder(){
    try{
	lines=document.getElementById('songorderIn').value.split('\n')
	problems=so.getsongorder(lines.filter((x)=>x[0]!="#"))
    /*
      problems+=lines[i]+"("+(i+1)+". sor)<br/>"
      */
	if (problems.length!=0){
	    problems=problems.map((x)=>x+"<br/>")
	    document.getElementById('errors').innerHTML="Ismeretlen dal<br/>"+problems
	}else{
	    document.getElementById('errors').innerHTML=""
	    exportsongorder()
	}  
    }catch(error){
	process.stdout.write(error.message+"\n")
    }
    refreshdb()
}
var WebSocket = require('ws')
var client=0   

function refreshdb(){
    try{
	client.send("REFRESHDB:")
    }catch(error){
	process.stdout.write(error.message+"(errrefresh)\n")
	makeconnect()
    }
}
let isopen=false
ip = Object.values(require("os").networkInterfaces()).
  flat().
  filter((item) => !item.internal && item.family === "IPv4").
  find(Boolean).address
function makeconnect(){ 
    setTimeout(()=>{
	//client = new WebSocket('ws://157.181.200.232:8000')
	client = new WebSocket('ws://'+ip+":"+config.port)
        try {
	client.on('close',()=>{
	setTimeout(()=>{
	    makeconnect()},500)
	})}
	catch(err){
	    process.stdout.write(error.message+"(errcon)\n")
	    isopen=false
		document.getElementById("isconnected").innerHTML="not connected"
	    setTimeout(()=>{
	        makeconnect()},500)
	    }
	    client.on('open',()=>{
		isopen=true
		process.stdout.write("OPEN"+"\n");
		document.getElementById("isconnected").innerHTML="connected"
	    })
	    setTimeout(()=>{try{
	        client.send("ping")
	    }catch(error){
	        //process.stdout.write('ws://'+ip+":"+config.port+"\n")
	        process.stdout.write(error.message+"(errping-this is normal)\n")
		isopen=false
		document.getElementById("isconnected").innerHTML="not connected"
	    }},500)
	    process.stdout.write('0'+"\n");
	},500)
}
vs=require('./vilagsarkai')
function makeplaces(){
    lines=document.getElementById('vilagsarkok').value.split('\n')
    vs.makesong(lines)
    refreshdb()
}

function make_talkinput_html_iner(title,name,image,music,thankid,thanknames,num,paird){
    if (paird===undefined) paird=thanknames.length==2
    if (image===undefined) image="-"
    if (paird && thanknames.length==1) thanknames.push("")
    return `<label for="title${num}">Cím:</label><input id="title${num}" type="text" value="${title}">
	<label for="paird${num}">Páros?:</label><input id="paird${num}" type="checkbox" ${paird?"checked":""} onclick=sw.refresh_talk(${num});>
	<label for="name${num}">${paird?"Nevek":"Név"}:</label><input id="name${num}" type="text" value="${name}"style="width:${paird?120:60}px;">
	<label for="image${num}">Kép:</label><input id="image${num}" type="text" value="${image}"style="width:60px;"> 
	<label for="music${num}">Zene:</label><input id="music${num}" type="text" value="${music}"style="width:60px;"> 
	<label for="thankid${num}">Köszönjük típus:</label><select id="thankid${num}" value="${thankid}">
	    ${!paird?`<option value=0 ${0==thankid?"selected":""}>Hála néked...</option>
	     <option value=1 ${1==thankid?"selected":""}>Köszönjük néked...</option>`:
	    `<option value=2 "selected">páros</option>`}
	</select>
	<label for="thanknames${num}1">${paird?"Nevek":"Név"} a köszönjükbe:</label><input id="thanknames${num}1" type="text" style="width:60px;" value="${thanknames[0]}">
	${paird?`<input id="thanknames${num}2" style="width:60px;" type="text" value="${thanknames[1]}">`:""}
    <input type="submit" value="Ok">
    <input type="button" value="reset" onclick=sw.reset_talk(${num})>`
}

function make_talkinput_html(title,name,image,music,thankid,thanknames,num){
    paird=thanknames.length==2
    if (image===undefined) image="-"
    return `<form id="talk_form${num}" onsubmit="sw.submit_talk(${num})">
	${make_talkinput_html_iner(title,name,image,music,thankid,thanknames,num,paird)}
	</form><br>`
}
function format_json(str){
    res=""
    indent=0
    in_str=0
    for (i=0; i!=str.length;++i){
	if (str[i]=='"') in_str=1-in_str
	if (str[i]=='}' && !in_str){
	    --indent
	    res+="\n"
	    for (j=0; j!=indent;++j) res+="  "
	}
	res+=str[i]
	if (in_str) continue
	if (str[i]==':')res+=" "
	if (str[i]=='{'){
	    ++indent
	    res+="\n"
	    for (j=0; j!=indent;++j) res+="  "
	}
	if (str[i]==','){
	    res+="\n"
	    for (j=0; j!=indent;++j) res+="  "
	}
    }
    return res;
}
function submit_talk(num){
    image=document.getElementById(`image${num}`).value
    music=document.getElementById(`music${num}`).value
    try{
	if (image!="-")
	    fs.accessSync(path.join(config.images_dir,image))
	if (music!="-")
	    fs.accessSync(path.join(config.talkmusic_dir,music))
    }catch(err){
	alert(`Hibás a kép vagy a zene filenév győződj meg hogy a "${config.images_dir}" illetve a "${config.talkmusic_dir}" mappában vannak ('-' jelzi hogy nincs)`)
        return false;
    }
    talks[num].title=document.getElementById(`title${num}`).value
    paird=document.getElementById(`paird${num}`).checked
    talks[num].name=document.getElementById(`name${num}`).value
    talks[num].image=document.getElementById(`image${num}`).value
    talks[num].music=document.getElementById(`music${num}`).value
    talks[num].thanks.id=document.getElementById(`thankid${num}`).value
    talks[num].thanks.names=[document.getElementById(`thanknames${num}1`).value]
    if (paird){
	talks[num].thanks.names.push(document.getElementById(`thanknames${num}2`).value)
    }
    json_new=format_json(JSON.stringify(talks))
    fs.writeFileSync(config.talks_path,json_new);
    refreshdb()
    return true;
}
function reset_talk(num){
    t=talks[num]
    document.getElementById(`talk_form${num}`).innerHTML=
	make_talkinput_html_iner(t.title,t.name,t.image,t.music,t.thanks.id,t.thanks.names,num)
}
function refresh_talk(num){
    //talks = require(config.talks_path)
    try{
    paird=document.getElementById(`paird${num}`).checked
    t=talks[num]
    document.getElementById(`talk_form${num}`).innerHTML=
	make_talkinput_html_iner(t.title,t.name,t.image,t.music,t.thanks.id,t.thanks.names,num,paird)
    }catch(error){
	process.stdout.write(error.message+"\n"+num+"\n")
    }
}
function make_talk_inputs(){
    //talks = require(config.talks_path)
    res=""
    for (i=0; i!=talks.length;++i){
	t=talks[i]
	res+=make_talkinput_html(t.title,t.name,t.image,t.music,t.thanks.id,t.thanks.names,i)
    }
    document.getElementById("talklist").innerHTML=res
}
function init(){
    make_talk_inputs()
    showSongorderList()
    makeQR(''+ip+':'+config.port)
    document.getElementById('adresslabel').innerHTML="csatlakozz a "+ip+(config.port==80?"":":"+config.port)+" címhez a 'távirányító' telefon(ok)kal"
    makeconnect()
}
//init()

module.exports={init,refreshdb,songordercall,importcall,newsongorder,makeplaces,reset_talk,refresh_talk,submit_talk}
