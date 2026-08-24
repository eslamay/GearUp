import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Router, RouterLink } from '@angular/router';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { CheckoutService } from '../checkout.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../account/account.service';

@Component({
  selector: 'app-checkout-page',
  imports: [CurrencyPipe, RouterLink,ReactiveFormsModule, SpinnerComponent],
  templateUrl: './checkout-page.component.html',
  styleUrl: './checkout-page.component.css'
})
export class CheckoutPageComponent implements OnInit {
  cartService = inject(CartService);
  private checkoutService = inject(CheckoutService);
  private router = inject(Router);
  private accountService = inject(AccountService);
  private fb = inject(FormBuilder);

  @ViewChild('paymentElement') paymentElementRef?: ElementRef<HTMLDivElement>;
  
  loading = true;
  currentStep = 1;

  // address form
  addressForm = this.fb.nonNullable.group({
    name: ['', Validators.required],
    line1: ['', Validators.required],
    line2: [''],
    city: ['', Validators.required],
    state: ['', Validators.required],
    postalCode: ['', Validators.required],
    country: ['', Validators.required]
  });
  savingAddress = false;

  ngOnInit() {
    this.cartService.getCart().subscribe({
      next: (cart) => {
        this.loading = false;

        if (!cart || cart.items.length === 0) {
          this.router.navigateByUrl('/cart');
        }
      },
      error: () => {
        this.loading = false;
        this.router.navigateByUrl('/cart');
      }
    });
  }


  // address form methods
  prefillAddress() {
    const address = this.accountService.currentUser()?.address;
    if (address) {
      this.addressForm.patchValue(address);
    }
  }

  saveAddressAndContinue() {
    if (this.addressForm.invalid) return;

    this.savingAddress = true;
    this.accountService.updateAddress(this.addressForm.getRawValue()).subscribe({
      next: () => {
        this.savingAddress = false;
        this.currentStep = 2;
      },
      error: () => {
        this.savingAddress = false;
      }
    });
  }
}