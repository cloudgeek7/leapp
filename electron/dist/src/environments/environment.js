"use strict";
// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.
Object.defineProperty(exports, "__esModule", { value: true });
var environment = {
    appName: 'Leapp',
    sessionDuration: 1200,
    lockFileDestination: '',
    python3Version: '3.4.0',
    production: false,
    credentialsDestination: '.aws/credentials',
    azureAccessTokens: '.azure/accessTokens.json',
    azureProfile: '.azure/azureProfile.json'
};
exports.environment = environment;
environment.lockFileDestination = ".Leapp/Leapp-lock.json";
//# sourceMappingURL=environment.js.map