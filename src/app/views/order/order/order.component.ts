import {Component, ElementRef, OnInit, TemplateRef, ViewChild} from '@angular/core';
import {CartService} from "../../../shared/services/cart.service";
import {CartType} from "../../../../types/cart.type";
import {DefaultResponseType} from "../../../../types/default-response.type";
import {Router} from "@angular/router";
import {ProductService} from "../../../shared/services/product.service";
import {MatSnackBar} from "@angular/material/snack-bar";
import {DeliveryType} from "../../../../types/delivery.type";
import {FormBuilder, Validators} from "@angular/forms";
import {PaymentType} from "../../../../types/payment.type";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";
import {OrderService} from "../../../shared/services/order.service";
import {OrderType} from "../../../../types/order.type";
import {HttpErrorResponse} from "@angular/common/http";
import {UserService} from "../../../shared/services/user.service";
import {UserInfoType} from "../../../../types/user-info.type";
import {AuthService} from "../../../core/auth/auth.service";

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss']
})
export class OrderComponent implements OnInit {


  deliveryType: DeliveryType = DeliveryType.delivery;
  deliveryTypes = DeliveryType;
  protected readonly PaymentType = PaymentType;
  cart: CartType | null = null;
  totalAmount: number = 0;
  totalCount: number = 0;
  dialogRef: MatDialogRef<any> | null = null;

  orderForm = this.fb.group({
    deliveryType: [DeliveryType.delivery],
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    phone: ['', Validators.required],
    fatherName: [''],
    paymentType: [PaymentType.cashToCourier, Validators.required],
    email: ['', [Validators.required, Validators.email]],
    street: [''],
    house: [''],
    entrance: [''],
    apartment: [''],
    comment: [''],
  });

  @ViewChild('popup')popup!: TemplateRef<ElementRef>;

  constructor(private cartService: CartService,
              private orderService: OrderService,
              private router: Router,
              private userService: UserService,
              private _snackBar: MatSnackBar,
              private fb: FormBuilder,
              private dialog: MatDialog,
              private authService: AuthService,) {
    this.updateDeliveryTypeValidation();
  }

  ngOnInit(): void {
    this.cartService.getCart().subscribe((data: CartType | DefaultResponseType) => {
        if((data as DefaultResponseType).error !== undefined){
          throw new Error((data as DefaultResponseType).message);
        }
        this.cart = data as CartType;
        if (!this.cart || (this.cart && this.cart.items.length ===0)){
          this._snackBar.open('Cart is empty');
          this.router.navigate(['/']);
          return;
        }
        this.calculateTotal();
      }
    );
    if (this.authService.getIsLoggedIn()){
      this.userService.getUserInfo()
        .subscribe((data: UserInfoType | DefaultResponseType) => {
          if((data as DefaultResponseType).error !== undefined){
            throw new Error((data as DefaultResponseType).message);
          }
          const userInfo: UserInfoType = data as UserInfoType;
          const paramsToUpdate = {
            firstName: userInfo.firstName ? userInfo.firstName : '',
            lastName: userInfo.lastName ? userInfo.lastName : '',
            phone: userInfo.phone ? userInfo.phone : '',
            fatherName: userInfo.fatherName ? userInfo.fatherName : '',
            paymentType: userInfo.paymentType ? userInfo.paymentType : PaymentType.cashToCourier,
            deliveryType: userInfo.deliveryType ? userInfo.deliveryType : DeliveryType.delivery,
            email: userInfo.email ? userInfo.email : '',
            street: userInfo.street ? userInfo.street : '',
            house: userInfo.house ? userInfo.house : '',
            entrance: userInfo.entrance ? userInfo.entrance : '',
            apartment: userInfo.apartment ? userInfo.apartment : '',
            comment: '',
          };
          this.orderForm.setValue(paramsToUpdate);
          this.orderForm.patchValue({
            deliveryType: userInfo.deliveryType ?? DeliveryType.delivery
          });

          // Also update component property
          this.deliveryType = userInfo.deliveryType ?? DeliveryType.delivery;
        });
    }
  }

  calculateTotal(){
    if (this.cart){
      this.totalAmount = 0;
      this.totalCount = 0;

      this.cart.items.forEach((element) => {
        this.totalAmount += element.quantity * element.product.price;
        this.totalCount += element.quantity;
      });
    }
  }


  changeDeliveryType(type: DeliveryType) {
    this.deliveryType = type;
    console.log(this.deliveryType);
    this.updateDeliveryTypeValidation();
  }

  updateDeliveryTypeValidation(){
    if (this.deliveryType === DeliveryType.delivery){
      this.orderForm.get('street')?.setValidators([Validators.required]);
      this.orderForm.get('house')?.setValidators([Validators.required]);
    } else {
      this.orderForm.get('street')?.removeValidators([Validators.required]);
      this.orderForm.get('house')?.removeValidators([Validators.required]);
      this.orderForm.get('street')?.setValue('');
      this.orderForm.get('house')?.setValue('');
      this.orderForm.get('entrance')?.setValue('');
      this.orderForm.get('apartment')?.setValue('');
    }
    this.orderForm.get('street')?.updateValueAndValidity();
    this.orderForm.get('house')?.updateValueAndValidity();
  }

  createOrder(): void {
    if (this.orderForm.valid && this.orderForm.value.firstName && this.orderForm.value.lastName
      && this.orderForm.value.phone && this.orderForm.value.email && this.orderForm.value.paymentType) {
      const paramsObject: OrderType = {
        deliveryType: this.deliveryType,
        firstName: this.orderForm.value.firstName,
        lastName: this.orderForm.value.lastName,
        phone: this.orderForm.value.phone,
        paymentType: this.orderForm.value.paymentType,
        email: this.orderForm.value.email,
      };

      if (this.deliveryType === DeliveryType.delivery){
        if(this.orderForm.value.street){
          paramsObject.street = this.orderForm.value.street;
        }
        if(this.orderForm.value.apartment){
          paramsObject.apartment = this.orderForm.value.apartment;
        }
        if(this.orderForm.value.house){
          paramsObject.house = this.orderForm.value.house;
        }
        if(this.orderForm.value.entrance){
          paramsObject.entrance = this.orderForm.value.entrance;
        }
      }

      if(this.orderForm.value.comment){
        paramsObject.comment = this.orderForm.value.comment;
      }
      this.orderService.createOrder(
        paramsObject).subscribe({
        next:(data: OrderType | DefaultResponseType) => {
          if ((data as DefaultResponseType).error !== undefined) {
            throw new Error((data as DefaultResponseType).message);
          }
          console.log(this.orderForm.value);
          this.dialogRef = this.dialog.open(this.popup);
          this.dialogRef.backdropClick()
            .subscribe(() => {
              this.router.navigate(['/']);
              this.cartService.setCount(0);
            });
        },
        error: (errorResponse: HttpErrorResponse) => {
          if (errorResponse.error && errorResponse.error.message) {
            this._snackBar.open(errorResponse.error.message);
          } else {
            this._snackBar.open('order error');
          }
        }
        });
    } else {
      this.orderForm.markAllAsTouched();
      this._snackBar.open('Заполните поля');
    }
  }

  closePopup(): void {
    this.dialogRef?.close();
    this.router.navigate(['/']);
  }
}
