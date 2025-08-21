# Chatbot Inteligente con AWS Bedrock

Un chatbot web avanzado que utiliza AWS Bedrock para proporcionar respuestas inteligentes basadas en contenido de soporte preentrenado, con capacidades futuras de procesamiento de audio.

## 🏗️ Arquitectura del Sistema

```
Frontend (React/Vue) → Backend (Node.js/Python) → AWS Bedrock → Modelo LLM
                                ↓
                        Base de Conocimiento
                        (Documentos de Soporte)
```

## 📋 Características Principales

- ✅ **Chat de Texto**: Interfaz web para conversaciones en tiempo real
- 🔮 **Audio Futuro**: Preparado para integración de mensajes de voz
- 🧠 **IA Avanzada**: Powered by AWS Bedrock (Claude, Llama, etc.)
- 📚 **Conocimiento Especializado**: Entrenado con documentación de soporte
- 🔒 **Seguro**: Autenticación y validación de datos
- ⚡ **Escalable**: Arquitectura cloud-native

## 🛠️ Stack Tecnológico Recomendado

### Frontend
- **React.js** o **Vue.js** - Framework principal
- **TypeScript** - Tipado estático
- **Tailwind CSS** - Estilos
- **Socket.io-client** - Comunicación en tiempo real

### Backend
- **Node.js** con **Express** o **Python** con **FastAPI**
- **Socket.io** - WebSockets para chat en tiempo real
- **AWS SDK** - Integración con servicios AWS
- **JWT** - Autenticación

### AWS Services
- **AWS Bedrock** - Modelos de IA (Claude 3, Llama 2)
- **Amazon S3** - Almacenamiento de documentos
- **AWS Lambda** - Funciones serverless
- **Amazon API Gateway** - API REST
- **Amazon DynamoDB** - Base de datos NoSQL
- **Amazon Transcribe** - Conversión de audio a texto (futuro)

## 🚀 Configuración del Proyecto

### Prerrequisitos
```bash
# Node.js 18+
node --version

# AWS CLI configurado
aws configure

# Python 3.9+ (si usas Python backend)
python --version
```

### Estructura de Carpetas Recomendada
```
chatbot-project/
├── frontend/                 # Aplicación web
│   ├── src/
│   ├── public/
│   └── package.json
├── backend/                  # API y lógica de negocio
│   ├── src/
│   ├── routes/
│   ├── services/
│   └── package.json
├── infrastructure/           # IaC con Terraform/CDK
│   ├── bedrock/
│   ├── lambda/
│   └── api-gateway/
├── data/                    # Documentos de entrenamiento
│   └── support-docs/
└── README.md
```

## 🔧 Configuración de AWS Bedrock

### 1. Habilitar Modelos en Bedrock
```bash
# Acceder a AWS Console → Bedrock → Model Access
# Habilitar modelos recomendados:
# - Claude 3 Sonnet
# - Claude 3 Haiku (más económico)
# - Llama 2 70B
```

### 2. Variables de Entorno
```env
# .env
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=tu_access_key
AWS_SECRET_ACCESS_KEY=tu_secret_key
BEDROCK_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
JWT_SECRET=tu_jwt_secret
PORT=3000
```

### 3. Configuración del Backend (Node.js)
```javascript
// services/bedrockService.js
import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime";

const client = new BedrockRuntimeClient({ region: process.env.AWS_REGION });

export async function generateResponse(userMessage, context) {
  const prompt = `
  Contexto: Eres un asistente de soporte especializado.
  Documentación: ${context}
  
  Usuario: ${userMessage}
  Asistente:`;

  const params = {
    modelId: process.env.BEDROCK_MODEL_ID,
    contentType: "application/json",
    accept: "application/json",
    body: JSON.stringify({
      prompt,
      max_tokens: 500,
      temperature: 0.7
    })
  };

  const command = new InvokeModelCommand(params);
  const response = await client.send(command);
  return JSON.parse(new TextDecoder().decode(response.body));
}
```

## 📚 Preparación de Datos de Entrenamiento

### 1. Recopilación de Documentos
```bash
# Crear estructura para documentos
mkdir -p data/support-docs/{faq,guides,policies}

# Formatos recomendados:
# - Markdown (.md)
# - JSON estructurado
# - Plain text (.txt)
```

### 2. Procesamiento de Documentos
```python
# scripts/process_docs.py
import json
from pathlib import Path

def process_support_docs():
    docs = []
    for file_path in Path("data/support-docs").rglob("*.md"):
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()
            docs.append({
                "title": file_path.stem,
                "content": content,
                "category": file_path.parent.name
            })
    
    with open("data/knowledge_base.json", 'w') as f:
        json.dump(docs, f, indent=2, ensure_ascii=False)

if __name__ == "__main__":
    process_support_docs()
```

## 🎨 Interfaz de Usuario Recomendada

### Componentes Principales
1. **ChatWindow** - Ventana principal de conversación
2. **MessageBubble** - Burbujas de mensajes
3. **InputArea** - Área de entrada de texto
4. **TypingIndicator** - Indicador de escritura
5. **AudioRecorder** - Grabador de audio (futuro)

### Ejemplo de Componente React
```jsx
// components/ChatWindow.jsx
import { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

export default function ChatWindow() {
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [socket, setSocket] = useState(null);

  useEffect(() => {
    const newSocket = io('http://localhost:3000');
    setSocket(newSocket);

    newSocket.on('bot-response', (response) => {
      setMessages(prev => [...prev, {
        type: 'bot',
        content: response.message,
        timestamp: new Date()
      }]);
    });

    return () => newSocket.close();
  }, []);

  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    const userMessage = {
      type: 'user',
      content: inputText,
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    socket.emit('user-message', inputText);
    setInputText('');
  };

  return (
    <div className="chat-container">
      <div className="messages">
        {messages.map((msg, idx) => (
          <MessageBubble key={idx} message={msg} />
        ))}
      </div>
      <div className="input-area">
        <input
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
          placeholder="Escribe tu pregunta..."
        />
        <button onClick={sendMessage}>Enviar</button>
      </div>
    </div>
  );
}
```

## 🔮 Roadmap de Funcionalidades

### Fase 1 - MVP (4-6 semanas)
- [x] Configuración básica del proyecto
- [ ] Integración con AWS Bedrock
- [ ] Chat de texto básico
- [ ] Base de conocimiento inicial
- [ ] Interfaz web responsive

### Fase 2 - Mejoras (6-8 semanas)
- [ ] Historial de conversaciones
- [ ] Autenticación de usuarios
- [ ] Métricas y analytics
- [ ] Optimización de respuestas
- [ ] Deploy en AWS

### Fase 3 - Audio (8-10 semanas)
- [ ] Integración con Amazon Transcribe
- [ ] Grabación de audio en frontend
- [ ] Procesamiento de voz a texto
- [ ] Respuestas por voz (Amazon Polly)

## 💰 Estimación de Costos AWS

### Bedrock (uso moderado)
- **Claude 3 Haiku**: ~$0.25 por 1M tokens de entrada
- **Claude 3 Sonnet**: ~$3.00 por 1M tokens de entrada
- **Estimado mensual**: $50-200 (dependiendo del volumen)

### Otros Servicios
- **Lambda**: ~$5-20/mes
- **API Gateway**: ~$10-30/mes
- **DynamoDB**: ~$5-15/mes
- **S3**: ~$5-10/mes

**Total estimado**: $75-275/mes para uso moderado

## 🚀 Comandos de Desarrollo

```bash
# Instalar dependencias
npm install

# Desarrollo frontend
npm run dev:frontend

# Desarrollo backend
npm run dev:backend

# Build para producción
npm run build

# Deploy a AWS
npm run deploy

# Procesar documentos de soporte
python scripts/process_docs.py

# Tests
npm test
```

## 📖 Recursos Adicionales

### Documentación
- [AWS Bedrock Documentation](https://docs.aws.amazon.com/bedrock/)
- [Claude API Reference](https://docs.anthropic.com/claude/reference)
- [React Chat UI Libraries](https://github.com/topics/react-chat)

### Herramientas Recomendadas
- **Postman** - Testing de APIs
- **AWS CloudWatch** - Monitoreo
- **Sentry** - Error tracking
- **Vercel/Netlify** - Deploy frontend

## 🤝 Contribución

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Añadir nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la Licencia MIT - ver el archivo [LICENSE](LICENSE) para más detalles.

## 📞 Soporte

Para preguntas o soporte:
- 📧 Email: soporte@tuempresa.com
- 💬 Discord: [Servidor del Proyecto]
- 📚 Wiki: [Documentación Completa]

---

**¡Construyamos el futuro de la atención al cliente con IA! 🚀**