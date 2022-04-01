import { async, ComponentFixture, TestBed } from "@angular/core/testing";

import { IntegrationBarComponent } from "./integration-bar.component";
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from "@angular/material/snack-bar";
import { mustInjected } from "../../../base-injectables";
import { RouterTestingModule } from "@angular/router/testing";
import { AppProviderService } from "../../services/app-provider.service";
import { AwsSsoIntegration } from "@noovolari/leapp-core/models/aws-sso-integration";

describe("IntegrationBarComponent", () => {
  let component: IntegrationBarComponent;
  let fixture: ComponentFixture<IntegrationBarComponent>;

  beforeEach(async(() => {
    const spyRepositoryService = jasmine.createSpyObj("Repository", {
      getProfiles: [],
      getSessions: [],
      getSegments: [],
      listAwsSsoIntegrations: [],
    });
    const spyWorkspaceService = jasmine.createSpyObj("WorkspaceService", [], {
      integrations: [],
      integrations$: { subscribe: () => {} },
      setIntegrations: (_awsSsoIntegrations: AwsSsoIntegration[]) => void {},
    });
    const spyLeappCoreService = jasmine.createSpyObj("LeappCoreService", [], {
      repository: spyRepositoryService,
      awsCoreService: { getRegions: () => ["mocked-region-1", "mocked-region-2"] },
      awsSsoOidcService: { listeners: [] },
      workspaceService: spyWorkspaceService,
    });

    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [IntegrationBarComponent],
      providers: [
        { provide: MAT_SNACK_BAR_DATA, useValue: {} },
        { provide: MatSnackBarRef, useValue: {} },
      ].concat(mustInjected().concat([{ provide: AppProviderService, useValue: spyLeappCoreService }])),
    }).compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(IntegrationBarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    component.subscription = {
      unsubscribe: () => {},
    };
    component.subscription2 = {
      unsubscribe: () => {},
    };
    component.subscription3 = {
      unsubscribe: () => {},
    };
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });
});
