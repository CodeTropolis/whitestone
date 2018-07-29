import { TestBed, inject } from '@angular/core/testing';

import { RecordResolverService } from './record-resolver.service';

describe('RecordResolverService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RecordResolverService]
    });
  });

  it('should be created', inject([RecordResolverService], (service: RecordResolverService) => {
    expect(service).toBeTruthy();
  }));
});
