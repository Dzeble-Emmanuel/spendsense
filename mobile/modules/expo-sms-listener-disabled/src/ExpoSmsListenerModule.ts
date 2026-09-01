import { NativeModule, requireNativeModule } from "expo";


export type SmsReceivedEvent = {
  sender: string;
  message: string;
};


export type ExpoSmsListenerEvents = {
  [key: string]: (...args: any[]) => void;

  onSmsReceived(event: SmsReceivedEvent): void;
};


declare class ExpoSmsListenerModule
  extends NativeModule<ExpoSmsListenerEvents> {

  startListening(): void;

  sendTestSMS(): void;

}


export default requireNativeModule<ExpoSmsListenerModule>(
  "ExpoSmsListener"
);