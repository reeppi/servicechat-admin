import { observer } from "mobx-react";
import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from "react-router-dom";
import service from './service';
import Chat from './chat';
import logoGoogle from './images/google_logo.png';
import logoFacebook from './images/facebook_logo.png';
import InputGroup from 'react-bootstrap/InputGroup';
import { Button } from 'react-bootstrap';
import { PadTop} from './helper';
import Form from 'react-bootstrap/Form';
import Spinner from 'react-bootstrap/Spinner';

const Main = observer(() => {

    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    useEffect ( () => { 
        document.title ="Servicechat";
        var code=searchParams.get("code");
        if (code) 
        {
            navigate("/");
            console.log("-->"+code);
            fetchToken(code);
        }
        if ( service.getToken() != "null")
        {
            service.logIn();
            service.openChat();
        }
    }, []); 

    const fetchToken = async (code :string)=> { 
            console.log("JOO HAETAAN");
            await service.fetchToken(code);        
    }

    const joinChat = (chatValue:string) =>
    {
        console.log("joinChat "+chatValue);
        service.joinChat(chatValue);
    }

    return (
        <>
            <Button onClick={()=>window.open(service.getApiUrl()+'/auth/google','_self')}> <img src={logoGoogle}/>Sign in with google</Button>
            <PadTop/>
            {service.logged && <Button onClick={()=>{ service.logOut()}}> Logout</Button> }
            {service.msg}
            <PadTop/>
            {service.logged && <>Select your chat site</>}
            {
                service.loadingChats && <div style={{display:"flex",justifyContent:"center"}}><Spinner animation="border" variant="primary"/></div>
            }
            {
                !service.loadingChats && service.logged && service.chatList.map( (e:any,index:number)=>
                    <div key={index}> 
                    <InputGroup>
                    <Button variant={service.chat == e.chat?"info":"primary"} style={{width:"90%"}} onClick={ (x:any)=>{joinChat(e.chat);}}>{e.chat}</Button>
                    <Button variant="danger" onClick={ ()=>{service.deleteChat(e.chat)}} style={{width:"10%"}} >X</Button>
                    </InputGroup>
                    <PadTop/></div> )
            }
            <CreateChat/>
            { service.logged && <Chat/> }
        </>
    )
}
)

const CreateChat = () => {

    const [newChat,setNewChat] = useState("");
    return (
        service.getToken()!="null"?
        <>
        <Form.Label style={{width:"80%"}} htmlFor="createChat">Create a new chat site</Form.Label>
        <InputGroup>
            <Form.Control id="createChat"  onChange={(e)=>{ setNewChat(e.target.value);}}  type="text"/>
            <Button onClick={ ()=>{service.createChat(newChat);}} style={{width:"20%"}} >New!</Button>
        </InputGroup>
        </>:<></>
    )
}

export default Main;
