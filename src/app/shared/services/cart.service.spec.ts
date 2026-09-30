import {CartService} from "./cart.service";
import {of} from "rxjs";
import {HttpClient} from "@angular/common/http";
import {environment} from "../../../environments/environment";
import {TestBed} from "@angular/core/testing";


describe('Cart service', () => {
  let cartService: CartService;
  const countValue = 3;
  let valueServiceSpy: jasmine.SpyObj<HttpClient>;
  beforeEach(() => {
    valueServiceSpy = jasmine.createSpyObj('HttpClient', ['get']);
    valueServiceSpy.get.and.returnValue(of({count: countValue}));


    // Создаем тестовое окружение полностью эмулируя модуль Angular
    TestBed.configureTestingModule({
      providers: [
        CartService,
        {provide: HttpClient  , useValue: valueServiceSpy},
      ]
    });
    cartService = TestBed.inject(CartService);
  });
  it('should emit new count value', (done: DoneFn)=>{
    cartService.count$.subscribe((count: number) => {
      expect(count).toBe(countValue);
      done();
    });
    cartService.getCartCount().subscribe();
  });

  it('should make http request for cart data', (done: DoneFn)=>{
    cartService.getCart().subscribe(()=>{
      expect(valueServiceSpy.get).toHaveBeenCalledOnceWith(environment.api + 'cart', {withCredentials: true});
      done();
    });
  });


});
