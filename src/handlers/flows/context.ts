export interface MessageContext {
  env: any;
  userId: string;
  chatId: number;
  text: string;
  message: any;
  request: Request;
}