
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';

const TermsOfServicePage: React.FC = () => {
  return (
    <>
      <NavBar />
      
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
        
        <div className="prose max-w-none">
          <p className="text-sm text-gray-500">Last updated: June 1, 2023</p>
          
          <h2>1. Acceptance of Terms</h2>
          <p>
            By accessing or using Manus Sports (the "Service"), you agree to be bound by these Terms of Service. 
            If you disagree with any part of the terms, you may not access the Service.
          </p>
          
          <h2>2. User Accounts</h2>
          <p>
            When you create an account with us, you must provide accurate, complete, and up-to-date information. 
            You are responsible for safeguarding the password and for all activities that occur under your account.
          </p>
          
          <h2>3. Content</h2>
          
          <h3>3.1 User Content</h3>
          <p>
            Users may post content, including articles, comments, and other materials. You retain all rights to 
            your content, but you grant us a license to use, reproduce, modify, adapt, publish, translate, and 
            distribute it in any medium and in any form.
          </p>
          
          <h3>3.2 Content Restrictions</h3>
          <p>You agree not to post content that:</p>
          <ul>
            <li>Is unlawful, harmful, threatening, abusive, harassing, defamatory, or invasive of privacy</li>
            <li>Infringes any patent, trademark, trade secret, copyright, or other intellectual property</li>
            <li>Contains software viruses or any other computer code designed to disrupt the Service</li>
            <li>Impersonates any person or entity or falsely states or misrepresents your affiliation</li>
            <li>Contains unsolicited promotional material or any form of spam</li>
          </ul>
          
          <h2>4. Writer Compensation</h2>
          <p>
            Writers receive compensation based on article read time, calculated at $5 per minute. Payments are made 
            through PayPal, and we reserve the right to modify the compensation system with notice to users.
          </p>
          
          <h2>5. Intellectual Property</h2>
          <p>
            The Service and its original content, features, and functionality are owned by Manus Sports and are 
            protected by international copyright, trademark, patent, trade secret, and other intellectual property laws.
          </p>
          
          <h2>6. Termination</h2>
          <p>
            We may terminate or suspend your account immediately, without prior notice or liability, for any reason, 
            including if you breach the Terms. Upon termination, your right to use the Service will immediately cease.
          </p>
          
          <h2>7. Limitation of Liability</h2>
          <p>
            In no event shall Manus Sports be liable for any indirect, incidental, special, consequential, or 
            punitive damages, including loss of profits, data, or other intangible losses, resulting from your 
            access to or use of or inability to access or use the Service.
          </p>
          
          <h2>8. Governing Law</h2>
          <p>
            These Terms shall be governed by and construed in accordance with the laws of the country/state 
            where Manus Sports is registered, without regard to its conflict of law provisions.
          </p>
          
          <h2>9. Changes to Terms</h2>
          <p>
            We reserve the right to modify or replace these Terms at any time. It is your responsibility to 
            review these Terms periodically for changes.
          </p>
          
          <h2>10. Contact Us</h2>
          <p>
            If you have any questions about these Terms, please contact us at:
            <br />
            Email: <a href="mailto:terms@manussports.com">terms@manussports.com</a>
          </p>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default TermsOfServicePage;
