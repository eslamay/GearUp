import { Component, ElementRef, inject, OnInit, ViewChild } from '@angular/core';
import { SpinnerComponent } from '../../../shared/components/spinner/spinner.component';
import { Router } from '@angular/router';
import { loadStripe, Stripe, StripeElements } from '@stripe/stripe-js';
import { CurrencyPipe } from '@angular/common';
import { CartService } from '../../cart/cart.service';
import { CheckoutService } from '../checkout.service';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../../account/account.service';
import { DeliveryMethod } from '../../../core/models/delivery-method';
import { environment } from '../../../../environments/environment.development';

@Component({
  selector: 'app-checkout-page',
  imports: [CurrencyPipe, ReactiveFormsModule, SpinnerComponent],
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

  // delivery methods
  deliveryMethods: DeliveryMethod[] = [];
  selectedDeliveryMethod: DeliveryMethod | null = null;

  // payment
  stripe: Stripe | null = null;
  elements: StripeElements | null = null;
  paymentError: string | null = null;
  processingPayment = false;
  clientSecret: string | null = null;

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

    this.checkoutService.getDeliveryMethods().subscribe(methods => {
    this.deliveryMethods = methods;
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

  // delivery methods 

  selectDeliveryMethod(method: DeliveryMethod) {
    this.selectedDeliveryMethod = method;
  }

  continueToReview() {
    if (!this.selectedDeliveryMethod) return;
    this.currentStep = 3;
  }

  get shippingPrice(): number {
    return this.selectedDeliveryMethod?.price ?? 0;
  }

  get total(): number {
    return this.cartService.subtotal() + this.shippingPrice;
  }

  // Review order and payment methods
  async continueToPayment() {
    this.currentStep = 4;

    const cart = this.cartService.cart();
    if (!cart) return;

    this.checkoutService.createOrUpdatePaymentIntent(cart.id).subscribe({
      next: async (updatedCart) => {
        this.clientSecret = updatedCart.clientSecret;
        await this.initStripeElements();
      },
      error: () => {
        this.paymentError = 'Could not initialize payment. Please try again.';
      }
    });
  }

  async initStripeElements() {
    if (!this.clientSecret) return;

    this.stripe = await loadStripe(environment.stripePublicKey);
    if (!this.stripe) return;

    this.elements = this.stripe.elements({ clientSecret: this.clientSecret });

    const paymentElement = this.elements.create('payment');

    setTimeout(() => {
      if (this.paymentElementRef) {
        paymentElement.mount(this.paymentElementRef.nativeElement);
      }
    });
  }
  
  async pay() {
  if (!this.stripe || !this.elements) return;

  this.processingPayment = true;
  this.paymentError = null;

  const result = await this.stripe.confirmPayment({
    elements: this.elements,
    redirect: 'if_required'
  });

  if (result.error) {
    this.processingPayment = false;
    this.paymentError = result.error.message ?? 'Payment failed. Please try again.';
    return;
  }

  // payment succeeded
  this.createOrderAfterPayment(result.paymentIntent);
}

private createOrderAfterPayment(paymentIntent: any) {
  const card = paymentIntent?.payment_method?.card;

  const orderDto = {
    cartId: this.cartService.cart()!.id,
    deliveryMethodId: this.selectedDeliveryMethod!.id,
    shippingAddress: this.addressForm.getRawValue(),
    paymentSummary: {
      last4: card ? Number(card.last4) : 0,
      brand: card?.brand ?? 'card',
      expMonth: card?.exp_month ?? 0,
      expYear: card?.exp_year ?? 0
    },
    discount: 0
  };

  this.checkoutService.createOrder(orderDto).subscribe({
    next: (order) => {
      this.processingPayment = false;
      localStorage.removeItem('cart_id');
      this.router.navigateByUrl(`/order-success/${order.id}`);
    },
    error: (err) => {
      this.processingPayment = false;
      this.paymentError = typeof err.error === 'string'
        ? err.error
        : 'Payment succeeded but order creation failed. Please contact support.';
    }
  });
}

  backToStep(step: number) {
    this.currentStep = step;
  }
}