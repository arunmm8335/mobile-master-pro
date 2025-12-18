import { Order, Product, User } from '../types';

// API Base URL - using relative path to leverage Vite proxy
const API_URL = '/api';

// Session storage key
const DB_SESSION_KEY = 'mmp_session';

class DatabaseService {
  private async fetchAPI(endpoint: string, options?: RequestInit) {
    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        let errorMessage = 'API request failed';
        try {
          const contentType = response.headers.get('content-type');
          if (contentType && contentType.includes('application/json')) {
            const error = await response.json();
            errorMessage = error.error || errorMessage;
          } else {
            errorMessage = await response.text() || errorMessage;
          }
        } catch (e) {
          console.error('Error parsing error response:', e);
        }
        throw new Error(errorMessage);
      }

      // Check if response has content
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('application/json')) {
        const text = await response.text();
        return text ? JSON.parse(text) : {};
      }
      
      return {};
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  // --- Product Operations ---

  async getProducts(): Promise<Product[]> {
    return await this.fetchAPI('/products');
  }

  async getProduct(id: string): Promise<Product> {
    return await this.fetchAPI(`/products/${encodeURIComponent(id)}`);
  }

  async addProduct(product: Omit<Product, 'id'>): Promise<Product> {
    return await this.fetchAPI('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    });
  }

  async updateProduct(id: string, updates: Partial<Omit<Product, 'id'>>): Promise<Product> {
    return await this.fetchAPI(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteProduct(id: string): Promise<void> {
    await this.fetchAPI(`/products/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Order Operations ---

  async getOrders(userId: string): Promise<Order[]> {
    return await this.fetchAPI(`/orders/user/${encodeURIComponent(userId)}`);
  }

  async createOrder(order: Omit<Order, 'id' | 'createdAt'>): Promise<Order> {
    return await this.fetchAPI('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    });
  }

  // --- Auth Operations ---

  async login(email: string, password: string): Promise<User> {
    const data = await this.fetchAPI('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });

    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(data.user));
    return data.user;
  }

  async register(name: string, email: string, password: string): Promise<User> {
    const data = await this.fetchAPI('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });

    localStorage.setItem(DB_SESSION_KEY, JSON.stringify(data.user));
    return data.user;
  }

  getCurrentUser(): User | null {
    const session = localStorage.getItem(DB_SESSION_KEY);
    return session ? JSON.parse(session) : null;
  }

  logout(): void {
    localStorage.removeItem(DB_SESSION_KEY);
  }

  async updateUserProfile(user: User): Promise<User> {
    const updatedUser = await this.fetchAPI(`/users/${user.id}`, {
      method: 'PUT',
      body: JSON.stringify(user),
    });
    
    // Store complete user data in localStorage including profileImage
    // Note: Large images might cause quota issues, but we'll handle gracefully
    try {
      localStorage.setItem(DB_SESSION_KEY, JSON.stringify(updatedUser));
    } catch (e) {
      // If quota exceeded, store without profile image
      console.warn('LocalStorage quota exceeded, storing without profile image');
      const { profileImage, ...userWithoutImage } = updatedUser;
      localStorage.setItem(DB_SESSION_KEY, JSON.stringify(userWithoutImage));
    }
    
    return updatedUser;
  }

  // --- Seller Operations ---

  async getSellers(status?: string): Promise<any[]> {
    const query = status ? `?status=${status}` : '';
    return await this.fetchAPI(`/sellers${query}`);
  }

  async getSeller(id: string): Promise<any> {
    return await this.fetchAPI(`/sellers/${id}`);
  }

  async getSellerByUserId(userId: string): Promise<any> {
    return await this.fetchAPI(`/sellers/user/${userId}`);
  }

  async registerSeller(sellerData: any): Promise<any> {
    return await this.fetchAPI('/sellers/register', {
      method: 'POST',
      body: JSON.stringify(sellerData),
    });
  }

  async updateSeller(id: string, updates: any): Promise<any> {
    return await this.fetchAPI(`/sellers/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateSellerStatus(id: string, status: string): Promise<any> {
    return await this.fetchAPI(`/sellers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- Delivery Operations ---

  async getDeliveryPersons(status?: string, available?: boolean): Promise<any[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (available !== undefined) params.append('available', String(available));
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.fetchAPI(`/delivery${query}`);
  }

  async getDeliveryPerson(id: string): Promise<any> {
    return await this.fetchAPI(`/delivery/${id}`);
  }

  async getDeliveryPersonByUserId(userId: string): Promise<any> {
    return await this.fetchAPI(`/delivery/user/${userId}`);
  }

  async registerDeliveryPerson(deliveryData: any): Promise<any> {
    return await this.fetchAPI('/delivery/register', {
      method: 'POST',
      body: JSON.stringify(deliveryData),
    });
  }

  async updateDeliveryPerson(id: string, updates: any): Promise<any> {
    return await this.fetchAPI(`/delivery/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async updateDeliveryLocation(id: string, latitude: number, longitude: number): Promise<any> {
    return await this.fetchAPI(`/delivery/${id}/location`, {
      method: 'PATCH',
      body: JSON.stringify({ latitude, longitude }),
    });
  }

  async updateDeliveryAvailability(id: string, isAvailable: boolean): Promise<any> {
    return await this.fetchAPI(`/delivery/${id}/availability`, {
      method: 'PATCH',
      body: JSON.stringify({ isAvailable }),
    });
  }

  async assignOrderToDelivery(deliveryId: string, orderId: string): Promise<any> {
    return await this.fetchAPI(`/delivery/${deliveryId}/assign-order`, {
      method: 'POST',
      body: JSON.stringify({ orderId }),
    });
  }

  async getDeliveryOrders(deliveryId: string): Promise<any[]> {
    return await this.fetchAPI(`/delivery/${deliveryId}/orders`);
  }

  // --- Review Operations ---

  async getProductReviews(productId: string, sortBy?: string): Promise<any[]> {
    const query = sortBy ? `?sortBy=${sortBy}` : '';
    return await this.fetchAPI(`/reviews/product/${productId}${query}`);
  }

  async getReview(id: string): Promise<any> {
    return await this.fetchAPI(`/reviews/${id}`);
  }

  async createReview(reviewData: any): Promise<any> {
    return await this.fetchAPI('/reviews', {
      method: 'POST',
      body: JSON.stringify(reviewData),
    });
  }

  async updateReview(id: string, updates: any): Promise<any> {
    return await this.fetchAPI(`/reviews/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    });
  }

  async deleteReview(id: string): Promise<void> {
    await this.fetchAPI(`/reviews/${id}`, {
      method: 'DELETE',
    });
  }

  async markReviewHelpful(id: string): Promise<any> {
    return await this.fetchAPI(`/reviews/${id}/helpful`, {
      method: 'POST',
    });
  }

  async addSellerResponse(reviewId: string, message: string): Promise<any> {
    return await this.fetchAPI(`/reviews/${reviewId}/response`, {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  }

  // --- Order Tracking ---

  async updateOrderStatus(orderId: string, status: string, message?: string, location?: string): Promise<any> {
    return await this.fetchAPI(`/orders/${orderId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, message, location }),
    });
  }

  async getAllOrders(filters?: { status?: string; sellerId?: string }): Promise<Order[]> {
    const params = new URLSearchParams();
    if (filters?.status) params.append('status', filters.status);
    if (filters?.sellerId) params.append('sellerId', filters.sellerId);
    const query = params.toString() ? `?${params.toString()}` : '';
    return await this.fetchAPI(`/orders${query}`);
  }

  async assignDeliveryPerson(orderId: string, deliveryPersonId: string, deliveryPersonName: string): Promise<any> {
    return await this.fetchAPI(`/orders/${orderId}/assign-delivery`, {
      method: 'PATCH',
      body: JSON.stringify({ deliveryPersonId, deliveryPersonName }),
    });
  }

  async generateDeliveryOtp(orderId: string): Promise<{ otp: string }> {
    return await this.fetchAPI(`/orders/${orderId}/generate-otp`, {
      method: 'POST',
    });
  }

  async confirmDelivery(orderId: string): Promise<any> {
    return await this.fetchAPI(`/orders/${orderId}/confirm-delivery`, {
      method: 'POST',
    });
  }
}

export const db = new DatabaseService();