import { useState, useRef } from 'react'
import './Chatbot.css'

function Chatbot() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'bot',
      content: '¡Hola! Soy tu asistente virtual de Personal. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ])
  const [inputText, setInputText] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [audioBlob, setAudioBlob] = useState(null)
  const mediaRecorderRef = useRef(null)
  const audioRef = useRef(null)

  const sendMessage = async () => {
    if (!inputText.trim()) return

    const userMessage = {
      id: Date.now(),
      type: 'user',
      content: inputText,
      timestamp: new Date()
    }

    setMessages(prev => [...prev, userMessage])
    const currentInput = inputText
    setInputText('')
    setIsTyping(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: currentInput })
      })
      
      const data = await response.json()
      
      const botMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: data.response || 'Error en la respuesta',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      const errorMessage = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Error de conexión. Intenta nuevamente.',
        timestamp: new Date()
      }
      setMessages(prev => [...prev, errorMessage])
    }
    
    setIsTyping(false)
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      const mediaRecorder = new MediaRecorder(stream)
      mediaRecorderRef.current = mediaRecorder
      
      const chunks = []
      mediaRecorder.ondataavailable = (e) => chunks.push(e.data)
      mediaRecorder.onstop = () => {
        const blob = new Blob(chunks, { type: 'audio/wav' })
        setAudioBlob(blob)
        stream.getTracks().forEach(track => track.stop())
      }
      
      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('Error accessing microphone:', error)
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  const playAudio = () => {
    if (audioBlob && audioRef.current) {
      audioRef.current.src = URL.createObjectURL(audioBlob)
      audioRef.current.play()
    }
  }

  const clearAudio = () => {
    setAudioBlob(null)
    if (audioRef.current) {
      audioRef.current.src = ''
    }
  }

  const sendAudio = async () => {
    if (!audioBlob) return
    
    const formData = new FormData()
    formData.append('audio', audioBlob, 'recording.wav')
    
    try {
      const response = await fetch('/api/audio', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      console.log('Audio enviado:', data)
      
      // Mostrar mensaje de confirmación
      const confirmMessage = {
        id: Date.now(),
        type: 'bot',
        content: `Audio recibido y guardado como: ${data.filename}`,
        timestamp: new Date()
      }
      setMessages(prev => [...prev, confirmMessage])
      
      clearAudio()
    } catch (error) {
      console.error('Error enviando audio:', error)
    }
  }

  return (
    <div className="chatbot-container">
      <div className="chat-header">
        <div className="chat-status">
          <div className="status-indicator online"></div>
          <span>Asistente Virtual - En línea</span>
        </div>
      </div>
      
      <div className="chat-messages">
        {messages.map(message => (
          <div key={message.id} className={`message ${message.type}`}>
            <div className="message-avatar">
              {message.type === 'bot' ? '🤖' : '👤'}
            </div>
            <div className="message-content">
              <div className="message-bubble">
                {message.content}
              </div>
              <div className="message-time">
                {message.timestamp.toLocaleTimeString('es-AR', { 
                  hour: '2-digit', 
                  minute: '2-digit' 
                })}
              </div>
            </div>
          </div>
        ))}
        
        {isTyping && (
          <div className="message bot">
            <div className="message-avatar">🤖</div>
            <div className="message-content">
              <div className="message-bubble typing">
                <div className="typing-indicator">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        {audioBlob && (
          <div className="audio-preview">
            <audio ref={audioRef} />
            <button onClick={playAudio} className="play-button">▶️</button>
            <span>Audio grabado</span>
            <button onClick={sendAudio} className="send-audio-button">📤</button>
            <button onClick={clearAudio} className="clear-button">❌</button>
          </div>
        )}
        <div className="input-container">
          <button 
            onClick={isRecording ? stopRecording : startRecording}
            className={`record-button ${isRecording ? 'recording' : ''}`}
          >
            {isRecording ? '⏹️' : '🎤'}
          </button>
          <textarea
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Escribe tu consulta aquí..."
            rows="1"
          />
          <button 
            onClick={sendMessage}
            disabled={!inputText.trim()}
            className="send-button"
          >
            ➤
          </button>
        </div>
      </div>
    </div>
  )
}

export default Chatbot