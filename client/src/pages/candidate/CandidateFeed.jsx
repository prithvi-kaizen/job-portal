import React, { useEffect, useState } from 'react';
import { useJobStore } from '../../store/jobStore';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Search, MapPin, Building, DollarSign, Bookmark, BookmarkCheck } from 'lucide-react';
import { motion } from 'framer-motion';

const CandidateFeed = () => {
  const { jobs, fetchJobs, isLoading } = useJobStore();
  const { user, token } = useAuthStore();
  const [search, setSearch] = useState('');
  const [location, setLocation] = useState('');
  const [bookmarkedJobs, setBookmarkedJobs] = useState(user?.bookmarkedJobs || []);
  const [applications, setApplications] = useState([]);
  
  // File upload state
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [resume, setResume] = useState(null);
  const [applyState, setApplyState] = useState({ loading: false, error: null, success: false });

  useEffect(() => {
    fetchJobs();
    fetchMyApplications();
  }, []);

  const fetchMyApplications = async () => {
    try {
      const res = await fetch('http://localhost:5001/api/applications/me', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if(res.ok) setApplications(data);
    } catch (error) {
      console.error(error);
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    fetchJobs(search, location);
  };

  const handleBookmark = async (jobId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/jobs/${jobId}/bookmark`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      if(res.ok) {
        setBookmarkedJobs(data);
        const updatedUser = { ...user, bookmarkedJobs: data };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleApply = async (e, jobId) => {
    e.preventDefault();
    if (!resume) return setApplyState({ error: "Please select a PDF resume." });
    
    setApplyState({ loading: true, error: null });
    const formData = new FormData();
    formData.append('resume', resume);
    formData.append('jobId', jobId);

    try {
      const res = await fetch('http://localhost:5001/api/applications', {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: formData
      });
      const data = await res.json();
      if(!res.ok) throw new Error(data.message);
      
      setApplyState({ loading: false, error: null, success: true });
      fetchMyApplications();
      setTimeout(() => setSelectedJobId(null), 2000);
    } catch (error) {
      setApplyState({ loading: false, error: error.message });
    }
  };

  const getApplicationStatus = (jobId) => {
    return applications.find(app => app.jobId?._id === jobId)?.status;
  };

  return (
    <div className="container max-w-5xl py-12">
      <div className="mb-12 space-y-4">
        <h1 className="text-4xl font-bold font-heading">Find your next role</h1>
        <p className="text-xl text-muted-foreground">Discover top opportunities tailored to your skills.</p>
        
        <form onSubmit={handleSearch} className="flex gap-4 pt-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Search by title, company, or keyword..." 
              className="pl-9 h-12 text-base"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="relative w-64">
            <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="City, state, or remote" 
              className="pl-9 h-12 text-base"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
            />
          </div>
          <Button type="submit" size="lg" className="h-12 px-8">Search</Button>
        </form>
      </div>

      <div className="space-y-6">
        {isLoading ? (
          <div className="text-center py-20 text-muted-foreground">Loading jobs...</div>
        ) : jobs.length === 0 ? (
          <div className="text-center py-20 border rounded-xl bg-card border-dashed">
            <h3 className="text-xl font-bold mb-2">No jobs found</h3>
            <p className="text-muted-foreground">Try adjusting your search filters.</p>
          </div>
        ) : (
          jobs.map((job, index) => {
            const isBookmarked = bookmarkedJobs.includes(job._id);
            const appStatus = getApplicationStatus(job._id);
            
            return (
              <motion.div 
                key={job._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3, delay: index * 0.05 }}
              >
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start gap-4">
                      <div className="space-y-3 flex-1">
                        <div>
                          <div className="flex justify-between items-start mb-1">
                            <h2 className="text-xl font-bold font-heading">{job.title}</h2>
                            {appStatus && (
                              <Badge variant={appStatus === 'rejected' ? 'destructive' : appStatus === 'interviewing' ? 'success' : 'secondary'}>
                                {appStatus.charAt(0).toUpperCase() + appStatus.slice(1)}
                              </Badge>
                            )}
                          </div>
                          <p className="text-lg text-muted-foreground flex items-center gap-2">
                            <Building className="w-4 h-4" /> {job.company}
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1"><MapPin className="w-4 h-4" /> {job.location}</span>
                          <span className="flex items-center gap-1"><DollarSign className="w-4 h-4" /> {job.salary}</span>
                        </div>
                        
                        <div className="flex flex-wrap gap-2 pt-2">
                          {job.tags?.map(tag => (
                            <Badge key={tag} variant="outline" className="font-normal">{tag}</Badge>
                          ))}
                        </div>
                        
                        <p className="text-sm pt-4 line-clamp-3 leading-relaxed">
                          {job.description}
                        </p>
                      </div>
                      
                      <div className="flex flex-col gap-3 min-w-[140px]">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start text-muted-foreground hover:text-foreground"
                          onClick={() => handleBookmark(job._id)}
                        >
                          {isBookmarked ? <BookmarkCheck className="w-4 h-4 mr-2 text-primary" /> : <Bookmark className="w-4 h-4 mr-2" />}
                          {isBookmarked ? 'Saved' : 'Save Job'}
                        </Button>
                        
                        {!appStatus ? (
                          <Button 
                            className="w-full" 
                            onClick={() => setSelectedJobId(selectedJobId === job._id ? null : job._id)}
                          >
                            {selectedJobId === job._id ? 'Cancel' : 'Apply Now'}
                          </Button>
                        ) : (
                          <Button className="w-full" disabled variant="secondary">Applied</Button>
                        )}
                      </div>
                    </div>
                    
                    {/* Apply Form Expansion */}
                    {selectedJobId === job._id && !appStatus && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="mt-6 pt-6 border-t"
                      >
                        <form onSubmit={(e) => handleApply(e, job._id)} className="flex items-end gap-4">
                          <div className="flex-1 space-y-2">
                            <label className="text-sm font-medium">Upload Resume (PDF)</label>
                            <Input 
                              type="file" 
                              accept=".pdf"
                              onChange={(e) => setResume(e.target.files[0])}
                              className="cursor-pointer"
                            />
                            {applyState.error && <p className="text-sm text-destructive">{applyState.error}</p>}
                            {applyState.success && <p className="text-sm text-green-600">Application submitted successfully!</p>}
                          </div>
                          <Button type="submit" disabled={applyState.loading || applyState.success}>
                            {applyState.loading ? 'Submitting...' : 'Submit Application'}
                          </Button>
                        </form>
                      </motion.div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>
            )
          })
        )}
      </div>
    </div>
  );
};

export default CandidateFeed;
