// App.tsx
import { useState, useEffect, ReactNode } from 'react';
import { motion } from 'framer-motion';
import { Terminal, Code2, Briefcase, GraduationCap, Hexagon, Database, Shield } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './card';
interface NavLinkProps {
  href: string;      // href should be a string
  children: ReactNode; // children can be anything that can be rendered
}
const ParticleBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none">
      {[...Array(50)].map((_, i) => {
        const size = Math.random() * 4 + 5 + 'px'; // Random size between 5px and 9px
        const duration = Math.random() * 10 + 10 + 's'; // Random duration between 10s and 20s
        return (
          <div
            key={i}
            className="absolute animate-float"
            style={{
              width: size,
              height: size,
              top: Math.random() * 100 + 'vh',
              left: Math.random() * 100 + 'vw',
              animationDuration: duration,
            }}
          >
            <Hexagon
              className="w-full h-full text-transparent border-2 border-purple-500 opacity-20"
            />
          </div>
        );
      })}
    </div>
  );
};

const HexGrid = () => (
  <div className="fixed inset-0 -z-10 pointer-events-none">
    {[...Array(30)].map((_, i) => (
      <Hexagon 
        key={i}
        className="absolute text-purple-500 opacity-10"
        style={{
          top: Math.random() * 100 + '%',
          left: Math.random() * 100 + '%',
          transform: `rotate(${Math.random() * 360}deg)`,
        }}
      />
    ))}
  </div>
);

const PortfolioWebsite = () => {
  const [activeSection, setActiveSection] = useState('hero');

  useEffect(() => {
    const handleScroll = () => {
      const sections = ['hero', 'experience', 'skills', 'education'];
      const current = sections.find(section => {
        const element = document.getElementById(section);
        if (element) {
          const bounds = element.getBoundingClientRect();
          const viewportHeight = window.innerHeight;
          return bounds.top <= viewportHeight / 2 && bounds.bottom >= viewportHeight / 2;
        }
        return false;
      });
      if (current) setActiveSection(current);
    };

    window.addEventListener('scroll', handleScroll);
    // Run once on mount to set the initial active section
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const NavLink: React.FC<NavLinkProps> = ({ href, children }) => (
    <motion.a
      href={href}
      className={`px-6 py-3 rounded-lg transition-colors text-base font-medium ${
        activeSection === href.slice(1)
          ? 'bg-purple-100 text-purple-900'
          : 'hover:bg-purple-50'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
    >
      {children}
    </motion.a>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-purple-50 relative">
      <ParticleBackground />
      <HexGrid />

      {/* Header adjusted to appear at the bottom on mobile devices */}
      <header className="fixed bottom-0 sm:top-0 sm:bottom-auto left-0 right-0 bg-white/80 backdrop-blur-md z-50 shadow-sm">
        <nav className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <motion.a 
              href="#hero"
              className="text-2xl font-bold text-purple-900"
              whileHover={{ scale: 1.05 }}
            >
              SP
            </motion.a>
            {/* Navigation alignment adjusted for mobile and larger screens */}
            <div className="flex gap-4 justify-center sm:justify-end">
              <NavLink href="#experience">Experience</NavLink>
              <NavLink href="#skills">Skills</NavLink>
              <NavLink href="#education">Education</NavLink>
            </div>
          </div>
        </nav>
      </header>

      <main className="pt-20">
        <section id="hero" className="min-h-screen flex items-center justify-center text-center p-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-6xl font-bold text-purple-900 mb-4">Sagar Pandita</h1>
            <p className="text-xl text-gray-600 mb-8">
              Offensive Security Engineer
            </p>
            <div className="flex gap-4 justify-center">
              <motion.a
                href="https://www.linkedin.com/in/sagar-pandita/"
                target="_blank"
                className="bg-purple-600 text-white px-6 py-3 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Connect on LinkedIn
              </motion.a>
              <motion.a
                href="https://medium.com/@panditasagar"
                target="_blank"
                className="bg-gray-800 text-white px-6 py-3 rounded-lg font-medium"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Read My Blog
              </motion.a>
            </div>
          </motion.div>
        </section>

        {/* Experience Section */}
        <section id="experience" className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-purple-900 mb-8">
              <Briefcase className="inline-block mr-2" /> Experience
            </h2>
            <div className="space-y-6">
              {[
                {
                  company: "Galaxy Digital Services",
                  role: "Associate, Offensive Security Engineer",
                  period: "Oct 2024 - Present",
                },
                {
                  company: "Software Engineering Institute",
                  role: "Security Engineer",
                  period: "Jan 2024 - May 2024",
                },
                {
                  company: "Network Contagion Research Institute",
                  role: "Security Engineer",
                  period: "Jun 2023 - Aug 2023",
                },
                {
                  company: "Willis Towers Watson",
                  role: "Software Security Engineer",
                  period: "Aug 2020 - Aug 2022",
                },
              ].map((exp, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card>
                    <CardHeader>
                      <CardTitle>{exp.company}</CardTitle>
                      <CardDescription>{exp.role}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-500">{exp.period}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* Skills Section */}
        <section id="skills" className="py-20 px-4">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-purple-900 mb-8">
              <Code2 className="inline-block mr-2" /> Skills
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>
                    <Terminal className="inline-block mr-2" /> Programming
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>Python, Java, C, PHP</li>
                    <li>JavaScript, TypeScript, Node.js</li>
                    <li>Assembly (x86), R</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <Shield className="inline-block mr-2" /> Security Tools
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>Wireshark</li>
                    <li>Burp Suite</li>
                    <li>Metasploit</li>
                    <li>Ghidra</li>
                  </ul>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>
                    <Database className="inline-block mr-2" /> Databases
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    <li>MySQL, PostgreSQL</li>
                    <li>MongoDB, Redis</li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>

        {/* Education Section */}
        <section id="education" className="py-20 px-4 bg-white">
          <div className="container mx-auto">
            <h2 className="text-3xl font-bold text-purple-900 mb-8">
              <GraduationCap className="inline-block mr-2" /> Education
            </h2>
            <Card>
              <CardHeader>
                <CardTitle>Carnegie Mellon University</CardTitle>
                <CardDescription>Master of Science in Information Security</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-2">Aug 2022 - May 2024</p>
                <p className="font-medium mb-2">GPA: 3.8/4.0</p>
                <p className="text-gray-600">
                  <strong>Key Coursework:</strong> Reverse Engineering, Ethical Hacking, Cryptography, Cloud Security
                </p>
              </CardContent>
            </Card>
          </div>
        </section>
      </main>
    </div>
  );
};

export default PortfolioWebsite;
