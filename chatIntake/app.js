var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var password = require('./secret');
const commands = require('./minecraftCommands');
var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
const childProcess = require('child_process');

var viewProcess = childProcess.exec('cd ../chatintakeview/ && npm start');
var controlProcess = childProcess.exec('cd ../chatintakecontroller/ && npm start');
var http = require('http');
const httpProxy = require("http-proxy");

var proxy_controller = new httpProxy.createServer({
  target: "http://localhost:3001/",
  secure: false,
});

var proxy_view = new httpProxy.createServer({
  target: "http://localhost:3000/",
  secure: false,
});
const ec2IP = "44.200.228.205";
http.createServer(  
    {
    //   key: fs.readFileSync("server.key"),
    //   cert: fs.readFileSync("server.cert"),
    //   ca: fs.readFileSync("serverCA.pem"),
    },
    function (req, res) {
      try {
        if (req.headers.host === ec2IP) {
          if(req.url.includes("/controller"))
          {
            proxy_controller.proxyRequest(req, res);
            proxy_controller.on("response", (remoteRes) => {
              res.writeHead(remoteRes.statusCode, remoteRes.headers);
              remoteRes.pipe(res);
            });
            proxy_controller.on("error", function (err, req, res) {
              if (err) console.log(err);
              res.writeHead(500);
              res.end("Oops, something went very wrong...");
            });
          } else {//either controller or view
          req.url = req.url.replace('/view', '/');
          proxy_view.proxyRequest(req, res);
          proxy_view.on("response", (remoteRes) => {
            res.writeHead(remoteRes.statusCode, remoteRes.headers);
            remoteRes.pipe(res);
          });
          proxy_view.on("error", function (err, req, res) {
            if (err) console.log(err);
            res.writeHead(500);
            res.end("Oops, something went very wrong...");
          });
         }
        } 
        // else if (req.headers.host === "SUBDOMAIN.DOMAIN.COM") {
        //   proxy_view.proxyRequest(req, res);
        //   proxy_view.on("response", (remoteRes) => {
        //     res.writeHead(remoteRes.statusCode, remoteRes.headers);
        //     remoteRes.pipe(res);
        //   });
        //   proxy_view.on("error", function (err, req, res) {
        //     if (err) console.log(err);
        //     res.writeHead(500);
        //     res.end("Oops, something went very wrong...");
        //   });
        // }
      } catch (error) {
          console.log(error)
      }
    }
)
.listen(80, function () {
    console.log("App is running on the port", 80);
});

var minecraftServerProcess = childProcess.spawn('java', [
    '-Xmx1024M',
    '-Xms1024M',
    '-jar',
    'server.jar',
    'nogui'
]);
// Log server output to stdout
let ws;
let log = function(data) {
    let output = data.toString();
    if(output.includes("[Server thread/INFO]: yman234 has the following entity data:")){
        let pos = output.slice(73,output.length-3);
        console.log(pos);
        pos = pos.split(",");
        console.log(pos);
        let posX = pos[0].trim();
        let posY = pos[1].trim();
        let posZ = pos[2].trim();
        console.log("position [x,y,z]", [posX,posY,posZ]);
        posX = Math.round(parseInt(posX.slice(0,posX.length-1)));
        posY = Math.round(parseInt(posY.slice(0,posY.length-1)));
        posZ = Math.round(parseInt(posZ.slice(0,posZ.length-1)));

        if(ws){
            ws.sendUTF(JSON.stringify({
                type: "positionView",
                posX: posX,
                posY: posY,
                posZ: posZ,
            }));
        }
    }else {
        process.stdout.write(output);
    }
}
minecraftServerProcess.stdout.on('data', log);
minecraftServerProcess.stderr.on('data', log);

const oneTime = (command)=>{
    minecraftServerProcess.stdin.write(command);
}

//voting variables
let voters = [];
let votes = [0,0]
let selectedCommands = [];
let seconds = 5*60;
let autoRandom = false;

const runCommands = (command) => {
    console.log("running command", command);
    if(command.repeat){
        console.log("running repeat command", command);
        if(command.name === "Snowball Art"){
            oneTime(command.command);
            oneTime('give yman234 minecraft:snowball 32\n');
            setTimeout(function() { oneTime('/fill 5 63 1 5 63 1 minecraft:air\n')},1000*60*5);//consider saying when its over in game
        }else if(command.name === "Ride Snowball"){
            oneTime(command.command);
            oneTime('give yman234 minecraft:snowball 32\n');
            setTimeout(function() { oneTime('/fill 2 63 1 2 63 1 minecraft:air\n')},1000*60*5);
        }else if(command.name === "Human Drill"){
            oneTime(command.command);
            setTimeout(function() { oneTime('/fill 4 63 1 4 63 1 minecraft:air\n')},1000*60*5);
        }else if(command.name === "Auto Bridge"){
            oneTime(command.command);
            setTimeout(function() { oneTime('/fill 3 63 1 3 63 1 minecraft:air\n')},1000*60*5);
        }
    }else if(command.hoard){
        let totalRuns = 100;
        for(let timesRan = 0; timesRan<totalRuns; timesRan++){
            if(timesRan< voters.length){
                for(let zombieToViewer = 0; zombieToViewer < totalRuns/voters.length ; zombieToViewer++){
                    oneTime(`/execute at yman234 run summon ${command.command} ^${Math.floor(Math.random()*7)} ^2 ^${Math.floor(Math.random()*7)} {CustomName:'{"text":"${voters[timesRan]}"}'}\n`);
                    totalRuns--;
                }
            }else{
                oneTime(`/execute at yman234 run summon ${command.command} ^${Math.floor(Math.random()*7)} ^2 ^${Math.floor(Math.random()*7)} {CustomName:'{"text":"ybotman"}'}\n`);
            }
        }
    }else if(command.special){
        //figure out which special case it is
        
        if(command.name === "Full Armor"){
            oneTime('/give @p minecraft:netherite_helmet{Enchantments:[{id:protection,lvl:255},{id:thorns,lvl:255},{id:unbreaking,lvl:255}]}\n');
            oneTime('/give @p minecraft:netherite_chestplate{Enchantments:[{id:protection,lvl:255},{id:thorns,lvl:255},{id:mending,lvl:255},{id:unbreaking,lvl:255}]}\n');
            oneTime('/give @p minecraft:netherite_leggings{Enchantments:[{id:protection,lvl:255},{id:thorns,lvl:255},{id:mending,lvl:255},{id:unbreaking,lvl:255}]}\n');
            oneTime('/give @p minecraft:netherite_boots{Enchantments:[{id:protection,lvl:255},{id:thorns,lvl:255},{id:mending,lvl:255},{id:unbreaking,lvl:255}]}\n');
        }else if(command.name === "Iron Armor"){
            oneTime('/give @p minecraft:netherite_helmet{Enchantments:[{id:protection,lvl:255},{id:thorns,lvl:255},{id:unbreaking,lvl:255}]}\n');
            oneTime('/give @p minecraft:netherite_chestplate{Enchantments:[{id:protection,lvl:255},{id:thorns,lvl:255},{id:mending,lvl:255},{id:unbreaking,lvl:255}]}\n');
            oneTime('/give @p minecraft:netherite_leggings{Enchantments:[{id:protection,lvl:255},{id:thorns,lvl:255},{id:mending,lvl:255},{id:unbreaking,lvl:255}]}\n');
            oneTime('/give @p minecraft:netherite_boots{Enchantments:[{id:protection,lvl:255},{id:thorns,lvl:255},{id:mending,lvl:255},{id:unbreaking,lvl:255}]}\n');
        }else if(command.name === "Bumpin Bow"){
            oneTime(command.command);
            oneTime("/give yman234 arrow 64\n");
        }else if(command.name === "Ok Bow"){
            oneTime(command.command);
            oneTime("/give yman234 arrow 64\n");
        }else if(command.name === "Pokey Bow"){
            oneTime(command.command);
            oneTime("/give yman234 arrow 64\n");
        }else if(command.name === "Tnt Chase"){
            oneTime(`/fill 6 63 3 6 63 3 minecraft:redstone_wire\n`);
            oneTime(command.command);
            setTimeout(function() { //remove redstone block
                oneTime('/fill 6 63 1 6 63 1 minecraft:air\n');
            },500);//consider saying when its over in game
            setTimeout(function() { //remove redstone wire
                oneTime(`/fill 6 63 3 6 63 3 minecraft:air\n`);
            },1000*60*1.5);//consider saying when its over in game
        }else {
            console.log("unexpected", command);
        }
    }else{
        oneTime(command.command);
        if(command.name === "Clear Items"){
            oneTime("/kill @e[type=item]\n");
        }
    }
}

//update position
let updateTimeout;
let updateCheck = false;
const updatePosition = () => {
    if(updateCheck){
        oneTime("/data get entity yman234 Pos\n");
        updateTimeout = setTimeout(()=>updatePosition() ,1000);//change to every 10 seconds
    }else if(updateTimeout){
        clearTimeout(updateTimeout);
    }
}


//specific minecraft commands
var app = express();

// app.use(logger('dev'));
// app.use(express.json());
// app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser());
// app.use(express.static(path.join(__dirname, 'public')));

// app.use('/', indexRouter);
// app.use('/users', usersRouter);




// app.use('/run', (req, res)=>{

//     // childProcess.exec("cd minecraft && java -Xmx1024M -Xms1024M -jar server.jar nogui", (error, stdout, stderr) => {
//     //     if (error) {
//     //         console.error(`exec error: ${error}`);
//     //         return;
//     //     }
//     //     console.log(`stdout: ${stdout}`);
//     //     console.error(`stderr: ${stderr}`);
//     //     res.send("success!");
//     // });
//     res.send("success!");
// });

// // catch 404 and forward to error handler
// app.use(function(req, res, next) {
//   next(createError(404));
// });

// // error handler
// app.use(function(err, req, res, next) {
//   // set locals, only providing error in development
//   res.locals.message = err.message;
//   res.locals.error = req.app.get('env') === 'development' ? err : {};

//   // render the error page
//   res.status(err.status || 500);
//   res.render('error');
// });

var WebSocketServer = require('websocket').server;
var server = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
server.listen(8080, function() {
    console.log((new Date()) + ' Server is listening on port 8080');
});

const voteServer = new WebSocketServer({
    httpServer: server,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
console.log("WebSocketServer Created:",voteServer);
function originIsAllowed(origin) {
    // put logic here to detect whether the specified origin is allowed.
    return true;
}
const random = require('random');
voteServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    connection = request.accept('echo-protocol', request.origin);
    ws = connection;
    console.log((new Date()) + ' Connection accepted.');
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            console.log('Received Message: ' + JSON.parse(message.utf8Data).mode);
            let messageData = JSON.parse(message.utf8Data);
            connection.sendUTF(message.utf8Data);
            if(messageData.mode && messageData.mode === "timeEnd"){
                runCommands(messageData.winner);
                console.log(autoRandom);
                if (autoRandom) {
                    //randomize commands
                    let max = commands.length-1;
                    let min = 0;
                    let raritySelect = Math.floor(Math.random() * (10 - 1 + 1) + 1);
                    let random1;
                    let random2;
                    let highRare = 14;
                    let lowRare = 10;
                    if(raritySelect > 7){//super rare
                        random1 = Math.floor(Math.random() * (max - (min+highRare) + 1) + min);
                        random2 = random.int(max, lowRare);
                    }else if(raritySelect > 4){//less rare
                        random1 = Math.floor(Math.random() * ((highRare-1) - (min+lowRare) + 1) + min);
                        random2 = random.int(highRare, lowRare);
                    }else{
                        random1 = Math.floor(Math.random() * ((lowRare-1) - min + 1) + min);
                        random2 = random.int(lowRare, min);
                    }
                    selectedCommands = [commands[random1],commands[random2]];
                    console.log("randomized new commands, updating ui");
                    voters = [];//empty voters to allow new votes in new poll
                    votes = [0,0];
                    ws.sendUTF(JSON.stringify({
                        type: "view",
                        selectedCommands:selectedCommands,
                        votes: votes,
                        voter: "",
                        seconds: seconds,
                        newDetails: true
                    }));
                }
            }
        }
        // else if (message.type === 'binary') {
        //     console.log('Received Binary Message of ' + message.binaryData.length + ' bytes');
        //     connection.sendBytes(message.binaryData);
        // }
        else{
            console.log("message not in expected format");
            connection.sendUTF("message not in expected format");
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

var commandServerHttp = http.createServer(function(request, response) {
    console.log((new Date()) + ' Received request for ' + request.url);
    response.writeHead(404);
    response.end();
});
commandServerHttp.listen(7070, function() {
    console.log((new Date()) + ' Server is listening on port 7070');
});

const commandServer = new WebSocketServer({
    httpServer: commandServerHttp,
    // You should not use autoAcceptConnections for production
    // applications, as it defeats all standard cross-origin protection
    // facilities built into the protocol and the browser.  You should
    // *always* verify the connection's origin and decide whether or not
    // to accept it.
    autoAcceptConnections: false
});
console.log("WebSocketServer Created:",commandServer);
let cws;
commandServer.on('request', function(request) {
    if (!originIsAllowed(request.origin)) {
      // Make sure we only accept requests from an allowed origin
      request.reject();
      console.log((new Date()) + ' Connection from origin ' + request.origin + ' rejected.');
      return;
    }
    
    connection = request.accept('echo-protocol', request.origin);
    cws = connection;
    console.log((new Date()) + ' Connection accepted.');
    
    connection.on('message', function(message) {
        if (message.type === 'utf8') {
            console.log('Received Message: ' + message.utf8Data);
            console.log('Received Message: ' + JSON.parse(message.utf8Data).mode);
            let messageData = JSON.parse(message.utf8Data);
            connection.sendUTF(message.utf8Data);
            if(messageData.mode && messageData.mode === "command"){
                selectedCommands = messageData.selectedCommands;
                seconds = messageData.seconds;
                console.log("received new commands, updating ui");
                voters = [];//empty voters to allow new votes in new poll
                votes = [0,0];
                ws.sendUTF(JSON.stringify({
                    type: "view",
                    selectedCommands:selectedCommands,
                    votes: votes,
                    voter: "",
                    seconds: seconds,
                    newDetails: true
                }));
            }
            else if(messageData.mode && messageData.mode === "requestCommands"){
                cws.sendUTF(JSON.stringify({type: "command",
                    commands: commands
                }));
            }else if(messageData.mode && messageData.mode === "autoRandom"){
                autoRandom = messageData.state;
                seconds = messageData.seconds;
            }else if(messageData.mode && messageData.mode === "updatePosition"){
                if(updateCheck !== messageData.state){//if the states are the same then this is meaningless
                    updateCheck = messageData.state;
                    updatePosition();
                }
            }else if(messageData.mode && messageData.mode === "avghans"){
                oneTime('/execute run tp yman234 9824 109 -57\n');
            }
        }
        else{
            console.log("message not in expected format");
            connection.sendUTF("message not in expected format");
        }
    });
    connection.on('close', function(reasonCode, description) {
        console.log((new Date()) + ' Peer ' + connection.remoteAddress + ' disconnected.');
    });
});

//voting system
const addVote = (vote, name)=>{ //expect votes in range [1,2]
    voters.push(name);
    votes[(vote-1)]++;
    //push votes to front end
    console.log("sending vote",[vote, name])
    ws.sendUTF(JSON.stringify({
      type: "view",
      selectedCommands:selectedCommands,
      votes: votes,
      voter: name,
      seconds: seconds,
      newDetails: false
    }));
}


const WebSocketClient = require('websocket').client;
const client = new WebSocketClient();
const channel = '#ymanishere';//'#ymanishere';  // Replace with your channel.
const account = 'ybotman';   // Replace with the account the bot runs as
const minecraftUsername = "yman234";

const gameRemindMessage = 'Get up and gameRemind, your body will thank you!';
const defaultGameRemindInterval = 1000 * 60 * 10; // Set to 10 minute for testing.
let gameRemindInterval = defaultGameRemindInterval;

client.on('connectFailed', function(error) {
    console.log('Connect Error: ' + error.toString());
});

client.on('connect', function(connection) {
    console.log('WebSocket Client Connected');

    // This is a simple bot that doesn't need the additional
    // Twitch IRC capabilities.

    connection.sendUTF('CAP REQ :twitch.tv/commands twitch.tv/membership twitch.tv/tags');
    
    // Authenticate with the Twitch IRC server and then join the channel.
    // If the authentication fails, the server drops the connection.

    connection.sendUTF(`PASS ${password}`); 
    connection.sendUTF(`NICK ${account}`);

    // Set a timer to post future 'gameRemind' messages. This timer can be
    // reset if the user passes, !gameRemind [minutes], in chat.
    // let intervalObj = setInterval(() => {
    //     connection.sendUTF(`PRIVMSG ${channel} :${gameRemindMessage}`);
    // }, gameRemindInterval);
    
    connection.on('error', function(error) {
        console.log("Connection Error: " + error.toString());
    });

    connection.on('close', function() {
        console.log('Connection Closed');
        console.log(`close description: ${connection.closeDescription}`);
        console.log(`close reason code: ${connection.closeReasonCode}`);

        // clearInterval(intervalObj);
    });

    // Process the Twitch IRC message.

    connection.on('message', function(ircMessage) {
        if (ircMessage.type === 'utf8') {
            let rawIrcMessage = ircMessage.utf8Data.trimEnd();
            console.log(`Message received (${new Date().toISOString()}): '${rawIrcMessage}'\n`);

            let messages = rawIrcMessage.split('\r\n');  // The IRC message may contain one or more messages.
            messages.forEach(message => {
                let parsedMessage = parseMessage(message);
            
                if (parsedMessage) {
                    // console.log(`Message command: ${parsedMessage.command.command}`);
                    console.log(`\n${JSON.stringify(parsedMessage, null, 3)}`)

                    switch (parsedMessage.command.command) {
                        case 'PRIVMSG':
                            // Ignore all messages except the '!gameRemind' bot
                            // command. A user can post a !gameRemind command to change the 
                            // interval for when the bot posts its gameRemind message.
                            if('vote' === parsedMessage.command.botCommand){
                                let voteNumber = (parsedMessage.command.botCommandParams && !voters.includes(parsedMessage.tags["display-name"])) ?
                                parseInt(parsedMessage.command.botCommandParams) : -1;

                                if(voteNumber == 1 || voteNumber == 2){
                                    addVote(voteNumber, parsedMessage.tags["display-name"]);
                                }
                            }
                            // else if ('gameRemind' === parsedMessage.command.botCommand) {
                                
                            //     // Assumes the command's parameter is well formed (e.g., !gameRemind 15).

                            //     let updateInterval = (parsedMessage.command.botCommandParams) ?
                            //         parseInt(parsedMessage.command.botCommandParams) * 1000 * 60 : defaultGameRemindInterval;

                            //     if (gameRemindInterval != updateInterval) {
                            //         // Valid range: 1 minute to 60 minutes
                            //         if (updateInterval >= 60000 && updateInterval <= 3600000) {  
                            //             gameRemindInterval = updateInterval;
                            //             // connection.sendUTF(`PRIVMSG ${channel} :interval set to ${parsedMessage.command.botCommandParams} minutes`);
                            //             // Reset the timer.
                            //         //     clearInterval(intervalObj);
                            //         //     intervalObj = null;
                            //         //     intervalObj = setInterval(() => {
                            //         //         connection.sendUTF(`PRIVMSG ${channel} :${gameRemindMessage}`);
                            //         //     }, gameRemindInterval);
                            //         }
                            //     }else{
                            //         // connection.sendUTF(`PRIVMSG ${channel} :${gameRemindMessage}`);
                            //     }
                            // }
                            // else if ('gameRemindoff' === parsedMessage.command.botCommand) {
                            //     // clearInterval(intervalObj);
                            //     // connection.sendUTF(`PRIVMSG ${channel} :game remind interval cleared`);
                            // }
                            // else if ('disconnect' === parsedMessage.command.botCommand) {
                            //     connection.sendUTF(`PRIVMSG ${channel} :I go now peepoBye`);
                            //     connection.sendUTF(`PART ${channel}`);
                            //     connection.close();
                            // }
                            // else if ('imagine' === parsedMessage.command.botCommand) {
                            //     connection.sendUTF(`PRIVMSG ${channel} :IMAGINE SKILL ISSUE`);
                            // }
                            break;
                        case 'PING':
                            connection.sendUTF('PONG ' + parsedMessage.parameters);
                            break;
                        case '001':
                            // Successfully logged in, so join the channel.
                            connection.sendUTF(`JOIN ${channel}`); 
                            break; 
                        case 'JOIN':
                            // Send the initial gameRemind message. All other gameRemind messages are
                            // sent by the timer.
                            // connection.sendUTF(`PRIVMSG ${channel} :GIGACHAD`);
                            break;
                        case 'PART':
                            console.log('The channel must have banned (/ban) the bot.');
                            // connection.close();
                            break;
                        case 'NOTICE': 
                            // If the authentication failed, leave the channel.
                            // The server will close the connection.
                            if ('Login authentication failed' === parsedMessage.parameters) {
                                console.log(`Authentication failed; left ${channel}`);
                                connection.sendUTF(`PART ${channel}`);
                            }
                            else if ('You don’t have permission to perform that action' === parsedMessage.parameters) {
                                console.log(`No permission. Check if the access token is still valid. Left ${channel}`);
                                connection.sendUTF(`PART ${channel}`);
                            }
                            break;
                        default:
                            ; // Ignore all other IRC messages.
                    }
                }
            });
        }
    });
    
});

client.connect('ws://irc-ws.chat.twitch.tv:80');


// Parses an IRC message and returns a JSON object with the message's 
// component parts (tags, source (nick and host), command, parameters). 
// Expects the caller to pass a single message. (Remember, the Twitch 
// IRC server may send one or more IRC messages in a single message.)
function parseMessage(message) {

    let parsedMessage = {  // Contains the component parts.
        tags: null,
        source: null,
        command: null,
        parameters: null
    };

    // The start index. Increments as we parse the IRC message.

    let idx = 0; 

    // The raw components of the IRC message.

    let rawTagsComponent = null;
    let rawSourceComponent = null; 
    let rawCommandComponent = null;
    let rawParametersComponent = null;

    // If the message includes tags, get the tags component of the IRC message.

    if (message[idx] === '@') {  // The message includes tags.
        let endIdx = message.indexOf(' ');
        rawTagsComponent = message.slice(1, endIdx);
        idx = endIdx + 1; // Should now point to source colon (:).
    }

    // Get the source component (nick and host) of the IRC message.
    // The idx should point to the source part; otherwise, it's a PING command.

    if (message[idx] === ':') {
        idx += 1;
        let endIdx = message.indexOf(' ', idx);
        rawSourceComponent = message.slice(idx, endIdx);
        idx = endIdx + 1;  // Should point to the command part of the message.
    }

    // Get the command component of the IRC message.

    let endIdx = message.indexOf(':', idx);  // Looking for the parameters part of the message.
    if (-1 == endIdx) {                      // But not all messages include the parameters part.
        endIdx = message.length;                 
    }

    rawCommandComponent = message.slice(idx, endIdx).trim();

    // Get the parameters component of the IRC message.

    if (endIdx != message.length) {  // Check if the IRC message contains a parameters component.
        idx = endIdx + 1;            // Should point to the parameters part of the message.
        rawParametersComponent = message.slice(idx);
    }

    // Parse the command component of the IRC message.

    parsedMessage.command = parseCommand(rawCommandComponent);

    // Only parse the rest of the components if it's a command
    // we care about; we ignore some messages.

    if (null == parsedMessage.command) {  // Is null if it's a message we don't care about.
        return null; 
    }
    else {
        if (null != rawTagsComponent) {  // The IRC message contains tags.
            parsedMessage.tags = parseTags(rawTagsComponent);
        }

        parsedMessage.source = parseSource(rawSourceComponent);

        parsedMessage.parameters = rawParametersComponent;
        if (rawParametersComponent && rawParametersComponent[0] === '!') {  
            // The user entered a bot command in the chat window.            
            parsedMessage.command = parseParameters(rawParametersComponent, parsedMessage.command);
        }
    }

    return parsedMessage;
}

// Parses the tags component of the IRC message.

function parseTags(tags) {
    // badge-info=;badges=broadcaster/1;color=#0000FF;...

    const tagsToIgnore = {  // List of tags to ignore.
        'client-nonce': null,
        'flags': null
    };

    let dictParsedTags = {};  // Holds the parsed list of tags.
                              // The key is the tag's name (e.g., color).
    let parsedTags = tags.split(';'); 

    parsedTags.forEach(tag => {
        let parsedTag = tag.split('=');  // Tags are key/value pairs.
        let tagValue = (parsedTag[1] === '') ? null : parsedTag[1];

        switch (parsedTag[0]) {  // Switch on tag name
            case 'badges':
            case 'badge-info':
                // badges=staff/1,broadcaster/1,turbo/1;

                if (tagValue) {
                    let dict = {};  // Holds the list of badge objects.
                                    // The key is the badge's name (e.g., subscriber).
                    let badges = tagValue.split(','); 
                    badges.forEach(pair => {
                        let badgeParts = pair.split('/');
                        dict[badgeParts[0]] = badgeParts[1];
                    })
                    dictParsedTags[parsedTag[0]] = dict;
                }
                else {
                    dictParsedTags[parsedTag[0]] = null;
                }
                break;
            case 'emotes':
                // emotes=25:0-4,12-16/1902:6-10

                if (tagValue) {
                    let dictEmotes = {};  // Holds a list of emote objects.
                                          // The key is the emote's ID.
                    let emotes = tagValue.split('/');
                    emotes.forEach(emote => {
                        let emoteParts = emote.split(':');

                        let textPositions = [];  // The list of position objects that identify
                                                 // the location of the emote in the chat message.
                        let positions = emoteParts[1].split(',');
                        positions.forEach(position => {
                            let positionParts = position.split('-');
                            textPositions.push({
                                startPosition: positionParts[0],
                                endPosition: positionParts[1]    
                            })
                        });

                        dictEmotes[emoteParts[0]] = textPositions;
                    })

                    dictParsedTags[parsedTag[0]] = dictEmotes;
                }
                else {
                    dictParsedTags[parsedTag[0]] = null;
                }

                break;
            case 'emote-sets':
                // emote-sets=0,33,50,237

                let emoteSetIds = tagValue.split(',');  // Array of emote set IDs.
                dictParsedTags[parsedTag[0]] = emoteSetIds;
                break;
            default:
                // If the tag is in the list of tags to ignore, ignore
                // it; otherwise, add it.

                if (tagsToIgnore.hasOwnProperty(parsedTag[0])) { 
                    ;
                }
                else {
                    dictParsedTags[parsedTag[0]] = tagValue;
                }
        } 
    });

    return dictParsedTags;
}

// Parses the command component of the IRC message.

function parseCommand(rawCommandComponent) {
    let parsedCommand = null;
    commandParts = rawCommandComponent.split(' ');

    switch (commandParts[0]) {
        case 'JOIN':
        case 'PART':
        case 'NOTICE':
        case 'CLEARCHAT':
        case 'HOSTTARGET':
        case 'PRIVMSG':
            parsedCommand = {
                command: commandParts[0],
                channel: commandParts[1]
            }
            break;
        case 'PING':
            parsedCommand = {
                command: commandParts[0]
            }
            break;
        case 'CAP':
            parsedCommand = {
                command: commandParts[0],
                isCapRequestEnabled: (commandParts[2] === 'ACK') ? true : false,
                // The parameters part of the messages contains the 
                // enabled capabilities.
            }
            break;
        case 'GLOBALUSERSTATE':  // Included only if you request the /commands capability.
                                 // But it has no meaning without also including the /tags capability.
            parsedCommand = {
                command: commandParts[0]
            }
            break;               
        case 'USERSTATE':   // Included only if you request the /commands capability.
        case 'ROOMSTATE':   // But it has no meaning without also including the /tags capabilities.
            parsedCommand = {
                command: commandParts[0],
                channel: commandParts[1]
            }
            break;
        case 'RECONNECT':  
            console.log('The Twitch IRC server is about to terminate the connection for maintenance.')
            parsedCommand = {
                command: commandParts[0]
            }
            break;
        case '421':
            console.log(`Unsupported IRC command: ${commandParts[2]}`)
            return null;
        case '001':  // Logged in (successfully authenticated). 
            parsedCommand = {
                command: commandParts[0],
                channel: commandParts[1]
            }
            break;
        case '002':  // Ignoring all other numeric messages.
        case '003':
        case '004':
        case '353':  // Tells you who else is in the chat room you're joining.
        case '366':
        case '372':
        case '375':
        case '376':
            console.log(`numeric message: ${commandParts[0]}`)
            return null;
        default:
            console.log(`\nUnexpected command: ${commandParts[0]}\n`);
            return null;
    }

    return parsedCommand;
}

// Parses the source (nick and host) components of the IRC message.

function parseSource(rawSourceComponent) {
    if (null == rawSourceComponent) {  // Not all messages contain a source
        return null;
    }
    else {
        let sourceParts = rawSourceComponent.split('!');
        return {
            nick: (sourceParts.length == 2) ? sourceParts[0] : null,
            host: (sourceParts.length == 2) ? sourceParts[1] : sourceParts[0]
        }
    }
}

// Parsing the IRC parameters component if it contains a command (e.g., !dice).

function parseParameters(rawParametersComponent, command) {
    let idx = 0
    let commandParts = rawParametersComponent.slice(idx + 1).trim(); 
    let paramsIdx = commandParts.indexOf(' ');

    if (-1 == paramsIdx) { // no parameters
        command.botCommand = commandParts.slice(0); 
    }
    else {
        command.botCommand = commandParts.slice(0, paramsIdx); 
        command.botCommandParams = commandParts.slice(paramsIdx).trim();
        // TODO: remove extra spaces in parameters string
    }

    return command;
}
module.exports = app;
