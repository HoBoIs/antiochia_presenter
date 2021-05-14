cfn=require('./conv_fname')
const fs = require('fs') 
const path = require('path')
const ttjs=require('./txttojs')
const xtjs=require('./xmltojs')

function single_file(fname){
  if (fname.includes('.txt')){
    ttjs.txttojs(fname)
  } else if(fname.includes('.xml')){
    xtjs.xmltojs(fname)
  } else {
    //Dict or Unknown
  }
}

function importsong(fname){
  if(fs.lstatSync(fname).isDirectory()){
    fs.readdirSync(fname).forEach((filename)=> {
      importsong(path.join(fname,filename))
    })
  }else{
    try{
    single_file(fname)
    }catch(err){
      process.stdout.write(err.message+"\n")
    }
  }
}

module.exports={importsong}
