export enum EnumSendMedia {
  VIDEO = 'video',
  IMAGE = 'image',
  AUDIO = 'audio',
  DOC = 'doc',
  ORDER = 'order',
}

export interface IMessage {
  session?: any;
  number: string;
  Message: MessageContent;
}

export interface MessageContent {
  message?: string;
  media?: MediaMessage[];
  url?: string;
  contact: IContactMessage;
  location?: ILocationMessage;
}

export interface MessageResponse {
  id?: string;
  fromMe?: boolean;
  isGroupMsg?: boolean;
  idWhatsapp?: string;

  sessionName?: string;
  sessionNumber?: string;
  clientNumber: string;
  clientName?: string;
  isMedia?: TypeMessage;
  message?: ContentMessage;
  type?: string;
  provider?: string;
}

interface ContentMessage {
  body?: string;
  media?: MediaMessage;
  date?: Date | string | number;
  location?: ILocationMessage;
  order?: IOrderMessage;
}

interface TypeMessage {
  isImage?: boolean;
  isVideo?: boolean;
  isAudio?: boolean;
  isSticker?: boolean;
  isContact?: boolean;
  isOrder?: boolean;
  isLocation?: boolean;
}

interface MediaMessage {
  type?: string;
  url?: string;
  text?: string;
}
export interface IOrderMessage {
  orderId?: string;
  tokenId?: string;
}

export interface ILocationMessage {
  lat: string;
  long: string;
}

export interface IContactMessage {
  contactNumber: any;
  displayName: string;
}

export interface IMessageDB {
  id: string;
  clientNumber: string;
  sessionName: string;
  sessionNumber: string;
  idWhatsapp: string;
  message?: string;
  fromMe: boolean;
  type: string;
  date: string;
  url?: string;
  tokenId?: string;
  orderId?: string;
  provider?: string;
  lat?: string;
  long?: string;
  createdAt?: string;
  updatedAt?: string;
}
