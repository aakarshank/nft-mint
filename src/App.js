import logo from './logo.svg';
import './App.css';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Marketplace from './Marketplace';
import CreateNFT from './CreateNFT';
import UserPage from './UserPage';
import Home from './Home';
function App() {
  return (
    <div className="App">
      <Router>
        <Routes>
          <Route path='/' element={<Home />} />
          <Route path ="/your-nfts" element={<UserPage />} />
          <Route path ="/marketplace" element={<Marketplace />} />
          <Route path ="/create-nft" element={<CreateNFT />} />
        </Routes>
      </Router>
      
    </div>
  );
}

export default App;
