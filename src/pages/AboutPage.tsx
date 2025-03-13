
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { DataProvider } from '@/contexts/DataContext';

const AboutPage: React.FC = () => {
  return (
    <DataProvider>
      <NavBar />
      
      <main className="container mx-auto px-4 md:px-6 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-4xl font-bold mb-6">About Manus Sports</h1>
          
          <div className="prose prose-lg max-w-none">
            <p className="text-xl text-gray-600 mb-8">
              Manus Sports is the premier destination for insightful sports analysis, 
              commentary, and stories across Football, Basketball, Cricket, Tennis, 
              Athletics, and Formula 1.
            </p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">Our Mission</h2>
            <p>
              At Manus Sports, our mission is to provide in-depth, thoughtful analysis
              that goes beyond scores and statistics. We believe in telling the stories
              behind the games and athletes, exploring the strategic elements that make
              sports so compelling, and sharing perspectives that enhance fans' enjoyment
              and understanding of their favorite sports.
            </p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">Our Team</h2>
            <p>
              Our team consists of passionate sports journalists, analysts, and former
              athletes who bring their expertise and love for sports to every article.
              We're committed to delivering high-quality content that educates, entertains,
              and engages sports fans around the world.
            </p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">Join Us</h2>
            <p>
              We're always looking for talented writers and analysts to join our team.
              If you have a passion for sports and a unique perspective to share,
              we'd love to hear from you. Check our Writer Guidelines for more information
              on how to contribute to Manus Sports.
            </p>
            
            <h2 className="text-2xl font-bold mt-10 mb-4">Contact</h2>
            <p>
              Have questions, feedback, or suggestions? We'd love to hear from you!
              Visit our <a href="/contact" className="text-blue-600 hover:underline">Contact page</a> to get in touch with our team.
            </p>
          </div>
        </div>
      </main>
      
      <Footer />
    </DataProvider>
  );
};

export default AboutPage;
