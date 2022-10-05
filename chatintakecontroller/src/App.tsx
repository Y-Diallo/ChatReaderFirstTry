import React, { useRef, useState, useEffect } from 'react';
import { useTimer } from 'react-timer-hook';
import './App.css';
import Timer from './Timer';
const ws = new WebSocket('ws://localhost:7070/', 'echo-protocol');

function App() {
  interface wsInboundCommandMessageData{
    type : string,
    commands: commandDetails[],
  }
  interface commandDetails {
    command : string,
    name : string,
    special?: boolean,
    repeat?: boolean,
    hoard?: boolean
  }
  interface wsOutboundCommandMessageData {
    mode: string,
    seconds : number,
    selectedCommands: commandDetails[],
  }
  const [commands, setCommands] = useState<commandDetails[]>([]);
  const selectedCommands = useRef<commandDetails[]>([]);
  const [newTime, setNewTime] = useState(300);//300 seconds
  const currentTimeLeft = useRef(new Date());// 1 second
  currentTimeLeft.current.setSeconds(currentTimeLeft.current.getSeconds() + 5);
  const voters = useRef<string[]>([]);
  const indexNumber = useRef(0);
  useEffect(() => {
    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected');
    }
  
    ws.onmessage = evt => {
      // listen to data sent from the websocket server
      const message = JSON.parse(evt.data);
      console.log("message from server", message);
      if(message.type && (message.type === 'command')){
        const messageData : wsInboundCommandMessageData = message;
        console.log("message from server",messageData);
        setCommands(messageData.commands);
      }
    }
  
    ws.onclose = () => {
      console.log('disconnected');
      // automatically try to reconnect on connection loss
    }
  }, []);
  

  const submitUpdate = ()=>{
    if(!(selectedCommands.current[0]&&selectedCommands.current[1]) || commands.length === 0){//incase of no selected commands
      return;
    }
    const outBoundMessage : wsOutboundCommandMessageData = {
      mode: "command",
      seconds : newTime,
      selectedCommands: selectedCommands.current,
    };
    ws.send(JSON.stringify(outBoundMessage));
  }

  const submitRandomUpdate = ()=>{
    if(commands.length === 0){//incase of no selected commands
      return;
    }
    let max = commands.length-1;
    let min = 0;
    let random1 = Math.floor(Math.random() * (max - min + 1) + min);
    let random2 = Math.floor(Math.random() * (max - min + 1) + min);
    const outBoundMessage : wsOutboundCommandMessageData = {
      mode: "command",
      seconds : newTime,
      selectedCommands: [commands[random1],commands[random2]],
    };
    ws.send(JSON.stringify(outBoundMessage));
  }

  const submitOneRandomUpdate = ()=>{
    if(commands.length === 0){//incase of no selected commands
      return;
    }
    let max = commands.length-1;
    let min = 0;
    let random1 = Math.floor(Math.random() * (max - min + 1) + min);
    const outBoundMessage : wsOutboundCommandMessageData = {
      mode: "command",
      seconds : newTime,
      selectedCommands: [selectedCommands.current[0],commands[random1]],
    };
    ws.send(JSON.stringify(outBoundMessage));
  }

  const avghans =()=>{
    const outBoundMessage = {
      mode: "avghans",
    };
    ws.send(JSON.stringify(outBoundMessage));
  }

  const autoRandom =(e: any)=>{
    const outBoundMessage = {
      mode: "autoRandom",
      state: e.target.id === "on" ? true:false,
      seconds : newTime,
    };
    ws.send(JSON.stringify(outBoundMessage));
  }
  const updatePosition =(e: any)=>{
    const outBoundMessage = {
      mode: "updatePosition",
      state: e.target.id === "on" ? true:false,
    };
    ws.send(JSON.stringify(outBoundMessage));
  }
  return (
    <>
      <div className="controls">
        <select onChange={(e) => {
          indexNumber.current = parseInt(e.target.value);
          selectedCommands.current[0] = commands[parseInt(e.target.value)];
          }}>
          {commands.map(({command,name}, index)=>{
            return <option key={index} value={index}>{name}</option>;
          })}
        </select>
        <select  onChange={(e) => {
          indexNumber.current = parseInt(e.target.value);
          selectedCommands.current[1] = commands[parseInt(e.target.value)];
          }}>
          {commands.map(({command,name}, index)=>{
            return <option key={index*2} value={index}>{name}</option>;
          })}
        </select>
        <input type="text" value={newTime} onChange={(e) => {
          if(parseInt(e.target.value)){
            setNewTime(parseInt(e.target.value))
          }else {
            setNewTime(0);
          }
          }}/>
        <input type="button" onClick={() => submitUpdate()} value="Submit"/>
        <input type="button" onClick={() => ws.send(JSON.stringify({mode:"requestCommands"}))} value="Request Commands"/>
      </div>
      <div style={{margin: "20px", padding: "20px", borderRadius:"10px", background: "white",width:"500px", height:"100px"}}>
        <input type="button" onClick={() => submitRandomUpdate()} value="Random"/>
        <input type="button" onClick={() => submitOneRandomUpdate()} value="Second command Random"/>
        <input type="button" onClick={() => avghans()} value="Avghans"/>
        <input id="on" type="button" onClick={(e) => autoRandom(e)} value="autoRandom on"/>
        <input id="off" type="button" onClick={(e) => autoRandom(e)} value="autoRandom off"/>
        <input id="on" type="button" onClick={(e) => updatePosition(e)} value="updatePosition on"/>
        <input id="off" type="button" onClick={(e) => updatePosition(e)} value="updatePosition off"/>
      </div>
    </>
  );
}

export default App;
