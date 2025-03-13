
import React from 'react';
import NavBar from '@/components/NavBar';
import Footer from '@/components/Footer';
import { DataProvider } from '@/contexts/DataContext';

const WriterGuidelinesPage: React.FC = () => {
  return (
    <>
      <NavBar />
      
      <main className="container mx-auto px-4 py-10 max-w-4xl">
        <h1 className="text-3xl font-bold mb-6">Writer Guidelines</h1>
        
        <div className="prose max-w-none">
          <h2>Writing for Manus Sports</h2>
          <p>
            Welcome to Manus Sports! We're excited that you're interested in contributing to our platform. 
            These guidelines will help you understand our expectations and ensure your content meets our standards.
          </p>
          
          <h2>Content Requirements</h2>
          <ul>
            <li><strong>Original Content:</strong> All submissions must be original and not published elsewhere.</li>
            <li><strong>Length:</strong> Articles should be between 800-2500 words, depending on the topic.</li>
            <li><strong>Accuracy:</strong> Facts must be accurate and properly sourced.</li>
            <li><strong>Timeliness:</strong> Content should be relevant and timely.</li>
            <li><strong>Quality:</strong> Well-written, engaging, and free of grammatical errors.</li>
          </ul>
          
          <h2>Earning Structure</h2>
          <p>
            Writers earn $5 per minute of the article's read time. This is calculated based on word count, 
            with an average reading speed of 250 words per minute. Earnings are automatically added to your 
            wallet and can be withdrawn via PayPal.
          </p>
          
          <h2>Article Categories</h2>
          <p>We publish content in the following categories:</p>
          <ul>
            <li>Football</li>
            <li>Basketball</li>
            <li>Cricket</li>
            <li>Tennis</li>
            <li>Athletics</li>
            <li>Formula 1</li>
          </ul>
          
          <h2>Submission Process</h2>
          <ol>
            <li>Register as an author on Manus Sports.</li>
            <li>Log in to your account and navigate to the Admin Dashboard.</li>
            <li>Click "New Article" to create a new submission.</li>
            <li>Fill in all required fields and submit your article for review.</li>
            <li>Our editorial team will review your submission and provide feedback.</li>
            <li>Once approved, your article will be published on the platform.</li>
          </ol>
          
          <h2>Style Guide</h2>
          <p>
            <strong>Tone:</strong> Conversational but professional. Avoid overly academic language.
          </p>
          <p>
            <strong>Structure:</strong> Include an introduction, body, and conclusion. Use subheadings to break up text.
          </p>
          <p>
            <strong>Formatting:</strong> Use appropriate HTML formatting for headlines, bold text, and lists.
          </p>
          
          <h2>Contact</h2>
          <p>
            If you have any questions about these guidelines or the submission process, 
            please contact us at <a href="mailto:support@manussports.com">support@manussports.com</a>.
          </p>
        </div>
      </main>
      
      <Footer />
    </>
  );
};

export default WriterGuidelinesPage;
