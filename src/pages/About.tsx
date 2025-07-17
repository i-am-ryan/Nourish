
import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { ArrowRight, Heart, Users, Target, Shield, Linkedin, Twitter, Mail } from 'lucide-react';

const About = () => {
  const values = [
    {
      title: "Community",
      subtitle: "First", 
      description: "We put people before profit, always. Every meal we share, every plan we make — it all begins with the wellbeing of our neighbours.",
      icon: Heart,
      image: "/lovable-uploads/2a423765-9217-4c15-8508-367465a3b142.png",
      hoverColor: "from-red-400 to-red-600",
      stat: "3,500 meals shared"
    },
    {
      title: "Impact",
      subtitle: "Focused",
      description: "Real change happens when good intentions meet smart action. We measure success by lives touched, not just logistics completed.",
      icon: Target,
      image: "/lovable-uploads/6f2ea9c8-6aa2-4e26-aed2-414eb6492e76.png",
      hoverColor: "from-orange-400 to-orange-600",
      stat: "220 community partners"
    },
    {
      title: "Trust &",
      subtitle: "Transparency",
      description: "Every donation, every delivery, every decision — we keep it open, honest, and accountable to the communities we serve.",
      icon: Shield,
      image: "/lovable-uploads/0ea5814a-8b22-4256-be89-df784abe7883.png",
      hoverColor: "from-blue-400 to-blue-600",
      stat: "100% transparent tracking"
    },
    {
      title: "Collaboration",
      subtitle: "Over Competition", 
      description: "We work with everyone — government, NGOs, businesses, families. Together we're stronger than the sum of our parts.",
      icon: Users,
      image: "/lovable-uploads/1c03dbd3-d693-4c6b-8f27-6b99367e1cbe.png",
      hoverColor: "from-green-400 to-green-600",
      stat: "45+ active partnerships"
    }
  ];

  const team = [
    {
      name: "Ryan Musiyarira",
      role: "Lead Solutions Architect & Full-Stack Developer",
      bio: "Technology innovator passionate about building scalable solutions for social good.",
      image: "/lovable-uploads/Ryan.jpeg",
      linkedin: "#",
      twitter: "#",
      email: "ryan@nourishsa.org"
    },
    {
    name: "Trister Tembo",
    role: "Backend Developer & API Integrations Specialist",
    bio: "Handles backend logic, builds APIs for surplus matching and user management, and ensures secure and efficient backend operations.",
    image: "/lovable-uploads/Trister Tempo.jpeg",
    linkedin: "#",
    twitter: "#",
    email: "trister@nourishsa.org"
  },
  {
    name: "Emmanuel Lombe",
    role: "Cloud Deployment & Infrastructure Manager",
    bio: "Manages deployment pipelines, configures cloud hosting, and ensures scalability and uptime for the NourishSA web application.",
    image: "/lovable-uploads/Emmanual.jpeg",
    linkedin: "#",
    twitter: "#",
    email: "emmanuel@nourishsa.org"
  },
  {
    name: "Zachary Issel",
    role: "UI/UX Designer & Frontend Contributor",
    bio: "Designs intuitive and visually engaging interfaces. Collaborates with developers to translate designs into interactive web components.",
    image: "/lovable-uploads/Zachary Issel.jpeg",
    linkedin: "#",
    twitter: "#",
    email: "zachary@nourishsa.org"
  },
  {
    name: "Tshepo Sitoe",
    role: "Database Administrator & Data Handling Lead",
    bio: "Leads database design, builds data models, and manages storage for surplus food, donations, and user information with secure practices.",
    image: "/lovable-uploads/Tshepo Sitoe.jpeg",
    linkedin: "#",
    twitter: "#",
    email: "tshepo@nourishsa.org"
  },
  {
    name: "Sandra Mwangi",
    role: "Project Coordinator & QA Tester",
    bio: "Keeps the project organized and on track, manages team workflows, and leads quality assurance testing to ensure a smooth user experience.",
    image: "/lovable-uploads/Sandra Mwangi.jpeg",
    linkedin: "#",
    twitter: "#",
    email: "sandra@nourishsa.org"
  },
  {
    name: "Oratile Selepe",
    role: "Content Manager & Community Engagement",
    bio: "Creates engaging content for the platform, manages community feedback, and ensures that user stories and community impact are highlighted across the platform.",
    image: "/lovable-uploads/ora.jpeg",
    linkedin: "#",
    twitter: "#",
    email: "oratile@nourishsa.org"
  }
  ];

  return (
    <div className="min-h-screen pt-16">
      {/* Our Story Banner */}
      <div className="relative w-full h-[50vh] bg-cover bg-center group overflow-hidden">
        <div 
          className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
          style={{
            backgroundImage: `url('/lovable-uploads/ismael-paramo-Cns0h4ypRyA-unsplash.jpg')`
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 to-black/60 flex items-center justify-center">
          <motion.div 
            className="text-center text-white px-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold mb-6 drop-shadow-lg">
              <span className="text-white">Building a </span>
              <span className="text-green-400">Hunger-Free Tomorrow</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-200 max-w-4xl mx-auto drop-shadow-md">
              Our Story, Our Purpose, Our People
            </p>
          </motion.div>
        </div>
      </div>

      {/* Our Story Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-green-50/50 to-white">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
          className="max-w-4xl mx-auto text-center"
        >
          <p className="text-lg text-gray-600 leading-relaxed mb-8">
          NourishSA is a student-led initiative created by final-year students determined to tackle one of South Africa’s most pressing challenges: food insecurity.

Every day, millions of South Africans face hunger—while tons of surplus food go to waste. We asked ourselves: How can technology solve this?
That question became the foundation of NourishSA, a digital platform that bridges the gap between food surplus and food need.
          </p>
          <p className="text-lg text-gray-600 leading-relaxed">
            Our web app makes it simple for supermarkets, restaurants, farms, and individuals to donate extra food directly to local community hubs, orphanages, NGOs, and families. Volunteers use our system to pick up, sort, and redistribute the food—fast, fairly, and transparently.

NourishSA is more than a project. It’s our way of proving that students can build real-world solutions that matter. We’re combining tech innovation with social impact, creating a smarter, more sustainable food rescue network for South Africa.

Join us as we turn ideas into action—one meal at a time.
          </p>
        </motion.div>
      </div>

      {/* Our Values Section - No Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-green-50/30 to-blue-50/30">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            <span className="text-gray-800">Our </span>
            <span className="text-green-600">Values</span>
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            These are the promises we live by — what keeps us real, honest and rooted in the communities we serve.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 gap-8">
          {values.map((value, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group cursor-pointer"
            >
              <motion.div 
                className="relative bg-white/90 backdrop-blur-md border border-white/20 rounded-3xl p-8 text-center h-full shadow-lg overflow-hidden"
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  rotateY: 2,
                  boxShadow: "0 25px 50px rgba(34, 197, 94, 0.3)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Background Image with Ken Burns Effect */}
                <div 
                  className="absolute inset-0 bg-cover bg-center opacity-20 transition-transform duration-700 group-hover:scale-110"
                  style={{ backgroundImage: `url(${value.image})` }}
                />
                
                {/* Glow Effect on Hover */}
                <motion.div 
                  className={`absolute inset-0 bg-gradient-to-r ${value.hoverColor} opacity-0 group-hover:opacity-10 transition-opacity duration-300 rounded-3xl`}
                />
                
                {/* Animated Icon */}
                <motion.div 
                  className={`relative w-20 h-20 mx-auto mb-6 bg-gradient-to-r ${value.hoverColor} rounded-full flex items-center justify-center text-white shadow-lg group-hover:shadow-xl transition-all duration-300`}
                  whileHover={{ 
                    scale: 1.2, 
                    rotate: 10,
                    y: -5
                  }}
                  transition={{ duration: 0.3 }}
                >
                  <value.icon size={32} className="group-hover:animate-pulse" />
                </motion.div>
                
                {/* Dual-Color Title */}
                <motion.h3 
                  className="text-2xl font-bold mb-4 group-hover:text-gray-800 transition-colors duration-300"
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.3 }}
                >
                  <span className="text-gray-900">{value.title} </span>
                  <span className="text-green-600 group-hover:text-green-500 transition-colors duration-300">
                    {value.subtitle}
                  </span>
                </motion.h3>
                
                {/* Description with Fade Animation */}
                <motion.p 
                  className="text-gray-600 mb-6 leading-relaxed group-hover:text-gray-700 transition-colors duration-300"
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 + 0.5 }}
                >
                  {value.description}
                </motion.p>
                
                {/* Animated Counter Stat */}
                <motion.div 
                  className="text-sm font-semibold text-green-600 bg-green-50 px-4 py-2 rounded-full inline-block group-hover:bg-green-100 transition-colors duration-300"
                  whileHover={{ scale: 1.05 }}
                >
                  {value.stat}
                </motion.div>
                
                {/* Pulse Effect Border */}
                <motion.div 
                  className="absolute inset-0 rounded-3xl border-2 border-green-400 opacity-0 group-hover:opacity-100"
                  initial={{ scale: 0.8 }}
                  whileHover={{ 
                    scale: 1,
                    opacity: [0, 1, 0],
                    transition: { duration: 2, repeat: Infinity }
                  }}
                />
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Meet Our Team Section - No Banner */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-br from-blue-50/30 to-green-50/30">
        <motion.div 
          className="text-center mb-16"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          viewport={{ once: true }}
        >
          <h2 className="text-4xl md:text-5xl font-bold text-gray-800 dark:text-white mb-6">
            <span className="text-gray-800">Meet Our </span>
            <span className="text-green-600">Team</span>
          </h2>
          <div className="w-24 h-1 bg-green-600 mx-auto mb-6 rounded-full"></div>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
            Passionate humans building real change — one surplus meal, one family at a time.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {team.map((member, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: index * 0.2 }}
              viewport={{ once: true }}
              className="group relative"
            >
              <motion.div 
                className="bg-white/90 backdrop-blur-md border border-white/20 rounded-3xl p-6 text-center shadow-lg transition-all duration-300 h-full overflow-hidden"
                whileHover={{ 
                  scale: 1.05, 
                  y: -8,
                  boxShadow: "0 25px 50px rgba(34, 197, 94, 0.2)"
                }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="mb-6 relative">
                  <motion.div 
                    className="w-32 h-32 mx-auto rounded-full overflow-hidden shadow-lg shadow-green-400/30 group-hover:shadow-lg group-hover:shadow-green-400/50 transition-all duration-300"
                    whileHover={{ scale: 1.1, rotate: 5 }}
                  >
                    <img 
                      src={member.image} 
                      alt={member.name}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    />
                  </motion.div>
                </div>
                
                {/* Hover Info Overlay */}
                <motion.div 
                  className="absolute inset-0 bg-gradient-to-t from-green-600/95 to-green-500/95 rounded-3xl flex flex-col justify-center items-center p-6 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                  initial={{ opacity: 0 }}
                  whileHover={{ opacity: 1 }}
                >
                  <h3 className="text-xl font-bold mb-2">{member.name}</h3>
                  <p className="text-green-100 font-semibold mb-4">{member.role}</p>
                  <p className="text-green-50 text-sm leading-relaxed text-center">{member.bio}</p>
                  
                  <div className="flex justify-center space-x-4 mt-4">
                    <motion.a 
                      href={member.linkedin} 
                      className="text-green-100 hover:text-white transition-colors"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Linkedin size={20} />
                    </motion.a>
                    <motion.a 
                      href={member.twitter} 
                      className="text-green-100 hover:text-white transition-colors"
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Twitter size={20} />
                    </motion.a>
                    <motion.a 
                      href={`mailto:${member.email}`} 
                      className="text-green-100 hover:text-white transition-colors"
                      whileHover={{ scale: 1.2, y: -2 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Mail size={20} />
                    </motion.a>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      
    </div>
  );
};

export default About;
