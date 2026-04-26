import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { 
  MessageSquare, 
  Activity, 
  FileText, 
  Building2, 
  ArrowRight,
  Zap,
  Shield,
  Heart,
  LogIn,
  UserPlus,
  Users,
  Stethoscope,
  Globe
} from 'lucide-react'

export default function HomePage() {
  const stats = [
    { label: 'Active Users', value: '2,847', icon: Users, color: 'text-blue-600' },
    { label: 'Health Records', value: '15,234', icon: Stethoscope, color: 'text-green-600' },
    { label: 'AI Consultations', value: '8,921', icon: MessageSquare, color: 'text-purple-600' },
    { label: 'Schemes Accessed', value: '1,456', icon: Building2, color: 'text-orange-600' }
  ]

  const features = [
    {
      title: 'Healthcare Chat',
      description: 'AI-powered healthcare assistant for instant medical guidance and symptom analysis',
      icon: MessageSquare,
      href: '/chatbot',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      buttonText: 'Start Chatting'
    },
    {
      title: 'Health Data Tracking',
      description: 'Monitor vital signs, track health metrics, and maintain comprehensive health records',
      icon: Activity,
      href: '/health-data',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      buttonText: 'View Health Data'
    },
    {
      title: 'Medical Records',
      description: 'Secure storage and management of your medical history, prescriptions, and reports',
      icon: Stethoscope,
      href: '/medical-records',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      buttonText: 'Access Records'
    },
    
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-blue-800 text-white">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <Heart className="h-16 w-16 text-white/90" />
            </div>
            <h1 className="text-5xl lg:text-7xl font-bold mb-6 bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
              CareConnect
            </h1>
            <p className="text-xl lg:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto leading-relaxed">
              Your AI-powered healthcare companion for rural communities with 
              multi-language support and comprehensive care management
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/login">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <LogIn className="mr-2 h-5 w-5" />
                  Login to Access Healthcare
                </Button>
              </Link>
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 text-lg px-8 py-4 rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
                  <UserPlus className="mr-2 h-5 w-5" />
                  Sign Up Free
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features Overview */}
        <section className="py-20 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold text-gray-900 mb-4">
                Comprehensive Healthcare Solutions
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Access advanced healthcare features after creating your account. 
                Join thousands of users managing their health with CareConnect.
              </p>
            </div>

            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-200 transition-colors">
                    <MessageSquare className="h-8 w-8 text-blue-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">AI Healthcare Chat</CardTitle>
                  <CardDescription className="text-gray-600">
                    Get instant medical advice and support in your preferred language
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-green-50 to-white">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-200 transition-colors">
                    <Activity className="h-8 w-8 text-green-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Health Tracking</CardTitle>
                  <CardDescription className="text-gray-600">
                    Monitor vital signs, symptoms, and health metrics over time
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-purple-50 to-white">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-200 transition-colors">
                    <FileText className="h-8 w-8 text-purple-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Medical Records</CardTitle>
                  <CardDescription className="text-gray-600">
                    Securely store and manage your medical history and documents
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg bg-gradient-to-br from-orange-50 to-white">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-orange-200 transition-colors">
                    <Building2 className="h-8 w-8 text-orange-600" />
                  </div>
                  <CardTitle className="text-xl font-semibold text-gray-900">Government Schemes</CardTitle>
                  <CardDescription className="text-gray-600">
                    Discover and apply for healthcare benefits and programs
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>

            <div className="text-center mt-12">
              <p className="text-lg text-gray-600 mb-6">
                Ready to take control of your healthcare journey?
              </p>
              <Link href="/signup">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-full">
                  Get Started Today
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Why Choose CareConnect */}
        <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-700 text-white">
          <div className="max-w-7xl mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold mb-4">Why Choose CareConnect?</h2>
              <p className="text-xl text-blue-100 max-w-3xl mx-auto">
                Join the healthcare revolution with our comprehensive, secure, and accessible platform
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="text-center group">
                <div className="w-20 h-20 bg-blue-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-blue-500 transition-colors">
                  <Zap className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">AI-Powered Intelligence</h3>
                <p className="text-blue-100 leading-relaxed">
                  Advanced AI provides instant health insights, symptom analysis, and personalized recommendations in multiple languages.
                </p>
                <Badge className="mt-4 bg-blue-500 text-white">Smart Analytics</Badge>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-green-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-green-500 transition-colors">
                  <Shield className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Bank-Level Security</h3>
                <p className="text-blue-100 leading-relaxed">
                  Your health data is protected with end-to-end encryption, HIPAA compliance, and industry-leading security protocols.
                </p>
                <Badge className="mt-4 bg-green-500 text-white">HIPAA Compliant</Badge>
              </div>

              <div className="text-center group">
                <div className="w-20 h-20 bg-purple-600 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-purple-500 transition-colors">
                  <Heart className="h-10 w-10 text-white" />
                </div>
                <h3 className="text-2xl font-semibold mb-4">Global Accessibility</h3>
                <p className="text-blue-100 leading-relaxed">
                  Available in 15+ languages with 24/7 support, making healthcare accessible to rural and underserved communities worldwide.
                </p>
                <Badge className="mt-4 bg-purple-500 text-white">15+ Languages</Badge>
              </div>
            </div>

            <div className="text-center mt-16">
              <Link href="/signup">
                <Button size="lg" className="bg-white text-blue-700 hover:bg-blue-50 px-8 py-4 rounded-full text-lg font-semibold">
                  Start Your Healthcare Journey
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}