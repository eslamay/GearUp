import { Injectable, signal } from '@angular/core';
import { User } from '../../core/models/user';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { map, Observable, tap } from 'rxjs';
import { RegisterDto } from '../../core/models/register';
import { LoginDto } from '../../core/models/login';

@Injectable({
  providedIn: 'root'
})
export class AccountService {
  private baseUrl = environment.baseUrl;

  currentUser = signal<User | null>(null);

  constructor(private http: HttpClient) {}


  login(values: LoginDto): Observable<{ message: string }> {
    return this.http.post<{ message: string }>(`${this.baseUrl}/Account/login`, values).pipe(
      tap(() => this.getUserInfo().subscribe())
    );
  }

  register(values: RegisterDto): Observable<object> {
    return this.http.post(`${this.baseUrl}/Account/register`, values);
  }

  getUserInfo(): Observable<User | null> {
    return this.http.get<User | null>(`${this.baseUrl}/Account/user-info`).pipe(
      map(user => user ?? null),
      tap(user => this.currentUser.set(user))
    );
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/Account/logout`, {}).pipe(
      tap(() => this.currentUser.set(null))
    );
  }
}
