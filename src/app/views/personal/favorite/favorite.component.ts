import {Component, Input, OnInit} from '@angular/core';
import {FavoriteService} from "../../../shared/services/favorite.service";
import {FavoriteType} from "../../../../types/favorite.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {environment} from "../../../../environments/environment";
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";

@Component({
  selector: 'app-favorite',
  templateUrl: './favorite.component.html',
  styleUrls: ['./favorite.component.scss']
})
export class FavoriteComponent implements OnInit {
  @Input() countInCart: number = 0;
  count: number = 0;
  products: FavoriteType[] = [];
  productsInCart: CartType | null = null;
  serverStaticPath = environment.serverStaticPath;
  private namesInCart: { name: string, quantity: number }[] = [];


  constructor(private favoriteService: FavoriteService,
              private cartService: CartService) { }

  ngOnInit(): void {
    this.favoriteService.getFavorites()
      .subscribe((data: FavoriteType[] | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const errorMsg: string = (data as DefaultResponseType).message;
          throw new Error(errorMsg);
        }

        this.products = data as FavoriteType[];
      });

    this.cartService.getCart()
      .subscribe((data: CartType | DefaultResponseType) => {
        if ((data as DefaultResponseType).error !== undefined) {
          const errorMsg: string = (data as DefaultResponseType).message;
          throw new Error(errorMsg);
        }

        this.productsInCart = data as CartType;
        this.productsInCart.items.forEach(item => {
          return this.namesInCart.push({name: item.product.name, quantity: item.quantity});
        });

        const cartQuantityMap = new Map<string, number>();
        this.productsInCart.items.forEach(item => {
          cartQuantityMap.set(item.product.name, item.quantity);
        });

        this.products = this.products.map(product => {
          if (cartQuantityMap.has(product.name)) {
            return {
              ...product,
              quantity: (product.quantity || 0) + cartQuantityMap.get(product.name)!
            };
          }
          return product;
        });

        console.log(this.products);
      });
  }

  removeFromFavorites(id: string) {
    this.favoriteService.removeFavorite(id)
      .subscribe((data: DefaultResponseType) => {
        if (data.error) {
          throw new Error(data.message);
        }
        this.products = this.products.filter(item => item.id !== id);
      });
  }

}
