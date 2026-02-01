import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

interface Book {
  id: string;
  title: string;
  author: string;
  coverImage: string;
  price: number;
  originalPrice?: number;
  rating: number;
  reviewCount: number;
  category: string;
  description: string;
  isBestseller?: boolean;
  isNew?: boolean;
  isTrending?: boolean;
}

interface Category {
  id: string;
  name: string;
  icon: string;
  bookCount: number;
}

@Component({
  selector: 'app-marketplace',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './marketplace.component.html',
  styleUrl: './marketplace.component.css'
})
export class MarketplaceComponent {
  searchQuery = '';
  selectedCategory = signal<string | null>(null);
  showBookModal = signal<Book | null>(null);
  cartCount = signal(0);
  
  // Expose Math for template
  Math = Math;

  categories: Category[] = [
    { id: 'fiction', name: 'Fiction', icon: '📚', bookCount: 2847 },
    { id: 'non-fiction', name: 'Non-Fiction', icon: '📖', bookCount: 1923 },
    { id: 'mystery', name: 'Mystery & Thriller', icon: '🔍', bookCount: 892 },
    { id: 'romance', name: 'Romance', icon: '💕', bookCount: 1456 },
    { id: 'scifi', name: 'Sci-Fi & Fantasy', icon: '🚀', bookCount: 1102 },
    { id: 'biography', name: 'Biography', icon: '👤', bookCount: 634 },
    { id: 'selfhelp', name: 'Self-Help', icon: '✨', bookCount: 789 },
    { id: 'poetry', name: 'Poetry', icon: '🪶', bookCount: 423 },
  ];

  trendingBooks: Book[] = [
    {
      id: '1',
      title: 'The Midnight Library',
      author: 'Eleanor Vance',
      coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=600&fit=crop',
      price: 14.99,
      originalPrice: 24.99,
      rating: 4.8,
      reviewCount: 12847,
      category: 'Fiction',
      description: 'A dazzling novel about all the choices that go into a life well lived.',
      isBestseller: true,
      isTrending: true
    },
    {
      id: '2',
      title: 'Echoes of Tomorrow',
      author: 'Marcus Chen',
      coverImage: 'https://images.unsplash.com/photo-1543002588-bfa74002ed7e?w=400&h=600&fit=crop',
      price: 18.99,
      rating: 4.6,
      reviewCount: 8934,
      category: 'Sci-Fi & Fantasy',
      description: 'A mind-bending journey through time that will leave you questioning reality.',
      isNew: true,
      isTrending: true
    },
    {
      id: '3',
      title: 'The Art of Stillness',
      author: 'Sarah Williams',
      coverImage: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=400&h=600&fit=crop',
      price: 12.99,
      rating: 4.9,
      reviewCount: 6521,
      category: 'Self-Help',
      description: 'Finding peace and purpose in an age of constant motion.',
      isBestseller: true
    },
    {
      id: '4',
      title: 'Whispers in the Dark',
      author: 'James Morrison',
      coverImage: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400&h=600&fit=crop',
      price: 16.99,
      originalPrice: 22.99,
      rating: 4.7,
      reviewCount: 4328,
      category: 'Mystery & Thriller',
      description: 'A gripping psychological thriller that keeps you guessing until the final page.',
      isTrending: true
    },
  ];

  featuredBooks: Book[] = [
    {
      id: '5',
      title: 'The Garden of Words',
      author: 'Isabella Rose',
      coverImage: 'https://images.unsplash.com/photo-1589998059171-988d887df646?w=400&h=600&fit=crop',
      price: 19.99,
      rating: 4.5,
      reviewCount: 3892,
      category: 'Poetry',
      description: 'A collection of poems that bloom with beauty and wisdom.'
    },
    {
      id: '6',
      title: 'Digital Minds',
      author: 'Dr. Alex Rivera',
      coverImage: 'https://images.unsplash.com/photo-1532012197267-da84d127e765?w=400&h=600&fit=crop',
      price: 24.99,
      rating: 4.4,
      reviewCount: 2156,
      category: 'Non-Fiction',
      description: 'Exploring the intersection of artificial intelligence and human consciousness.',
      isNew: true
    },
    {
      id: '7',
      title: 'Love in Paris',
      author: 'Amélie Dubois',
      coverImage: 'https://images.unsplash.com/photo-1476275466078-4007374efbbe?w=400&h=600&fit=crop',
      price: 13.99,
      originalPrice: 18.99,
      rating: 4.6,
      reviewCount: 7823,
      category: 'Romance',
      description: 'A sweeping romance set against the backdrop of the City of Lights.'
    },
    {
      id: '8',
      title: 'The Last Kingdom',
      author: 'Robert Blackwood',
      coverImage: 'https://images.unsplash.com/photo-1509021436665-8f07dbf5bf1d?w=400&h=600&fit=crop',
      price: 21.99,
      rating: 4.8,
      reviewCount: 9156,
      category: 'Fiction',
      description: 'An epic tale of war, honor, and the bonds that define us.',
      isBestseller: true
    },
    {
      id: '9',
      title: 'Mindful Living',
      author: 'Dr. Emma Chen',
      coverImage: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&h=600&fit=crop',
      price: 15.99,
      rating: 4.7,
      reviewCount: 5234,
      category: 'Self-Help',
      description: 'Practical strategies for a more intentional and fulfilling life.'
    },
    {
      id: '10',
      title: 'The Hidden Truth',
      author: 'Victoria Kane',
      coverImage: 'https://images.unsplash.com/photo-1519682337058-a94d519337bc?w=400&h=600&fit=crop',
      price: 17.99,
      originalPrice: 23.99,
      rating: 4.5,
      reviewCount: 3678,
      category: 'Mystery & Thriller',
      description: 'A detective uncovers secrets that threaten to destroy everything she knows.',
      isNew: true
    },
  ];

  newReleases: Book[] = [
    {
      id: '11',
      title: 'Beyond the Horizon',
      author: 'Nathan Grey',
      coverImage: 'https://images.unsplash.com/photo-1495446815901-a7297e633e8d?w=400&h=600&fit=crop',
      price: 22.99,
      rating: 4.3,
      reviewCount: 892,
      category: 'Sci-Fi & Fantasy',
      description: 'A space odyssey that explores the depths of human courage.',
      isNew: true
    },
    {
      id: '12',
      title: 'The Forgotten Artist',
      author: 'Sophie Laurent',
      coverImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&h=600&fit=crop',
      price: 19.99,
      rating: 4.6,
      reviewCount: 1234,
      category: 'Biography',
      description: 'The untold story of a revolutionary artist lost to history.',
      isNew: true
    },
    {
      id: '13',
      title: 'Seasons of the Heart',
      author: 'Clara Bennett',
      coverImage: 'https://images.unsplash.com/photo-1516979187457-637abb4f9353?w=400&h=600&fit=crop',
      price: 14.99,
      rating: 4.4,
      reviewCount: 756,
      category: 'Romance',
      description: 'A heartwarming story of second chances and enduring love.',
      isNew: true
    },
    {
      id: '14',
      title: 'The Mind\'s Eye',
      author: 'Dr. Michael Torres',
      coverImage: 'https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?w=400&h=600&fit=crop',
      price: 26.99,
      rating: 4.5,
      reviewCount: 543,
      category: 'Non-Fiction',
      description: 'Groundbreaking research into the science of perception.',
      isNew: true
    },
  ];

  reviews = [
    {
      id: '1',
      bookTitle: 'The Midnight Library',
      reviewer: 'Sarah M.',
      avatar: 'SM',
      rating: 5,
      text: 'Absolutely transformative! This book changed my perspective on life and the choices we make.',
      date: 'Jan 28, 2026'
    },
    {
      id: '2',
      bookTitle: 'Echoes of Tomorrow',
      reviewer: 'David K.',
      avatar: 'DK',
      rating: 5,
      text: 'A masterpiece of science fiction. The world-building is incredible and the plot keeps you hooked.',
      date: 'Jan 25, 2026'
    },
    {
      id: '3',
      bookTitle: 'The Art of Stillness',
      reviewer: 'Emily R.',
      avatar: 'ER',
      rating: 4,
      text: 'Beautifully written with practical wisdom. Perfect for anyone feeling overwhelmed by modern life.',
      date: 'Jan 22, 2026'
    },
  ];

  selectCategory(categoryId: string | null): void {
    this.selectedCategory.set(categoryId);
  }

  openBookModal(book: Book): void {
    this.showBookModal.set(book);
  }

  closeBookModal(): void {
    this.showBookModal.set(null);
  }

  addToCart(book: Book): void {
    this.cartCount.update(count => count + 1);
  }

  getStars(rating: number): number[] {
    return Array(5).fill(0).map((_, i) => i < Math.floor(rating) ? 1 : 0);
  }

  formatReviewCount(count: number): string {
    if (count >= 1000) {
      return `${(count / 1000).toFixed(1)}k`;
    }
    return count.toString();
  }
}
