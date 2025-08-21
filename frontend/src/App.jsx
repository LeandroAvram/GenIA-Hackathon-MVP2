import Header from './components/Header'
import Footer from './components/Footer'
import Chatbot from './components/Chatbot'
import './App.css'

function App() {
  return (
    <div className="app">
      <Header />
      <main className="main-content">
        <div className="container">
          <h1 className="page-title">Asistente Virtual <span className="pia-highlight">PIA</span></h1>
          <p className="page-subtitle">¿En qué podemos ayudarte hoy?</p>
          <Chatbot />
        </div>
      </main>
      <Footer />
    </div>
  )
}

export default App