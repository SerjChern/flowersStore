import {ProductCardComponent} from "./product-card.component";
import {ComponentFixture, TestBed} from "@angular/core/testing";
import {CartService} from "../../services/cart.service";
import {AuthService} from "../../../core/auth/auth.service";
import {Router} from "@angular/router";
import {MatSnackBar} from "@angular/material/snack-bar";
import {FavoriteService} from "../../services/favorite.service";
import {of} from "rxjs";


describe('product card', () => {

  let productCardComponent: ProductCardComponent;
  let fixture: ComponentFixture<ProductCardComponent>;
  beforeEach(() => {

    const cartServiceSpy = jasmine.createSpyObj("CartService", ["updateCart"]);
    const authServiceSpy = jasmine.createSpyObj("AuthService", ["getIsLoggedIn"]);
    const routerSpy = jasmine.createSpyObj("Router", ["navigate"]);
    const _snackBarSpy = jasmine.createSpyObj("MatSnackBar", ["open"]);
    const favoriteServiceSpy = jasmine.createSpyObj("FavoriteService", ["removeFavorite", "addFavorite"]);


    TestBed.configureTestingModule({
      declarations: [ProductCardComponent],
      providers: [
        {provide: CartService, useValue: cartServiceSpy},
        {provide: AuthService, useValue: authServiceSpy},
        {provide: Router, useValue: routerSpy},
        {provide: MatSnackBar, useValue: _snackBarSpy},
        {provide: FavoriteService, useValue: favoriteServiceSpy},
      ]
    });
    fixture = TestBed.createComponent(ProductCardComponent);
    productCardComponent = fixture.componentInstance;
  });
  it('should have count init value 1', ()=>{
    expect(productCardComponent.count).toBe(1);
  });
  it('should set value from input CountInCart to count', (done: DoneFn)=>{
    productCardComponent.countInCart = 5;
    fixture.detectChanges();
    fixture.whenStable().then(() => {
      expect(productCardComponent.count).toBe(5);
      done();
    });
  });
  it('should call RemoveFromCard with count 0', ()=>{
    let cartServiceRemoveSpy = TestBed.inject(CartService) as jasmine.SpyObj<CartService>;
    cartServiceRemoveSpy.updateCart.and.returnValue(of({
      items:[
        {
          product: {
            id: '1',
            name: '1',
            price: 1,
            image: '1',
            url: '1',
          },
          quantity: 1,
        }]
    }));
    //productCardComponent.removeFromCart();
  });

});
