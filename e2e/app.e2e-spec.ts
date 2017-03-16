import { KaohsiungUppmPage } from './app.po';

describe('kaohsiung-uppm App', () => {
  let page: KaohsiungUppmPage;

  beforeEach(() => {
    page = new KaohsiungUppmPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
