import { CloudProviderService } from "@noovolari/leapp-core/services/cloud-provider-service";
import { AwsIamUserService } from "@noovolari/leapp-core/services/session/aws/aws-iam-user-service";
import { FileService } from "@noovolari/leapp-core/services/file-service";
import { KeychainService } from "@noovolari/leapp-core/services/keychain-service";
import { AwsCoreService } from "@noovolari/leapp-core/services/aws-core-service";
import { LoggingService } from "@noovolari/leapp-core/services/logging-service";
import { TimerService } from "@noovolari/leapp-core/services/timer-service";
import { AwsIamRoleFederatedService } from "@noovolari/leapp-core/services/session/aws/aws-iam-role-federated-service";
import { AzureService } from "@noovolari/leapp-core/services/session/azure/azure-service";
import { ExecuteService } from "@noovolari/leapp-core/services/execute-service";
import { RetroCompatibilityService } from "@noovolari/leapp-core/services/retro-compatibility-service";
import { AwsParentSessionFactory } from "@noovolari/leapp-core/services/session/aws/aws-parent-session.factory";
import { AwsIamRoleChainedService } from "@noovolari/leapp-core/services/session/aws/aws-iam-role-chained-service";
import { Repository } from "@noovolari/leapp-core/services/repository";
import { RegionsService } from "@noovolari/leapp-core/services/regions-service";
import { AwsSsoRoleService } from "@noovolari/leapp-core/services/session/aws/aws-sso-role-service";
import { WorkspaceService } from "@noovolari/leapp-core/services/workspace-service";
import { SessionFactory } from "@noovolari/leapp-core/services/session-factory";
import { RotationService } from "@noovolari/leapp-core/services/rotation-service";
import { AzureCoreService } from "@noovolari/leapp-core/services/azure-core-service";
import { CliMfaCodePromptService } from "./cli-mfa-code-prompt-service";
import { CliNativeService } from "./cli-native-service";
import { RemoteProceduresClient } from "@noovolari/leapp-core/services/remote-procedures-client";
import { constants } from "@noovolari/leapp-core/models/constants";
import { NamedProfilesService } from "@noovolari/leapp-core/services/named-profiles-service";
import { IdpUrlsService } from "@noovolari/leapp-core/services/idp-urls-service";
import { AwsSsoIntegrationService } from "@noovolari/leapp-core/services/aws-sso-integration-service";
import CliInquirer from "inquirer";
import { AwsSsoOidcService } from "@noovolari/leapp-core/services/aws-sso-oidc.service";
import { CliOpenWebConsoleService } from "./cli-open-web-console-service";
import { WebConsoleService } from "@noovolari/leapp-core/services/web-console-service";
import fetch from "node-fetch";
import { AwsSamlAssertionExtractionService } from "@noovolari/leapp-core/services/aws-saml-assertion-extraction-service";
import { SsmService } from "@noovolari/leapp-core/services/ssm-service";
import { CliRpcAwsSsoOidcVerificationWindowService } from "./cli-rpc-aws-sso-oidc-verification-window-service";
import { IAwsSsoOidcVerificationWindowService } from "@noovolari/leapp-core/interfaces/i-aws-sso-oidc-verification-window-service";
import { CliRpcAwsSamlAuthenticationService } from "./cli-rpc-aws-saml-authentication-service";

/* eslint-disable */
export class CliProviderService {
  private cliNativeServiceInstance: CliNativeService;
  private cliAwsSsoOidcVerificationWindowServiceInstance: IAwsSsoOidcVerificationWindowService;
  private awsSamlAssertionExtractionServiceInstance: AwsSamlAssertionExtractionService;
  private cliRpcAwsSamlAuthenticationServiceInstance: CliRpcAwsSamlAuthenticationService;
  private remoteProceduresClientInstance: RemoteProceduresClient;
  private cliMfaCodePromptServiceInstance: CliMfaCodePromptService;
  private workspaceServiceInstance: WorkspaceService;
  private awsIamUserServiceInstance: AwsIamUserService;
  private awsIamRoleFederatedServiceInstance: AwsIamRoleFederatedService;
  private awsIamRoleChainedServiceInstance: AwsIamRoleChainedService;
  private awsSsoRoleServiceInstance: AwsSsoRoleService;
  private awsSsoOidcServiceInstance: AwsSsoOidcService;
  private azureServiceInstance: AzureService;
  private sessionFactoryInstance: SessionFactory;
  private awsParentSessionFactoryInstance: AwsParentSessionFactory;
  private fileServiceInstance: FileService;
  private repositoryInstance: Repository;
  private regionsServiceInstance: RegionsService;
  private namedProfilesServiceInstance: NamedProfilesService;
  private idpUrlsServiceInstance: IdpUrlsService;
  private awsSsoIntegrationServiceInstance: AwsSsoIntegrationService;
  private keyChainServiceInstance: KeychainService;
  private loggingServiceInstance: LoggingService;
  private timerServiceInstance: TimerService;
  private executeServiceInstance: ExecuteService;
  private rotationServiceInstance: RotationService;
  private retroCompatibilityServiceInstance: RetroCompatibilityService;
  private cloudProviderServiceInstance: CloudProviderService;
  private awsCoreServiceInstance: AwsCoreService;
  private azureCoreServiceInstance: AzureCoreService;
  private cliOpenWebConsoleServiceInstance: CliOpenWebConsoleService;
  private webConsoleServiceInstance: WebConsoleService;
  private ssmServiceInstance: SsmService;

  public get cliNativeService(): CliNativeService {
    if (!this.cliNativeServiceInstance) {
      this.cliNativeServiceInstance = new CliNativeService();
    }
    return this.cliNativeServiceInstance;
  }

  public get cliAwsSsoOidcVerificationWindowService(): IAwsSsoOidcVerificationWindowService {
    if (!this.cliAwsSsoOidcVerificationWindowServiceInstance) {
      this.cliAwsSsoOidcVerificationWindowServiceInstance = new CliRpcAwsSsoOidcVerificationWindowService(this.remoteProceduresClient);
    }
    return this.cliAwsSsoOidcVerificationWindowServiceInstance;
  }

  public get awsSamlAssertionExtractionService(): AwsSamlAssertionExtractionService {
    if (!this.awsSamlAssertionExtractionServiceInstance) {
      this.awsSamlAssertionExtractionServiceInstance = new AwsSamlAssertionExtractionService();
    }
    return this.awsSamlAssertionExtractionServiceInstance;
  }

  public get cliRpcAwsSamlAuthenticationService(): CliRpcAwsSamlAuthenticationService {
    if (!this.cliRpcAwsSamlAuthenticationServiceInstance) {
      this.cliRpcAwsSamlAuthenticationServiceInstance = new CliRpcAwsSamlAuthenticationService(this.remoteProceduresClient);
    }
    return this.cliRpcAwsSamlAuthenticationServiceInstance;
  }

  public get remoteProceduresClient(): RemoteProceduresClient {
    if (!this.remoteProceduresClientInstance) {
      this.remoteProceduresClientInstance = new RemoteProceduresClient(this.cliNativeService);
    }
    return this.remoteProceduresClientInstance;
  }

  public get cliMfaCodePromptService(): CliMfaCodePromptService {
    if (!this.cliMfaCodePromptServiceInstance) {
      this.cliMfaCodePromptServiceInstance = new CliMfaCodePromptService(this.inquirer);
    }
    return this.cliMfaCodePromptServiceInstance;
  }

  public get workspaceService(): WorkspaceService {
    if (!this.workspaceServiceInstance) {
      this.workspaceServiceInstance = new WorkspaceService(this.repository);
    }
    return this.workspaceServiceInstance;
  }

  public get awsIamUserService(): AwsIamUserService {
    if (!this.awsIamUserServiceInstance) {
      this.awsIamUserServiceInstance = new AwsIamUserService(this.workspaceService, this.repository, this.cliMfaCodePromptService,
        this.keyChainService, this.fileService, this.awsCoreService);
    }
    return this.awsIamUserServiceInstance;
  }

  get awsIamRoleFederatedService(): AwsIamRoleFederatedService {
    if (!this.awsIamRoleFederatedServiceInstance) {
      this.awsIamRoleFederatedServiceInstance = new AwsIamRoleFederatedService(this.workspaceService, this.repository,
        this.fileService, this.awsCoreService, this.cliRpcAwsSamlAuthenticationService, constants.samlRoleSessionDuration);
    }
    return this.awsIamRoleFederatedServiceInstance;
  }

  get awsIamRoleChainedService(): AwsIamRoleChainedService {
    if (!this.awsIamRoleChainedServiceInstance) {
      this.awsIamRoleChainedServiceInstance = new AwsIamRoleChainedService(this.workspaceService, this.repository,
        this.awsCoreService, this.fileService, this.awsIamUserService, this.awsParentSessionFactory);
    }
    return this.awsIamRoleChainedServiceInstance;
  }

  get awsSsoRoleService(): AwsSsoRoleService {
    if (!this.awsSsoRoleServiceInstance) {
      this.awsSsoRoleServiceInstance = new AwsSsoRoleService(this.workspaceService, this.repository, this.fileService,
        this.keyChainService, this.awsCoreService, this.cliNativeService, this.awsSsoOidcService);
    }
    return this.awsSsoRoleServiceInstance;
  }

  get awsSsoOidcService(): AwsSsoOidcService {
    if (!this.awsSsoOidcServiceInstance) {
      this.awsSsoOidcServiceInstance = new AwsSsoOidcService(this.cliAwsSsoOidcVerificationWindowService, this.repository, true);
    }
    return this.awsSsoOidcServiceInstance;
  }

  get azureService(): AzureService {
    if (!this.azureServiceInstance) {
      this.azureServiceInstance = new AzureService(this.workspaceService, this.repository, this.fileService, this.executeService,
        constants.azureAccessTokens);
    }
    return this.azureServiceInstance;
  }

  get sessionFactory(): SessionFactory {
    if (!this.sessionFactoryInstance) {
      this.sessionFactoryInstance = new SessionFactory(this.awsIamUserService, this.awsIamRoleFederatedService,
        this.awsIamRoleChainedService, this.awsSsoRoleService, this.azureService);
    }
    return this.sessionFactoryInstance;
  }

  get awsParentSessionFactory(): AwsParentSessionFactory {
    if (!this.awsParentSessionFactoryInstance) {
      this.awsParentSessionFactoryInstance = new AwsParentSessionFactory(this.awsIamUserService, this.awsIamRoleFederatedService,
        this.awsSsoRoleService);
    }
    return this.awsParentSessionFactoryInstance;
  }

  get fileService(): FileService {
    if (!this.fileServiceInstance) {
      this.fileServiceInstance = new FileService(this.cliNativeService);
    }
    return this.fileServiceInstance;
  }

  get repository(): Repository {
    if (!this.repositoryInstance) {
      this.repositoryInstance = new Repository(this.cliNativeService, this.fileService);
    }
    return this.repositoryInstance;
  }

  get regionsService(): RegionsService {
    if (!this.regionsServiceInstance) {
      this.regionsServiceInstance = new RegionsService(this.sessionFactory, this.repository, this.workspaceService);
    }
    return this.regionsServiceInstance;
  }

  get namedProfilesService(): NamedProfilesService {
    if (!this.namedProfilesServiceInstance) {
      this.namedProfilesServiceInstance = new NamedProfilesService(this.sessionFactory, this.repository, this.workspaceService);
    }
    return this.namedProfilesServiceInstance;
  }

  get idpUrlsService(): IdpUrlsService {
    if (!this.idpUrlsServiceInstance) {
      this.idpUrlsServiceInstance = new IdpUrlsService(this.sessionFactory, this.repository);
    }
    return this.idpUrlsServiceInstance;
  }

  get awsSsoIntegrationService(): AwsSsoIntegrationService {
    if (!this.awsSsoIntegrationServiceInstance) {
      this.awsSsoIntegrationServiceInstance = new AwsSsoIntegrationService(this.repository, this.awsSsoOidcService,
        this.awsSsoRoleService, this.keyChainService, this.workspaceService, this.cliNativeService, this.sessionFactory);
    }
    return this.awsSsoIntegrationServiceInstance;
  }

  get keyChainService(): KeychainService {
    if (!this.keyChainServiceInstance) {
      this.keyChainServiceInstance = new KeychainService(this.cliNativeService);
    }
    return this.keyChainServiceInstance;
  }

  get loggingService(): LoggingService {
    if (!this.loggingServiceInstance) {
      this.loggingServiceInstance = new LoggingService(this.cliNativeService);
    }
    return this.loggingServiceInstance;
  }

  get timerService(): TimerService {
    if (!this.timerServiceInstance) {
      this.timerServiceInstance = new TimerService();
    }
    return this.timerServiceInstance;
  }

  get executeService(): ExecuteService {
    if (!this.executeServiceInstance) {
      this.executeServiceInstance = new ExecuteService(this.cliNativeService, this.repository);
    }
    return this.executeServiceInstance;
  }

  get rotationService(): RotationService {
    if (!this.rotationServiceInstance) {
      this.rotationServiceInstance = new RotationService(this.sessionFactory, this.repository);
    }
    return this.rotationServiceInstance;
  }

  get retroCompatibilityService(): RetroCompatibilityService {
    if (!this.retroCompatibilityServiceInstance) {
      this.retroCompatibilityServiceInstance = new RetroCompatibilityService(this.fileService, this.keyChainService,
        this.repository, this.workspaceService, constants.appName, constants.lockFileDestination);
    }
    return this.retroCompatibilityServiceInstance;
  }

  get cloudProviderService(): CloudProviderService {
    if (!this.cloudProviderServiceInstance) {
      this.cloudProviderServiceInstance = new CloudProviderService(this.awsCoreService, this.azureCoreService,
        this.namedProfilesService, this.idpUrlsService, this.repository);
    }
    return this.cloudProviderServiceInstance;
  }

  get awsCoreService(): AwsCoreService {
    if (!this.awsCoreServiceInstance) {
      this.awsCoreServiceInstance = new AwsCoreService(this.cliNativeService);
    }
    return this.awsCoreServiceInstance;
  }

  get azureCoreService(): AzureCoreService {
    if (!this.azureCoreServiceInstance) {
      this.azureCoreServiceInstance = new AzureCoreService();
    }
    return this.azureCoreServiceInstance;
  }

  get cliOpenWebConsoleService(): CliOpenWebConsoleService {
    if (!this.cliOpenWebConsoleServiceInstance) {
      this.cliOpenWebConsoleServiceInstance = new CliOpenWebConsoleService();
    }
    return this.cliOpenWebConsoleServiceInstance;
  }

  get webConsoleService(): WebConsoleService {
    if (!this.webConsoleServiceInstance) {
      this.webConsoleServiceInstance = new WebConsoleService(this.cliOpenWebConsoleService, this.loggingService, fetch);
    }
    return this.webConsoleServiceInstance;
  }

  get ssmService(): SsmService {
    if (!this.ssmServiceInstance) {
      this.ssmServiceInstance = new SsmService(this.loggingService, this.executeService);
    }
    return this.ssmServiceInstance;
  }

  get inquirer(): CliInquirer.Inquirer {
    return CliInquirer;
  }
}
