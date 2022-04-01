import { LeappBaseError } from "./leapp-base-error";
import { LoggerLevel } from "../services/logging-service";

export class LeappMissingMfaTokenError extends LeappBaseError {
  constructor(context: any, message: string) {
    super("Leapp Missing Mfa Token Error", context, LoggerLevel.warn, message);
  }
}
