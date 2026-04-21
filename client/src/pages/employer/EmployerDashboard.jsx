import React, { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Badge } from '../../components/ui/badge';
import { Plus, Users, Briefcase, FileText } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const EmployerDashboard = () => {
  const { user, token } = useAuthStore();
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState({});
  const [view, setView] = useState('jobs'); // 'jobs', 'new_job', 'applications'
  const [selectedJob, setSelectedJob] = useState(null);

  // New Job Form State
  const [jobForm, setJobForm] = useState({
    title: '', description: '', company: '', location: '', salary: '', tags: ''
  });

  useEffect(() => {
    fetchMyJobs();
  }, []);

  const fetchMyJobs = async () => {
    try {
      const res = await fetch(`http://localhost:5001/api/jobs`);
      const data = await res.json();
      // filter on frontend for simplicity/demo since we don't have a /jobs/me route yet
      const myJobs = data.filter(job => job.employerId?._id === user._id);
      setJobs(myJobs);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchApplications = async (jobId) => {
    try {
      const res = await fetch(`http://localhost:5001/api/applications/job/${jobId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setApplications({ ...applications, [jobId]: data });
    } catch (error) {
      console.error(error);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const formData = {
        ...jobForm,
        tags: jobForm.tags.split(',').map(tag => tag.trim())
      };
      
      const res = await fetch('http://localhost:5001/api/jobs', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      if(res.ok) {
        setView('jobs');
        fetchMyJobs();
        setJobForm({ title: '', description: '', company: '', location: '', salary: '', tags: '' });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleUpdateStatus = async (appId, jobId, status) => {
    try {
      const res = await fetch(`http://localhost:5001/api/applications/${appId}/status`, {
        method: 'PUT',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ status })
      });
      
      if(res.ok) {
        fetchApplications(jobId);
      }
    } catch (error) {
      console.error(error);
    }
  };

  const viewApplications = (job) => {
    setSelectedJob(job);
    setView('applications');
    if (!applications[job._id]) {
      fetchApplications(job._id);
    }
  };

  return (
    <div className="container max-w-6xl py-12 flex flex-col md:flex-row gap-8">
      {/* Sidebar Layout */}
      <aside className="w-full md:w-64 space-y-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-4 px-4">Dashboard</h2>
        <Button 
          variant={view === 'jobs' ? 'secondary' : 'ghost'} 
          className="w-full justify-start h-10 px-4"
          onClick={() => setView('jobs')}
        >
          <Briefcase className="w-4 h-4 mr-3" /> My Postings
        </Button>
        <Button 
          variant={view === 'new_job' ? 'secondary' : 'ghost'} 
          className="w-full justify-start h-10 px-4"
          onClick={() => setView('new_job')}
        >
          <Plus className="w-4 h-4 mr-3" /> Post new Job
        </Button>
      </aside>

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {view === 'jobs' && (
            <motion.div 
              key="jobs"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div className="flex justify-between items-end border-b pb-4">
                <div>
                  <h1 className="text-3xl font-bold font-heading">My Postings</h1>
                  <p className="text-muted-foreground mt-1">Manage jobs and view applicants.</p>
                </div>
                <Button onClick={() => setView('new_job')}><Plus className="w-4 h-4 mr-2" /> Post Job</Button>
              </div>

              {jobs.length === 0 ? (
                <div className="text-center py-20 border border-dashed rounded-xl bg-muted/10">
                  <Briefcase className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-50" />
                  <h3 className="text-lg font-medium mb-1">No postings yet</h3>
                  <p className="text-muted-foreground mb-4">Create your first job posting to start receiving applicants.</p>
                  <Button variant="outline" onClick={() => setView('new_job')}>Post a Job</Button>
                </div>
              ) : (
                <div className="grid gap-4">
                  {jobs.map(job => (
                    <Card key={job._id} className="hover:border-primary/50 transition-colors">
                      <CardContent className="p-6 flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-xl">{job.title}</h3>
                          <div className="text-sm text-muted-foreground mt-1 space-x-3">
                            <span>{job.location}</span>
                            <span>&bull;</span>
                            <span>{job.salary}</span>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <Button variant="outline" onClick={() => viewApplications(job)}>
                            <Users className="w-4 h-4 mr-2" /> View Applicants
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {view === 'new_job' && (
            <motion.div 
              key="new_job"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="border-b pb-4 mb-6">
                <h1 className="text-3xl font-bold font-heading">Post a New Job</h1>
                <p className="text-muted-foreground mt-1">Fill out the details below to publish.</p>
              </div>
              <Card className="max-w-2xl border-none shadow-none bg-transparent">
                <form onSubmit={handleCreateJob} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Title</label>
                    <Input required value={jobForm.title} onChange={e => setJobForm({...jobForm, title: e.target.value})} placeholder="e.g. Senior Frontend Engineer" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Company Name</label>
                      <Input required value={jobForm.company} onChange={e => setJobForm({...jobForm, company: e.target.value})} placeholder="Acme Corp" />
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Location</label>
                      <Input required value={jobForm.location} onChange={e => setJobForm({...jobForm, location: e.target.value})} placeholder="Remote, US" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Salary Range</label>
                    <Input required value={jobForm.salary} onChange={e => setJobForm({...jobForm, salary: e.target.value})} placeholder="$120k - $150k" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Tags (comma separated)</label>
                    <Input value={jobForm.tags} onChange={e => setJobForm({...jobForm, tags: e.target.value})} placeholder="React, Node, Fullstack" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Job Description</label>
                    <textarea 
                      required
                      className="flex min-h-[150px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={jobForm.description}
                      onChange={e => setJobForm({...jobForm, description: e.target.value})}
                      placeholder="Describe the role and responsibilities..."
                    />
                  </div>
                  <div className="pt-4 flex gap-4">
                    <Button type="button" variant="outline" onClick={() => setView('jobs')}>Cancel</Button>
                    <Button type="submit">Publish Job Post</Button>
                  </div>
                </form>
              </Card>
            </motion.div>
          )}

          {view === 'applications' && selectedJob && (
            <motion.div 
              key="applications"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
            >
              <div className="border-b pb-4 mb-6 flex justify-between items-center">
                <div>
                  <h1 className="text-3xl font-bold font-heading mb-1 flex items-center gap-2">
                    Applicants <Badge variant="secondary">{selectedJob.title}</Badge>
                  </h1>
                  <button onClick={() => setView('jobs')} className="text-sm text-primary hover:underline">&larr; Back to jobs</button>
                </div>
              </div>

              <div className="space-y-4">
                {(!applications[selectedJob._id] || applications[selectedJob._id].length === 0) ? (
                  <div className="text-center py-16 border border-dashed rounded-xl bg-muted/10">
                    <Users className="w-8 h-8 text-muted-foreground mx-auto mb-4 opacity-50" />
                    <h3 className="text-lg font-medium mb-1">No applicants yet</h3>
                    <p className="text-muted-foreground">Applications will appear here once candidates apply.</p>
                  </div>
                ) : (
                  applications[selectedJob._id].map(app => (
                    <Card key={app._id}>
                      <CardContent className="p-6 flex justify-between items-center flex-wrap gap-4">
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-3 mb-2">
                            <h3 className="font-bold text-lg">{app.userId.name}</h3>
                            <Badge variant={app.status === 'rejected' ? 'destructive' : app.status === 'interviewing' ? 'success' : 'secondary'}>
                                {app.status.charAt(0).toUpperCase() + app.status.slice(1)}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">{app.userId.email}</p>
                          <p className="text-xs text-muted-foreground mt-1">Applied: {new Date(app.createdAt).toLocaleDateString()}</p>
                        </div>
                        
                        <div className="flex items-center gap-4 border-l pl-4">
                          <a href={`http://localhost:5001${app.resumeURL}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-sm text-primary hover:underline font-medium">
                            <FileText className="w-4 h-4" /> View Resume
                          </a>
                        </div>
                        
                        <div className="flex gap-2">
                          <Button size="sm" variant={app.status === 'interviewing' ? 'default' : 'outline'} onClick={() => handleUpdateStatus(app._id, selectedJob._id, 'interviewing')}>
                            Interviewing
                          </Button>
                          <Button size="sm" variant={app.status === 'rejected' ? 'destructive' : 'outline'} onClick={() => handleUpdateStatus(app._id, selectedJob._id, 'rejected')}>
                            Reject
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default EmployerDashboard;
