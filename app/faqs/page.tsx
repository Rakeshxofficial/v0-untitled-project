import { HelpCircle } from "lucide-react"
import Footer from "@/app/components/footer"
import TelegramButton from "@/app/components/telegram-button"
import FAQItem from "@/app/components/faq-item"
import type { Metadata } from "next"

// Add this metadata export before the FAQsPage component
export const metadata: Metadata = {
  title: "Frequently Asked Questions - InstallMOD",
  description:
    "Find answers to common questions about modded APKs, installation process, OBB files, and using modified Android apps and games safely.",
  openGraph: {
    title: "InstallMOD FAQs - Get Help & Support",
    description:
      "Answers to frequently asked questions about downloading and installing modded APKs on Android devices.",
    type: "website",
  },
}

// Sample FAQ data
const faqs = [
  {
    question: "What is InstallMOD?",
    answer:
      "InstallMOD is a platform that provides modified (modded) versions of popular Android applications and games. These modified versions often include premium features unlocked, removed advertisements, unlimited resources, and other enhancements that are normally paid or restricted in the original versions.",
  },
  {
    question: "Are modded APKs safe to download and use?",
    answer:
      "While we strive to provide safe and virus-free modded APKs, there are inherent risks when using modified applications. We recommend using a reliable antivirus app on your device, downloading only from trusted sources like InstallMOD, and being cautious about the permissions you grant to applications.",
  },
  {
    question: "How do I install APK files on my Android device?",
    answer:
      "To install APK files: 1) Download the APK file from InstallMOD. 2) Go to your device Settings > Security. 3) Enable 'Unknown Sources' to allow installation of apps from sources other than the Play Store. 4) Open the downloaded APK file and tap 'Install'. 5) Follow the on-screen instructions to complete installation.",
  },
  {
    question: "What is an OBB file and how do I install it?",
    answer:
      "OBB (Opaque Binary Blob) files contain additional game data that won't fit in the main APK file, usually for graphics, audio, and other resources. To install an OBB file: 1) Download both the APK and OBB files. 2) Install the APK file first. 3) Extract the OBB file to Android/OBB/[package.name]/ directory on your device storage. 4) Launch the game.",
  },
  {
    question: "Why do some apps show 'App not installed' error?",
    answer:
      "This error can occur for several reasons: 1) Insufficient storage space on your device. 2) Incompatible Android version. 3) Corrupted APK file. 4) An older version of the app is already installed. 5) The app requires additional files like OBB. Try clearing space on your device, checking compatibility, or reinstalling after completely removing any previous version.",
  },
  {
    question: "How often are apps updated on InstallMOD?",
    answer:
      "We strive to update our modded apps and games as soon as new versions are available and can be successfully modified. Popular apps are typically updated within a few days of their official release, while less popular ones might take longer.",
  },
  {
    question: "Can I request a specific app to be modded?",
    answer:
      "Yes! We welcome app requests from our users. You can submit your request through our Telegram channel or contact form. While we can't guarantee that all requests will be fulfilled, we do our best to accommodate popular requests.",
  },
  {
    question: "Is it legal to use modded APKs?",
    answer:
      "The legality of using modded APKs exists in a gray area and varies by country. While modifying apps for personal use is generally not illegal in most places, distributing modded versions of paid apps can violate copyright laws and terms of service. Users should be aware of the legal implications in their respective countries.",
  },
]

export default function FAQsPage() {
  return (
    <div className="min-h-screen bg-white dark:bg-gray-900">
      {/* Add a subtle gradient background */}
      <div className="absolute inset-0 bg-gradient-to-b from-gray-50 to-white dark:from-gray-900 dark:to-gray-950 -z-10"></div>

      <main className="container mx-auto px-4 py-6">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-6">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center shadow-lg relative">
              <HelpCircle className="w-5 h-5 text-white" />
              {/* Add glow effect */}
              <div className="absolute inset-0 bg-blue-400 rounded-full blur-md opacity-30 -z-10"></div>
            </div>
            <h1 className="text-2xl font-bold text-gray-800 dark:text-white">Frequently Asked Questions</h1>
          </div>

          {/* FAQ Accordion */}
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <FAQItem key={index} question={faq.question} answer={faq.answer} />
            ))}
          </div>

          {/* Contact section */}
          <div className="mt-12 bg-white dark:bg-gray-800 shadow-md rounded-xl p-6">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Still have questions?</h2>
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              If you couldn't find the answer to your question, feel free to reach out to us through our Telegram
              channel or contact form.
            </p>
            <div className="flex flex-wrap gap-3">
              <a
                href="https://t.me/installmod"
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
              >
                Join our Telegram
              </a>
              <a
                href="/contact-us"
                className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors inline-flex items-center"
              >
                Contact Us
              </a>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />

      {/* Floating Telegram Button */}
      <TelegramButton />
    </div>
  )
}
