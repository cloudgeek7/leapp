import {Component, Input, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {Session} from '../../../../../core/models/session';
import {AwsSessionService} from '../../../services/session/aws/aws-session.service';
import {AppService, LoggerLevel, ToastLevel} from '../../../services/app.service';
import {Router} from '@angular/router';
import {AwsIamRoleFederatedSession} from '../../../../../core/models/aws-iam-role-federated-session';
import {SsmService} from '../../../services/ssm.service';
import {SessionType} from '../../../../../core/models/session-type';
import {WorkspaceService} from '../../../services/workspace.service';
import {environment} from '../../../../environments/environment';
import {KeychainService} from '../../../services/keychain.service';
import * as uuid from 'uuid';
import {BsModalRef, BsModalService} from 'ngx-bootstrap/modal';
import {FileService} from '../../../services/file.service';
import {SessionFactoryService} from '../../../services/session-factory.service';
import {SessionStatus} from '../../../../../core/models/session-status';
import {SessionService} from '../../../services/session.service';
import {Constants} from '../../../../../core/models/constants';
import {AwsIamUserService} from '../../../services/session/aws/methods/aws-iam-user.service';
import {LoggingService} from '../../../services/logging.service';

@Component({
  selector: 'app-session-card',
  templateUrl: './session-card.component.html',
  styleUrls: ['./session-card.component.scss'],

})
export class SessionCardComponent implements OnInit {

  @Input()
  session!: Session;

  @ViewChild('ssmModalTemplate', { static: false })
  ssmModalTemplate: TemplateRef<any>;

  @ViewChild('defaultRegionModalTemplate', { static: false })
  defaultRegionModalTemplate: TemplateRef<any>;

  @ViewChild('defaultProfileModalTemplate', { static: false })
  defaultProfileModalTemplate: TemplateRef<any>;

  eSessionType = SessionType;
  eSessionStatus = SessionStatus;

  modalRef: BsModalRef;

  ssmLoading = true;
  selectedSsmRegion;
  selectedDefaultRegion;
  openSsm = false;
  firstTimeSsm = true;
  awsRegions = [];
  regionOrLocations = [];
  instances = [];
  duplicateInstances = [];
  placeholder;
  selectedProfile: any;
  profiles: { id: string; name: string }[];

  // Generated by the factory
  private sessionService: SessionService;

  constructor(private workspaceService: WorkspaceService,
              private keychainService: KeychainService,
              private appService: AppService,
              private fileService: FileService,
              private router: Router,
              private ssmService: SsmService,
              private sessionProviderService: SessionFactoryService,
              private loggingService: LoggingService,
              private modalService: BsModalService) {}

  ngOnInit() {
    // Generate a singleton service for the concrete implementation of SessionService
    this.sessionService = this.sessionProviderService.getService(this.session.type);

    // Set regions and locations
    this.awsRegions = this.appService.getRegions();
    const azureLocations = this.appService.getLocations();

    // Get profiles
    this.profiles = this.workspaceService.getProfiles();

    // Array and labels for regions and locations
    this.regionOrLocations = this.session.type !== SessionType.azure ? this.awsRegions : azureLocations;
    this.placeholder = this.session.type !== SessionType.azure ? 'Select a default region' : 'Select a default location';

    // Pre selected Region and Profile
    this.selectedDefaultRegion = this.session.region;
    this.selectedProfile = this.getProfileId(this.session);
  }

  /**
   * Used to call for start or stop depending on session status
   */
  switchCredentials() {
    if (this.session.status === SessionStatus.active) {
      this.stopSession();
    } else {
      this.startSession();
    }
  }

  /**
   * Start the selected session
   */
  startSession() {
    this.sessionService.start(this.session.sessionId).then(_ => {});
    this.logSessionData(this.session, `Starting Session`);
  }

  /**
   * Stop session
   */
  stopSession() {
    this.sessionService.stop(this.session.sessionId).then(_ => {});
    this.logSessionData(this.session, `Stopped Session`);
  }

  /**
   * Delete a session from the workspace
   *
   * @param session - the session to remove
   * @param event - for stopping propagation bubbles
   */
  deleteSession(session, event) {
    event.stopPropagation();

    const dialogMessage = this.generateDeleteDialogMessage(session);

    this.appService.confirmDialog(dialogMessage, (status) => {
      if (status === Constants.confirmed) {
        this.sessionService.delete(session.sessionId).then(_ => {});
        this.logSessionData(session, 'Session Deleted');
      }
    });
  }

  /**
   * Edit Session
   *
   * @param session - the session to edit
   * @param event - to remove propagation bubbles
   */
  editSession(session: Session, event) {
    event.stopPropagation();
    this.router.navigate(['/managing', 'edit-account'], {queryParams: { sessionId: session.sessionId }}).then(_ => {});
  }

  /**
   * Copy credentials in the clipboard
   */
  async copyCredentials(session: Session, type: number, event) {
    event.stopPropagation();
    try {
      if (this.workspaceService.get()) {
        const texts = {
          1: (session as AwsIamRoleFederatedSession).roleArn ? `${(session as AwsIamRoleFederatedSession).roleArn.split('/')[0].substring(13, 25)}` : '',
          2: (session as AwsIamRoleFederatedSession).roleArn ? `${(session as AwsIamRoleFederatedSession).roleArn}` : ''
        };

        let text = texts[type];

        // Special conditions for IAM Users
        if (session.type === SessionType.awsIamUser) {
          // Get Account from Caller Identity
          text = await (this.sessionService as AwsIamUserService).getAccountNumberFromCallerIdentity(session);
        }

        this.appService.copyToClipboard(text);
        this.loggingService.toast('Your information have been successfully copied!', ToastLevel.success, 'Information copied!');
      }
    } catch (err) {
      this.loggingService.toast(err, ToastLevel.warn);
      this.loggingService.logger(err, LoggerLevel.error, this, err.stack);
    }
  }

  // ============================== //
  // ========== SSM AREA ========== //
  // ============================== //
  addNewProfile(tag: string) {
    return {id: uuid.v4(), name: tag};
  }

  /**
   * SSM Modal open given the correct session
   *
   * @param session - the session to check for possible ssm sessions
   */
  ssmModalOpen(session) {
    // Reset things before opening the modal
    this.instances = [];
    this.ssmLoading = false;
    this.firstTimeSsm = true;
    this.selectedSsmRegion = null;
    this.modalRef = this.modalService.show(this.ssmModalTemplate, { class: 'ssm-modal'});
  }

  /**
   * SSM Modal open given the correct session
   *
   * @param session - the session to check for possible ssm sessions
   */
  changeRegionModalOpen(session) {
    // open the modal
    this.modalRef = this.modalService.show(this.defaultRegionModalTemplate, { class: 'ssm-modal'});
  }

  /**
   * Set the region for ssm init and launch the mopethod form the server to find instances
   *
   * @param event - the change select event
   * @param session - The session in which the aws region need to change
   */
  async changeSsmRegion(event, session: Session) {
    // We have a valid SSM region
    if (this.selectedSsmRegion) {
      // Start process
      this.ssmLoading = true;
      this.firstTimeSsm = true;
      // Generate valid temporary credentials for the SSM and EC2 client
      const credentials = await (this.sessionService as AwsSessionService).generateCredentials(session.sessionId);
      // Get the instances
      this.instances = await this.ssmService.getSsmInstances(credentials, this.selectedSsmRegion);
      this.duplicateInstances = this.instances;
      this.ssmLoading = false;
      this.firstTimeSsm = false;
    }
  }

  /**
   * Set the region for the session
   */
  async changeRegion() {
    if (this.selectedDefaultRegion) {
      let wasActive = false;

      if (this.session.status === SessionStatus.active) {
        // Stop temporary if the session is active
        await this.sessionService.stop(this.session.sessionId);
        wasActive = true;
      }

      this.session.region = this.selectedDefaultRegion;
      this.sessionService.update(this.session.sessionId, this.session);

      if (wasActive) {
        this.startSession();
      }

      this.loggingService.toast('Default region has been changed!', ToastLevel.success, 'Region changed!');
      this.modalRef.hide();
    }
  }

  /**
   * Start a new ssm session
   *
   * @param sessionId - id of the session
   * @param instanceId - instance id to start ssm session
   */
  async startSsmSession(sessionId, instanceId) {
    this.instances.forEach(instance => {
     if (instance.InstanceId === instanceId) {
       instance.loading = true;
     }
    });

    // Generate valid temporary credentials for the SSM and EC2 client
    const credentials = await (this.sessionService as AwsSessionService).generateCredentials(sessionId);

    this.ssmService.startSession(credentials, instanceId, this.selectedSsmRegion);

    setTimeout(() => {
      this.instances.forEach(instance => {
       if (instance.InstanceId === instanceId) {
          instance.loading = false;
       }
      });
    }, 4000);

    this.openSsm = false;
    this.ssmLoading = false;
  }

  searchSSMInstance(event) {
    if (event.target.value !== '') {
      this.instances = this.duplicateInstances.filter(i =>
                                 i.InstanceId.indexOf(event.target.value) > -1 ||
                                 i.IPAddress.indexOf(event.target.value) > -1 ||
                                 i.Name.indexOf(event.target.value) > -1);
    } else {
      this.instances = this.duplicateInstances;
    }
  }

  getProfileId(session: Session): string {
    if(session.type !== SessionType.azure) {
      return (session as any).profileId;
    } else {
      return undefined;
    }
  }

  getProfileName(profileId: string): string {
    const profileName = this.workspaceService.getProfileName(profileId);
    return profileName ? profileName : environment.defaultAwsProfileName;
  }

  async changeProfile() {
    if (this.selectedProfile) {
      let wasActive = false;

      if(!this.workspaceService.getProfileName(this.selectedProfile.id)) {
        this.workspaceService.addProfile(this.selectedProfile);
      }

      if (this.session.status === SessionStatus.active) {
        await this.sessionService.stop(this.session.sessionId);
        wasActive = true;
      }

      (this.session as any).profileId = this.selectedProfile.id;
      this.sessionService.update(this.session.sessionId, this.session);

      if (wasActive) {
        this.startSession();
      }

      this.loggingService.toast('Profile has been changed!', ToastLevel.success, 'Profile changed!');
      this.modalRef.hide();
    }
  }

  changeProfileModalOpen() {
    this.selectedProfile = null;
    this.modalRef = this.modalService.show(this.defaultProfileModalTemplate, { class: 'ssm-modal'});
  }

  goBack() {
    this.modalRef.hide();
  }

  getIcon(session: Session) {
    const iconName = this.getProfileName(this.getProfileId(session)) === environment.defaultAwsProfileName ? 'home' : 'user';
    return session.status === SessionStatus.active ? `${iconName} orange` : iconName;
  }

  private logSessionData(session: Session, message: string): void {
    this.loggingService.logger(
      message,
      LoggerLevel.info,
      this,
      JSON.stringify({
        timestamp: new Date().toISOString(),
        id: session.sessionId,
        account: session.sessionName,
        type: session.type
      }, null, 3));
  }

  private generateDeleteDialogMessage(session: Session): string {
    let iamRoleChainedSessions = [];
    if (session.type !== SessionType.azure) {
      iamRoleChainedSessions = (this.sessionService as AwsSessionService).listIamRoleChained(session);
    }

    let iamRoleChainedSessionString = '';
    iamRoleChainedSessions.forEach(sess => {
      iamRoleChainedSessionString += `<li><div class="removed-sessions"><b>${sess.sessionName}</b></div></li>`;
    });
    if (iamRoleChainedSessionString !== '') {
      return 'This session has iamRoleChained sessions: <br><ul>' +
        iamRoleChainedSessionString +
        '</ul><br>Removing the session will also remove the iamRoleChained session associated with it. Do you want to proceed?';
    } else {
      return 'Do you really want to delete this session?';
    }
  }
}
