import { BrowserRouter as Router, Routes, Route} from 'react-router-dom';
import './App.css';
import Main from './main';
import Chat from './chat';
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
  return (
    <Router>
    <div style={{justifyContent:"center",display:"flex"}}><h2>webservicechat</h2></div>
    <div style={{justifyContent:"center",display:"flex"}}>
    <div className="Page">
      <Routes>
          <Route path='/'  element={<Main/>}  ></Route>
          <Route path='/chat/:chatname' element={<Chat/>}></Route>
      </Routes> 
    </div>
    </div>
   </Router>
  );
}

export default App;
