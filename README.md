<<<<<<< HEAD
# 🩺 Rural Healthcare Educator

A comprehensive multilingual AI chatbot designed to educate rural and semi-urban populations about preventive healthcare, disease symptoms, vaccination schedules, and government health schemes. Built with Next.js, Gemini AI, and modern web technologies.

## 🎯 Problem Statement

Create a multilingual AI chatbot to educate rural and semi-urban populations about:
- **Preventive Healthcare**: Hygiene, nutrition, lifestyle practices
- **Disease Symptoms**: Recognition and when to seek medical help
- **Vaccination Schedules**: Government programs and timing
- **Government Health Schemes**: Available services and benefits
- **Real-time Outbreak Alerts**: Disease awareness and prevention

## 🚀 Expected Outcomes

- **80% Accuracy** in answering health queries
- **20% Increase** in community health awareness
- **Multi-channel Access** via web, WhatsApp, and SMS
- **Real-time Integration** with government health databases

## ✨ Features

### 🧠 AI-Powered Healthcare Assistant
- **Gemini AI Integration**: Powered by Google's latest AI model
- **Multilingual Support**: English, Tamil, and Hindi
- **Contextual Responses**: Tailored healthcare information for rural communities
- **Accuracy Tracking**: Monitor response quality and user satisfaction

### 🚨 Real-time Outbreak Alerts
- **Disease Monitoring**: Track active outbreaks and their severity
- **Location-based Alerts**: Region-specific health warnings
- **Prevention Guidelines**: Actionable steps to prevent disease spread
- **Government Integration**: Connect with official health authorities

### 🏥 Government Health Schemes
- **Comprehensive Database**: All major government health programs
- **Eligibility Information**: Clear criteria for each scheme
- **Application Process**: Step-by-step guidance
- **Contact Details**: Direct access to scheme administrators

### 📊 Analytics & Metrics
- **Response Accuracy**: Track AI response quality
- **Community Awareness**: Monitor preventive healthcare queries
- **User Engagement**: Daily active users and growth metrics
- **Language Distribution**: Multilingual usage statistics

### 📱 Multi-Channel Access
- **Web Interface**: Modern, responsive web application
- **WhatsApp Integration**: Coming soon for mobile convenience
- **SMS Service**: Coming soon for areas with limited internet
- **Progressive Web App**: Installable on mobile devices

## 🛠️ Technical Architecture

### Frontend
- **Next.js 15**: React framework with App Router
- **TypeScript**: Type-safe development
- **Tailwind CSS**: Modern, responsive styling
- **Shadcn/ui**: Beautiful, accessible components
- **SWR**: Data fetching and caching

### Backend
- **Next.js API Routes**: Serverless API endpoints
- **Google Generative AI**: Gemini 1.5 Flash integration
- **Mock Databases**: Simulated government health data
- **Real-time Updates**: Live outbreak and scheme information

### AI & NLP
- **Gemini 1.5 Flash**: Advanced language model
- **Custom Prompts**: Healthcare-specific training
- **Multilingual Translation**: Automatic language conversion
- **Context Awareness**: Rural healthcare focus

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- pnpm (recommended) or npm
- Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd gemini-healthcare-chatbot
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   # or
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```bash
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   pnpm dev
   # or
   npm run dev
   ```

5. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📡 API Endpoints

### Chat API
- **POST** `/api/chat` - Main healthcare chatbot endpoint
- **Parameters**: `message`, `language`
- **Response**: AI-generated healthcare guidance

### Health Data API
- **GET** `/api/healthdata` - Health advisories and information
- **Parameters**: `lang` (en/ta/hi)
- **Response**: Multilingual health content

### Outbreak Alerts API
- **GET** `/api/outbreaks` - Real-time outbreak information
- **Parameters**: `lang`, `severity`, `location`
- **Response**: Active disease alerts and prevention measures

### Government Schemes API
- **GET** `/api/schemes` - Government health programs
- **Parameters**: `lang`, `category`, `state`, `active`
- **Response**: Available health schemes and benefits

### Metrics API
- **GET** `/api/metrics` - Analytics and performance data
- **Parameters**: `type`, `lang`, `category`, `startDate`, `endDate`
- **Response**: Accuracy, awareness, and community metrics

## 🎨 Usage Examples

### Basic Health Query
```typescript
const response = await fetch('/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    message: "My child has fever and cough for two days. What should I do?",
    language: "en"
  })
})
```

### Outbreak Information
```typescript
const outbreaks = await fetch('/api/outbreaks?lang=en&severity=high')
```

### Government Schemes
```typescript
const schemes = await fetch('/api/schemes?lang=ta&category=vaccination')
```

## 🔧 Configuration

### Language Support
The chatbot supports three languages:
- **English (en)**: Primary language
- **Tamil (ta)**: Regional language support
- **Hindi (hi)**: National language support

### Healthcare Categories
- **Symptoms**: Disease recognition and guidance
- **Prevention**: Hygiene and lifestyle practices
- **Vaccination**: Immunization schedules
- **Government**: Health schemes and programs
- **General**: Miscellaneous health queries

## 📈 Performance Metrics

### Accuracy Tracking
- User rating system (1-5 scale)
- AI confidence scoring
- Response quality assessment
- Continuous improvement feedback

### Community Awareness
- Preventive query percentage
- Vaccination interest tracking
- Government scheme awareness
- Language preference analysis

### Growth Metrics
- Daily active users
- Weekly growth rate
- Query volume trends
- User engagement patterns

## 🚧 Roadmap

### Phase 1: Core Features ✅
- [x] Multilingual AI chatbot
- [x] Basic healthcare guidance
- [x] Government schemes database
- [x] Outbreak alerts system

### Phase 2: Advanced Features 🚧
- [ ] WhatsApp integration
- [ ] SMS service
- [ ] Real government API integration
- [ ] Advanced analytics dashboard

### Phase 3: Scale & Deploy 🚧
- [ ] Cloud deployment
- [ ] Database optimization
- [ ] Performance monitoring
- [ ] User feedback system

## 🤝 Contributing

We welcome contributions to improve the Rural Healthcare Educator:

1. **Fork the repository**
2. **Create a feature branch**
3. **Make your changes**
4. **Add tests if applicable**
5. **Submit a pull request**

### Development Guidelines
- Follow TypeScript best practices
- Use conventional commit messages
- Ensure responsive design
- Test multilingual functionality
- Maintain accessibility standards

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **Google Gemini AI** for advanced language capabilities
- **Government of India** for healthcare scheme information
- **Open Source Community** for development tools and libraries
- **Healthcare Workers** for domain expertise and validation

## 📞 Support

For support and questions:
- **Issues**: [GitHub Issues](https://github.com/your-repo/issues)
- **Documentation**: [Wiki](https://github.com/your-repo/wiki)
- **Email**: support@healthcare-educator.com

---

**⚠️ Important Notice**: This is an educational tool designed to provide general healthcare information. Always consult qualified healthcare professionals for medical advice, diagnosis, and treatment. The chatbot cannot replace professional medical consultation.

**🎯 Mission**: Empowering rural communities with accessible, accurate, and actionable healthcare information through AI technology.
=======
# 🏥 AI Healthcare Chatbot

An AI-powered healthcare assistant that provides:
- 🤖 Chat-based medical guidance
- 🎤 Voice input (speech-to-text)
- 📍 Hospital locator
- 📊 Health dashboard

---

## 🚀 Tech Stack
- Frontend: React / Next.js
- Backend: Node.js
- AI: Google Generative AI
- Cloud: Microsoft Azure
- Database: Azure SQL

---

## 📁 Project Structure

frontend/ → UI  
backend/ → APIs  
docs/ → diagrams  
public/ → assets  

---

## ⚡ Features
- User Authentication  
- AI Chatbot  
- Symptom Analysis  
- Voice Interaction  
- Hospital Locator  

---

## 📌 Future Scope
- Doctor consultation  
- Multilingual support  
- Wearable integration  

---
>>>>>>> 8cd164ba505401f26869828668d8e90a574dfabc
