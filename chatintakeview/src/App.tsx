import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import View from './View';
import Controller from './Controller';
import NotFound from './NotFound';
 
function App() {
  
  return (
      <Router>
        <Routes>
          <Route path="/:streamerName/:minecraftName" element={<Controller/>}/>
          <Route path="/view/:streamerName" element={<View/>}/>
          <Route path="*" element={<NotFound/>}/>
        </Routes>
      </Router>
  );
}

export default App;
