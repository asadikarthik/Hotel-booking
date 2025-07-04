import React from 'react'
import Hero from '../Components/Hero'
import FeaturedDestination from '../Components/FeaturedDestination'
import ExclusiveOffers from '../Components/ExclusiveOffers'
import Testimonial from '../Components/Testimonials'
import NewsLetter from '../Components/NewsLetter'
import Footer from '../Components/Footer'

const Home = () => {
  return (
    <>
      <Hero/>
      <FeaturedDestination/>
      <ExclusiveOffers/>
      <Testimonial/>
      <NewsLetter/>
    </>
  )
}

export default Home
