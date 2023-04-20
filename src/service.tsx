
import { makeAutoObservable } from "mobx";
import axios from "axios";

interface ichatMessage {
  sender: string;
  time: string;
  msg: string;
}

interface IChat {
  address: string;
  active: boolean;
  messages: ichatMessage[]|null;
}
 
class service {
    chatActive:boolean=false;
    ws:any;
    logged:Boolean=false;
    chatOpen:Boolean=false;
    msg:String="";
    msgChat:String="";
    chat:String="";
    chatList:any=[];
    chatMap = new Map<string, IChat>();
    loadingChats:boolean=false;

    constructor ()
    {
        makeAutoObservable(this);
    }

    setChatActive(value:boolean)
    {
      this.chatActive=value;
    }

    setMsg(value:string)
    {
        this.msg=value;
    }

    setChatList(value:any)
    {
      this.chatList = value;
    }

    deleteChatMap(user:string)
    {
      this.chatMap.delete(user);
    }
    
    nullChatMap(user:string,address:string) {
      this.chatMap.set(user,{address,active:true,messages:null})
    }

    setOpenChatActiveMode(user:string,value:boolean)
    {
      const tmp = this.chatMap.get(user);
      if ( tmp )
      {
        tmp.active=value;
        this.chatMap.set(user,tmp);
        console.log("Chat unactivated");
      }
    }

    getOpenChatActiveMode(user:string):boolean
    {
      if ( this.chatMap.has(user) ) 
      {
        const a = this.chatMap.get(user);
        if (a) 
          return a.active
      }
      return true;
    }

    addChatMapMsg(value:ichatMessage)
    {
      if ( this.chatMap.has(value.sender)  )
        {
          const tmpChat = this.chatMap.get(value.sender);
          if ( !tmpChat ) return;

          if ( tmpChat.messages)
          {
            let tmpMessages = tmpChat.messages?.slice();
            tmpMessages?.push(value);
            tmpChat.messages=tmpMessages;
            this.chatMap.set(value.sender, tmpChat);
          } else 
          {
              const messages0 = [ value ];
              tmpChat.messages = messages0;
              this.chatMap.set(value.sender, tmpChat);
          }
        }
    }

    setMsgChat(value:String)
    {
        this.msgChat=value;
    }

    logIn()
    {
        this.logged=true;
    }

    logOut()
    {
        window.sessionStorage.removeItem("JWT",); 
        this.ws.close();
        this.logged=false;
    }

    getToken() :string {
        return String(window.sessionStorage.getItem("JWT"));
    }  

    sendMsg(sender:string,receiver:string,msg:string) {
      this.ws.send(JSON.stringify({event:"MSGADMIN",payload:{sender,receiver,msg}}));
      console.log(sender+" "+receiver+" "+ msg );
    }

    joinChat(chatValue:string)
    {
      console.log("joinChat TOKEN");
      this.chat = chatValue;
      this.ws.send(JSON.stringify({event:"TOKEN",payload:{code:this.getToken(),chat:chatValue}}));
    }

    openChat()
    {
      var url;
      if (  window.location.hostname == "localhost" ) 
            url= "ws://localhost:3001";
        else
            url= "wss://servicechat-backend.fly.dev";
      
      this.ws=new WebSocket(url);
      this.ws.onopen = (e:any) =>
      {
        console.log("connected to service");
        this.setChatList([]);
        this.loadingChats=true;
        this.ws.send(JSON.stringify({event:"GETCHATLIST",payload:{code:this.getToken()}}));
        //this.ws.send(JSON.stringify({event:"TOKEN",payload:{code:this.getToken(),chat:this.chat}}));
      }
      this.ws.onmessage = (e:any) => {
        var data = JSON.parse(e.data);
        switch ( data.event )
        {
            case "MSG" : 
              console.log( data.payload.sender+" -> "+data.payload.msg);
              this.addChatMapMsg({sender:data.payload.sender,msg:data.payload.msg,time:data.payload.time}); 
              break;
            case "CHATLIST":
                console.log("chatlist received");
                console.log(data.payload.data);
                console.log("-------");
                this.setChatList(data.payload.data);
                this.loadingChats=false;
              break;
            case "USERS" :
      
              for (let user of this.chatMap.keys())
              {
                if ( !data.payload.users.find( (e:any)=>e.id==user))
                {
                  if ( !this.chatActive )
                    this.deleteChatMap(user);
                  else
                    this.setOpenChatActiveMode(user,false)
                }
              }
              
              for (let user of data.payload.users)
              {
               // console.log("messages "+user.id+":"+ this.chatMap.get(user.id)?.messages);
                if ( !this.chatMap.has(user.id))
                {
                  console.log("NULLCHATMAP "+user.id);
                  this.nullChatMap(user.id,user.address);
                }
                /* 
                else
                {
                  this.setOpenChatActiveMode(user.id,true);
                }*/

              } 
                console.log( data.payload.sender+" USERS -> "+data.payload.users);
            break;
        }     
      };
    }

    getApiUrl = () => {
      console.log("apiurl");
      if (  window.location.hostname == "tietovisa.netlify.app" ) 
        return "https://webservicechat.netlify.app";
      else 
        return "http://localhost:3001";
    }

    getChatlist = async () =>
    {
      try {
        this.loadingChats=true;
        var config = { headers: {'Authorization': this.getToken()},};
        const res  = await axios.get(this.getApiUrl()+"/chatlist",config);
        if ( res.data )
        {
          if ( Array.isArray(res.data))
            this.setChatList(res.data);
        } else {
          throw new Error("Failed data");
        }
      } catch (err:any) {
        this.setMsg(err.message);
      }  finally
      {
        this.loadingChats=false;
      }    
    }

    deleteChat = async (chatId:string) =>
    {
      try {
        var config = { headers: {'Authorization': this.getToken()},};
        const res  = await axios.get(this.getApiUrl()+"/delete?chat="+chatId,config);
        if ( res.data )
        {
          this.getChatlist();
          this.setMsg(res.data.msg);
        } else {
          throw new Error("Failed data");
        }
      } catch (err:any) {
        this.setMsg(err.message);
      }      
    }

    createChat = async (chatId:string) =>
    {
      try {
        console.log("Create chat "+chatId);
        var config = { headers: {'Authorization': this.getToken()},};
        const res  = await axios.get(this.getApiUrl()+"/insert?chat="+chatId,config);
        if ( res.data )
        {
          if ( !res.data.error )
            this.getChatlist();
        this.setMsg(res.data.msg);
        } else {
          throw new Error("Failed data");
        }
      } catch (err:any) {
        this.setMsg(err.message);
      }      
    }


    fetchToken = async (code:string) => {
      console.log("fetch Token");
      try { 
      const res = await axios.get(this.getApiUrl()+"/getToken?code="+code);
      if (res.data) {
        if ( res.data.hasOwnProperty('error') ) 
          this.setMsg(res.data.error);
        if ( res.data.hasOwnProperty('token') ) 
        {
          console.log("token haettu.");
          window.sessionStorage.setItem("JWT", res.data.token);
          if ( res.data.hasOwnProperty('msg') )
          {
            console.log(res.data.token);
            this.openChat();
            this.logIn();
            this.setMsg(res.data.msg);
          }
        }
      } else 
      {
        throw(Error("Token response not ok"));
      }
      } catch (err) {
        this.setMsg((err as Error).message);
        return (err as Error).message;
      }  
    }







}

export default new service();
