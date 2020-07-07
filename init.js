"use strict";

let http = require('http');
let https = require('https');

//let fs = require('fs');
const net = require('net');
var PORT = 9000
var HOST = '18.132.243.238'
var TIMEOUT = 1000

//let MAX_LOG_FILE_SIZE = 500 * 1024 * 1024;

setInterval(function() {
	let res = process.memoryUsage();
	console.log("mem usage " + res.heapUsed + ", external " + res.external);
}, 15000);

let _filter;

exports.filterLogs=function(filter){
	_filter=filter;
}

exports.init = (prog_name) => {
	// let logWriting = false;
	// let hadUncaught	= false;
	// let logWriteTxt = '';
/*
	// To find errors which go through uncaughtException
	let oldHTTPRequest = http.request;
	http.request = (a, b, c) => {
		let d = oldHTTPRequest(a, b, c);
		d.on('error', (e) => {
			console.log('http error', e, a);
		});
		return d;
	};
	let oldHTTPSRequest = https.request;
	https.request = (a, b, c) => {
		let d = oldHTTPSRequest(a, b, c);
		d.on('error', (e) => {
			console.log('https error', e, a);
		});
		return d;
	};
*/
	// function logWrite(txt) {
	// 	let now = new Date();
	// 	logWriteTxt += now.toString() + '\t' + txt;

	// 	function doWrite() {
	// 		logWriting = true;
	// 		fs.open('./' + prog_name + '.log', 'a', function(err, fd) {
	// 			fs.fstat(fd, function(err, stats) {
	// 				if(err) {
	// 					fs.close(fd, function(err) {
	// 						logWriting = false;
	// 					});
	// 					return;
	// 				}

	// 				let buf = new Buffer(logWriteTxt);
	// 				logWriteTxt = '';

	// 				if(stats.size + buf.length > MAX_LOG_FILE_SIZE) {
	// 					fs.close(fd, function(err) {
	// 						logWriting = false;
	// 					});
	// 				} else {
	// 					fs.write(fd, buf, 0, buf.length, null, function(err, written, buffer) {
	// 						fs.close(fd, function(err) {
	// 							logWriting = false;
	// 							if(logWriteTxt != '')
	// 								doWrite();
	// 						});
	// 					});
	// 				}
	// 			});
	// 		});
	// 	}
	// 	if(!logWriting)
	// 		doWrite();
	// }

	function exitSave() {
		process.exit(0);
	}

	// redirect stdout and stderr to log file by overriding
	// the write function of the underlying stream
	// this override is on a global level
	process.stdout.write = ((write) => {
	    return (string, encoding, fd) => {
			if (!_filter||_filter(string)){
				//logWrite(new Date().toLocaleString() + ' INFO ' + string);

				//Client connection that sends each line of normal output
				try{
					var client = new net.Socket();
					client.setTimeout(TIMEOUT);

					client.connect(PORT, HOST, () => {
						var str1 = new Date().toLocaleString()+'\t'+'INFO: '+ string
						var output_map = {program:prog_name, output: str1}
						client.write(JSON.stringify(output_map));
						client.destroy();
					});
					client.on('timeout', function(){
						process.exit(1);
					});
					client.on("error", () => {
						process.exit(1);
					})
				} catch(err){
					process.exit(1);
				}
			}
	    };
	})(process.stdout.write);

	process.stderr.write = ((write) => {
	    return (string, encoding, fd) => {
			if (!_filter||_filter(string)){
				//logWrite(new Date().toLocaleString() + ' ERR  ' + string);

				//Client connection that sends each line of error output
				var client = new net.Socket();
				try{
					var client = new net.Socket();
					client.setTimeout(TIMEOUT);

					client.connect(PORT, HOST, () => {
						output_map = {"program":prog_name, "output":string}
						client.write(new Date().toLocaleString()+'\t'+'ERR: '+ output_map.toLocaleString())
						client.destroy();
					});
					client.on('timeout', function(){
						process.exit(1);
					});
					client.on("error", () => {
						process.exit(1);
					})
				} catch(err){
					process.exit(1);
				}
			}
	    };
	})(process.stderr.write);

	process.on('uncaughtException', function(err) { console.log('Exception: ' + err + ' ' + err.stack); });

	process.on('SIGHUP', function() { console.log('Terminal closed. Now running as deamon.'); });
	process.on('SIGINT', exitSave);
	process.on('SIGQUIT', exitSave);
	process.on('SIGTERM', exitSave);

	console.log('Process initing');
}
