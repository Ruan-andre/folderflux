import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/Sidebar';


const Main = ()=>{
    return (
        <div style={{ display: 'flex' }}>
          <Sidebar />
          <main style={{ flex: 1, padding: '1.6rem' }}>
            <Outlet /> 
          </main>
        </div>
      );
}

export default Main;