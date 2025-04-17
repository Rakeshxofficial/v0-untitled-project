import Image from "next/image"

export function AboutUs() {
  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Our Story</h2>
        <div className="flex flex-col md:flex-row gap-6 items-center">
          <div className="md:w-1/2">
            <p className="mb-4">
              InstallMOD was founded in 2020 with a simple mission: to provide Android users with access to enhanced
              versions of their favorite apps and games. We recognized that many users were looking for ways to unlock
              premium features, remove ads, and enhance their mobile experience without the high costs often associated
              with premium apps.
            </p>
            <p>
              What started as a small project has grown into a trusted platform serving millions of users worldwide. Our
              team of dedicated developers, content curators, and security experts work tirelessly to ensure that every
              mod we offer is safe, functional, and regularly updated.
            </p>
          </div>
          <div className="md:w-1/2 rounded-lg overflow-hidden">
            <Image
              src="/placeholder.svg?height=300&width=500"
              alt="InstallMOD Team"
              width={500}
              height={300}
              className="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Our Mission</h2>
        <p>
          At InstallMOD, our mission is to democratize access to premium mobile experiences. We believe that everyone
          should have the opportunity to enjoy enhanced functionality and features in their favorite apps and games. We
          strive to:
        </p>
        <ul className="list-disc pl-6 space-y-2">
          <li>Provide a safe and reliable platform for modified Android applications</li>
          <li>Ensure thorough testing and verification of all content before publishing</li>
          <li>Maintain transparency about modifications and potential limitations</li>
          <li>Foster a community of users who share knowledge and experiences</li>
          <li>Respect intellectual property rights while promoting fair use</li>
        </ul>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Our Values</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Safety First</h3>
            <p>
              We prioritize user security above all else, implementing rigorous testing protocols to ensure all mods are
              free from malware and other security threats.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-2">Quality Assurance</h3>
            <p>
              Every mod undergoes extensive testing to verify functionality, stability, and compatibility with various
              Android versions and devices.
            </p>
          </div>
          <div className="bg-muted/50 p-4 rounded-lg">
            <h3 className="text-xl font-medium mb-2">User-Centric Approach</h3>
            <p>
              We actively listen to our community's feedback and continuously improve our platform to meet their needs
              and expectations.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Meet Our Team</h2>
        <p>
          Behind InstallMOD is a diverse team of passionate professionals united by a common goal: to provide the best
          modded app experience for our users. Our team includes developers, security experts, content curators, and
          community managers working together to maintain and improve our platform.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-4">
          <div className="text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 bg-muted">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt="Team Member"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">Alex Johnson</h3>
            <p className="text-sm text-muted-foreground">Founder & CEO</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 bg-muted">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt="Team Member"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">Sarah Chen</h3>
            <p className="text-sm text-muted-foreground">Lead Developer</p>
          </div>
          <div className="text-center">
            <div className="w-24 h-24 rounded-full overflow-hidden mx-auto mb-3 bg-muted">
              <Image
                src="/placeholder.svg?height=96&width=96"
                alt="Team Member"
                width={96}
                height={96}
                className="w-full h-full object-cover"
              />
            </div>
            <h3 className="font-medium">Michael Rodriguez</h3>
            <p className="text-sm text-muted-foreground">Security Specialist</p>
          </div>
        </div>
      </section>
    </div>
  )
}
