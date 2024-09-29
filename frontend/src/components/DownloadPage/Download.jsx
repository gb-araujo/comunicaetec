import QRCode from 'qrcode.react';
import './Download.css'; // Importando o arquivo CSS

const DownloadPage = () => {
  const handleDownload = () => {
  };

  return (
    <div className='download' style={{ textAlign: 'center' }}>
      <h1>Faça o download do nosso aplicativo!</h1>
      <QRCode value="" size={256} /> <br/>
      <button onClick={handleDownload} className="buttonDownload">
        Download
      </button>
    </div>
  );
};

export default DownloadPage;
