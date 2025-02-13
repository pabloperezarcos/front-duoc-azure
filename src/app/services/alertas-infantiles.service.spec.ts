import { TestBed } from '@angular/core/testing';

import { AlertasInfantilesService } from './alertas-infantiles.service';

describe('AlertasInfantilesService', () => {
  let service: AlertasInfantilesService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(AlertasInfantilesService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
