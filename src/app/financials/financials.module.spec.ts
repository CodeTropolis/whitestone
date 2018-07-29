import { FinancialsModule } from './financials.module';

describe('FinancialsModule', () => {
  let financialsModule: FinancialsModule;

  beforeEach(() => {
    financialsModule = new FinancialsModule();
  });

  it('should create an instance', () => {
    expect(financialsModule).toBeTruthy();
  });
});
