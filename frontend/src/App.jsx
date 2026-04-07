import { useEffect, useState } from 'react';
import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

function App() {
  const [status, setStatus] = useState('unknown');
  const [view, setView] = useState('home');
  const [authUser, setAuthUser] = useState(null);
  const [authToken, setAuthToken] = useState(localStorage.getItem('plantcare_token') || '');
  const [message, setMessage] = useState('');
  const [messageType, setMessageType] = useState('info');
  const [authLoading, setAuthLoading] = useState(false);

  const [registerForm, setRegisterForm] = useState({ username: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });

  const [plants, setPlants] = useState([]);
  const [careGuides, setCareGuides] = useState([]);
  const [schedules, setSchedules] = useState([]);

  const [addPlantForm, setAddPlantForm] = useState({ name: '', type: '', imageUrl: '', wateringFrequency: '', notes: '' });
  const [scheduleForm, setScheduleForm] = useState({ plantId: '', frequency: 'weekly', nextWateringDate: '', notificationEnabled: true });
  const [careGuideForm, setCareGuideForm] = useState({ plantType: '', sunlightNeeded: '', wateringTips: '', fertilizerTips: '', temperatureRange: '', commonIssues: '' });
  const [profileForm, setProfileForm] = useState({ username: '', profilePic: '', password: '' });

  const setAuthHeaders = (token) => {
    if (token) api.defaults.headers.common.Authorization = `Bearer ${token}`;
    else delete api.defaults.headers.common.Authorization;
  };

  const buildErrorMessage = (err, fallbackMsg) => {
    if (err.response?.data?.message) return err.response.data.message;
    if (err.response?.statusText) return `${err.response.status}: ${err.response.statusText}`;
    if (err.message) return err.message;
    return fallbackMsg;
  };

  useEffect(() => {
    api.get('/health').then((r) => setStatus(r.data.status)).catch(() => setStatus('failed'));
    setAuthHeaders(authToken);

    const storedUser = localStorage.getItem('plantcare_user');
    if (authToken && storedUser) {
      setAuthUser(JSON.parse(storedUser));
      setView('dashboard');
    }
  }, [authToken]);

  const refreshData = async () => {
    if (!authUser) return;
    try {
      const [plantsRes, guidesRes, schedulesRes] = await Promise.all([
        api.get('/plants'),
        api.get('/care-guides'),
        api.get('/watering-schedules')
      ]);
      setPlants(plantsRes.data);
      setCareGuides(guidesRes.data);
      setSchedules(schedulesRes.data);
    } catch (err) {
      console.warn(err);
      setMessage(buildErrorMessage(err, 'Failed to fetch data'));
      setMessageType('error');
    }
  };

  useEffect(() => {
    refreshData();
  }, [authUser]);

  const handleRegister = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage('Registering...');
    setMessageType('info');
    try {
      const res = await api.post('/auth/register', registerForm);
      const user = res.data.user;
      const token = res.data.token;
      setAuthUser(user);
      setAuthToken(token);
      localStorage.setItem('plantcare_token', token);
      localStorage.setItem('plantcare_user', JSON.stringify(user));
      setMessage('Registration successful. Welcome ' + user.username);
      setMessageType('success');
      setRegisterForm({ username: '', email: '', password: '' });
      setView('dashboard');
    } catch (err) {
      console.error(err);
      setMessage(buildErrorMessage(err, 'Register failed'));
      setMessageType('error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setAuthLoading(true);
    setMessage('Logging in...');
    setMessageType('info');
    try {
      const res = await api.post('/auth/login', loginForm);
      const user = res.data.user;
      const token = res.data.token;
      setAuthUser(user);
      setAuthToken(token);
      localStorage.setItem('plantcare_token', token);
      localStorage.setItem('plantcare_user', JSON.stringify(user));
      setMessage('Login successful. Welcome back ' + user.username);
      setMessageType('success');
      setLoginForm({ email: '', password: '' });
      setView('dashboard');
    } catch (err) {
      console.error(err);
      setMessage(buildErrorMessage(err, 'Login failed'));
      setMessageType('error');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = () => {
    setAuthUser(null);
    setAuthToken('');
    localStorage.removeItem('plantcare_token');
    localStorage.removeItem('plantcare_user');
    setView('home');
    setMessage('Logged out successfully');
    setMessageType('success');
    setPlants([]);
    setCareGuides([]);
    setSchedules([]);
  };

  const handleAddPlant = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/plants', addPlantForm);
      setPlants((prev) => [...prev, res.data]);
      setAddPlantForm({ name: '', type: '', imageUrl: '', wateringFrequency: '', notes: '' });
      setMessage('Plant added: ' + res.data.name);
      setMessageType('success');
    } catch (err) {
      setMessage(buildErrorMessage(err, 'Failed to add plant'));
      setMessageType('error');
    }
  };

  const handleDeletePlant = async (plantId) => {
    if (!window.confirm('Remove this plant?')) return;
    try {
      await api.delete(`/plants/${plantId}`);
      setPlants((prev) => prev.filter((p) => p._id !== plantId));
      setMessage('Plant removed successfully');
      setMessageType('success');
    } catch (err) {
      setMessage(buildErrorMessage(err, 'Failed to delete plant'));
      setMessageType('error');
    }
  };

  const handleAddSchedule = async (e) => {
    e.preventDefault();
    if (!scheduleForm.plantId) return setMessage('Please choose a plant');
    try {
      const res = await api.post('/watering-schedules', scheduleForm);
      setSchedules((prev) => [...prev, res.data]);
      setScheduleForm({ plantId: '', frequency: 'weekly', nextWateringDate: '', notificationEnabled: true });
      setMessage('Schedule created');
      setMessageType('success');
    } catch (err) {
      setMessage(buildErrorMessage(err, 'Failed to create schedule'));
      setMessageType('error');
    }
  };

  const handleDeleteSchedule = async (scheduleId) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await api.delete(`/watering-schedules/${scheduleId}`);
      setSchedules((prev) => prev.filter((s) => s._id !== scheduleId));
      setMessage('Schedule deleted');
      setMessageType('success');
    } catch (err) {
      setMessage(buildErrorMessage(err, 'Failed to delete schedule'));
      setMessageType('error');
    }
  };

  const handleCreateCareGuide = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/care-guides', careGuideForm);
      setCareGuides((prev) => [...prev, res.data]);
      setCareGuideForm({ plantType: '', sunlightNeeded: '', wateringTips: '', fertilizerTips: '', temperatureRange: '', commonIssues: '' });
      setMessage('Care guide added');
      setMessageType('success');
    } catch (err) {
      setMessage(buildErrorMessage(err, 'Failed to add care guide'));
      setMessageType('error');
    }
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    if (!authUser) return;
    try {
      const payload = {};
      if (profileForm.username) payload.username = profileForm.username;
      if (profileForm.profilePic) payload.profilePic = profileForm.profilePic;
      if (profileForm.password) payload.password = profileForm.password;
      const res = await api.put(`/users/${authUser._id}`, payload);
      setAuthUser(res.data);
      localStorage.setItem('plantcare_user', JSON.stringify(res.data));
      setMessage('Profile updated');
      setMessageType('success');
      setProfileForm({ username: '', profilePic: '', password: '' });
    } catch (err) {
      setMessage(buildErrorMessage(err, 'Failed to update profile'));
      setMessageType('error');
    }
  };

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingWaterings = schedules
    .filter((s) => s.nextWateringDate)
    .map((s) => {
      const date = new Date(s.nextWateringDate);
      date.setHours(0, 0, 0, 0);
      return { ...s, date };
    })
    .filter((s) => s.date >= today)
    .sort((a, b) => a.date - b.date)
    .slice(0, 5);

  const sharedNav = authUser ? (
    <div className="nav">
      <button onClick={() => setView('dashboard')}>Dashboard</button>
      <button onClick={() => setView('schedules')}>Schedules</button>
      <button onClick={() => setView('care-guides')}>Care Guides</button>
      <button onClick={() => setView('profile')}>Profile</button>
      <button className="logout" onClick={handleLogout}>Logout</button>
    </div>
  ) : null;

  const homeSection = (
    <div>
      <h2>Get started</h2>
      <p>Please register or login to continue.</p>
    </div>
  );

  const registerSection = (
    <section>
      <h2>Register</h2>
      <form onSubmit={handleRegister}>
        <label>Username</label>
        <input value={registerForm.username} onChange={(e) => setRegisterForm({ ...registerForm, username: e.target.value })} required />
        <label>Email</label>
        <input type="email" value={registerForm.email} onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={registerForm.password} onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })} required />
        <button type="submit" disabled={authLoading}>{authLoading ? 'Registering...' : 'Register'}</button>
      </form>
    </section>
  );

  const loginSection = (
    <section>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <label>Email</label>
        <input type="email" value={loginForm.email} onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })} required />
        <label>Password</label>
        <input type="password" value={loginForm.password} onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })} required />
        <button type="submit" disabled={authLoading}>{authLoading ? 'Logging in...' : 'Login'}</button>
      </form>
    </section>
  );

  const dashboardSection = (
    <div className="dashboard">
      <h2>Welcome {authUser?.username}</h2>
      <p>You are logged in as <strong>{authUser?.role}</strong>.</p>
      <div>
        <p>Total Plants: {plants.length}</p>
        <p>Total Guides: {careGuides.length}</p>
        <p>Total Schedules: {schedules.length}</p>
      </div>
      <section>
        <h3>Upcoming Waterings</h3>
        <ul>
          {upcomingWaterings.length === 0 ? <li>No upcoming reminders set.</li> : upcomingWaterings.map((s) => (
            <li key={s._id}>{s.plantId?.name || 'Plant'} on {new Date(s.nextWateringDate).toLocaleDateString()}</li>
          ))}
        </ul>
      </section>
      <section>
        <h3>Plant List</h3>
        <div className='plant-grid'>
          {plants.map((p) => (
            <article key={p._id} className='plant-card'>
              <img src={p.imageUrl || 'https://via.placeholder.com/100'} alt={p.name} width='100' />
              <h4>{p.name}</h4>
              <p>{p.type}</p>
              <p>{p.wateringFrequency}</p>
              <button onClick={() => handleDeletePlant(p._id)}>Delete</button>
            </article>
          ))}
        </div>
      </section>
      <section>
        <h3>Add New Plant</h3>
        <form onSubmit={handleAddPlant}>
          <input value={addPlantForm.name} placeholder='Name' onChange={(e) => setAddPlantForm({ ...addPlantForm, name: e.target.value })} required />
          <input value={addPlantForm.type} placeholder='Type' onChange={(e) => setAddPlantForm({ ...addPlantForm, type: e.target.value })} required />
          <input value={addPlantForm.imageUrl} placeholder='Image URL' onChange={(e) => setAddPlantForm({ ...addPlantForm, imageUrl: e.target.value })} />
          <input value={addPlantForm.wateringFrequency} placeholder='Watering Frequency' onChange={(e) => setAddPlantForm({ ...addPlantForm, wateringFrequency: e.target.value })} />
          <input value={addPlantForm.notes} placeholder='Notes' onChange={(e) => setAddPlantForm({ ...addPlantForm, notes: e.target.value })} />
          <button type='submit'>Add Plant</button>
        </form>
      </section>
    </div>
  );

  const schedulesSection = (
    <div>
      <h2>Watering Schedules</h2>
      <form onSubmit={handleAddSchedule}>
        <select value={scheduleForm.plantId} onChange={(e) => setScheduleForm({ ...scheduleForm, plantId: e.target.value })} required>
          <option value=''>Select plant</option>
          {plants.map((p) => <option key={p._id} value={p._id}>{p.name}</option>)}
        </select>
        <select value={scheduleForm.frequency} onChange={(e) => setScheduleForm({ ...scheduleForm, frequency: e.target.value })}>
          <option value='daily'>Daily</option>
          <option value='weekly'>Weekly</option>
          <option value='custom'>Custom</option>
        </select>
        <input type='date' value={scheduleForm.nextWateringDate} onChange={(e) => setScheduleForm({ ...scheduleForm, nextWateringDate: e.target.value })} required />
        <label><input type='checkbox' checked={scheduleForm.notificationEnabled} onChange={(e) => setScheduleForm({ ...scheduleForm, notificationEnabled: e.target.checked })} /> Enable notifications</label>
        <button type='submit'>Create Schedule</button>
      </form>
      <ul>
        {schedules.map((s) => (
          <li key={s._id}>
            {s.plantId?.name || 'Plant'} - {s.frequency} - next {new Date(s.nextWateringDate).toLocaleDateString()}
            <button onClick={() => handleDeleteSchedule(s._id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );

  const careGuidesSection = (
    <div>
      <h2>Care Guides</h2>
      {authUser?.role === 'admin' && (
        <form onSubmit={handleCreateCareGuide}>
          <input value={careGuideForm.plantType} placeholder='Plant Type' onChange={(e) => setCareGuideForm({ ...careGuideForm, plantType: e.target.value })} required />
          <input value={careGuideForm.sunlightNeeded} placeholder='Sunlight Needed' onChange={(e) => setCareGuideForm({ ...careGuideForm, sunlightNeeded: e.target.value })} />
          <input value={careGuideForm.wateringTips} placeholder='Watering Tips' onChange={(e) => setCareGuideForm({ ...careGuideForm, wateringTips: e.target.value })} />
          <input value={careGuideForm.fertilizerTips} placeholder='Fertilizer Tips' onChange={(e) => setCareGuideForm({ ...careGuideForm, fertilizerTips: e.target.value })} />
          <input value={careGuideForm.temperatureRange} placeholder='Temperature Range' onChange={(e) => setCareGuideForm({ ...careGuideForm, temperatureRange: e.target.value })} />
          <input value={careGuideForm.commonIssues} placeholder='Common Issues' onChange={(e) => setCareGuideForm({ ...careGuideForm, commonIssues: e.target.value })} />
          <button type='submit'>Add Guide</button>
        </form>
      )}
      <ul>
        {careGuides.map((g) => (
          <li key={g._id}><strong>{g.plantType}</strong>: {g.wateringTips} / {g.sunlightNeeded} / {g.temperatureRange}</li>
        ))}
      </ul>
    </div>
  );

  const profileSection = (
    <div>
      <h2>Profile</h2>
      <p><strong>Username:</strong> {authUser?.username}</p>
      <p><strong>Email:</strong> {authUser?.email}</p>
      <p><strong>Role:</strong> {authUser?.role}</p>
      <form onSubmit={handleProfileUpdate}>
        <input value={profileForm.username} placeholder='New Username' onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })} />
        <input value={profileForm.profilePic} placeholder='Profile Pic URL' onChange={(e) => setProfileForm({ ...profileForm, profilePic: e.target.value })} />
        <input type='password' value={profileForm.password} placeholder='New Password' onChange={(e) => setProfileForm({ ...profileForm, password: e.target.value })} />
        <button type='submit'>Update Profile</button>
      </form>
    </div>
  );

  let content;
  if (!authUser) {
    if (view === 'register') content = registerSection;
    else if (view === 'login') content = loginSection;
    else content = homeSection;
  } else {
    if (view === 'schedules') content = schedulesSection;
    else if (view === 'care-guides') content = careGuidesSection;
    else if (view === 'profile') content = profileSection;
    else content = dashboardSection;
  }

  return (
    <div className='container'>
      <h1>Plant Care Reminder App</h1>
      <p>Backend health: {status}</p>
      <p style={{ color: messageType === 'error' ? '#b00020' : messageType === 'success' ? '#2b9348' : '#333' }}>{message}</p>
      {!authUser && (
        <div>
          <button onClick={() => setView('register')}>Register</button>
          <button onClick={() => setView('login')}>Login</button>
        </div>
      )}
      {sharedNav}
      {content}
    </div>
  );
}

export default App;
