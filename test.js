audiocc_init = require('./init.js');

audiocc_init.init('test3');

var play = function play(){
    console.log("hello");
    console.log("hello again");
    console.log("hello again");
    console.log("hello again");
    console.log("hello again");
    console.log("hello again");
}

var interval = setInterval(play,1000)

setTimeout(()=>{process.exit(1)},10000);