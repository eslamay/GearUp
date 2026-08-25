import { Component, inject, OnInit } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ImageUrlPipe } from '../../../shared/pipes/image-url.pipe';
import { ProductService } from '../product.service';
import { Product } from '../../../core/models/product';
import { Observable } from 'rxjs';
import { AccountService } from '../../account/account.service';
import { VendorService } from '../../vendor/vendor.service';

@Component({
  selector: 'app-product-form',
  imports: [ReactiveFormsModule, RouterLink, ImageUrlPipe],
  templateUrl: './product-form.component.html',
  styleUrl: './product-form.component.css'
})
export class ProductFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private productService = inject(ProductService);
  private vendorService = inject(VendorService);
  private accountService = inject(AccountService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  productId: number | null = null;
  isEditMode = false;

  loading = false;
  errorMessages: string[] = [];

  selectedFile: File | null = null;
  previewUrl: string | null = null;
  existingPictureUrl: string | null = null;

  form = this.fb.nonNullable.group({
    name: ['', Validators.required],
    description: ['', Validators.required],
    price: [0, [Validators.required, Validators.min(0.01)]],
    type: ['', Validators.required],
    brand: ['', Validators.required],
    quantityInStock: [1, [Validators.required, Validators.min(1)]]
  });


  private get isAdmin(): boolean {
    return this.accountService.currentUser()?.roles === 'Admin';
  }

  private get returnUrl(): string {
    return this.isAdmin ? '/shop' : '/vendor/dashboard';
  }

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam) {
      this.productId = Number(idParam);
      this.isEditMode = true;
      this.loadProduct(this.productId);
    }
  }

  loadProduct(id: number) {
    this.loading = true;

    const request$ = this.isAdmin
      ? this.productService.getProduct(id)
      : this.vendorService.getMyProduct(id);

    request$.subscribe({
      next: (product) => {
        this.form.patchValue({
          name: product.name,
          description: product.description,
          price: product.price,
          type: product.type,
          brand: product.brand,
          quantityInStock: product.quantityInStock
        });
        this.existingPictureUrl = product.pictureUrl;
        this.loading = false;
      },
      error: () => (this.loading = false)
    });
  }

  onFileSelected(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      this.selectedFile = input.files[0];

      const reader = new FileReader();
      reader.onload = () => (this.previewUrl = reader.result as string);
      reader.readAsDataURL(this.selectedFile);
    }
  }

  onSubmit() {
    if (this.form.invalid) return;

    if (!this.isEditMode && !this.selectedFile) {
      this.errorMessages = ['Please select a product image.'];
      return;
    }

    this.loading = true;
    this.errorMessages = [];

    const formData = new FormData();
    const values = this.form.getRawValue();

    formData.append('Name', values.name);
    formData.append('Description', values.description);
    formData.append('Price', values.price.toString());
    formData.append('Type', values.type);
    formData.append('Brand', values.brand);
    formData.append('QuantityInStock', values.quantityInStock.toString());

    if (this.selectedFile) {
      formData.append('file', this.selectedFile);
    }

    const request$ = this.isAdmin
      ? (this.isEditMode && this.productId
          ? this.productService.updateProduct(this.productId, formData)
          : this.productService.createProduct(formData))
      : (this.isEditMode && this.productId
          ? this.vendorService.updateProduct(this.productId, formData)
          : this.vendorService.createProduct(formData));

    (request$ as Observable<Product>).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl(this.returnUrl);
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.errors) {
          this.errorMessages = Object.values(err.error.errors).flat() as string[];
        } else if (typeof err.error === 'string') {
          this.errorMessages = [err.error];
        } else {
          this.errorMessages = ['Something went wrong. Please try again.'];
        }
      }
    });
  }
}
