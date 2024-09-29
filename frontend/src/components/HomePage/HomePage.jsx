import React from 'react';
import './HomePage.css';
import Navbar from '../Navbar/Navbar';

const HomePage = () => {
  return (
    <div className="home-page">
      <Navbar />
      <h1 className="comunica-etec-xVxyAW">Comunica<br />Etec</h1>
      <img
        className="illustrations-xVxyAW"
        src="https://cdn.animaapp.com/projects/667047f005f1a98fc36317e2/releases/667048037ecc40b4cd081b33/img/illustrations.png"
        alt="illustrations"
      />
      <p className="conectando-mentes-e-xVxyAW">
        <span>
          <span className="span0-dr1Phx">Conectando</span>
          <span className="span1-dr1Phx"> mentes e construindo pontes para o futuro da educação</span>
        </span>
      </p>
    </div>
  );
};

export default HomePage;
