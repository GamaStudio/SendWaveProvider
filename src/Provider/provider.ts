import { ProviderClass, utils } from '@builderbot/bot';
import Queue from 'queue-promise';

import { GlobalVendorArgs, ProviderInterface } from './interface';
import {
  BotContext,
  BotCtxMiddleware,
  BotCtxMiddlewareOptions,
  SendOptions,
} from '@builderbot/bot/dist/types';

import axios, { AxiosInstance } from 'axios';

import { Agent } from 'https';
import { SendWaveWebHookServer } from './server';
import { colors } from '@gamastudio/colorslog';
import { Vendor } from '@builderbot/bot/dist/provider/interface/provider';

export class SendWaveProvider extends ProviderClass<any> {
  protected beforeHttpServerInit(): void {
    throw new Error('Method not implemented.');
  }
  protected afterHttpServerInit(): void {
    throw new Error('Method not implemented.');
  }
  protected initVendor(): Promise<any> {
    throw new Error('Method not implemented.');
  }
  saveFile(_: any, __?: { path: string }): Promise<string> {
    throw new Error('Method not implemented.');
  }

  http: SendWaveWebHookServer | undefined;
  queue: Queue = new Queue();
  public declare vendor: Vendor;
  sendWaveApi?: AxiosInstance;

  globalVendorArgs: Partial<GlobalVendorArgs> = {
    name: 'bot',
  };

  constructor(args?: Partial<GlobalVendorArgs>) {
    super();

    this.globalVendorArgs = { ...this.globalVendorArgs, ...args };
    this.http = new SendWaveWebHookServer(args?.port || 3000);
    this.createInstance();
  }

  createInstance() {
    this.sendWaveApi = axios.create({
      baseURL: this.globalVendorArgs.url,
      httpsAgent: new Agent({ rejectUnauthorized: false }),
      headers: {
        'Content-Type': 'application/json',
      },
    });
  }

  busEvents = () => [
    {
      event: 'auth_failure',
      func: (payload: any) => this.emit('auth_failure', payload),
    },
    {
      event: 'ready',
      func: () => this.emit('ready', true),
    },
    {
      event: 'noticia',
      func: () => this.emit('noticia', true),
    },
    {
      event: 'message',
      func: (payload: BotContext) => {
        this.emit('message', payload);
      },
    },
    {
      event: 'host',
      func: (payload: any) => {
        this.emit('host', payload);
      },
    },
  ];

  async listenOnEvents() {
    const listEvents = this.busEvents();
    for (const { event, func } of listEvents) {
      this.http?.on(event, func);
    }
  }

  initHttpServer = (
    port: number,
    opts: Pick<BotCtxMiddlewareOptions, 'blacklist'>
  ) => {
    const methods: BotCtxMiddleware<ProviderInterface> = {
      sendMessage: this.sendMessage,
      provider: this,
      blacklist: opts.blacklist,
      dispatch: (customEvent: any, payload: any) => {
        this.emit('message', {
          ...payload,
          body: utils.setEvent(customEvent),
          name: payload.name,
          from: utils.removePlus(payload.from),
        });
      },
    };

    this.http!.start(
      methods,
      port,
      { botName: this.globalVendorArgs.name || 'bot' },
      routes => {
        this.getListRoutes(this.server);
        colors.system(`[WEBHOOK] : http://localhost:${port}/webhook`);
        this.emit('ready', {
          title: '🛜  HTTP Server ON ',
          instructions: routes,
        });

        this.emit('noticia', {
          title: '⚡⚡ SETUP ONE MESSAGE ⚡⚡',
          instructions: [
            `Add "When a message comes in"`,
            `http://localhost:${port}/webhook`,
          ],
        });

        const host = {
          ...this.globalVendorArgs,
        };
        this.emit('host', host);
      }
    );

    this.listenOnEvents();
    return;
  };

  async sendMessage(
    number: string,
    message: any,
    options?: SendOptions
  ): Promise<any> {
    options = { ...options, ...options!['options'] };

    let mss = { number, message, options };

    if (options?.media) {
      colors.info('is not media');
    } else {
      return await this.sendText(mss);
    }
  }

  // {
  //   body: "string",
  // }
  async sendText(data: any): Promise<any> {
    try {
      return await this.sendWaveApi?.post(
        `/api/wp/message/send/text?session=${this.http?.session}`,
        {
          number: data.number,
          Message: {
            message: data.message,
          },
        }
      );
    } catch (e) {
      colors.error(e);
    }
  }
}
