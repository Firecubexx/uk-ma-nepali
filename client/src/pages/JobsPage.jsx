import { usePageTitle } from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { FiBriefcase, FiMapPin, FiClock, FiDollarSign, FiPlus, FiSearch, FiUsers } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { SpinnerPage, EmptyState, Modal } from '../components/common/UI';
import Avatar from '../components/common/Avatar';
import api from '../utils/api';
import { useAuth } from '../context/AuthContext';

const JOB_TYPES = ['full-time', 'part-time', 'contract', 'temporary', 'zero-hours'];
const UK_CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'All'];

function JobCard({ job, onApply }) {
  const { user } = useAuth();
  const applied = job.applicants?.includes(user?._id);

  return (
    <div className="card p-5 hover:shadow-md transition-shadow fade-in">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="tag capitalize">{job.type}</span>
          </div>
          <h3 className="font-bold text-gray-900 dark:text-white text-lg leading-tight">{job.title}</h3>
          <p className="text-primary-500 font-semibold">{job.company}</p>
        </div>
        <Avatar src={job.postedBy?.avatar} name={job.postedBy?.name || '?'} size="sm" />
      </div>

      <div className="mt-3 flex flex-wrap gap-3 text-sm text-gray-500 dark:text-gray-400">
        <span className="flex items-center gap-1"><FiMapPin size={14} /> {job.location}</span>
        {job.salary && <span className="flex items-center gap-1"><FiDollarSign size={14} /> {job.salary}</span>}
        <span className="flex items-center gap-1"><FiUsers size={14} /> {job.applicants?.length || 0} applicants</span>
        <span className="flex items-center gap-1"><FiClock size={14} /> {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}</span>
      </div>

      <p className="mt-3 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">{job.description}</p>

      <div className="mt-4 flex items-center justify-between">
        <p className="text-xs text-gray-400">Posted by {job.postedBy?.name}</p>
        <button
          onClick={() => onApply(job._id)}
          disabled={applied}
          className={applied ? 'btn-secondary text-sm cursor-default' : 'btn-primary text-sm'}
        >
          {applied ? '✓ Applied' : 'Apply Now'}
        </button>
      </div>
    </div>
  );
}

export default function JobsPage() {
  usePageTitle('Jobs');
  const [jobs, setJobs]         = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [search, setSearch]     = useState('');
  const [cityFilter, setCityFilter] = useState('');
  const [form, setForm] = useState({ title: '', company: '', location: '', type: 'full-time', salary: '', description: '', contactEmail: '' });

  const fetchJobs = async () => {
    try {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (cityFilter && cityFilter !== 'All') params.append('city', cityFilter);
      const { data } = await api.get(`/jobs?${params}`);
      setJobs(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchJobs(); }, [search, cityFilter]);

  const handleApply = async (id) => {
    try {
      await api.post(`/jobs/${id}/apply`);
      toast.success('Application sent! 🎉');
      setJobs((prev) => prev.map((j) => j._id === id ? { ...j, applicants: [...(j.applicants || []), 'me'] } : j));
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to apply'); }
  };

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post('/jobs', form);
      setJobs((prev) => [data, ...prev]);
      setShowModal(false);
      setForm({ title: '', company: '', location: '', type: 'full-time', salary: '', description: '', contactEmail: '' });
      toast.success('Job posted!');
    } catch { toast.error('Failed to post job'); }
  };

  if (loading) return <SpinnerPage />;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Jobs 💼</h1>
          <p className="text-sm text-gray-500 mt-0.5">Find jobs shared by the Nepali community</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Post Job
        </button>
      </div>

      {/* Search & filter */}
      <div className="card p-4 space-y-3">
        <div className="relative">
          <FiSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input
            type="text"
            placeholder="Search jobs or companies..."
            className="input-field pl-10"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {UK_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => setCityFilter(c === 'All' ? '' : c)}
              className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
                (c === 'All' && !cityFilter) || cityFilter === c
                  ? 'bg-primary-500 text-white'
                  : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
              }`}
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Jobs list */}
      {jobs.length === 0 ? (
        <EmptyState icon="💼" title="No jobs found" description="Be the first to post a job for the community!" />
      ) : (
        jobs.map((job) => <JobCard key={job._id} job={job} onApply={handleApply} />)
      )}

      {/* Post job modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Post a Job">
        <form onSubmit={handlePost} className="space-y-3">
          <input className="input-field" placeholder="Job title *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <input className="input-field" placeholder="Company name *" value={form.company} onChange={(e) => setForm({ ...form, company: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Location *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {JOB_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t}</option>)}
            </select>
          </div>
          <input className="input-field" placeholder="Salary (e.g. £25,000 - £30,000)" value={form.salary} onChange={(e) => setForm({ ...form, salary: e.target.value })} />
          <textarea className="input-field resize-none h-28" placeholder="Job description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <input className="input-field" placeholder="Contact email" type="email" value={form.contactEmail} onChange={(e) => setForm({ ...form, contactEmail: e.target.value })} />
          <button type="submit" className="btn-primary w-full">Post Job</button>
        </form>
      </Modal>
    </div>
  );
}
