import './Header.css'

function Header() {
  return (
    <header className="header">
      <div className="header-main">
        <div className="container">
          <div className="header-content">
            <div className="logo">
              <span className="logo-text">Personal</span>
            </div>
            <nav className="nav">
              <a href="#" className="nav-link">Planes</a>
              <a href="#" className="nav-link">Servicios</a>
              <a href="#" className="nav-link active">Ayuda</a>
              <a href="#" className="nav-link">Mi Personal</a>
            </nav>
            <div className="header-actions">
              <button className="btn-login">Ingresar</button>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header