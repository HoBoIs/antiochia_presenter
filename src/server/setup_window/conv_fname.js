
function conv_fname(name){
  outname=name.toLowerCase();
  outname=outname.replace(/\.xml/gi,"")
  outname=outname.replace(/\.txt/gi,"")
  outname=outname.replace(/.*\//gi,"")// elérési út törlése. windowd alatt lehet hogy ".*\\"-re kell cserélni a ".*/"-t 
  outname=outname.replace(/\s_\s/gi,"(")
  outname=outname.replace(/1-2/gi,"1+2")
  outname=outname.replace(/\s/gi,"_")
  outname=outname.replace(/é/gi,"e")
  outname=outname.replace(/í/gi,"i")
  outname=outname.replace(/á/gi,"a")
  outname=outname.replace(/[öőó]/gi,"o")
  outname=outname.replace(/[űúü]/gi,"u")
  outname=outname.replace(/_\([^\(]*\)-*1*$/gi,"")//utolsó zárójel törlése. az openlp exportálása miatt (ott az a kiadó, ez nem alternatíz cím)
  outname=outname.replace(/_*\)_*/gi,"")
  outname=outname.replace(/_*\(_*/gi,"(")
  outname=outname.replace(/-.*/gi,"")
  outname=outname.replace(/[,!\.]/gi,"")
  outname=outname.replace(/_*$/gi,"")
  outname=outname.replace(/__*/gi,"_")
  outname=outname.replace(/^_*/gi,"")

  outnames=outname.split('(')//alternatív címek (pl.: "antiochia_dal(gyere_gyere)"->["antiochia_dal","gyere_gyere"]) hogy bármeiken meg lehessen majd találni
  if (outnames[0]=="koszonjuk"){
    outnames=[outname]// a köszönjük utáni zárójel nem alternatív cím
  }
  ol=[]
  outnames.forEach( f => ol.push(f+".js"))
  return ol
}
module.exports={conv_fname}
