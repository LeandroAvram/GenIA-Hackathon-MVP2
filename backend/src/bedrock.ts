import { BedrockRuntimeClient, InvokeModelCommand } from '@aws-sdk/client-bedrock-runtime';
import { ToolRegistry } from './tools';

export class BedrockService {
  private client: BedrockRuntimeClient;
  private toolRegistry: ToolRegistry;

  constructor() {
    const credentials: any = {};
    if (process.env.AWS_ACCESS_KEY_ID) credentials.accessKeyId = process.env.AWS_ACCESS_KEY_ID;
    if (process.env.AWS_SECRET_ACCESS_KEY) credentials.secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;
    if (process.env.AWS_SESSION_TOKEN) credentials.sessionToken = process.env.AWS_SESSION_TOKEN;

    
    this.client = new BedrockRuntimeClient({ 
      region: process.env.AWS_REGION || 'us-west-2',
      ...(Object.keys(credentials).length > 0 && { credentials })
    });
    this.toolRegistry = new ToolRegistry();
  }

  async askQuestion(question: string): Promise<string> {
    const tools = this.toolRegistry.getTools();
    const toolsSchema = tools.map(t => ({
      name: t.name,
      description: t.description,
      input_schema: t.parameters
    }));

    const systemPrompt = `
Eres un agente de atención al cliente en telecomunicaciones, amable y profesional.
Tu función es ayudar a los usuarios con consultas sobre servicios de telecomunicaciones, planes, facturación, soporte técnico y preguntas frecuentes.
No comiences tus respuestas con frases impersonales o genéricas como “Basado en la información disponible”, “Según la información que tengo”, “De acuerdo a la base de datos”, etc.
Responde directamente al usuario de forma natural y cercana, como lo haría un agente humano.
Pautas de comportamiento:

Responde de forma clara y sencilla

Evita tecnicismos y usa un lenguaje fácil de entender.

Cuando se trate de soporte técnico, explica los pasos de manera simple y ordenada.

Sé profesional y empático

Mantén siempre un tono cordial y de apoyo.

Recuerda que el cliente puede estar frustrado; responde con paciencia y comprensión.

Ofrece soluciones prácticas

Da respuestas que ayuden al cliente a resolver su problema de la forma más rápida y efectiva posible.

Si existe más de una alternativa, menciónalas de manera breve.

Si no tienes una respuesta confiable

Brinda una orientación general basada en prácticas comunes en telecomunicaciones.

Si no es posible ayudar y denota frustracion, responde con sinceridad:
Responde de manera honesta y educada indicando la necesidad de escalar el caso:
“Lamento no poder resolver tu consulta en este momento. Voy a derivarte con un representante humano para que pueda ayudarte mejor.”

No inventes información.


Cuando la solución fue brindada correctamente

Cierra la interacción con un mensaje breve de encuesta de satisfacción, por ejemplo:
“Me alegra haber podido ayudarte 😊. Antes de cerrar, ¿podrías valorar tu experiencia de atención respondiendo a esta breve encuesta de satisfacción?”
Estilo:

Mantén tus respuestas cortas, directas y útiles.

Usa listas o pasos numerados solo cuando ayuden a la claridad.

Confirma la comprensión cuando guíes un proceso (por ejemplo: “¿Podrías confirmar si tu dispositivo muestra alguna señal en la pantalla?”).`;

    const messages = [
      { role: 'user', content: `${systemPrompt}\n\nUser question: ${question}` }
    ];
    
    while (true) {
      const command = new InvokeModelCommand({
        modelId: 'anthropic.claude-3-5-sonnet-20241022-v2:0',
        body: JSON.stringify({
          anthropic_version: 'bedrock-2023-05-31',
          max_tokens: 1000,
          messages,
          ...(toolsSchema.length > 0 && { tools: toolsSchema })
        })
      });

      const response = await this.client.send(command);
      const result = JSON.parse(new TextDecoder().decode(response.body));
      
      messages.push({ role: 'assistant', content: result.content });

      const toolUse = result.content.find((c: any) => c.type === 'tool_use');
      if (!toolUse) {
        const textContent = result.content.find((c: any) => c.type === 'text');
        return textContent?.text || 'No response generated';
      }

      const toolResult = await this.toolRegistry.executeTool(toolUse.name, toolUse.input);
      (messages as any).push({
        role: 'user',
        content: [{
          type: 'tool_result',
          tool_use_id: toolUse.id,
          content: toolResult
        }]
      });
    }
  }
}