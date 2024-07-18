import { SendOptions, Button } from "@builderbot/bot/dist/types";

export interface ProviderInterface {
  sendText: (to: string, message: string) => Promise<any>;
  sendImage: (to: string, mediaInput: string | null) => Promise<any>;
  sendVideo: (to: string, pathVideo: string | null) => Promise<any>;
  sendMedia: (to: string, text: string, mediaInput: string) => Promise<any>;
  sendButtons: (to: string, buttons: Button[], text: string) => Promise<any>;
  sendButtonUrl: (
    to: string,
    button: Button & { url: string },
    text: string
  ) => Promise<any>;
  sendContacts: (to: string, contact: any[]) => Promise<any>;
  sendCatalog: (number: any, bodyText: any, itemCatalogId: any) => Promise<any>;
  sendMessage: (
    number: string,
    message: string,
    options?: SendOptions
  ) => Promise<any>;
  sendFile: (to: string, mediaInput: string | null) => Promise<any>;
  sendAudio: (to: string, fileOpus: string, text: string) => void;
}

export interface ISendText {
  session?: any;
  number: string;
  Message: MessageContent;
}

export interface MessageContent {
  message?: string;
  url?: string;
}
