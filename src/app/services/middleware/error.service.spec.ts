import { TestBed } from '@angular/core/testing';

import { ErrorService } from './error.service';
import {mustInjected} from '../../../base-injectables';
import {AppService} from '../app.service';
import {ToastrModule} from 'ngx-toastr';
import {LeappBaseError} from '../../../../core/errors/leapp-base-error';
import {ErrorHandler} from '@angular/core';
import {AppModule} from '../../app.module';
import {LoggerLevel} from '../../../../core/services/logging-service';

describe('ErrorService', () => {
  let spyAppService;
  let errorService;
  let handler;

  beforeEach(() => {
    spyAppService = jasmine.createSpyObj('AppService', ['logger', 'toast']);
    spyAppService.logger.and.returnValue(true);
    spyAppService.toast.and.returnValue(true);

    handler = TestBed.configureTestingModule({
      imports: [AppModule, ToastrModule.forRoot()],
      providers: [
        { provide: ErrorHandler, useClass: ErrorService },
        { provide: AppService, useValue: spyAppService },

      ].concat(mustInjected())
    }).inject(ErrorHandler) as any;

    errorService = TestBed.inject(ErrorService);
  });

  it('should be created', () => {
    expect(errorService).toBeTruthy();
  });

  it('should call the Error Handler is an error is thrown in code', () => {
    const spyErrorHandler = spyOn(errorService, 'handleError');
    const error =  new LeappBaseError('Mock Error', 'testing', LoggerLevel.warn, 'custom test message');
    errorService.handleError(error);
    expect(spyErrorHandler).toHaveBeenCalled();
  });

  it('should call logger and toast', () => {
    const error =  new LeappBaseError('Mock Error', 'testing', LoggerLevel.warn, 'custom test message');
    errorService.handleError(error);
    expect(spyAppService.logger).toHaveBeenCalled();
    expect(spyAppService.toast).toHaveBeenCalled();
  });

  it('should be registered on the AppModule', () => {
    expect(handler).toEqual(jasmine.any(ErrorService));
  });
});
