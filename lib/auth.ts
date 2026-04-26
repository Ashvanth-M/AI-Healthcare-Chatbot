export interface User {
  id: string
  name: string
  email: string
  createdAt: string
}

export interface AuthState {
  user: User | null
  isLoading: boolean
  error: string | null
}

// Simple in-memory user storage (in production, use a proper database)
const users: User[] = []

export const authService = {
  // Simulate API delay
  delay: (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),

  async login(email: string, password: string): Promise<User> {
    await this.delay(1000) // Simulate network delay
    
    const user = users.find(u => u.email === email)
    if (!user) {
      throw new Error("User not found. Please check your email or sign up.")
    }
    
    // In a real app, you'd verify the password hash
    // For demo purposes, we'll just check if password is not empty
    if (!password) {
      throw new Error("Invalid password")
    }
    
    return user
  },

  async signup(name: string, email: string, password: string): Promise<User> {
    await this.delay(1000) // Simulate network delay
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email)
    if (existingUser) {
      throw new Error("User with this email already exists")
    }
    
    // Create new user
    const newUser: User = {
      id: Math.random().toString(36).substr(2, 9),
      name,
      email,
      createdAt: new Date().toISOString()
    }
    
    users.push(newUser)
    return newUser
  },

  async logout(): Promise<void> {
    await this.delay(500)
    // In a real app, you'd invalidate the session/token
  },

  // Get current user from localStorage (client-side only)
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null
    
    try {
      const userData = localStorage.getItem('healthcare_user')
      return userData ? JSON.parse(userData) : null
    } catch {
      return null
    }
  },

  // Save user to localStorage (client-side only)
  saveUser(user: User): void {
    if (typeof window === 'undefined') return
    
    localStorage.setItem('healthcare_user', JSON.stringify(user))
  },

  // Remove user from localStorage (client-side only)
  removeUser(): void {
    if (typeof window === 'undefined') return
    
    localStorage.removeItem('healthcare_user')
  }
}