import React from 'react';
import { Main } from './home/Main';
import { Who } from './home/Who';
import { Slogans } from './home/Slogans';
import { TopRated } from './home/TopRated';
import { Events } from './home/Events';
import { Carousel } from './home/Carousel';

/**
 * Home Page Component
 * Serves as the landing page of the application.
 * Composes various sections including the Hero (Main), About (Who), Slogans, 
 * Top Rated works, Events, and a final Carousel.
 */
export const Home: React.FC = () => {
  return (
    <div className="overflow-x-hidden">
      {/* Hero Section */}
      <Main />
      
      {/* Brand Pillars & Slogans */}
      <Slogans />
      
      {/* About Us Section */}
      <Who />
      
      {/* Featured Works (Catalog Data) */}
      <TopRated />
      
      {/* Upcoming Events & Workshops */}
      <Events />
      
      {/* Visual Experience Carousel */}
      <Carousel />
    </div>
  );
};

export default Home;
