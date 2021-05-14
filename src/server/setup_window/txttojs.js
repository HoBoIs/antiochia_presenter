cfn=require('./conv_fname')
const fs = require('fs') 
const path = require('path')
config=require('../config')

function single_file(fname){
  lines=fs.readFileSync(fname).toString().split('\n')
  outfn=path.join(config.song_dir,cfn.conv_fname(fname)[0])
  data="module.exports = {\n"
  data+="    titles: [`"+ lines[0].replace("\n","").replace("|","`,`")+"`],\n"
  data+=("    sections: [\n")
  data+=("`\n")
  let i;
  for (i=2; i<lines.length;++i){
    line=lines[i].replace(/\s*$/,"")
    if (line==""){
      data+="`,`\n"
    }else{
      data+=line+"\n"
    }
  }
  lastline=lines[i-1].replace(/\s*$/,"")
  if (lastline!=""){
      data+="`,`\n"
  }
  data=data.slice(0,-2)
  data+=("\n    ]\n")
  data+=("}\n")
  fs.writeFile(outfn, data, (err) => {       
    if (err) throw err; 
  }) 
}

function txttojs(fname){
  if(fs.lstatSync(fname).isDirectory()){
    fs.readdirSync(fname).forEach((filename)=> {
      single_file(path.join(fname,filename))
    })
  }else{
    single_file(fname)
  }
}
module.exports={txttojs}
