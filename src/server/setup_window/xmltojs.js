Object.defineProperty(Array.prototype, 'flat', {
  value: function() {
    return this.reduce(function (flat, toFlatten) {
      return flat.concat(toFlatten);
      }, []);
    }
});

cfn=require('./conv_fname')
const fs = require('fs') 
const path = require('path')
config=require('../config')
function replu(match, p1, offset, string){
  return "<u>"+p1+"</u>"
}
function repli(match, p1, offset, string){
  return "<i>"+p1+"</i>"
}
function single_file(fname){
  theader="    titles: ["
  verseskeys={}
  versesvals=[]
  verseOrder=[]
  titles=[]
  let lines=[]
  lines=fs.readFileSync(fname).toString().split('\n')
  outfn=path.join(config.song_dir,cfn.conv_fname(fname)[0])
  data="module.exports = {\n"+theader
  lines.forEach((line)=>{
    line=line.replace(/\s\s\s*/gi,"")
    line=line.replace("`","'")
    line=line.replace("\n","")
    line=line.replace(/<tag name="it">([^<]*)<\/tag>/gi,repli)//formázás
    line=line.replace(/<tag name="u">([^<]*)<\/tag>/gi,replu)//formázás
    if (line.includes( "<title>")){
    	titles.push(line.replace(/- Antis/gi,"").
			replace(/<[\/]*title>/gi,"").
			split(/[^a-zA-zÉéÁáŐőÚúŰűÓóÜüÖöÍí0-9, \.]/))/**/
    }
    if (line.includes("<verse name")){
    	versename=line.replace(/.*="/,"").replace(/".*/,"")
    }
    if (line.includes("<verseOrder>")){
    	//verseOrder=line).split(" ".replace(/</*verseOrder>/gi,"") 
	verseOrder=line.replace(/<[\/]*verseOrder>/gi,"").split(" ") 
	
    }
    if (line.includes("<lines>")){
    	line="`"+line.replace(/<[\/]*lines>/gi,"")+"\n` ,"
        verseskeys[versename]=versesvals.length
    	versesvals.push(line.replace(/<br\/>/gi,"\n"))
    }
  })
  titles=titles.flat().filter((x)=>x.replace(/[0-9,]/,"").length>2).map((x)=>"`"+x+"`")
  if (titles.length==0){
    process.stdout.write(fname+"has no valid title\n")
  }
  data+=titles
  //data=data.slice(0, -1)
  data+="],\n    sections: [\n"
  if (verseOrder.length==0){
    versesvals.forEach((vers)=> data+=vers) 
  }else{
    verseOrder.forEach((versenm)=>{data+=versesvals[verseskeys[versenm]]})
  }
  data=data.slice(0, -1)
  data+="\n    ]\n}\n"
  fs.writeFileSync(outfn, data)
}

function xmltojs(fname){
  if(fs.lstatSync(fname).isDirectory()){
    fs.readdirSync(fname).forEach((filename)=> {
      single_file(path.join(fname,filename))
    })
  }else{
    single_file(fname)
  }
}
module.exports={xmltojs}
