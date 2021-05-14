
cfn=require('./conv_fname')
const fs = require('fs') 
const path = require('path')
config=require('../config')
const folder = config.song_dir

function getsongorder(lines){
  fails=[]
  keys=[]
  fnames={}
  titles={}
  fs.readdirSync(folder).forEach((file)=> {
    try{
      tmp=require(path.join(folder,file)).titles
      for (j=0;j<tmp.length;++j){
	keys.push(tmp[j].toLowerCase().replace(/[\s,]*/gi,""))
	fnames[tmp[j].toLowerCase().replace(/[\s,]*/gi,"")]=file
	titles[tmp[j].toLowerCase().replace(/[\s,]*/gi,"")]=tmp[j]
      }
    }catch(error){
      process.stdout.write(path.join(folder,line)+"\n")
      process.stdout.write(error.message+"\n")
    }
  })
  keys=keys.sort()
  goodlines=[]
  for (j=0;j!=lines.length;j++){
    line=lines[j].toLowerCase().replace(/[\s,]*/gi,"")
    if (line==""){continue;}
    try{
      filekeys=keys.filter((k)=>/*k.startsWith(line)||*/line.startsWith(k))
      filekey=filekeys[0]
      filekeys.forEach((f)=>{
        if (f.length>filekey.length) {filekey=f}
      })
      if (fs.existsSync(path.join(config.song_dir,fnames[filekey]))){
	lines[j]=titles[filekey]
      }else{
	process.stdout.write(fnames[filekey]+"\n"+path.join(config.song_dir,fnames[filekey])+"\n")
	fails.push(lines[j]+" line "+(j+1))
      }
    }catch(error){
      fails.push(lines[j]+" line "+(j+1))
    }
  }
  return fails;
}

function songorder(begin,end,lines){
  //var lines=[]
  /*fs.readFile('songlist.txt', (err, data) => { 
    lines=data.toString().split('\n'); 
  })*/
  fs.readdirSync(folder).forEach((filename)=> {
    if ('0'<=filename[0] && filename[0]<='9'){
      try{
	fs.unlink(path.join(folder,filename))
      }catch(err){
	process.stdout.write(err.message+'\n')
	throw err
      }
    }
  })
  i=1
  fails=[]
  keys=[]
  titles={}
  fs.readdirSync(folder).forEach((file)=> {
    try{
      tmp=require(path.join(folder,file)).titles
      for (j=0;j<tmp.length;++j){
	keys.push(tmp[j].toLowerCase().replace(/[\s,]*/gi,""))
	titles[tmp[j].toLowerCase().replace(/[\s,]*/gi,"")]=path.join(folder,file)
      }
    }catch(error){
      process.stdout.write(file+"\n")
      //tmp=require(path.join(folder,file)).titles
      process.stdout.write(error.message+" "+'\n')
    }
  })
  keys=keys.sort()
  goodlines=[]
  for (j=begin-1;j!=end;j++){
    line=lines[j].toLowerCase().replace(/[\s,]*/gi,""/*{*/).replace(/.*}/,"")
    if (line==""){continue;}
    comment=""
    if (lines[j][0]=='{') {
	comment=lines[j].replace(/<br\/>.*/,"").replace("{","")//}
	process.stdout.write(comment+"#\n")
    }
//if (line[0]=="#"){continue;}
    try{
      filekeys=keys.filter((k)=>/*k.startsWith(line)||*/line.startsWith(k))
      filekey=filekeys[0]
      filekeys.forEach((f)=>{
        if (f.length>filekey.length) {filekey=f}
      })
      //longname=path.join(folder,filename)
      if (fs.existsSync(titles[filekey])){
	goodlines.push([titles[filekey],path.join(folder,(i+'').padStart(3,'0')+line+comment+".js")])
      }else{
	fails.push(lines[j])
      }
    }catch(error){
      process.stdout.write(error.message()+'\n')
      fails.push(lines[j])
    }
    i++
  }
  if (fails.length==0){
    goodlines.forEach( (ln)=>{
      fs.linkSync(ln[0],ln[1])
    })
  }
  process.stdout.write(fails+'\n')
  return fails;
}
module.exports={songorder,getsongorder}
