import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '../components/ui/button';
import { motion } from 'framer-motion';
import { ArrowRight, Briefcase, Zap, ShieldCheck } from 'lucide-react';

const Landing = () => {
  return (
    <div className="flex flex-col min-h-[calc(100vh-4rem)]">
      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center text-center px-4 py-20 bg-gradient-to-b from-background to-muted/30">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="max-w-3xl space-y-8"
        >

          
          <h1 className="font-heading text-5xl md:text-7xl font-bold tracking-tight text-primary">
            Hire <span className="text-muted-foreground font-serif italic">brilliant</span> minds.<br /> Find your next role.
          </h1>
          

          
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link to="/auth">
              <Button size="lg" className="h-12 px-8 text-base">
                Get Started <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
            <Link to="/auth">
              <Button size="lg" variant="outline" className="h-12 px-8 text-base">
                Post a Job
              </Button>
            </Link>
          </div>
        </motion.div>
      </section>


    </div>
  );
};

export default Landing;
