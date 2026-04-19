import SockJS from "sockjs-client";
import { Client, type Frame, type Message, over } from "stompjs";

export interface SalaMensaje {
  usuario: string;
  mensaje: string;
  salaCodigo: string;
}

type MensajeHandler = (mensaje: SalaMensaje) => void;
type ErrorHandler = (error: string) => void;

const API_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8080";
const WS_ENDPOINT = `${API_URL}/ws`;
const WS_SUBSCRIBE_DESTINATION = "/topic/sala";
const WS_SEND_DESTINATION = "/app/mensaje";

let stompClient: Client | null = null;

export const conectarSocket = (
  onMensaje: MensajeHandler,
  onError?: ErrorHandler,
): void => {
  if (stompClient?.connected) {
    return;
  }

  const socket = new SockJS(WS_ENDPOINT);
  stompClient = over(socket);
  stompClient.debug = () => {};

  stompClient.connect(
    {},
    (_frame?: Frame) => {
      stompClient?.subscribe(WS_SUBSCRIBE_DESTINATION, (message: Message) => {
        try {
          const body = JSON.parse(message.body) as SalaMensaje;
          onMensaje(body);
        } catch {
          onError?.("No se pudo procesar el mensaje recibido.");
        }
      });
    },
    () => {
      onError?.("No se pudo conectar al WebSocket.");
    },
  );
};

export const desconectarSocket = (): void => {
  stompClient?.disconnect(() => {
    stompClient = null;
  });
};

export const enviarMensajeSala = (mensaje: SalaMensaje): void => {
  if (!stompClient?.connected) {
    throw new Error("WebSocket no conectado.");
  }

  stompClient.send(WS_SEND_DESTINATION, {}, JSON.stringify(mensaje));
};
