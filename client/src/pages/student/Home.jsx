import React, { useEffect, useMemo, useState } from 'react';
import Footer from '../../components/student/Footer';
import Hero from '../../components/student/Hero';
import Companies from '../../components/student/Companies';
import CoursesSection from '../../components/student/CoursesSection';
import TestimonialsSection from '../../components/student/TestimonialsSection';
import CallToAction from '../../components/student/CallToAction';
import HomepageFeatureGrid from '../../components/student/HomepageFeatureGrid';
import ImmersiveBackground from '../../components/common/ImmersiveBackground';
import api from '@/utils/api';
import { defaultHomepageConfig, mergeHomepageConfig } from '../../utils/homepageConfig';

const Home = () => {
  const [homepageConfig, setHomepageConfig] = useState(defaultHomepageConfig);

  useEffect(() => {
    const loadHomepage = async () => {
      try {
        const { data } = await api.get('/setting/homepage');
        if (data.success) {
          setHomepageConfig(mergeHomepageConfig(data.homepage));
        }
      } catch (error) {
        setHomepageConfig(defaultHomepageConfig);
      }
    };

    loadHomepage();
  }, []);

  const themeVars = useMemo(() => ({
    '--primary': homepageConfig.theme.primary,
    '--primary-hover': homepageConfig.theme.primaryHover,
    '--accent': homepageConfig.theme.accent,
    '--surface-tint': homepageConfig.theme.surfaceTint
  }), [homepageConfig]);

  return (
    <div
      className="relative flex flex-col items-center overflow-hidden text-center"
      style={themeVars}
    >
      <ImmersiveBackground />

      <div className="relative z-10 flex w-full flex-col items-center">
        <Hero config={homepageConfig.hero} />
        <HomepageFeatureGrid config={homepageConfig.features} />
        <Companies />
        <CoursesSection config={homepageConfig.showcase} />
        <TestimonialsSection config={homepageConfig.testimonials} />
        <CallToAction config={homepageConfig.cta} />
        <Footer />
      </div>
    </div>
  );
};

export default Home;




