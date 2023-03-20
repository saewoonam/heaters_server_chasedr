// const polka = require('polka');
const fastify = require('fastify')
const hph = require('./hph');
// const cors = require('cors')({origin:true});
const cors = require('@fastify/cors');

// const app = polka()
const app = fastify({ logger: true })
const setcors = async () => {
  try {
      await app.register(cors, {
          origin:true
      });
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
setcors()

// const port = '/dev/tty.usbmodem21101';
// const port = '/dev/tty.usbmodem1401';
const port = process.env.SERIAL //|| '/dev/tty.usbmodem1401'
console.log('serial port: ', port)
const get_dict = {
    'current':"I?",
    'monitor':"mon?",
    'enabled':"EN?"
};
const wait = delay => new Promise(resolve => setTimeout(resolve, delay));
var busy = false;

function lock() {
    busy = true;
}
function unlock() {
    busy = false;
}

async function wait_not_busy() {
    var counter = 0;
    while (busy || (counter==5)) {
        console.log('busy wait 1 second, counter', counter);
        await wait(1000)
        counter++;
    }
    console.log('wait_not_busy counter', counter);
}

app
  .get('/hph/:ch/get/:command', async (req, res) => {
        wait_not_busy();
        lock()
        ch = req.params['ch'];
        cmd = req.params['command'];
        if (get_dict[cmd]===undefined) {
            res.end('Unknown command');
        } else {
            const cmd_to_send = `${get_dict[cmd]} ${ch}\n`
            // console.log(ch, cmd, cmd_to_send);
            // let current = await hph.query(port, get_dict[cmd])
            var current;
            try {
                current = await hph.query(port, cmd_to_send)
            } catch(error) {
                console.log('caught error at /hph/:ch/get/:command/', error);
                current = {'code':'failed'};
            }
            res.send(JSON.stringify(current));
        } 
        unlock();
    })
    /*
  .get('/get/current', async (req, res) => {
        console.log('get current');
        let current = await hph.query(port, 'I?\n')
        res.end(JSON.stringify(current));
    })
  .get('/get/monitor', async (req, res) => {
        console.log('get current');
        let current = await hph.query(port, 'mon?\n')
        res.end(JSON.stringify(current));
    })
    */
  .get('/hph/:ch/reset', async(req, res) => {
        ch = req.params['ch'];
        let cmd = `reset ${ch}\n`;
        console.log('reset');
        response = await hph.write(port, cmd)
        // console.log(response);
        res.send(JSON.stringify(response))
    })
  .get('/hph/:ch/set/current', async(req, res) => {
    if ("i" in req.query) {
        ch = req.params['ch'];
        let cmd = 'I '+ ch + ' '+ req.query["i"] + '\n';
        console.log(`set current ${req.query["i"]}`);
        response = await hph.write(port, cmd)
        // console.log(response);
    } else {
        response = "no i to set";
        }
    res.send(JSON.stringify(response))
    // res.end(`${response}`);
  })
  .get('/hph/:ch/set/enabled', async(req, res) => {
   if ("value" in req.query) {
        ch = req.params['ch'];
        let cmd = 'EN '+ ch + ' '+ req.query["value"] + '\n';
        console.log(`enable ${ch} ${req.query["value"]}`);
        response = await hph.write(port, cmd)
        // console.log(response);
    } else {
        response = "no i to set";
        }
    res.send(JSON.stringify(response))
    // res.end(`${response}`);
  })
  .get('/lph/:ch/set/current', async(req, res) => {
    if ("i" in req.query) {
        ch = req.params['ch'];
        let cmd = 'LPH '+ ch + ' '+ req.query["i"] + '\n';
        console.log(`set channel ${ch} lph current ${req.query["i"]}`);
        response = await hph.write(port, cmd)
        // console.log(response);
    } else {
        response = "no i to set";
        }
    res.send(JSON.stringify(response))
    // res.end(`${response}`);
  })
  .get('/lph/:ch/get/current', async (req, res) => {
        wait_not_busy();
        lock();
        ch = req.params['ch'];
        cmd = req.params['command'];
        const cmd_to_send = `LPH? ${ch}\n`
        let current = await hph.query(port, cmd_to_send)
        res.send(JSON.stringify(current));
        unlock();
    })
  .get('/query/state', async (req, res) => {
        wait_not_busy();
        lock();
        var results = {};
        var cmd_to_send;
        for (let ch=0; ch<4; ch++) {
            // const cmd_to_send = `LPH? ${ch+1}\n`
            // const cmd_to_send = `I? ${ch}\n`
            // const cmd_to_send = `EN? ${ch}\n`
            cmd_to_send = `MON? ${ch}\n`
            var ch_result = await hph.query(port, cmd_to_send);
            if ('error' in ch_result) {
                console.log('index.js error in query')
            }
            const ch_name = Object.keys(ch_result)[0]
            cmd_to_send = `I? ${ch}\n`
            ch_result[ch_name]['dac'] = await hph.query(port, cmd_to_send);
            cmd_to_send = `EN? ${ch}\n`
            ch_result[ch_name]['EN'] = await hph.query(port, cmd_to_send);
            // results = Object.assign({}, results, ch_result)
            var flat_dict = {}
            for (const key in ch_result[ch_name]) {
                // console.log(ch_name, 'key', key, ch_result[ch_name][key])
                flat_dict[(ch_name+'_'+key).toUpperCase()] = ch_result[ch_name][key]
            }
            results = Object.assign({}, results, flat_dict)
            // console.log(flat_dict)
        }
        for (let ch=0; ch<5; ch++) {
            cmd_to_send = `LPH? ${ch+1}\n`
            var ch_result = await hph.query(port, cmd_to_send);
            results = Object.assign({}, results, ch_result)
        }
        console.log(results);
        res.send(JSON.stringify(results));
        unlock();
    })

let server_port = process.env.PORT || 3300
/*
app.listen(server_port, () => {
    console.log(`> Running on localhost:${server_port}`);
  });
*/
const start = async () => {
  try {
    await app.listen({ port: server_port, host:"::" })
  } catch (err) {
    app.log.error(err)
    process.exit(1)
  }
}
start()
