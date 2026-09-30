import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../services/cart.service";
import {FavoriteService} from "../../services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";

@Component({
  selector: 'favorite-product',
  templateUrl: './favorite-product.component.html',
  styleUrls: ['./favorite-product.component.scss']
})
export class FavoriteProductComponent implements OnInit {
  @Input() product!: FavoriteType;
  @Input() countInCart: number = 0;

  @Output() remove = new EventEmitter<string>();
  count: number = 1;
  serverStaticPath = environment.serverStaticPath;

  constructor(private cartService: CartService,
              private favoriteService: FavoriteService,) { }

  ngOnInit(): void {
  }

  addToCart(): void {
    this.cartService.updateCart(this.product.id, this.count)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined){
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = this.count;
      });
  }

  removeFromCart(): void {
    this.cartService.updateCart(this.product.id, 0)
      .subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined){
          throw new Error((data as DefaultResponseType).message);
        }
        this.countInCart = 0;
        this.count = 1;
      });
  }

  updateCount(value: number): void {
    this.count = value;
    if (this.countInCart) {
      this.cartService.updateCart(this.product.id, this.count)
        .subscribe((data: CartType | DefaultResponseType) => {
          if((data as DefaultResponseType).error !== undefined){
            throw new Error((data as DefaultResponseType).message);
          }
          this.countInCart = this.count;
        });
    }
  }

  removeFromFavorites(){
    this.remove.emit(this.product.id);
  }
}
