import { useLocation, useNavigate } from 'react-router-dom';
import Logo from '../Logo';
import Back from '../../assets/voltar.png';
import './styles.css';



export default function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  const isHome = location.pathname === '/';

  return (
    <header className="app-header">
      <div className="header-left">
        {isHome ? (
          <Logo mclass="header-logo" />
        ) : (
          <button className="back-button" onClick={() => navigate(-1)}>
            <img src={Back} alt="Voltar" />
          </button>
        )}
      </div>

      <div className="header-title">
        {/* opcional: título por rota */}
        SabeTudo Cristão
      </div>

      <div className="header-right" />
    </header>
  );
}


