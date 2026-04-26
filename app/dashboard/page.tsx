'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ProtectedRoute } from '@/components/ProtectedRoute'
import { useAuth } from '@/contexts/AuthContext'
import { 
  MessageSquare, 
  Activity, 
  FileText, 
  Building2, 
  ArrowRight,
  Heart,
  User,
  LogOut,
  Zap,
  Shield,
  Globe
} from 'lucide-react'

export default function DashboardPage() {
  const { user, logout } = useAuth()

  const handleLogout = () => {
    logout()
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50">
        {/* Header */}
        <div className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-4">
              <div className="flex items-center">
                <Heart className="h-8 w-8 text-blue-600" />
                <span className="ml-2 text-xl font-bold text-gray-900">CareConnect</span>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Welcome Section */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Your Healthcare Dashboard
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Access all your healthcare tools and services in one secure place. 
              Your AI-powered healthcare companion is ready to assist you.
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-blue-100">AI Conversations</p>
                    <p className="text-3xl font-bold">24/7</p>
                  </div>
                  <MessageSquare className="h-12 w-12 text-blue-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-green-500 to-green-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-green-100">Health Tracking</p>
                    <p className="text-3xl font-bold">Active</p>
                  </div>
                  <Activity className="h-12 w-12 text-green-200" />
                </div>
              </CardContent>
            </Card>
            
            <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-purple-100">Secure Records</p>
                    <p className="text-3xl font-bold">Protected</p>
                  </div>
                  <Shield className="h-12 w-12 text-purple-200" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Healthcare Services */}
          <div className="mb-12">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-8">
              Your Healthcare Services
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* AI Healthcare Chat */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-blue-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl">AI Healthcare Chat</CardTitle>
                  <CardDescription>
                    Get instant medical guidance and health advice from our AI assistant
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/chatbot">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700 text-white group-hover:scale-105 transition-transform">
                      Start Chat
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Health Data Tracking */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-green-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl">Health Data</CardTitle>
                  <CardDescription>
                    Track your vital signs, symptoms, and health metrics over time
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/health-data">
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white group-hover:scale-105 transition-transform">
                      Track Health
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              {/* Medical Records */}
              <Card className="group hover:shadow-lg transition-all duration-300 border-2 hover:border-purple-200">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl">Medical Records</CardTitle>
                  <CardDescription>
                    Securely store and manage your medical history and documents
                  </CardDescription>
                </CardHeader>
                <CardContent className="pt-0">
                  <Link href="/medical-records">
                    <Button className="w-full bg-purple-600 hover:bg-purple-700 text-white group-hover:scale-105 transition-transform">
                      View Records
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>

              
            </div>
          </div>

          {/* Features Section */}
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-8 text-white">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">Why Choose CareConnect?</h2>
              <p className="text-blue-100 text-lg">
                Experience the future of healthcare with our advanced features
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Zap className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">AI-Powered Intelligence</h3>
                <p className="text-blue-100">
                  Advanced AI provides personalized health insights and recommendations
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Shield className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Bank-Level Security</h3>
                <p className="text-blue-100">
                  Your health data is protected with enterprise-grade encryption
                </p>
              </div>
              
              <div className="text-center">
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <Globe className="h-8 w-8 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Global Accessibility</h3>
                <p className="text-blue-100">
                  Multi-language support for healthcare access anywhere, anytime
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  )
}