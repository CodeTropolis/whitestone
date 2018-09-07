import { TestBed, inject } from '@angular/core/testing';

import { FinancialsService } from '../core/services/financials.service';

describe('FinancialsService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [FinancialsService]
    });
  });

  it('should be created', inject([FinancialsService], (service: FinancialsService) => {
    expect(service).toBeTruthy();
  }));
});
