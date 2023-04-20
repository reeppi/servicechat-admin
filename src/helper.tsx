const getApiUrl = () => {
  console.log("apiurl");
  if (  window.location.hostname == "servicechat.netlify.app" ) 
    return "https://servicechat-backend.netlify.app";
  else 
    return "http://localhost:3001";
}

const PadTop = ( {children } : { children?:any } ) => <div style={{paddingTop:"4px"}}>{children}</div>

const fileUrl: string="https://eu2.contabostorage.com/cab6b4ec7ee045779d63f412f885dfe6:tietovisa";
const apiUrl = getApiUrl();
const defaultTimeout : number=9000;

export { PadTop, fileUrl, apiUrl, defaultTimeout}