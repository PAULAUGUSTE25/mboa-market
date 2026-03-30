/**
 * Service d'authentification local (sans backend)
 * Stocke les utilisateurs dans localStorage
 */

interface LocalUser {
  id: string;
  phone: string;
  password: string; // En production, devrait être hashé
  email?: string;
  profile: {
    display_name: string;
    activity_type: string;
    domain?: string;
    region: string;
    locality?: string;
    avatar_url?: string;
    bio?: string;
  };
  created_at: string;
}

class LocalAuthService {
  private USERS_KEY = 'mboa_users';
  private CURRENT_USER_KEY = 'mboa_current_user';

  /**
   * Récupère tous les utilisateurs du localStorage
   */
  private getUsers(): LocalUser[] {
    const usersJson = localStorage.getItem(this.USERS_KEY);
    return usersJson ? JSON.parse(usersJson) : [];
  }

  /**
   * Sauvegarde les utilisateurs dans localStorage
   */
  private saveUsers(users: LocalUser[]): void {
    localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
  }

  /**
   * Inscription d'un nouvel utilisateur
   */
  async register(data: {
    phone: string;
    password: string;
    email?: string;
    profile: {
      display_name: string;
      activity_type: string;
      domain?: string;
      region: string;
      locality?: string;
    };
  }): Promise<LocalUser> {
    const users = this.getUsers();

    // Vérifier si l'utilisateur existe déjà
    const existingUser = users.find(u => u.phone === data.phone);
    if (existingUser) {
      throw new Error('Ce numéro de téléphone est déjà utilisé');
    }

    // Créer le nouvel utilisateur
    const newUser: LocalUser = {
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      phone: data.phone,
      password: data.password, // En production, devrait être hashé
      email: data.email,
      profile: {
        ...data.profile,
        avatar_url: `https://ui-avatars.com/api/?name=${encodeURIComponent(data.profile.display_name)}&background=10b981&color=fff&size=200`,
        bio: ''
      },
      created_at: new Date().toISOString()
    };

    // Ajouter l'utilisateur
    users.push(newUser);
    this.saveUsers(users);

    // Définir comme utilisateur actuel
    this.setCurrentUser(newUser);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = newUser;
    return userWithoutPassword as LocalUser;
  }

  /**
   * Connexion d'un utilisateur
   */
  async login(credentials: { phone: string; password: string }): Promise<LocalUser> {
    const users = this.getUsers();

    // Trouver l'utilisateur
    const user = users.find(
      u => u.phone === credentials.phone && u.password === credentials.password
    );

    if (!user) {
      throw new Error('Numéro de téléphone ou mot de passe incorrect');
    }

    // Définir comme utilisateur actuel
    this.setCurrentUser(user);

    // Retourner l'utilisateur sans le mot de passe
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as LocalUser;
  }

  /**
   * Déconnexion
   */
  logout(): void {
    localStorage.removeItem(this.CURRENT_USER_KEY);
  }

  /**
   * Récupérer l'utilisateur actuel
   */
  getCurrentUser(): LocalUser | null {
    const userJson = localStorage.getItem(this.CURRENT_USER_KEY);
    return userJson ? JSON.parse(userJson) : null;
  }

  /**
   * Définir l'utilisateur actuel
   */
  private setCurrentUser(user: LocalUser): void {
    const { password, ...userWithoutPassword } = user;
    localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(userWithoutPassword));
  }

  /**
   * Vérifier si un utilisateur est connecté
   */
  isAuthenticated(): boolean {
    return this.getCurrentUser() !== null;
  }

  /**
   * Mettre à jour le profil de l'utilisateur
   */
  async updateProfile(updates: Partial<LocalUser['profile']>): Promise<LocalUser> {
    const currentUser = this.getCurrentUser();
    if (!currentUser) {
      throw new Error('Aucun utilisateur connecté');
    }

    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === currentUser.id);

    if (userIndex === -1) {
      throw new Error('Utilisateur non trouvé');
    }

    // Mettre à jour le profil
    users[userIndex].profile = {
      ...users[userIndex].profile,
      ...updates
    };

    this.saveUsers(users);
    this.setCurrentUser(users[userIndex]);

    const { password, ...userWithoutPassword } = users[userIndex];
    return userWithoutPassword as LocalUser;
  }

  /**
   * Créer un utilisateur de test (pour développement)
   */
  createTestUser(): void {
    const testUser: LocalUser = {
      id: 'test_user_001',
      phone: '+237695584290',
      password: 'password123',
      email: 'test@mboamarket.com',
      profile: {
        display_name: 'Utilisateur Test',
        activity_type: 'producer',
        domain: 'agriculture',
        region: 'Centre',
        locality: 'Yaoundé',
        avatar_url: 'https://ui-avatars.com/api/?name=Test+User&background=10b981&color=fff&size=200',
        bio: 'Compte de test pour MBOA Market'
      },
      created_at: new Date().toISOString()
    };

    const users = this.getUsers();
    const existingTest = users.find(u => u.phone === testUser.phone);
    
    if (!existingTest) {
      users.push(testUser);
      this.saveUsers(users);
      console.log('✅ Utilisateur de test créé : +237695584290 / password123');
    }
  }
}

export const localAuth = new LocalAuthService();

// Créer l'utilisateur de test au chargement
if (typeof window !== 'undefined') {
  localAuth.createTestUser();
}
