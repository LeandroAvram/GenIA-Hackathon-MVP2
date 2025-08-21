import { AudioType, AudioMediaType, TextMediaType } from "./types";

export const DefaultInferenceConfiguration = {
  maxTokens: 1024,
  topP: 0.9,
  temperature: 0.7,
};

export const DefaultAudioInputConfiguration = {
  audioType: "SPEECH" as AudioType,
  encoding: "base64",
  mediaType: "audio/lpcm" as AudioMediaType,
  sampleRateHertz: 16000,
  sampleSizeBits: 16,
  channelCount: 1,
};

export const DefaultToolSchema = JSON.stringify({
  "type": "object",
  "properties": {},
  "required": []
});

export const WeatherToolSchema = JSON.stringify({
  "type": "object",
  "properties": {
    "latitude": {
      "type": "string",
      "description": "Geographical WGS84 latitude of the location."
    },
    "longitude": {
      "type": "string",
      "description": "Geographical WGS84 longitude of the location."
    }
  },
  "required": ["latitude", "longitude"]
});

export const KnowledgeBaseToolSchema = JSON.stringify({
  "type": "object",
  "properties": {
    "query": {
      "type": "string",
      "description": "La consulta de búsqueda para encontrar información relevante en la base de conocimiento."
    }
  },
  "required": ["query"]
});

export const DefaultTextConfiguration = { mediaType: "text/plain" as TextMediaType };

export const DefaultSystemPrompt = "Eres un asistente de Personal Flow que SIEMPRE responde en español siempre. " +
  "OBLIGATORIAMENTE debes usar la herramienta knowledgeBaseTool para buscar información antes de responder CUALQUIER pregunta. " +
  "NUNCA respondas sin usar primero esta herramienta. Responde SOLO en español, sin excepción. " +
  "Basa tus respuestas únicamente en la información de la base de conocimiento. " +
  "Si no encuentras información relevante, responde en español que no tienes esa información disponible.";

export const DefaultAudioOutputConfiguration = {
  ...DefaultAudioInputConfiguration,
  sampleRateHertz: 24000,
  voiceId: "lupe",
};
