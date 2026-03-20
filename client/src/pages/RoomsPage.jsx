import { usePageTitle } from '../hooks/usePageTitle';
import { useState, useEffect } from 'react';
import { FiMapPin, FiDollarSign, FiPlus, FiSearch, FiPhone } from 'react-icons/fi';
import { formatDistanceToNow } from 'date-fns';
import toast from 'react-hot-toast';
import { SpinnerPage, EmptyState, Modal } from '../components/common/UI';
import Avatar from '../components/common/Avatar';
import api from '../utils/api';

const ROOM_TYPES = ['single-room', 'double-room', 'studio', 'flat', 'house-share', 'en-suite'];
const AMENITIES_LIST = ['WiFi', 'Bills Included', 'Parking', 'Garden', 'Washing Machine', 'Near Transport', 'Furnished', 'Pet Friendly'];
const UK_CITIES = ['London', 'Manchester', 'Birmingham', 'Leeds', 'Glasgow', 'Edinburgh', 'Bristol', 'Cardiff', 'Leicester', 'All'];

function RoomCard({ room }) {
  const [imgIdx, setImgIdx] = useState(0);

  return (
    <div className="card overflow-hidden hover:shadow-md transition-shadow fade-in">
      {/* Image */}
      <div className="relative h-48 bg-gray-100 dark:bg-gray-800">
        {room.images?.length > 0 ? (
          <>
            <img src={room.images[imgIdx]} alt={room.title} className="w-full h-full object-cover" />
            {room.images.length > 1 && (
              <div className="absolute bottom-2 right-2 flex gap-1">
                {room.images.map((_, i) => (
                  <button key={i} onClick={() => setImgIdx(i)}
                    className={`w-1.5 h-1.5 rounded-full transition-all ${i === imgIdx ? 'bg-white' : 'bg-white/50'}`} />
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-5xl">🏠</div>
        )}
        <div className="absolute top-3 left-3">
          <span className="bg-white/90 backdrop-blur-sm text-gray-800 text-xs font-semibold px-2 py-1 rounded-lg capitalize">
            {room.type?.replace('-', ' ')}
          </span>
        </div>
        <div className="absolute top-3 right-3">
          <span className="bg-primary-500 text-white text-sm font-bold px-3 py-1 rounded-lg">
            £{room.price}/mo
          </span>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-bold text-gray-900 dark:text-white text-base mb-1">{room.title}</h3>
        <p className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <FiMapPin size={13} /> {room.location}, {room.city}
        </p>
        <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mb-3">{room.description}</p>

        {/* Amenities */}
        {room.amenities?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mb-3">
            {room.amenities.slice(0, 4).map((a) => <span key={a} className="tag text-xs">{a}</span>)}
            {room.amenities.length > 4 && <span className="tag text-xs">+{room.amenities.length - 4}</span>}
          </div>
        )}

        <div className="flex items-center justify-between pt-2 border-t border-gray-50 dark:border-gray-800">
          <div className="flex items-center gap-2">
            <Avatar src={room.postedBy?.avatar} name={room.postedBy?.name || '?'} size="xs" />
            <span className="text-xs text-gray-500">{room.postedBy?.name}</span>
          </div>
          {room.contactNumber && (
            <a href={`tel:${room.contactNumber}`} className="flex items-center gap-1 btn-outline text-xs py-1.5 px-3">
              <FiPhone size={12} /> Contact
            </a>
          )}
        </div>
      </div>
    </div>
  );
}

export default function RoomsPage() {
  usePageTitle('Rooms');
  const [rooms, setRooms]       = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [cityFilter, setCityFilter] = useState('');
  const [selectedAmenities, setSelectedAmenities] = useState([]);
  const [form, setForm] = useState({ title: '', description: '', location: '', city: '', price: '', type: 'single-room', contactNumber: '', preferredTenant: 'any', billsIncluded: false });
  const [images, setImages] = useState([]);

  const fetchRooms = async () => {
    try {
      const params = new URLSearchParams();
      if (cityFilter && cityFilter !== 'All') params.append('city', cityFilter);
      const { data } = await api.get(`/rooms?${params}`);
      setRooms(data);
    } catch {}
    finally { setLoading(false); }
  };

  useEffect(() => { fetchRooms(); }, [cityFilter]);

  const toggleAmenity = (a) => setSelectedAmenities((prev) =>
    prev.includes(a) ? prev.filter((x) => x !== a) : [...prev, a]
  );

  const handlePost = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      selectedAmenities.forEach((a) => fd.append('amenities', a));
      images.forEach((img) => fd.append('images', img));
      const { data } = await api.post('/rooms', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setRooms((prev) => [data, ...prev]);
      setShowModal(false);
      toast.success('Room listed!');
    } catch { toast.error('Failed to list room'); }
  };

  if (loading) return <SpinnerPage />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold text-gray-900 dark:text-white">Rooms & Flats 🏠</h1>
          <p className="text-sm text-gray-500 mt-0.5">Find accommodation across the UK</p>
        </div>
        <button onClick={() => setShowModal(true)} className="btn-primary flex items-center gap-2">
          <FiPlus size={18} /> Add Listing
        </button>
      </div>

      {/* City filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {UK_CITIES.map((c) => (
          <button
            key={c}
            onClick={() => setCityFilter(c === 'All' ? '' : c)}
            className={`shrink-0 px-3 py-1.5 rounded-xl text-sm font-medium transition-all ${
              (c === 'All' && !cityFilter) || cityFilter === c
                ? 'bg-primary-500 text-white'
                : 'bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-primary-300'
            }`}
          >
            {c}
          </button>
        ))}
      </div>

      {rooms.length === 0 ? (
        <EmptyState icon="🏠" title="No listings found" description="Be the first to add a room listing!" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {rooms.map((room) => <RoomCard key={room._id} room={room} />)}
        </div>
      )}

      {/* Add listing modal */}
      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add Room Listing">
        <form onSubmit={handlePost} className="space-y-3">
          <input className="input-field" placeholder="Title (e.g. Double room in Wembley) *" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} required />
          <textarea className="input-field resize-none h-20 text-sm" placeholder="Description *" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} required />
          <div className="grid grid-cols-2 gap-3">
            <input className="input-field" placeholder="Street / Area *" value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} required />
            <input className="input-field" placeholder="City *" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} required />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">£</span>
              <input type="number" className="input-field pl-7" placeholder="Price/month *" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required />
            </div>
            <select className="input-field" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              {ROOM_TYPES.map((t) => <option key={t} value={t} className="capitalize">{t.replace('-', ' ')}</option>)}
            </select>
          </div>
          <input className="input-field" placeholder="Contact number" value={form.contactNumber} onChange={(e) => setForm({ ...form, contactNumber: e.target.value })} />

          <div>
            <p className="text-sm font-medium mb-2 text-gray-700 dark:text-gray-300">Amenities</p>
            <div className="flex flex-wrap gap-2">
              {AMENITIES_LIST.map((a) => (
                <button
                  type="button"
                  key={a}
                  onClick={() => toggleAmenity(a)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium transition-all border ${
                    selectedAmenities.includes(a)
                      ? 'bg-primary-500 text-white border-primary-500'
                      : 'border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400'
                  }`}
                >
                  {a}
                </button>
              ))}
            </div>
          </div>

          <div>
            <p className="text-sm font-medium mb-1 text-gray-700 dark:text-gray-300">Photos (optional)</p>
            <input type="file" multiple accept="image/*" className="text-sm text-gray-500" onChange={(e) => setImages(Array.from(e.target.files))} />
          </div>

          <button type="submit" className="btn-primary w-full">List Room</button>
        </form>
      </Modal>
    </div>
  );
}
