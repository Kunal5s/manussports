
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const PrivacyPolicyPage: React.FC = () => {
  return (
    <>
      <NavBar />
      
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
        
        <div className="prose max-w-none">
          <p className="text-sm text-gray-500">Last updated: June 1, 2023</p>
          
          <h2>1. Introduction</h2>
          <p>
            Welcome to Manus Sports ("we," "our," or "us"). We are committed to protecting your privacy 
            and providing you with a secure experience when using our services. This Privacy Policy explains 
            how we collect, use, disclose, and safeguard your information when you visit our website.
          </p>
          
          <h2>2. Information We Collect</h2>
          <p>We may collect information about you in various ways, including:</p>
          
          <h3>2.1 Personal Data</h3>
          <p>
            When you register an account, we may collect your name, email address, and profile information. 
            If you're a writer, we may also collect payment information for earnings distribution.
          </p>
          
          <h3>2.2 Usage Data</h3>
          <p>
            We automatically collect information about how you interact with our website, including pages 
            visited, time spent on pages, referring websites, and other browsing actions.
          </p>
          
          <h3>2.3 Cookies and Tracking Technologies</h3>
          <p>
            We use cookies and similar tracking technologies to track activity on our website and store certain information. 
            Cookies are files with small amounts of data that may include an anonymous unique identifier.
          </p>
          
          <h2>3. How We Use Your Information</h2>
          <p>We may use the information we collect for various purposes, including:</p>
          <ul>
            <li>Providing, operating, and maintaining our website</li>
            <li>Improving, personalizing, and expanding our website</li>
            <li>Understanding and analyzing how you use our website</li>
            <li>Developing new products, services, features, and functionality</li>
            <li>Processing payments and managing earnings for writers</li>
            <li>Communicating with you about updates, security alerts, and support</li>
            <li>Preventing fraudulent activities and enforcing our terms of service</li>
          </ul>
          
          <h2>4. Data Security</h2>
          <p>
            We implement appropriate security measures to protect your personal information. However, 
            no method of transmission over the Internet or electronic storage is 100% secure, and we 
            cannot guarantee absolute security.
          </p>
          
          <h2>5. Third-Party Services</h2>
          <p>
            We may use third-party services that collect, monitor, and analyze data to improve our service. 
            These third parties have access to your personal information only to perform these tasks on our 
            behalf and are obligated not to disclose or use it for any other purpose.
          </p>
          
          <h2>6. Your Rights</h2>
          <p>
            Depending on your location, you may have certain rights regarding your personal information, 
            including the right to access, correct, delete, or restrict processing of your data. To exercise 
            these rights, please contact us using the information provided below.
          </p>
          
          <h2>7. Changes to This Privacy Policy</h2>
          <p>
            We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
            the new Privacy Policy on this page and updating the "Last updated" date.
          </p>
          
          <h2>8. Contact Us</h2>
          <p>
            If you have any questions about this Privacy Policy, please contact us at:
            <br />
            Email: <a href="mailto:privacy@manussports.com">privacy@manussports.com</a>
          </p>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default PrivacyPolicyPage;
