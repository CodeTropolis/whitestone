import { RecordModule } from './record.module';

describe('RecordModule', () => {
  let recordModule: RecordModule;

  beforeEach(() => {
    recordModule = new RecordModule();
  });

  it('should create an instance', () => {
    expect(recordModule).toBeTruthy();
  });
});
