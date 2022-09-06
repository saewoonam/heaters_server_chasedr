const polka = require('polka');
const hph = require('./hph');
const cors = require('cors')({origin:true});

const app = polka()
// const port = '/dev/tty.usbmodem21101';
// const port = '/dev/tty.usbmodem1401';
const port = process.env.SERIAL //|| '/dev/tty.usbmodem1401'
console.log('serial port: ', port)
const get_dict = {
    'current':"I?",
    'monitor':"mon?",
};

app
  .use(cors)
  .get('/hph/:ch/get/:command', async (req, res) => {
        ch = req.params['ch'];
        cmd = req.params['command'];
        if (get_dict[cmd]===undefined) {
            res.end('Unknown command');
        } else {
            const cmd_to_send = `${get_dict[cmd]} ${ch}\n`
            // console.log(ch, cmd, cmd_to_send);
            // let current = await hph.query(port, get_dict[cmd])
            let current = await hph.query(port, cmd_to_send)
            res.end(JSON.stringify(current));
        } 
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
    // console.log('query', JSON.stringify(req.query));
    // console.log("i" in req.query);
        ch = req.params['ch'];
        let cmd = `reset ${ch}\n`;
        console.log('reset');
        response = await hph.write(port, cmd)
        // console.log(response);
        res.end(JSON.stringify(response))
    })
  .get('/hph/:ch/set/current', async(req, res) => {
    // console.log('query', JSON.stringify(req.query));
    // console.log("i" in req.query);
    if ("i" in req.query) {
        ch = req.params['ch'];
        let cmd = 'I '+ ch + ' '+ req.query["i"] + '\n';
        console.log(`set current ${req.query["i"]}`);
        response = await hph.write(port, cmd)
        // console.log(response);
    } else {
        response = "no i to set";
        }
    res.end(JSON.stringify(response))
    // res.end(`${response}`);
  })
  .get('/lph/:ch/set/current', async(req, res) => {
    // console.log('query', JSON.stringify(req.query));
    // console.log("i" in req.query);
    if ("i" in req.query) {
        ch = req.params['ch'];
        let cmd = 'LPH '+ ch + ' '+ req.query["i"] + '\n';
        console.log(`set channel ${ch} lph current ${req.query["i"]}`);
        response = await hph.write(port, cmd)
        // console.log(response);
    } else {
        response = "no i to set";
        }
    res.end(JSON.stringify(response))
    // res.end(`${response}`);
  })
  .get('/lph/:ch/get/current', async (req, res) => {
        ch = req.params['ch'];
        cmd = req.params['command'];
        const cmd_to_send = `LPH? ${ch}\n`
        let current = await hph.query(port, cmd_to_send)
        res.end(JSON.stringify(current));
    })

let server_port = process.env.PORT || 3200
app.listen(server_port, () => {
    console.log(`> Running on localhost:${server_port}`);
  });

