import { useState, useRef, useEffect,forwardRef,useImperativeHandle } from 'react';
import { useParams } from "react-router-dom";
import { observer } from "mobx-react";
import service from './service';
import FloatingLabel from 'react-bootstrap/FloatingLabel';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { Button } from 'react-bootstrap';



const Chat = observer(() => {
    const { chatname } = useParams();
    /*
    var chat ="";
    if ( !chatname) 
        chat="test";
    */
    return (
    <>
     <Form.Check  type="switch" id="keep" label="Leave chat open after user disconnect" onChange={(e)=>service.setChatActive(e.target.checked)} checked={service.chatActive}/>
     <Form.Label htmlFor="nameBox">Nimesi</Form.Label>
     <Form.Control id="nameBox" type="text"/>
     Chat :     <strong>{service.chat}</strong>
   
    { 
         Array.from(service.chatMap.keys()).map( (e:any)=><ChatEntry key={e} user={e}/> )
    } 
    </>
    )
}
)

const ChatEntry = observer( (props:any) => {
    const [msg,setMsg] = useState("");
    useEffect ( () => { 
        if (chatRef.current) chatRef.current.scrollTop = chatRef.current.scrollHeight;
      }, [service.chatMap.get(props.user)?.messages]); 
    
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const chatRef = useRef<HTMLDivElement>(null);
    const keyH = useRef(false);

    const keyDown = (e:any) => { 
        if ( !keyH.current && e.key == "Enter" ) { 
            keyH.current=true; sendMsg() } 
        }

    const sendMsg = () =>
    {
        service.sendMsg("Tupi",props.user,msg);
    }


    return <>
    <hr/>

    <div style={{display:"flex",justifyContent:"space-between"}}>
        <div>
        <strong>CHAT: {props.user}  ADDRESS: { service.chatMap.get(props.user)?.address } <br/>
         { service.getOpenChatActiveMode(props.user)?"":" UNACTIVE " }
        </strong>  
        </div>
        <div>
            <Button variant= { service.getOpenChatActiveMode(props.user)?"danger":"primary" } onClick={()=>{service.deleteChatMap(props.user) }}>X</Button>
        </div>
    </div>

    <div className="chat" ref={chatRef}>  
    {
          service.chatMap.get(props.user)?.messages?.map( (e:any,index:number)=><li key={index}>{e.time} {e.msg}</li>)
    }
    </div>
    <div style={{display:"flex"}}>
            <InputGroup>
            <FloatingLabel controlId="floatingInput" label="chat viesti" >
            <Form.Control onKeyDown={e => keyDown(e) } onKeyUp={e => { keyH.current=false; } } maxLength={20} value={msg}  onChange={(e)=>{ setMsg(e.target.value);}} placeholder="chat viesti"/>
            </FloatingLabel>
            <Button disabled={service.getOpenChatActiveMode(props.user)?false:true} onClick={()=>{ sendMsg(); }}>Send</Button>
        </InputGroup>
    </div>
    </>
}
)



export default Chat;
