import * as uuid from 'uuid'
import {constants} from '../models/constants'
import {AwsNamedProfile} from '../models/aws-named-profile'
import {Repository} from './repository'
import {Session} from '../models/session'
import {SessionFactory} from './session-factory'
import {SessionStatus} from '../models/session-status'
import {WorkspaceService} from './workspace-service'

export class NamedProfilesService {

    constructor(private sessionFactory: SessionFactory, private repository: Repository,
                private workspaceService: WorkspaceService) {
    }

    public getNamedProfiles(excludingDefault: boolean = false): AwsNamedProfile[] {
        const excludedProfileId = excludingDefault ? this.repository.getDefaultProfileId() : null
        return this.repository.getProfiles().filter(profile => profile.id !== excludedProfileId)
    }

    getNamedProfilesMap(): Map<string, AwsNamedProfile> {
        return new Map(this.getNamedProfiles().map(profile => [profile.id, profile] as [string, AwsNamedProfile]))
    }

    getSessionsWithNamedProfile(id: string): Session[] {
        return this.repository.getSessions().filter(session => (session as any).profileId === id)
    }

    createNamedProfile(name: string) {
        this.repository.addProfile(new AwsNamedProfile(this.getNewId(), name.trim()))
    }

    async editNamedProfile(id: string, newName: string) {
        const activeSessions = this.getSessionsWithNamedProfile(id)
            .filter(session => session.status == SessionStatus.active)

        for (const session of activeSessions) {
            await this.sessionFactory.getSessionService(session.type).stop(session.sessionId)
        }
        this.repository.updateProfile(id, newName.trim())
        for (const session of activeSessions) {
            await this.sessionFactory.getSessionService(session.type).start(session.sessionId)
        }
    }

    async deleteNamedProfile(id: string) {
        const sessions = this.getSessionsWithNamedProfile(id)
        const defaultNamedProfileId = this.repository.getDefaultProfileId()

        for (const session of sessions) {
            const sessionService = this.sessionFactory.getSessionService(session.type)
            const wasActive = session.status === SessionStatus.active
            if (wasActive) {
                await sessionService.stop(session.sessionId)
            }

            (session as any).profileId = defaultNamedProfileId
            this.repository.updateSession(session.sessionId, session)
            this.workspaceService.updateSession(session.sessionId, session)

            if (wasActive) {
                await sessionService.start(session.sessionId)
            }
        }
        this.repository.removeProfile(id)
    }

    getNewId() {
        return uuid.v4()
    }

    validateNewProfileName(name: string): boolean | string {
        const trimmedName = name.trim()
        if (trimmedName.length === 0) {
            return 'Empty profile name'
        }
        if (trimmedName === constants.defaultAwsProfileName) {
            return '"default" is not a valid profile name'
        }
        const namedProfilesNames = this.getNamedProfiles().map(namedProfile => namedProfile.name)
        if (namedProfilesNames.includes(trimmedName)) {
            return 'Profile already exists'
        }
        return true
    }
}
