import { ChevronDown } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"

interface AppFAQProps {
  name: string
  version: string
  requirements: string
  size: string
  appFeatures: string[]
  iconBgColor?: string
}

export default function AppFAQ({
  name,
  version,
  requirements,
  size,
  appFeatures = [],
  iconBgColor = "#ff5757",
}: AppFAQProps) {
  // Extract the base app name without "MOD APK" suffix for more natural reading
  const baseName = name.replace(/\s+MOD\s+APK$/i, "").trim()

  // Format features as a comma-separated list with "and" before the last item
  const featuresText =
    appFeatures.length > 0
      ? appFeatures.length === 1
        ? appFeatures[0]
        : `${appFeatures.slice(0, -1).join(", ")} and ${appFeatures[appFeatures.length - 1]}`
      : "premium features"

  return (
    <section className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-md mb-6" aria-labelledby="faq-heading">
      <div className="flex items-center gap-3 mb-6">
        <div
          className="w-10 h-10 rounded-full flex items-center justify-center shadow-lg relative"
          style={{ background: iconBgColor }}
        >
          <ChevronDown className="w-5 h-5 text-white" />
          {/* Add glow effect */}
          <div
            className="absolute inset-0 rounded-full blur-md opacity-30 -z-10"
            style={{ background: iconBgColor }}
          ></div>
        </div>
        <h2 id="faq-heading" className="text-xl font-bold text-gray-800 dark:text-white">
          Frequently Asked Questions
        </h2>
      </div>

      <Accordion type="single" collapsible className="w-full">
        <AccordionItem value="what-is">
          <AccordionTrigger className="text-left font-medium" style={{ color: iconBgColor }}>
            What is {baseName}?
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-600 dark:text-gray-300">
              {baseName} is a popular application that allows users to{" "}
              {baseName.toLowerCase().includes("game")
                ? "enjoy an immersive gaming experience"
                : "access various features and services"}
              . The MOD APK version provides additional benefits like {featuresText} that aren't available in the
              standard version.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="whats-new">
          <AccordionTrigger className="text-left font-medium" style={{ color: iconBgColor }}>
            What's new in {baseName} {version}?
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-600 dark:text-gray-300">
              {baseName} {version} includes the latest updates and improvements from the original app, plus our MOD
              enhancements. This version features {featuresText}, improved stability, and compatibility with the latest
              Android devices.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="is-safe">
          <AccordionTrigger className="text-left font-medium" style={{ color: iconBgColor }}>
            Is {baseName} MOD APK safe to use?
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-600 dark:text-gray-300">
              Yes, we thoroughly test all MOD APKs before publishing them. Our {baseName} MOD APK is scanned for viruses
              and malware. However, as with any modified application, we recommend using a separate account from your
              main one for additional security.
            </p>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="how-to-install">
          <AccordionTrigger className="text-left font-medium" style={{ color: iconBgColor }}>
            How do I install {baseName} MOD APK?
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-600 dark:text-gray-300">To install {baseName} MOD APK:</p>
            <ol className="list-decimal pl-5 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Download the APK file from our website</li>
              <li>Enable "Install from Unknown Sources" in your device settings</li>
              <li>Open the downloaded file and tap "Install"</li>
              <li>Wait for the installation to complete</li>
              <li>Open the app and enjoy the premium features!</li>
            </ol>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="requirements">
          <AccordionTrigger className="text-left font-medium" style={{ color: iconBgColor }}>
            What are the requirements for {baseName} MOD APK?
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-600 dark:text-gray-300">{baseName} MOD APK requires:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
              <li>Android {requirements}</li>
              <li>At least {size} of free storage space</li>
              <li>An active internet connection for most features</li>
              <li>Permission to install apps from unknown sources</li>
            </ul>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="features">
          <AccordionTrigger className="text-left font-medium" style={{ color: iconBgColor }}>
            What MOD features are included?
          </AccordionTrigger>
          <AccordionContent>
            <p className="text-gray-600 dark:text-gray-300">This MOD version of {baseName} includes:</p>
            <ul className="list-disc pl-5 mt-2 space-y-1 text-gray-600 dark:text-gray-300">
              {appFeatures.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
              <li>No ads for distraction-free experience</li>
              <li>Regular updates to maintain compatibility</li>
            </ul>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  )
}
