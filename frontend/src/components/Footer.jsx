import './Footer.css'

function Footer() {
  return (
    <footer className="footer">
      <div className="footer-main">
        <div className="container">
          <div className="footer-content">
            <div className="footer-section">
              <h4>Atención al Cliente</h4>
              <ul>
                <li><a href="#">Centro de Ayuda</a></li>
                <li><a href="#">Contactanos</a></li>
                <li><a href="#">Reclamos</a></li>
                <li><a href="#">Defensa del Consumidor</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Servicios</h4>
              <ul>
                <li><a href="#">Planes Móviles</a></li>
                <li><a href="#">Internet Hogar</a></li>
                <li><a href="#">TV</a></li>
                <li><a href="#">Empresas</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Personal</h4>
              <ul>
                <li><a href="#">Quiénes Somos</a></li>
                <li><a href="#">Trabaja con Nosotros</a></li>
                <li><a href="#">Prensa</a></li>
                <li><a href="#">Inversores</a></li>
              </ul>
            </div>
            <div className="footer-section">
              <h4>Seguinos</h4>
              <div className="social-links">
                <a href="#" className="social-link">📘</a>
                <a href="#" className="social-link">📷</a>
                <a href="#" className="social-link">🐦</a>
                <a href="#" className="social-link">📺</a>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer-bottom">
        <div className="container">
          <div className="footer-bottom-content">
            <p>&copy; 2024 Personal. Todos los derechos reservados.</p>
            <div className="footer-legal">
              <a href="#">Términos y Condiciones</a>
              <a href="#">Política de Privacidad</a>
              <a href="#">Defensa del Consumidor</a>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer