import React, { useRef, useState } from 'react';
import vs from './vs.png';
import './App.css';
import { useTimer } from 'react-timer-hook';
import Timer from './Timer';
import { start } from 'repl';

function App() {
  interface wsInboundViewMessageData{
    type : string,
    selectedCommands: commandDetails[],
    votes: number[],
    voter : string,
    seconds : number,
    newDetails: boolean
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
  const [time, setTime] = useState(100);
  const viewCommands = useRef<commandDetails[]>([{command:"",name:"Diamond Sword"},{command:"",name:"Tnt Spawn"}]);
  const votes1 = useRef(4);
  const votes2 = useRef(11);
  const [totalVotes,setTotalVotes] = useState(15);
  const dateInital = useRef(new Date());// 1 second
  const timeoutHold = useRef<NodeJS.Timer>();
  dateInital.current.setSeconds(dateInital.current.getSeconds() + 5);

  const ws = new WebSocket('ws://localhost:8080/', 'echo-protocol');
  ws.onopen = () => {
    // on connecting, do nothing but log it to the console
    console.log('connected');
  }

  ws.onmessage = evt => {
    // listen to data sent from the websocket server
    const message = JSON.parse(evt.data);
    console.log("message from server", message);
    if(message.type && 'view' === message.type){
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
      if(allowVotes.current){//
        votes1.current = messageData.votes[0];
        votes2.current = messageData.votes[1];
      }

      setTotalVotes(messageData.votes[0]+messageData.votes[1]);
    }
  }

  const startTimer = (seconds : number)=>{
    if(seconds >= 0){
      setTime(seconds);
      timeoutHold.current = setTimeout(()=>startTimer(seconds-1) ,1000)
    }else{
      winner.current = ((votes1.current===votes2.current) ? Math.round(Math.random()):(votes1.current>votes2.current ?0:1));
      console.log(`the winner is ${winner.current} and the votes are 1: ${votes1.current}  2:${votes2.current}`);
      const outBoundMessage = {
        mode: "timeEnd",
        winner : viewCommands.current[winner.current],
      };
      ws.send(JSON.stringify(outBoundMessage));
    }
  }
  ws.onclose = () => {
    console.log('disconnected');
    // automatically try to reconnect on connection loss
  }


  return (
    <>
      <div className="votingMachine">
        <div style={{display: "flex", flexDirection:"row", justifyContent:"center", height:"150px"}}>
          <span className="voteDescription left">
            <span className="voteHow">Type !vote 1 for<br/></span>
            <span className="voteTitle">{viewCommands.current[0].name}</span>
          </span>
          <span style={{
            display: "flex",
            flexDirection:"column",
            justifyContent:"center",
            textAlign:"center",
            fontSize:"50px",
            fontWeight:500}}>
            {Math.floor(time / 60)}:{time%60 < 10 ? "0"+time%60:time%60}
            <img style={{margin:"auto 10px",width: "75px", height:"75px"}} src={vs} alt="versus"/>
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
              background:"purple"
            }}><span style={{
                fontSize:"130px",
                color: 'yellow',
                margin:"0px 10px"
                }}>{votes1.current > 0 && votes2.current > 0 ? votes1.current:
                (votes2.current > 0 && votes1.current === 0 ? "":votes1.current)}
              </span>
          </span>
          <span style={{
            transition: "0.3s",
            width: (winner.current===1?"100":(votes1.current === 0 && votes2.current === 0 ? "50":(votes2.current ? 100*(votes2.current/totalVotes): "0")) + "%"),
            background:"yellow"
          }}><span style={{
              fontSize:"130px",
              color: 'purple',
              margin:"0px 10px"
              }}>{votes2.current > 0 && votes1.current > 0 ? votes2.current:
                (votes1.current > 0 && votes2.current === 0 ? "":votes2.current)}
            </span>
          </span>
        </span>
      </div>
      {/* <button onClick={() => ws.send(JSON.stringify({something:"hi"}))}>send hi</button> */}
      {/* <button onClick={() => startTimer(100)}>startTimer</button> */}
    </>
  );
}

export default App;
