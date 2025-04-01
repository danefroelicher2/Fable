// src/app/premium/page.tsx
"use client";

import { useState } from "react";
import Link from "next/link";

export default function PremiumPage() {
  const [selectedPlan, setSelectedPlan] = useState("annual");

  const plans = {
    monthly: {
      price: "$9.99",
      period: "/month",
      savings: "",
      isPopular: false,
    },
    annual: {
      price: "$6.99",
      period: "/month",
      savings: "Save 30%",
      isPopular: true,
    },
  };

  // Premium features
  const premiumFeatures = [
    {
      icon: "📚",
      title: "Exclusive Content",
      description:
        "Access to premium articles, in-depth analyses, and exclusive interviews with historians.",
    },
    {
      icon: "🔎",
      title: "Advanced Research Tools",
      description:
        "Powerful search capabilities across our entire archive with filtering options.",
    },
    {
      icon: "🎓",
      title: "Expert Webinars",
      description:
        "Monthly webinars with renowned historians and subject matter experts.",
    },
    {
      icon: "📱",
      title: "Ad-Free Experience",
      description:
        "Enjoy an uninterrupted reading experience without advertisements.",
    },
    {
      icon: "💾",
      title: "Personal Library",
      description:
        "Save and organize articles in your personal digital library for offline reading.",
    },
    {
      icon: "🎧",
      title: "Audio Articles",
      description:
        "Listen to our best articles in audio format, perfect for your commute.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-10">
      {/* Hero Section */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center mb-4">
          <svg
            className="h-8 w-8 text-yellow-400 mr-2"
            viewBox="0 0 24 24"
            fill="currentColor"
          >
            <path d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" />
          </svg>
          <h1 className="text-4xl font-bold">HistoryNet Premium</h1>
        </div>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Unlock the full potential of history with our premium membership. Dive
          deeper into the past with exclusive content and advanced features.
        </p>
      </div>

      {/* Pricing Section */}
      <div className="max-w-4xl mx-auto mb-16">
        <div className="bg-white rounded-xl shadow-xl overflow-hidden">
          <div className="p-8 text-center border-b border-gray-200">
            <h2 className="text-3xl font-bold mb-2">
              Choose Your Membership Plan
            </h2>
            <p className="text-gray-600">
              Cancel anytime. All plans include a 7-day free trial.
            </p>
          </div>

          {/* Toggle between plans */}
          <div className="flex justify-center p-6 bg-gray-50">
            <div className="inline-flex rounded-md p-1 bg-gray-200">
              <button
                onClick={() => setSelectedPlan("monthly")}
                className={`px-4 py-2 rounded-md font-medium ${
                  selectedPlan === "monthly"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700"
                }`}
              >
                Monthly
              </button>
              <button
                onClick={() => setSelectedPlan("annual")}
                className={`px-4 py-2 rounded-md font-medium ${
                  selectedPlan === "annual"
                    ? "bg-blue-600 text-white"
                    : "text-gray-700"
                }`}
              >
                Annual
              </button>
            </div>
          </div>

          {/* Selected Plan Details */}
          <div className="p-8 text-center">
            <div className="relative inline-block">
              {plans[selectedPlan as keyof typeof plans].savings && (
                <div className="absolute -top-4 -right-4 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded-full">
                  {plans[selectedPlan as keyof typeof plans].savings}
                </div>
              )}
              <div className="flex items-center justify-center">
                <span className="text-5xl font-bold">
                  {plans[selectedPlan as keyof typeof plans].price}
                </span>
                <span className="text-gray-600 ml-2">
                  {plans[selectedPlan as keyof typeof plans].period}
                </span>
              </div>
            </div>

            <p className="text-gray-600 mt-4">
              Billed {selectedPlan === "annual" ? "annually" : "monthly"}
            </p>

            <div className="mt-8">
              <Link
                href="/signup-premium"
                className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
              >
                Start Your Free Trial
              </Link>
              <p className="text-sm text-gray-500 mt-2">
                No credit card required for trial
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Feature Grid */}
      <div className="mb-16">
        <h2 className="text-3xl font-bold text-center mb-12">
          Premium Benefits
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {premiumFeatures.map((feature, index) => (
            <div key={index} className="bg-white p-6 rounded-lg shadow-md">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Testimonials */}
      <div className="bg-gray-50 rounded-xl p-8 mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          What Our Members Say
        </h2>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                <span className="text-blue-600 font-bold">JH</span>
              </div>
              <div>
                <h4 className="font-bold">James H.</h4>
                <p className="text-gray-500 text-sm">History Teacher</p>
              </div>
            </div>
            <p className="text-gray-700">
              "The premium content has been invaluable for my classroom
              preparations. My students love the engaging material!"
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mr-4">
                <span className="text-green-600 font-bold">LM</span>
              </div>
              <div>
                <h4 className="font-bold">Lisa M.</h4>
                <p className="text-gray-500 text-sm">History Enthusiast</p>
              </div>
            </div>
            <p className="text-gray-700">
              "The audio articles are perfect for my commute. I've learned so
              much about world history in just a few months!"
            </p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex items-center mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center mr-4">
                <span className="text-purple-600 font-bold">RT</span>
              </div>
              <div>
                <h4 className="font-bold">Robert T.</h4>
                <p className="text-gray-500 text-sm">Writer</p>
              </div>
            </div>
            <p className="text-gray-700">
              "The research tools have transformed my work. I can find primary
              sources and expert analyses in minutes!"
            </p>
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="max-w-3xl mx-auto mb-16">
        <h2 className="text-3xl font-bold text-center mb-10">
          Frequently Asked Questions
        </h2>

        <div className="space-y-4">
          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">
              How does the 7-day free trial work?
            </h3>
            <p className="text-gray-700">
              You can sign up for our 7-day free trial without providing payment
              information. After the trial period, you'll be prompted to select
              a payment plan to continue your premium membership.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">
              Can I cancel my subscription?
            </h3>
            <p className="text-gray-700">
              Yes, you can cancel your subscription at any time. If you cancel,
              you'll still have access to premium features until the end of your
              current billing period.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">
              What's included in the premium membership?
            </h3>
            <p className="text-gray-700">
              Premium membership includes exclusive articles, advanced research
              tools, expert webinars, ad-free experience, personal library for
              saving articles, and audio versions of selected articles.
            </p>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-md">
            <h3 className="font-bold text-lg mb-2">
              How often is new premium content added?
            </h3>
            <p className="text-gray-700">
              We add new premium content weekly, including in-depth articles,
              interviews with historians, and audio content. We also host
              monthly webinars on various historical topics.
            </p>
          </div>
        </div>
      </div>

      {/* Call to Action */}
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-6">
          Ready to Dive Deeper into History?
        </h2>
        <Link
          href="/signup-premium"
          className="inline-block bg-blue-600 text-white py-3 px-8 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
        >
          Start Your Free Trial
        </Link>
        <p className="mt-4 text-gray-600">
          Join thousands of history enthusiasts who have already upgraded their
          experience.
        </p>
      </div>
    </div>
  );
}
