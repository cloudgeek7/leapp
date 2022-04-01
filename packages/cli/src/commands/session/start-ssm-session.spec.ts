import { describe, expect, jest, test } from "@jest/globals";
import StartSsmSession from "./start-ssm-session";
import { AwsSessionService } from "@noovolari/leapp-core/services/session/aws/aws-session-service";
import { constants } from "@noovolari/leapp-core/models/constants";

describe("StartSsmSession", () => {
  const getTestCommand = (cliProviderService: any = null): StartSsmSession => {
    const command = new StartSsmSession([], {} as any);
    (command as any).cliProviderService = cliProviderService;
    return command;
  };

  const runCommand = async (errorToThrow: any, expectedErrorMessage: string) => {
    const command = getTestCommand();

    command.selectSession = jest.fn(async (): Promise<any> => "session");
    command.generateCredentials = jest.fn(async (): Promise<any> => "credentials");
    command.selectRegion = jest.fn(async (): Promise<any> => "region");
    command.selectSsmInstance = jest.fn(async (): Promise<any> => "ssmInstance");
    command.startSsmSession = jest.fn(async () => {
      if (errorToThrow) {
        throw errorToThrow;
      }
    });

    try {
      await command.run();
    } catch (error) {
      expect(error).toEqual(new Error(expectedErrorMessage));
    }
    expect(command.selectSession).toHaveBeenCalled();
    expect(command.generateCredentials).toHaveBeenCalledWith("session");
    expect(command.selectRegion).toHaveBeenCalledWith("session");
    expect(command.selectSsmInstance).toHaveBeenCalledWith("credentials", "region");
    expect(command.startSsmSession).toHaveBeenCalledWith("credentials", "ssmInstance", "region");
  };

  test("run - all ok", async () => {
    await runCommand(undefined, "");
  });

  test("run - deleteSession throws exception", async () => {
    await runCommand(new Error("errorMessage"), "errorMessage");
  });

  test("run - deleteSession throws undefined object", async () => {
    await runCommand({ hello: "randomObj" }, "Unknown error: [object Object]");
  });

  test("selectSession", async () => {
    const cliProviderService: any = {
      repository: {
        getSessions: jest.fn(() => [{ sessionName: "awsSession", type: "aws" }, { sessionName: "azureSession" }]),
      },
      sessionFactory: {
        getSessionService: (sessionType) => (sessionType === "aws" ? new (AwsSessionService as any)() : "AzureSession"),
      },
      inquirer: {
        prompt: jest.fn(() => ({ selectedSession: "awsSession" })),
      },
    };

    const command = getTestCommand(cliProviderService);
    const selectedSession = await command.selectSession();
    expect(cliProviderService.inquirer.prompt).toHaveBeenCalledWith([
      {
        choices: [{ name: "awsSession", value: { sessionName: "awsSession", type: "aws" } }],
        message: "select a session",
        name: "selectedSession",
        type: "list",
      },
    ]);
    expect(selectedSession).toEqual("awsSession");
  });

  test("generateCredentials", async () => {
    const awsSessionService = { generateCredentials: jest.fn(() => "credentials") };
    const cliProviderService: any = {
      sessionFactory: { getSessionService: jest.fn(() => awsSessionService) },
    };

    const command = getTestCommand(cliProviderService);

    const session = { sessionId: "sessionId", type: "type" } as any;
    const credentials = await command.generateCredentials(session);

    expect(credentials).toBe("credentials");
    expect(cliProviderService.sessionFactory.getSessionService).toHaveBeenCalledWith(session.type);
    expect(awsSessionService.generateCredentials).toHaveBeenCalledWith(session.sessionId);
  });

  test("selectRegion", async () => {
    const regionFieldChoice = { fieldName: "regionName2", fieldValue: "regionName3" };
    const cliProviderService: any = {
      cloudProviderService: {
        availableRegions: jest.fn(() => [regionFieldChoice]),
      },
      inquirer: {
        prompt: async (params: any) => {
          expect(params).toEqual([
            {
              name: "selectedRegion",
              message: "select region",
              type: "list",
              choices: [{ name: regionFieldChoice.fieldName, value: regionFieldChoice.fieldValue }],
            },
          ]);
          return { selectedRegion: "selectedRegion" };
        },
      },
    };

    const command = getTestCommand(cliProviderService);

    const session = { type: "type" } as any;
    const selectedRegion = await command.selectRegion(session);

    expect(selectedRegion).toBe("selectedRegion");
    expect(cliProviderService.cloudProviderService.availableRegions).toHaveBeenCalledWith(session.type);
  });

  test("selectSsmInstance", async () => {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    const instances = { Name: "instanceName", InstanceId: "instanceId" };
    const cliProviderService: any = {
      ssmService: { getSsmInstances: jest.fn(() => [instances]) },
      inquirer: {
        prompt: async (params: any) => {
          expect(params).toEqual([
            {
              name: "selectedInstance",
              message: "select an instance",
              type: "list",
              choices: [{ name: instances.Name, value: instances.InstanceId }],
            },
          ]);
          return { selectedInstance: "selectedInstance" };
        },
      },
    };

    const command = getTestCommand(cliProviderService);

    const selectedInstance = await command.selectSsmInstance("credentials" as any, "region");

    expect(selectedInstance).toBe("selectedInstance");
    expect(cliProviderService.ssmService.getSsmInstances).toHaveBeenCalledWith("credentials", "region");
  });

  test("startSsmSession, macOS, iTerm", async () => {
    const cliProviderService: any = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      cliNativeService: { process: { platform: "darwin", env: { TERM_PROGRAM: "iTerm.app" } } },
      ssmService: { startSession: jest.fn(() => null) },
    };
    const command = getTestCommand(cliProviderService);
    command.log = jest.fn();

    await command.startSsmSession("credentials" as any, "instanceId", "region");
    expect(cliProviderService.ssmService.startSession).toHaveBeenCalledWith("credentials", "instanceId", "region", constants.macOsIterm2);
    expect(command.log).toHaveBeenCalledWith("started AWS SSM session");
  });

  test("startSsmSession, macOS, other terminal", async () => {
    const cliProviderService: any = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      cliNativeService: { process: { platform: "darwin", env: { TERM_PROGRAM: "otherTerminal.app" } } },
      ssmService: { startSession: jest.fn(() => null) },
    };
    const command = getTestCommand(cliProviderService);

    await command.startSsmSession("credentials" as any, "instanceId", "region");
    expect(cliProviderService.ssmService.startSession).toHaveBeenCalledWith("credentials", "instanceId", "region", constants.macOsTerminal);
  });

  test("startSsmSession, windows, iTerm", async () => {
    const cliProviderService: any = {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      cliNativeService: { process: { platform: "win32", env: { TERM_PROGRAM: "iTerm.app" } } },
      ssmService: { startSession: jest.fn(() => null) },
    };
    const command = getTestCommand(cliProviderService);

    await command.startSsmSession("credentials" as any, "instanceId", "region");
    expect(cliProviderService.ssmService.startSession).toHaveBeenCalledWith("credentials", "instanceId", "region", undefined);
  });
});
