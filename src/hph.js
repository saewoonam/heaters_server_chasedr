const {autoDetect} = require('@serialport/bindings-cpp')
// import {autoDetect} from '@serialport/bindings-cpp'
// const fs = require('fs')

const Bindings = autoDetect()

async function write(port_path, msg_string) {
    msg = new Buffer.from(msg_string, 'utf8')    // console.log(query)
    let port = await open(port_path);
    if (typeof(port)=='string') {
        // console.log('failed to open port');
        return port
    }
    // let port = await Bindings.open({path:port_path, baudRate:9600});
    await port.write(msg)
    line = await readline(port);
    await port.close();
    return line;
}

async function readline(port ) {
    response = new Buffer.alloc(255);
    var len = 0
    var result
    do {  // read until we get \r\n after len>7
        // console.log('try to read');
        result = await port.read(response, len, 255-len)
        len += result.bytesRead
        // console.log('result', result);
        // console.log(JSON.stringify(response.slice(0, len).toString()));
        // console.log(response.slice(0, len).toString().endsWith('\r\n'), len<=query.length);
    } while (!(response.slice(0, len).toString().endsWith('\r\n')) );
    response = response.slice(0, len).toString()
    response = response.trim().split('\r\n')[0]
    // console.log(response)
    // console.log('replace', response.replaceAll("'", '"'))
    response = response.replaceAll("'", '"')
    // console.log(response)
    response = JSON.parse(response)
    // console.log(response)
    // console.log('response', response);
    return response; 
}
async function open(port_path) {
    let port;
    try {
        port = await Bindings.open({path:port_path, baudRate:9600});
    } catch (e) {
        console.error(e);
        // console.log('error', e.toString(), typeof(e));
        response = e.toString();
        return response
    } finally {
        // console.log('open cleanup');
    }
    return port;
}
async function query(port_path, query_string) {
    // await Bindings.list().then(res=>console.log(res))
    // console.log('readDiodes/main');
    query = new Buffer.from(query_string, 'utf8')    // console.log(query)
    // console.log(query.length);
    response = new Buffer.alloc(255);
    let port = await open(port_path);
    if (typeof(port)=='string') {
        // console.log('failed to open port');
        return port
    }
    /*
    try {
        port = await Bindings.open({path:port_path, baudRate:9600});
    } catch (e) {
        console.error(e);
        // console.log('error', e.toString(), typeof(e));
        response = e.toString();
        return response
    } finally {
        // console.log('open cleanup');
    }
    */
    // console.log('isOpen', port.isOpen)
    await port.write(query)
    // console.log('finished writing query');
    var len = 0
    var result
    do {  // read until we get \r\n after len>7
        // console.log('try to read');
        result = await port.read(response, len, 255-len)
        len += result.bytesRead
        // console.log('result', result);
        // console.log(JSON.stringify(response.slice(0, len).toString()));
        // console.log(response.slice(0, len).toString().endsWith('\r\n'), len<=query.length);
    } while (!(response.slice(0, len).toString().endsWith('\r\n')) );
    response = response.slice(0, len).toString()
    response = response.trim().split('\r\n')[0]
    // console.log(response)
    // console.log('replace', response.replaceAll("'", '"'))
    response = response.replaceAll("'", '"')
    // console.log(response)
    response = JSON.parse(response)
    // console.log(response)
    await port.close();
    // console.log('response', response);
    return response; 

}
// main('/dev/ttyACM0')
// main('/dev/ttyUSB0')
// main('/dev/tty.usbmodem21101')
exports.query = query;
exports.write = write;
// query('/dev/tty.usbmodem21101', 'I?\n');
// write('/dev/tty.usbmodem21101', 'I 10\n');
