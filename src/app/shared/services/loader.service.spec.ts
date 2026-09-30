import {LoaderService} from "./loader.service";

describe('Loader service', () => {
  let loaderService: LoaderService;
  beforeEach(() => {
    loaderService = new LoaderService();
  });
  it('should emit true value fro showing loader', (done: DoneFn)=>{

    loaderService.isShowed$.subscribe(isShowed => {
      expect(isShowed).toBe(true);
      done();
    });
    loaderService.show();
  });
  it('should emit false value fro hiding loader', (done: DoneFn)=>{

    loaderService.isShowed$.subscribe(isShowed => {
      expect(isShowed).toBe(false);
      done();
    });
    loaderService.hide();
  });





});
