import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountService } from '../account.service';
import { Router, RouterLink } from '@angular/router';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './register.component.html',
  styleUrl: './register.component.css'
})
export class RegisterComponent {
private fb = inject(FormBuilder);
  private accountService = inject(AccountService);
  private router = inject(Router);

  loading = false;
  errorMessages: string[] = [];

  form = this.fb.nonNullable.group({
    firstName: ['', Validators.required],
    lastName: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    username: ['', Validators.required],
    password: ['', [Validators.required, Validators.minLength(6)]],
    role: ['Customer' as 'Customer' | 'Vendor', Validators.required]
  });

  onSubmit() {
    if (this.form.invalid) return;

    this.loading = true;
    this.errorMessages = [];

    this.accountService.register(this.form.getRawValue()).subscribe({
      next: () => {
        this.loading = false;
        this.router.navigateByUrl('/account/login');
      },
      error: (err) => {
        this.loading = false;
        if (err.error?.errors) {
          this.errorMessages = Object.values(err.error.errors).flat() as string[];
        } else {
          this.errorMessages = ['Something went wrong. Please try again.'];
        }
      }
    });
  }
}
