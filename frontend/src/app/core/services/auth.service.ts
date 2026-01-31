import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, of } from 'rxjs';
import { 
  User, 
  AuthResponse, 
  LoginRequest, 
  RegisterRequest, 
  ForgotPasswordRequest, 
  ResetPasswordRequest 
} from '../models';
import { environment } from '../../../environments/environment';

const TOKEN_KEY = 'inkspire_token';
const USER_KEY = 'inkspire_user';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private baseUrl = `${environment.apiUrl}/api/auth`;
  
  // Signals for reactive state management
  private currentUserSignal = signal<User | null>(null);
  private tokenSignal = signal<string | null>(null);

  // Computed values
  public currentUser = computed(() => this.currentUserSignal());
  public isAuthenticated = computed(() => !!this.tokenSignal());
  public token = computed(() => this.tokenSignal());

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.loadStoredAuth();
  }

  private loadStoredAuth(): void {
    const token = localStorage.getItem(TOKEN_KEY);
    const userJson = localStorage.getItem(USER_KEY);
    
    if (token && userJson) {
      try {
        const user = JSON.parse(userJson);
        this.tokenSignal.set(token);
        this.currentUserSignal.set(user);
      } catch {
        this.clearAuth();
      }
    }
  }

  private storeAuth(response: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, response.token);
    localStorage.setItem(USER_KEY, JSON.stringify(response.user));
    this.tokenSignal.set(response.token);
    this.currentUserSignal.set(response.user);
  }

  private clearAuth(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    this.tokenSignal.set(null);
    this.currentUserSignal.set(null);
  }

  register(request: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/register`, request)
      .pipe(
        tap(response => this.storeAuth(response))
      );
  }

  login(request: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.baseUrl}/login`, request)
      .pipe(
        tap(response => this.storeAuth(response))
      );
  }

  logout(): void {
    this.clearAuth();
    this.router.navigate(['/auth/login']);
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/forgot-password`, request);
  }

  resetPassword(request: ResetPasswordRequest): Observable<any> {
    return this.http.post(`${this.baseUrl}/reset-password`, request);
  }

  getCurrentUser(): Observable<User> {
    return this.http.get<User>(`${this.baseUrl}/me`)
      .pipe(
        tap(user => this.currentUserSignal.set(user))
      );
  }

  getToken(): string | null {
    return this.tokenSignal();
  }
}
