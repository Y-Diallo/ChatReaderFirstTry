import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import View from './View';
import Controller
 from './Controller';
 
function App() {
  
  return (
      <Router>
        <Routes>
          <Route path="/" element={<Controller/>}/>
          <Route path="/view" element={<View/>}/>
        </Routes>
      </Router>
  );
}

export default App;
