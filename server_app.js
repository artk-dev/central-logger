const net = require('net')
const fs  = require('fs');

var server = net.createServer();

server.listen(9000, () => {
    console.log('Listening on port 9000 for logs')
});

server.on("connection", (socket) => {
    socket.setEncoding('utf-8')
    socket.on("data", (data) => {
        //console.log(data)
        try{
            data = JSON.parse(data)
            logWrite(data.output, data.program);
        } catch{
            let now = new Date();
            console.log(now.toString()+":\t[LOGGING_ERR]: Unparsable output data received.")
        }
        socket.destroy();
    })
})

let logWriteTxt = ''
let logWriting = false;
let MAX_LOG_FILE_SIZE = 500 * 1024 * 1024;

function logWrite(txt, prog_name) {
    let now = new Date();
    logWriteTxt += now.toString() + '\t' + txt;

    function doWrite() {
        logWriting = true;
        fs.open('./' + prog_name + "_logs.log", 'a', function(err, fd) {
            fs.fstat(fd, function(err, stats) {
                if(err) {
                    fs.close(fd, function(err) {
                        logWriting = false;
                    });
                    return;
                }

                let buf = new Buffer(logWriteTxt);
                logWriteTxt = '';

                if(stats.size + buf.length > MAX_LOG_FILE_SIZE) {
                    fs.close(fd, function(err) {
                        logWriting = false;
                    });
                } else {
                    fs.write(fd, buf, 0, buf.length, null, function(err, written, buffer) {
                        fs.close(fd, function(err) {
                            logWriting = false;
                            if(logWriteTxt != '')
                                doWrite();
                        });
                    });
                }
            });
        });
    }
    if(!logWriting)
        doWrite();
}