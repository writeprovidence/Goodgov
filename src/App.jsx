import React from 'react';
import './App.css';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Trusted from './components/Trusted';
import Steps from './components/Steps';
import FeaturedQuizzes from './components/FeaturedQuizzes';
import Testimonial from './components/Testimonial';
import CTA from './components/CTA';
import Footer from './components/Footer';

function App() {
  return (
    <>
      <Navbar />
      <main>
        <Hero />
        <Trusted />
        <Steps />
        <FeaturedQuizzes />
        <Testimonial />
        <CTA />
      </main>
      <Footer />
    </>
  );
}

export default App;
