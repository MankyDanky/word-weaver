"use client";

import Link from "next/link";
import { useAuth } from "@/lib/hooks/useAuth";

export default function Home() {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen font-poppins">
      {/* Hero Section */}
      <div className="relative bg-gradient-to-br from-blue-400 to-indigo-600 text-white pb-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 md:py-32 relative z-10">
          <div className="flex flex-col md:flex-row items-center justify-between">
            <div className="md:w-1/2 mb-10 md:mb-0">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                Craft Perfect Essays with AI Assistance
              </h1>
              <p className="mt-6 text-lg md:text-xl text-blue-100">
                WordWeaverAI helps you create well-structured, thoughtful essays on any topic in minutes, not hours.
              </p>
              <div className="mt-10 flex flex-col sm:flex-row gap-4">
                <Link
                  href={isAuthenticated ? "/dashboard" : "/register"}
                  className="bg-white text-indigo-600 px-8 py-3 rounded-lg font-medium shadow-md hover:bg-blue-50 transition-colors"
                >
                  {isAuthenticated ? "Go to Dashboard" : "Get Started"}
                </Link>
                <Link
                  href="#how-it-works"
                  className="border border-white px-8 py-3 rounded-lg font-medium hover:bg-white hover:text-indigo-600 transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
            <div className="md:w-1/2 relative">
              <div className="bg-white p-4 rounded-lg shadow-2xl">
                <div className="bg-gray-50 rounded p-4">
                  <div className="flex gap-2 mb-4">
                    <div className="w-3 h-3 bg-red-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-yellow-400 rounded-full"></div>
                    <div className="w-3 h-3 bg-green-400 rounded-full"></div>
                  </div>
                  <div className="space-y-3">
                    <div className="bg-blue-100 p-2 rounded text-indigo-700 text-sm">Title: Climate Change Impact</div>
                    <div className="bg-blue-100 p-2 rounded text-indigo-700 text-sm">Theme: Environmental Science</div>
                    <div className="bg-blue-100 p-2 rounded text-indigo-700 text-sm">Style: Academic</div>
                    <div className="h-4"></div>
                    <div className="h-2 bg-gray-200 rounded w-3/4"></div>
                    <div className="h-2 bg-gray-200 rounded"></div>
                    <div className="h-2 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-2 bg-gray-200 rounded w-2/3"></div>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 bg-gradient-to-br from-indigo-500 to-purple-600 p-4 rounded-lg shadow-lg transform rotate-6">
                <div className="h-2 bg-white/30 rounded w-24 mb-2"></div>
                <div className="h-2 bg-white/30 rounded w-20"></div>
              </div>
            </div>
          </div>
        </div>
        {/* Fixed wave divider */}
        <div className="absolute bottom-0 left-0 right-0 z-0">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1440 200" preserveAspectRatio="none" className="w-full h-auto">
            <path fill="#ffffff" fillOpacity="1" d="M0,96L48,112C96,128,192,160,288,160C384,160,480,128,576,122.7C672,117,768,139,864,138.7C960,139,1056,117,1152,106.7C1248,96,1344,96,1392,96L1440,96L1440,200L1392,200C1344,200,1248,200,1152,200C1056,200,960,200,864,200C768,200,672,200,576,200C480,200,384,200,288,200C192,200,96,200,48,200L0,200Z"></path>
          </svg>
        </div>
      </div>

      {/* Features Section - Shifted up to eliminate gap */}
      <section className="py-20 px-4 max-w-7xl mx-auto -mt-1 relative z-10 bg-white" id="features">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Features That Make Writing Effortless</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            Our AI-powered tools help you create compelling essays with just a few inputs.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-lg flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Title-Based Generation</h3>
            <p className="text-gray-600">
              Simply input your essay title, and our AI will generate a well-structured piece with introduction, body, and conclusion.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-indigo-100 rounded-lg flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-indigo-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Theme Customization</h3>
            <p className="text-gray-600">
              Specify themes, tones, and styles to get essays tailored to specific academic requirements or personal preferences.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-purple-100 rounded-lg flex items-center justify-center mb-6">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart Citations</h3>
            <p className="text-gray-600">
              Our AI incorporates relevant citations and references in multiple formats including MLA, APA, and Chicago.
            </p>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 bg-gray-50" id="how-it-works">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800">How WordWeaverAI Works</h2>
            <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
              Three simple steps to create professional essays in minutes
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                1
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Enter Your Topic</h3>
              <p className="text-gray-600">
                Provide your essay title, desired themes, and any specific requirements.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                2
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">AI Generation</h3>
              <p className="text-gray-600">
                Our advanced AI creates a well-structured essay based on your inputs.
              </p>
            </div>

            <div className="flex flex-col items-center text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-2xl font-bold mb-6">
                3
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Review & Download</h3>
              <p className="text-gray-600">
                Edit the generated content if needed, then download your finished essay.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials/Benefits */}
      <section className="py-20 px-4 max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Why Students & Writers Love WordWeaverAI</h2>
          <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
            See how our AI writing assistant has helped thousands save time and improve their writing
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 min-w-[3rem] flex-shrink-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                TS
              </div>
              <div>
                <h4 className="text-lg font-semibold">Time Saving</h4>
                <p className="text-gray-600">Complete essays in minutes, not hours</p>
              </div>
            </div>
            <p className="text-gray-700">
              &#34;WordWeaverAI helped me complete a 2000-word research paper in under an hour. The quality was outstanding, and I only needed to make minor edits. This tool has completely transformed my academic workflow.&#34;
            </p>
          </div>

          <div className="bg-white rounded-xl p-8 shadow-lg border border-gray-100">
            <div className="flex items-center mb-6">
              <div className="w-12 h-12 min-w-[3rem] flex-shrink-0 bg-gradient-to-br from-blue-400 to-indigo-600 rounded-full flex items-center justify-center text-white font-bold mr-4">
                WS
              </div>
              <div>
                <h4 className="text-lg font-semibold">Writing Skills</h4>
                <p className="text-gray-600">Learn from AI-generated structures</p>
              </div>
            </div>
            <p className="text-gray-700">
              &#34;As someone who struggles with writing, using WordWeaverAI has not only helped me complete assignments but also improved my own skills by showing me how to structure arguments and develop ideas coherently.&#34;
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-blue-400 to-indigo-600 text-white">
        <div className="max-w-5xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">Ready to Transform Your Writing Process?</h2>
          <p className="text-xl mb-10 text-blue-100">
            Join thousands of students and professionals who are saving time and producing better essays with WordWeaverAI.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register" className="bg-white text-indigo-600 px-8 py-4 rounded-lg font-medium shadow-md hover:bg-blue-50 transition-colors text-lg">
              Create Free Account
            </Link>
            <Link href="#features" className="border border-white px-8 py-4 rounded-lg font-medium hover:bg-white hover:text-indigo-600 transition-colors text-lg">
              Explore Features
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-12 px-4">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-xl font-bold mb-4">WordWeaverAI</h3>
            <p className="text-gray-300">
              AI-powered essay writing assistant for students and professionals.
            </p>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Product</h4>
            <ul className="space-y-2">
              <li><a href="#features" className="text-gray-300 hover:text-white">Features</a></li>
              <li><a href="#how-it-works" className="text-gray-300 hover:text-white">How It Works</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Pricing</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">About Us</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Blog</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Contact</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-lg font-semibold mb-4">Legal</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-gray-300 hover:text-white">Privacy Policy</a></li>
              <li><a href="#" className="text-gray-300 hover:text-white">Terms of Service</a></li>
            </ul>
          </div>
        </div>
        <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-gray-700 text-center text-gray-400">
          <p>© {new Date().getFullYear()} WordWeaverAI. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}