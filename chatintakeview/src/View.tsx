import React, { useEffect, useRef, useState } from 'react';
import {useParams} from 'react-router-dom';
import './View.css';
// const ws = new WebSocket('ws://54.208.28.153:8080/', 'echo-protocol');
const ws = new WebSocket('ws://localhost:8080/', 'echo-protocol');

function View() {
  interface wsInboundViewMessageData{
    type : string,    
    streamerName: string[],
    selectedCommands: commandDetails[],
    votes: number[],
    voter : string,
    seconds : number,
    newDetails: boolean
  }
  interface wsInboundPositionViewMessageData{
    type : string,    
    posX: number,
    posY: number,
    posZ: number,
    streamerNames: string[],
    minecraftUser:string
  }
  interface commandDetails {
    command : string,
    name : string,
    special?: boolean,
    repeat?: boolean,
    hoard?: boolean
  }
  const allowVotes = useRef(true);
  const winner = useRef(3);
  const [time, setTime] = useState(90);
  const viewCommands = useRef<commandDetails[]>([{command:"",name:"Diamond Sword"},{command:"",name:"Tnt Spawn"}]);
  const votes1 = useRef(1);
  const votes2 = useRef(1);
  const { streamerName , minecraftName } = useParams();
  const [totalVotes,setTotalVotes] = useState(2);
  const [position, setPosition] = useState([500,110,500]);
  const dateInital = useRef(new Date());// 1 second
  const timeoutHold = useRef<NodeJS.Timer>();
  dateInital.current.setSeconds(dateInital.current.getSeconds() + 5);

  useEffect(() => {
    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected');
    }
  
    ws.onmessage = evt => {
      // listen to data sent from the websocket server
      const message = JSON.parse(evt.data);
      console.log("message from server", message);
      if(message.streamerName && message.streamerName.includes(streamerName)){
        if(message.type && ('view' === message.type)){
            const messageData : wsInboundViewMessageData = message;
            if(messageData.newDetails){
                if(timeoutHold.current){
                    clearTimeout(timeoutHold.current);
                }
                viewCommands.current = messageData.selectedCommands;
                allowVotes.current = true;//when setting up new poll allow votes
                winner.current = 3;
                startTimer(messageData.seconds);
            }
            if(allowVotes.current){
                votes1.current = messageData.votes[0];
                votes2.current = messageData.votes[1];
            }
    
            setTotalVotes(messageData.votes[0]+messageData.votes[1]);
        }
    }else if(message.type && 'positionView' === message.type){
        const messageData : wsInboundPositionViewMessageData = message;
        console.log("streamer name " + streamerName + " and streamer array ",messageData.streamerNames);
        if(messageData.streamerNames.find((name)=>{
            return name === streamerName;
        }) && messageData.minecraftUser === minecraftName){
            let posX = messageData.posX;
            let posY = messageData.posY+60;
            //bedrock at -60, floor around 60, adjust to make bedrock 0
            let posZ = messageData.posZ;
            posY = posY < 0 ? 0 : posY;
            console.log("position [x,y,z]", [posX,posY,posZ]);
            setPosition([posX,posY,posZ]);
        }
    }
    
}
    ws.onclose = () => {
      console.log('disconnected');
      // automatically try to reconnect on connection loss
    }
  }, []);
  

  const startTimer = (seconds : number)=>{
    if(seconds >= 0){
      setTime(seconds);
      timeoutHold.current = setTimeout(()=>startTimer(seconds-1) ,1000);
    }else{
      winner.current = ((votes1.current===votes2.current) ? Math.round(Math.random()):(votes1.current>votes2.current ?0:1));
      console.log(`the winner is ${winner.current} and the votes are 1: ${votes1.current}  2:${votes2.current}`);
      const outBoundMessage = {
        mode: "timeEnd",
        streamerName: streamerName,
        winner : viewCommands.current[winner.current],
      };
      ws.send(JSON.stringify(outBoundMessage));
    }
  }



  return (
    <>
      <div className="votingMachine">
        <div style={{display: "flex", flexDirection:"row", justifyContent:"center", height:"150px", width: "1000px", margin: "0px auto"}}>
          <span className="voteDescription left">
            <span className="voteHow">Type !vote 1 for<br/></span>
            <span className="voteTitle">{viewCommands.current[0].name}</span>
          </span>
          <span className='voteTimer'>
            {Math.floor(time / 60)}:{time%60 < 10 ? "0"+time%60:time%60}
          </span>
          <span className="voteDescription right">
            <span className="voteHow">Type !vote 2 for<br/></span>
            <span className="voteTitle">{viewCommands.current[1].name}</span>
          </span>
        </div>
        <span className='voteHolder'>
          <span className='right' style={{
              transition: "0.3s",
              width: (winner.current===0?"100":(votes1.current === 0 && votes2.current === 0 ? "50":(votes1.current ? 100*(votes1.current/totalVotes): "0")) + "%"),
              background:"black"
            }}><span className='voteCounter' style={{color: 'white',
                }}>{votes1.current > 0 && votes2.current > 0 ? votes1.current:
                (votes2.current > 0 && votes1.current === 0 ? "":votes1.current)}
              </span>
          </span>
          <span style={{
            transition: "0.3s",
            width: (winner.current===1?"100":(votes1.current === 0 && votes2.current === 0 ? "50":(votes2.current ? 100*(votes2.current/totalVotes): "0")) + "%"),
            background:"white"
          }}><span className='voteCounter' style={{color: 'black',
              }}>{votes2.current > 0 && votes1.current > 0 ? votes2.current:
                (votes1.current > 0 && votes2.current === 0 ? "":votes2.current)}
            </span>
          </span>
        </span>
      </div>
      <span className='allPosition'>
        <div className="positionDisplay">
          <span className='blocksLeft'><span>{position[1]}</span><br/>Blocks<br/>TO GO</span>
          <div className="positionBar">
            <span className="positionDone" 
              style={{
              transition: "0.3s",
              height: position[1] >= 120? "0":(position[1] === 0? "100":100*((120-position[1])/120) + "%"),
              background:"#878ECD"
            }}></span>
            <span className="positionIncomplete" 
              style={{
              transition: "0.3s",
              height: position[1] >= 120? "100":(position[1] === 0? "0": 100*(position[1]/120) + "%"),
            }}></span>
          </div>
        </div>
        <div className="positionDisplay" style={{width:"200px"}}>
          <span className='blocksLeft'style={{width:"200px"}}><span style={{width:"200px"}}>{10000-position[0]}</span><br/>Blocks<br/>TO GO</span>
          <div className="positionBar">
            <span className="positionDone" 
              style={{
              transition: "0.3s",
              height: position[0] >= 10000? "100%":(position[0] === 0? "0": 100*(position[0]/10000) + "%"),
              background:"#878ECD"
            }}></span>
            <span className="positionIncomplete" 
              style={{
              transition: "0.3s",
              height: position[0] >= 10000? "0%":(position[0] === 0? "100":100*((10000-position[0])/10000) + "%"),
            }}></span>
          </div>
        </div>
      </span>
      {/* <button onClick={() => ws.send(JSON.stringify({something:"hi"}))}>send hi</button> */}
      {/* <button onClick={() => startTimer(100)}>startTimer</button> */}
    </>
  );
}

export default View;
