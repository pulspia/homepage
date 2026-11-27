import React from 'react';
import Hero from '../components/Hero/Hero';
import Services from '../components/Services/Services';
import About from '../components/About/About';
import Location from '../components/Location/Location';
import Contact from '../components/Contact/Contact';

const Home = ({ lang }) => {
  return (
    <main>
      <Hero lang={lang} />
      <Services lang={lang} />
      <About lang={lang} />
      <Location lang={lang} />
      <Contact lang={lang} />
    </main>
  );
};

export default Home;
