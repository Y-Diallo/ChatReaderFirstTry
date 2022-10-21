import React, { useRef, useState, useEffect } from 'react';
import {useParams} from 'react-router-dom';
import './Controller.css';
import commands from './minecraftCommands';
// const ws = new WebSocket('ws://54.208.28.153:7070/', 'echo-protocol');
const ws = new WebSocket('ws://localhost:7070/', 'echo-protocol');

function Controller() {
  interface commandDetails {
    command : string,
    name : string,
    special?: boolean,
    repeat?: boolean,
    hoard?: boolean
  }
  interface wsOutboundCommandMessageData {
    mode: string,
    streamerName: string | undefined,
    minecraftName: string | undefined,
    seconds : number,
    selectedCommands: commandDetails[],
  }
  const selectedCommands = useRef<commandDetails[]>([commands[0],commands[0]]);
  const [newTime, setNewTime] = useState(90);//300 seconds  
  const { streamerName, minecraftName } = useParams();

  useEffect(() => {
    ws.onopen = () => {
      // on connecting, do nothing but log it to the console
      console.log('connected');
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
      streamerName: streamerName,
      minecraftName: minecraftName,
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
      streamerName: streamerName,
      minecraftName: minecraftName,
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
      streamerName: streamerName,
      minecraftName: minecraftName,
      seconds : newTime,
      selectedCommands: [selectedCommands.current[0],commands[random1]],
    };
    ws.send(JSON.stringify(outBoundMessage));
  }

  const avghans =()=>{
    const outBoundMessage = {
      mode: "avghans",
      streamerName: streamerName,
    };
    ws.send(JSON.stringify(outBoundMessage));
  }

  const autoRandom =(e: any)=>{
    const outBoundMessage = {
      mode: "autoRandom",
      streamerName: streamerName,
      minecraftName: minecraftName,
      state: e.target.id === "on" ? true:false,
      seconds : newTime,
    };
    ws.send(JSON.stringify(outBoundMessage));
  }
  const updatePosition =(e: any)=>{
    const outBoundMessage = {
      mode: "updatePosition",
      streamerName: streamerName,
      minecraftName: minecraftName,
      state: e.target.id === "on" ? true:false,
    };
    ws.send(JSON.stringify(outBoundMessage));
  }
  return (
    <>
      <div className="controls">
        <select onChange={(e) => {
          selectedCommands.current[0] = commands[parseInt(e.target.value)];
          }}>
          {commands.map(({command,name}, index)=>{
            return <option key={index} value={index}>{name}</option>;
          })}
        </select>
        <select  onChange={(e) => {
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
      </div>
      <div style={{margin: "20px", padding: "20px", borderRadius:"10px", background: "white",width:"500px", height:"100px"}}>
        <input type="button" onClick={() => submitRandomUpdate()} value="Random"/>
        <input type="button" onClick={() => submitOneRandomUpdate()} value="Second command Random"/>
        {streamerName === "YmanIsHere" ? <input type="button" onClick={() => avghans()} value="Avghans"/>:<></>}
        <input id="on" type="button" onClick={(e) => autoRandom(e)} value="autoRandom on"/>
        <input id="off" type="button" onClick={(e) => autoRandom(e)} value="autoRandom off"/>
        <input id="on" type="button" onClick={(e) => updatePosition(e)} value="updatePosition on"/>
        <input id="off" type="button" onClick={(e) => updatePosition(e)} value="updatePosition off"/>
      </div>
    </>
  );
}

export default Controller;
