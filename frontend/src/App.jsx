import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import AppsList from './pages/AppsList';
import AppDetail from './pages/AppDetail';
import DeploymentDetail from './pages/DeploymentDetail';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<AppsList />} />
        <Route path="/app/:id" element={<AppDetail />} />
        <Route path="/deployments/:id" element={<DeploymentDetail />}/>
      </Routes>
    </Router>
  );
}

export default App;