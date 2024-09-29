import { Link } from 'react-router-dom';
import './Navbar.css';
import reg from '../../assets/user-plus.svg';
import logo from '../../assets/logo.png'; 
function Navbar() {
    return (
      <nav className='container'>
        <Link to="/" className='linkLogo'> 
          <img src={logo} alt="Company Logo" className="logoNav" /> 
        </Link>
        <div className="links-container"> 
          <Link to="/registro" className='linkRegistrar'>
            <button className='registrar' type='submit'>
              <img src={reg} alt="Imagem do registro" />Registrar-se
            </button>
          </Link>
          <Link to="/login" className='linkLogin'>
            <button className='login' type='submit'>Login</button>
          </Link>
        </div>
      </nav>
    );
  }

export default Navbar;
