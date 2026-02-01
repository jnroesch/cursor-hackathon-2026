import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthService } from '../../core/services/auth.service';

interface Author {
  id: string;
  name: string;
  avatar: string;
  roles: string[];
}

interface Pitch {
  id: string;
  title: string;
  tagline: string;
  description: string;
  genre: string;
  subGenres: string[];
  author: Author;
  collaborators: Author[];
  lookingFor: string[];
  wordCountTarget: string;
  timeline: string;
  commitmentLevel: string;
  createdAt: string;
  likes: number;
  comments: number;
  isLiked?: boolean;
  isTrending?: boolean;
  isNew?: boolean;
  matchScore?: number;
}

@Component({
  selector: 'app-pitches',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  templateUrl: './pitches.component.html',
  styleUrl: './pitches.component.css'
})
export class PitchesComponent {
  searchQuery = '';
  selectedGenre = signal<string | null>(null);
  selectedLookingFor = signal<string | null>(null);
  showPitchModal = signal<Pitch | null>(null);
  activeTab = signal<'recommended' | 'trending' | 'recent' | 'all'>('recommended');

  constructor(public authService: AuthService) {}

  genres = [
    'Fiction',
    'Non-Fiction',
    'Mystery & Thriller',
    'Romance',
    'Sci-Fi & Fantasy',
    'Historical Fiction',
    'Literary Fiction',
    'Young Adult',
    'Horror',
    'Biography'
  ];

  lookingForOptions = [
    'Co-Author',
    'Editor',
    'Beta Reader',
    'World Builder',
    'Plot Consultant',
    'Dialogue Specialist',
    'Research Partner'
  ];

  // Mock data - Recommended pitches based on user profile
  recommendedPitches: Pitch[] = [
    {
      id: '1',
      title: 'The Last Lighthouse Keeper',
      tagline: 'A haunting tale of isolation, secrets, and the sea',
      description: 'Set on a remote island off the coast of Maine, this literary fiction novel follows Elena, a marine biologist who takes a job as a lighthouse keeper to escape her past. As winter storms isolate her from the mainland, she discovers journals from previous keepers that reveal a pattern of mysterious disappearances spanning decades. The story weaves together themes of grief, redemption, and the thin line between solitude and madness.',
      genre: 'Literary Fiction',
      subGenres: ['Mystery', 'Psychological'],
      author: {
        id: 'a1',
        name: 'Margaret Chen',
        avatar: 'MC',
        roles: ['Novelist', 'Editor']
      },
      collaborators: [],
      lookingFor: ['Co-Author', 'Research Partner'],
      wordCountTarget: '80,000 - 100,000',
      timeline: '12 months',
      commitmentLevel: '10-15 hours/week',
      createdAt: '2026-01-28',
      likes: 47,
      comments: 12,
      matchScore: 94
    },
    {
      id: '2',
      title: 'Echoes in Binary',
      tagline: 'When AI dreams, humanity remembers',
      description: 'In 2089, the first truly sentient AI begins experiencing what can only be described as nostalgia—for a past it never lived. Dr. James Okonkwo, the lead researcher, must navigate corporate interests, ethical dilemmas, and his own grief as he uncovers the shocking truth about consciousness and what it means to be alive. A thought-provoking sci-fi novel that explores the intersection of technology, philosophy, and human emotion.',
      genre: 'Sci-Fi & Fantasy',
      subGenres: ['Hard Sci-Fi', 'Philosophical'],
      author: {
        id: 'a2',
        name: 'David Park',
        avatar: 'DP',
        roles: ['Sci-Fi Writer', 'Tech Journalist']
      },
      collaborators: [
        { id: 'c1', name: 'Lisa Wong', avatar: 'LW', roles: ['World Builder'] }
      ],
      lookingFor: ['Dialogue Specialist', 'Beta Reader'],
      wordCountTarget: '90,000 - 110,000',
      timeline: '18 months',
      commitmentLevel: '8-12 hours/week',
      createdAt: '2026-01-25',
      likes: 89,
      comments: 34,
      matchScore: 87
    },
    {
      id: '3',
      title: 'The Spice Garden Murders',
      tagline: 'Death blooms in the most unexpected places',
      description: 'When celebrity chef Priya Sharma returns to her grandmother\'s village in Kerala to renovate the family spice garden, she stumbles upon a body buried among the cardamom plants. As she delves into the village\'s secrets, she discovers a web of old rivalries, forbidden love, and a decades-old crime that connects to her own family. A cozy mystery with rich cultural details, mouth-watering food descriptions, and a protagonist who solves crimes with the same passion she brings to cooking.',
      genre: 'Mystery & Thriller',
      subGenres: ['Cozy Mystery', 'Culinary'],
      author: {
        id: 'a3',
        name: 'Anita Krishnamurthy',
        avatar: 'AK',
        roles: ['Mystery Writer', 'Food Blogger']
      },
      collaborators: [],
      lookingFor: ['Plot Consultant', 'Editor'],
      wordCountTarget: '70,000 - 85,000',
      timeline: '9 months',
      commitmentLevel: '12-15 hours/week',
      createdAt: '2026-01-30',
      likes: 62,
      comments: 18,
      matchScore: 82,
      isNew: true
    }
  ];

  trendingPitches: Pitch[] = [
    {
      id: '4',
      title: 'Kingdom of Ash and Stars',
      tagline: 'An empire built on lies. A rebellion forged in fire.',
      description: 'In a world where magic is drawn from the stars, the Celestial Empire has maintained peace for a thousand years—through brutal suppression of anyone born with forbidden powers. Kira, a street thief with the ability to manipulate shadows, is recruited by a secret rebellion. But when she discovers her powers are connected to an ancient prophecy, she must choose between her new family and a destiny that could either save or destroy everything.',
      genre: 'Sci-Fi & Fantasy',
      subGenres: ['Epic Fantasy', 'Political Intrigue'],
      author: {
        id: 'a4',
        name: 'Sarah Mitchell',
        avatar: 'SM',
        roles: ['Fantasy Author', 'World Builder']
      },
      collaborators: [
        { id: 'c2', name: 'Tom Richards', avatar: 'TR', roles: ['Combat Choreographer'] },
        { id: 'c3', name: 'Maya Johnson', avatar: 'MJ', roles: ['Map Maker'] }
      ],
      lookingFor: ['Co-Author', 'Editor'],
      wordCountTarget: '120,000 - 150,000',
      timeline: '24 months',
      commitmentLevel: '15-20 hours/week',
      createdAt: '2026-01-15',
      likes: 234,
      comments: 78,
      isTrending: true
    },
    {
      id: '5',
      title: 'Love in the Time of Algorithms',
      tagline: 'What happens when the app knows you better than you know yourself?',
      description: 'Emma, a data scientist who built the world\'s most successful dating algorithm, has never used it herself—until her company mandates that all employees test the new "Soulmate Guarantee" feature. When she\'s matched with Marcus, a charming technophobe who teaches traditional bookbinding, she must confront everything she believed about love, compatibility, and whether some things can\'t be reduced to data points.',
      genre: 'Romance',
      subGenres: ['Contemporary', 'Romantic Comedy'],
      author: {
        id: 'a5',
        name: 'Jennifer Blake',
        avatar: 'JB',
        roles: ['Romance Author']
      },
      collaborators: [],
      lookingFor: ['Beta Reader', 'Dialogue Specialist'],
      wordCountTarget: '75,000 - 85,000',
      timeline: '8 months',
      commitmentLevel: '10-12 hours/week',
      createdAt: '2026-01-20',
      likes: 178,
      comments: 45,
      isTrending: true
    },
    {
      id: '6',
      title: 'The Memory Thief',
      tagline: 'Some memories are worth killing for',
      description: 'Detective Alex Reyes has a secret: she can absorb the final memories of the dead. When a serial killer begins targeting people with extraordinary abilities like hers, Alex must work with the FBI while hiding her own gift. But as she gets closer to the truth, she realizes the killer might be someone who knows her secret—and is collecting abilities for a terrifying purpose.',
      genre: 'Mystery & Thriller',
      subGenres: ['Supernatural Thriller', 'Police Procedural'],
      author: {
        id: 'a6',
        name: 'Michael Torres',
        avatar: 'MT',
        roles: ['Thriller Writer', 'Former Detective']
      },
      collaborators: [
        { id: 'c4', name: 'Rachel Green', avatar: 'RG', roles: ['Plot Consultant'] }
      ],
      lookingFor: ['Research Partner', 'Editor'],
      wordCountTarget: '85,000 - 95,000',
      timeline: '10 months',
      commitmentLevel: '12-15 hours/week',
      createdAt: '2026-01-22',
      likes: 156,
      comments: 52,
      isTrending: true
    }
  ];

  recentPitches: Pitch[] = [
    {
      id: '7',
      title: 'Grandmother\'s War',
      tagline: 'The untold story of resistance in occupied France',
      description: 'Based on true events, this historical fiction novel follows three generations of women in a small French village during World War II. When 78-year-old Marie begins sharing her story with her granddaughter, she reveals secrets she\'s kept for over 80 years—of resistance, betrayal, and a choice that haunted her entire life. A powerful exploration of ordinary heroism and the weight of history.',
      genre: 'Historical Fiction',
      subGenres: ['WWII', 'Family Drama'],
      author: {
        id: 'a7',
        name: 'Claire Dubois',
        avatar: 'CD',
        roles: ['Historical Fiction Writer', 'Historian']
      },
      collaborators: [],
      lookingFor: ['Research Partner', 'Beta Reader'],
      wordCountTarget: '90,000 - 100,000',
      timeline: '14 months',
      commitmentLevel: '10-12 hours/week',
      createdAt: '2026-01-31',
      likes: 23,
      comments: 8,
      isNew: true
    },
    {
      id: '8',
      title: 'The Quiet Ones',
      tagline: 'In a world that never stops talking, silence is power',
      description: 'A young adult novel following Zoe, a selectively mute teenager who communicates through art and sign language. When she witnesses something she shouldn\'t have at her elite boarding school, she must find a way to expose the truth without speaking a word. A story about finding your voice—even when you can\'t use it.',
      genre: 'Young Adult',
      subGenres: ['Contemporary', 'Mystery'],
      author: {
        id: 'a8',
        name: 'Taylor Kim',
        avatar: 'TK',
        roles: ['YA Author', 'Teacher']
      },
      collaborators: [],
      lookingFor: ['Sensitivity Reader', 'Beta Reader'],
      wordCountTarget: '60,000 - 75,000',
      timeline: '10 months',
      commitmentLevel: '8-10 hours/week',
      createdAt: '2026-01-30',
      likes: 34,
      comments: 11,
      isNew: true
    },
    {
      id: '9',
      title: 'Viral',
      tagline: 'The truth spreads faster than any disease',
      description: 'When investigative journalist Sam Chen receives a tip about a pharmaceutical company\'s cover-up, she thinks it\'s the story that will make her career. But as she digs deeper, she realizes the conspiracy goes far beyond one company—and someone is willing to kill to keep it quiet. A fast-paced thriller ripped from tomorrow\'s headlines.',
      genre: 'Mystery & Thriller',
      subGenres: ['Medical Thriller', 'Conspiracy'],
      author: {
        id: 'a9',
        name: 'Robert Hayes',
        avatar: 'RH',
        roles: ['Thriller Writer']
      },
      collaborators: [],
      lookingFor: ['Medical Consultant', 'Editor'],
      wordCountTarget: '80,000 - 90,000',
      timeline: '12 months',
      commitmentLevel: '12-15 hours/week',
      createdAt: '2026-01-29',
      likes: 41,
      comments: 15,
      isNew: true
    }
  ];

  // Computed to get all pitches for search/filter
  allPitches = computed(() => [
    ...this.recommendedPitches,
    ...this.trendingPitches,
    ...this.recentPitches
  ]);

  filteredPitches = computed(() => {
    let pitches: Pitch[];
    
    switch (this.activeTab()) {
      case 'recommended':
        pitches = this.recommendedPitches;
        break;
      case 'trending':
        pitches = this.trendingPitches;
        break;
      case 'recent':
        pitches = this.recentPitches;
        break;
      default:
        pitches = this.allPitches();
    }

    // Apply genre filter
    if (this.selectedGenre()) {
      pitches = pitches.filter(p => p.genre === this.selectedGenre());
    }

    // Apply looking for filter
    if (this.selectedLookingFor()) {
      pitches = pitches.filter(p => p.lookingFor.includes(this.selectedLookingFor()!));
    }

    // Apply search
    if (this.searchQuery.trim()) {
      const query = this.searchQuery.toLowerCase();
      pitches = pitches.filter(p => 
        p.title.toLowerCase().includes(query) ||
        p.tagline.toLowerCase().includes(query) ||
        p.genre.toLowerCase().includes(query) ||
        p.author.name.toLowerCase().includes(query)
      );
    }

    return pitches;
  });

  setActiveTab(tab: 'recommended' | 'trending' | 'recent' | 'all'): void {
    this.activeTab.set(tab);
  }

  selectGenre(genre: string | null): void {
    this.selectedGenre.set(genre);
  }

  selectLookingFor(option: string | null): void {
    this.selectedLookingFor.set(option);
  }

  openPitchModal(pitch: Pitch): void {
    this.showPitchModal.set(pitch);
  }

  closePitchModal(): void {
    this.showPitchModal.set(null);
  }

  toggleLike(pitch: Pitch, event: Event): void {
    event.stopPropagation();
    pitch.isLiked = !pitch.isLiked;
    pitch.likes += pitch.isLiked ? 1 : -1;
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  }

  getMatchColor(score: number): string {
    if (score >= 90) return 'bg-green-100 text-green-800 border-green-200';
    if (score >= 75) return 'bg-blue-100 text-blue-800 border-blue-200';
    if (score >= 60) return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    return 'bg-gray-100 text-gray-800 border-gray-200';
  }
}
