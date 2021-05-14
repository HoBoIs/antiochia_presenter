var WebSocket = require('ws')
client = new WebSocket('ws://157.181.200.232:8000')
function foo(){
    setTimeout(()=>{try{
      client.send("NEXT:")
    }catch(error){
      process.stdout.write(error.message+"\n")
    }foo()},500)
}
foo();
