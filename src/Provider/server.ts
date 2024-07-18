import { BotCtxMiddleware } from "@builderbot/bot/dist/types";
import bodyParser from "body-parser";
import { EventEmitter } from "node:events";
import polka, { Middleware, Polka, } from "polka";
import type { SendWaveProvider } from "./provider";
import Queue from "queue-promise";

const idCtxBot = "id-ctx-bot";
const idBotName = "id-bot";

/**
 * Encargado de levantar un servidor HTTP con una hook url
 * [POST] /webhook
 */
export class SendWaveWebHookServer extends EventEmitter {
  public server?: Polka;
  public port: number;
  private messageQueue: Queue;
  session: any;



  constructor(port: number) {
    super();
    this.server = this.buildHTTPServer();
    this.port = port;
    this.messageQueue = new Queue({
      concurrent: 100,
      interval: 2000,
      start: true,
    });
    this.getListRoutes(this.server)
    // this.port = port;
  }

  protected getListRoutes = (app: Polka): string[] => {
    try {
      const list = (app as any).routes as {
        [key: string]: { old: string }[][];
      };
      const methodKeys = Object.keys(list);
      const parseListRoutes = methodKeys.reduce((prev, current) => {
        const routesForMethod = list[current]
          .flat(2)
          .map((i) => ({ method: current, path: i.old }));
        prev = prev.concat(routesForMethod);
        return prev;
      }, [] as { method: string; path: string }[]);
      const unique = parseListRoutes.map(
        (r) => `[${r.method}]: http://localhost:${this.port}${r.path}`
      );
      return [...unique];
    } catch (e) {
      console.log(`[Error]:`, e);
      return [];
    }
  };

  /**
   * Mensaje entrante
   * emit: 'message'
   * @param req
   * @param res
   */
  private incomingMsg: Middleware = (req, res) => {
    try {
      const { body } = req as any;

      if (!body.fromMe) {
        const message = {
          id: body.id,
          from: body?.clientNumber,
          to: body?.sessionNumber,
          name: body?.clientName,
          body: body?.message.body,
          host: body.sessionName,
        };

        this.session = body.sessionName;

        this.messageQueue.enqueue(() => this.processMessage(message, body));
        const jsonResponse = JSON.stringify({
          data: message,
          ok: true,
          message: "Message queued",
        });

        res.end(jsonResponse);
      }
    } catch (error) {
      // console.log("hizo un get");
    }
  };

  protected processMessage(message: any, custom?: any): Promise<void> {
    return new Promise((resolve, reject) => {
      try {
        this.emit("message", { ...message, ...custom });
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  /**
   * Construir HTTP Server
   * @returns Polka instance
   */
  protected buildHTTPServer(): Polka {
    return (
      polka()
        // .use(cors())
        .use(bodyParser.urlencoded({ extended: true }))
        .use(bodyParser.json())
        .get("/webhook", this.incomingMsg)
        .post("/webhook", this.incomingMsg)
    );
  }

  /**
   * Iniciar el servidor HTTP
   */
  start(
    vendor: BotCtxMiddleware,
    port?: number,
    args?: { botName: string },
    cb: (arg?: any) => void = () => null
  ) {
    if (port) this.port = port;

    this.server?.use(async (req:any, _, next) => {
      req[idCtxBot] = vendor;
      req[idBotName] = args?.botName ?? "bot";
      if (req[idCtxBot]) return next();
      return next();
    });

    const routes = this.getListRoutes(this.server!).join("\n");
    this.server?.listen(this.port, cb(routes));
  }

  stop(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.server?.server?.close((err) => {
        if (err) {
          reject(err);
        } else {
          resolve();
        }
      });
    });
  }
}

/**
 *
 * @param inHandleCtx
 * @returns
 */
export const inHandleCtx =
  <
    T extends Pick<SendWaveProvider, "sendMessage" | "vendor"> & {
      provider: SendWaveProvider;
    }
  >(
    ctxPolka: (bot: T | undefined, req: any, res: any) => Promise<void>
  ) =>
  (req: any, res: any) => {
    const bot: T | undefined = req[idCtxBot] ?? undefined;

    const responseError = (res: any) => {
      const jsonRaw = {
        error: `You must first log in by scanning the qr code to be able to use this functionality.`,
        code: `100`,
      };
      console.log(jsonRaw);
      res.writeHead(400, { "Content-Type": "application/json" });
      const jsonBody = JSON.stringify(jsonRaw);
      return res.end(jsonBody);
    };

    try {
      ctxPolka(bot, req, res).catch(() => responseError(res));
    } catch (err) {
      return responseError(res);
    }
  };
