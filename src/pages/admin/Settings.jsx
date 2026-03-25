import { useState } from 'react';
import { useSettings } from '../../hooks/useSettings';
import { Button } from '../../components/Button';
import api from '../../services/api';

export const Settings = () => {
  const { settings, loading, updateSettings, refresh } = useSettings();
  const [form, setForm] = useState(null);
  const [courses, setCourses] = useState([]);
  const [computers, setComputers] = useState({
    mode: 'range',
    range: { start: 1, end: 20, prefix: 'PC ', defaultValue: undefined },
    manualList: [],
    defaultValue: 0,
    syncComputersToInventory: true,
  });
  const [landing, setLanding] = useState({ heroImage: '', aboutText: '', galleryImages: [], socialMedia: {} });
  const [syncing, setSyncing] = useState(false);
  const [stampPreview, setStampPreview] = useState('');

  if (loading) return <div className="text-center py-10">Loading settings...</div>;
  if (!settings) return <div className="text-center py-10">No settings found.</div>;

  const initForm = () => {
    setForm({
      schoolName: settings.schoolName || '',
      motto: settings.motto || '',
      address: settings.address || '',
      phone: settings.phone || '',
      email: settings.email || '',
      stampImage: settings.stampImage || '',
    });
    setStampPreview(settings.stampImage || '');
    setCourses(settings.courses || []);
    setComputers({
      mode: settings.computers?.mode || 'range',
      range: {
        start: settings.computers?.range?.start ?? 1,
        end: settings.computers?.range?.end ?? 20,
        prefix: settings.computers?.range?.prefix ?? 'PC ',
        defaultValue: settings.computers?.range?.defaultValue,
      },
      manualList: (settings.computers?.manualList || []).map(item => {
        if (typeof item === 'string') return { name: item, value: undefined };
        return { name: item.name, value: item.value };
      }),
      defaultValue: settings.computers?.defaultValue ?? 0,
      syncComputersToInventory: settings.syncComputersToInventory !== false,
    });
    setLanding(settings.landing || { heroImage: '', aboutText: '', galleryImages: [], socialMedia: {} });
  };

  if (!form) initForm();

  const handleStampUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file size (max 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('File too large. Maximum size is 2MB.');
      return;
    }
    
    // Check file type
    if (!file.type.match('image.*')) {
      alert('Please select an image file (jpg, png, gif).');
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result;
      setForm({ ...form, stampImage: base64String });
      setStampPreview(base64String);
    };
    reader.readAsDataURL(file);
  };

  const handleSave = async () => {
    const updated = {
      ...form,
      courses,
      computers: {
        mode: computers.mode,
        range: {
          start: computers.range.start,
          end: computers.range.end,
          prefix: computers.range.prefix,
          defaultValue: computers.range.defaultValue,
        },
        manualList: computers.manualList.map(item => ({
          name: item.name,
          value: item.value,
        })),
        defaultValue: computers.defaultValue,
      },
      syncComputersToInventory: computers.syncComputersToInventory,
      landing,
    };
    const result = await updateSettings(updated);
    if (result.success) {
      alert('Settings saved and computers synced to inventory!');
      refresh();
    } else {
      alert(result.message);
    }
  };

  const handleSyncComputers = async () => {
    setSyncing(true);
    try {
      await api.post('/settings/sync-computers');
      alert('Computers synced to inventory successfully!');
      refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const addCourse = () => setCourses([...courses, { name: '', durationMonths: 3, totalFee: 0 }]);
  const updateCourse = (idx, field, value) => {
    const newCourses = [...courses];
    newCourses[idx][field] = value;
    setCourses(newCourses);
  };
  const removeCourse = (idx) => setCourses(courses.filter((_, i) => i !== idx));

  const addManualComputer = () => setComputers({ ...computers, manualList: [...computers.manualList, { name: '', value: undefined }] });
  const updateManualComputer = (idx, field, value) => {
    const newList = [...computers.manualList];
    if (field === 'name') newList[idx].name = value;
    else if (field === 'value') newList[idx].value = value === '' ? undefined : parseFloat(value);
    setComputers({ ...computers, manualList: newList });
  };
  const removeManualComputer = (idx) => setComputers({ ...computers, manualList: computers.manualList.filter((_, i) => i !== idx) });

  const generatePreview = () => {
    const defaultVal = computers.defaultValue || 0;
    if (computers.mode === 'range') {
      const { start, end, prefix, defaultValue } = computers.range;
      const effectiveDefault = (defaultValue !== undefined && defaultValue !== null) ? defaultValue : defaultVal;
      const preview = [];
      for (let i = start; i <= Math.min(end, start + 4); i++) {
        preview.push(`${prefix}${String(i).padStart(2, '0')} (KES ${effectiveDefault.toLocaleString()})`);
      }
      if (end - start > 4) preview.push('...');
      return preview.join(', ');
    } else {
      return computers.manualList.slice(0, 5).map(item => {
        const val = (item.value !== undefined && item.value !== null) ? item.value : defaultVal;
        return `${item.name} (KES ${val.toLocaleString()})`;
      }).join(', ');
    }
  };

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Settings</h1>
      <div className="space-y-6">
        {/* General Settings */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">General</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">School Name</label>
            <input className="w-full border p-2 rounded" value={form?.schoolName || ''} onChange={e => setForm({...form, schoolName: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Motto</label>
            <input className="w-full border p-2 rounded" value={form?.motto || ''} onChange={e => setForm({...form, motto: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Address</label>
            <input className="w-full border p-2 rounded" value={form?.address || ''} onChange={e => setForm({...form, address: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input className="w-full border p-2 rounded" value={form?.phone || ''} onChange={e => setForm({...form, phone: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Email</label>
            <input className="w-full border p-2 rounded" value={form?.email || ''} onChange={e => setForm({...form, email: e.target.value})} />
          </div>
          
          {/* Stamp Image Upload */}
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Official Stamp Image</label>
            <div className="flex flex-col gap-2">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleStampUpload}
                className="w-full border p-2 rounded"
              />
              <input 
                type="text" 
                placeholder="Or enter image URL"
                className="w-full border p-2 rounded" 
                value={form?.stampImage || ''} 
                onChange={e => {
                  setForm({...form, stampImage: e.target.value});
                  setStampPreview(e.target.value);
                }} 
              />
              {stampPreview && (
                <div className="mt-2 p-3 bg-gray-50 rounded flex items-center gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Stamp Preview:</p>
                    <img 
                      src={stampPreview} 
                      alt="Stamp Preview" 
                      className="max-w-[120px] max-h-[80px] border border-gray-300 rounded p-1 bg-white"
                      onError={(e) => { e.target.style.display = 'none'; e.target.parentElement.innerHTML += '<p class="text-red-500 text-sm">Invalid image URL</p>'; }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      setForm({...form, stampImage: ''});
                      setStampPreview('');
                    }}
                    className="text-red-500 text-sm hover:underline"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>
            <p className="text-xs text-gray-500 mt-1">Upload a stamp image (PNG with transparent background recommended). Max 2MB.</p>
          </div>
        </div>

        {/* Courses */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Courses</h2>
          {courses.map((c, idx) => (
            <div key={idx} className="border p-3 mb-2 rounded bg-gray-50">
              <input placeholder="Course Name" className="w-full mb-2 p-2 border rounded" value={c.name} onChange={e => updateCourse(idx, 'name', e.target.value)} />
              <div className="grid grid-cols-2 gap-2">
                <input type="number" placeholder="Duration (months)" className="p-2 border rounded" value={c.durationMonths} onChange={e => updateCourse(idx, 'durationMonths', parseInt(e.target.value))} />
                <input type="number" placeholder="Total Fee (KES)" className="p-2 border rounded" value={c.totalFee} onChange={e => updateCourse(idx, 'totalFee', parseInt(e.target.value))} />
              </div>
              <button onClick={() => removeCourse(idx)} className="text-red-600 text-sm mt-2 hover:underline">Remove Course</button>
            </div>
          ))}
          <Button onClick={addCourse} className="mt-2">+ Add Course</Button>
        </div>

        {/* Computers with Inventory Sync */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Computers (Auto-Sync to Inventory)</h2>
          
          <div className="mb-4 p-3 bg-blue-50 rounded-lg">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                checked={computers.syncComputersToInventory} 
                onChange={(e) => setComputers({...computers, syncComputersToInventory: e.target.checked})}
              />
              <span className="text-sm font-medium">Automatically sync computers to inventory when settings are saved</span>
            </label>
            <p className="text-xs text-gray-500 mt-1">When enabled, computers defined below will be added to Inventory as assets with their values.</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Default Computer Value (KES)</label>
            <input 
              type="number" 
              className="w-full border p-2 rounded" 
              value={computers.defaultValue || 0}
              onChange={(e) => setComputers({...computers, defaultValue: parseFloat(e.target.value) || 0})}
              placeholder="e.g., 25000"
            />
            <p className="text-xs text-gray-500 mt-1">Fallback value when a computer doesn't have its own value set.</p>
          </div>
          
          <div className="mb-4">
            <label className="block text-sm font-medium mb-1">Computer Mode</label>
            <select className="w-full border p-2 rounded" value={computers.mode} onChange={e => setComputers({...computers, mode: e.target.value})}>
              <option value="range">Range (Auto-generate)</option>
              <option value="manual">Manual List</option>
            </select>
          </div>
          
          {computers.mode === 'range' ? (
            <div className="mb-4">
              <div className="grid grid-cols-3 gap-3 mb-3">
                <div>
                  <label className="block text-xs mb-1">Start</label>
                  <input type="number" className="w-full border p-2 rounded" value={computers.range.start} onChange={e => setComputers({...computers, range: {...computers.range, start: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <label className="block text-xs mb-1">End</label>
                  <input type="number" className="w-full border p-2 rounded" value={computers.range.end} onChange={e => setComputers({...computers, range: {...computers.range, end: parseInt(e.target.value)}})} />
                </div>
                <div>
                  <label className="block text-xs mb-1">Prefix</label>
                  <input className="w-full border p-2 rounded" value={computers.range.prefix} onChange={e => setComputers({...computers, range: {...computers.range, prefix: e.target.value}})} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Value per Computer (KES)</label>
                <input 
                  type="number" 
                  className="w-full border p-2 rounded" 
                  value={computers.range.defaultValue !== undefined ? computers.range.defaultValue : ''}
                  onChange={e => {
                    const val = e.target.value === '' ? undefined : parseFloat(e.target.value);
                    setComputers({...computers, range: {...computers.range, defaultValue: val}});
                  }}
                  placeholder="Use default"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Leave blank to use the default value ({computers.defaultValue?.toLocaleString() || 0})
                </p>
              </div>
            </div>
          ) : (
            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="font-medium">Manual Computer List</label>
                <Button variant="secondary" onClick={addManualComputer} className="text-sm py-1">+ Add Computer</Button>
              </div>
              {computers.manualList.map((item, idx) => (
                <div key={idx} className="flex gap-2 mb-2">
                  <input 
                    className="flex-1 border p-2 rounded" 
                    placeholder="Computer name (e.g., Lab 1, PC 01)"
                    value={item.name} 
                    onChange={e => updateManualComputer(idx, 'name', e.target.value)} 
                  />
                  <input 
                    type="number"
                    className="w-32 border p-2 rounded"
                    placeholder="Value (KES)"
                    value={item.value !== undefined ? item.value : ''}
                    onChange={e => updateManualComputer(idx, 'value', e.target.value)}
                  />
                  <button onClick={() => removeManualComputer(idx)} className="text-red-600 px-3">Remove</button>
                </div>
              ))}
              <p className="text-xs text-gray-500 mt-2">Leave value blank to use the default value ({computers.defaultValue?.toLocaleString() || 0}).</p>
            </div>
          )}
          
          <div className="mt-3 p-2 bg-gray-50 rounded text-sm">
            <strong>Preview:</strong> {generatePreview()}
          </div>
          
          <div className="mt-4 flex gap-3">
            <Button variant="secondary" onClick={handleSyncComputers} disabled={syncing}>
              {syncing ? 'Syncing...' : '🔄 Sync Computers Now'}
            </Button>
            <p className="text-xs text-gray-500 mt-2">Manually trigger sync to add/update/remove computers from inventory with their values</p>
          </div>
        </div>

        {/* Landing Page */}
        <div className="card">
          <h2 className="text-xl font-semibold mb-4">Landing Page</h2>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Hero Image URL</label>
            <input className="w-full border p-2 rounded" value={landing.heroImage} onChange={e => setLanding({...landing, heroImage: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">About Text</label>
            <textarea className="w-full border p-2 rounded" rows="3" value={landing.aboutText} onChange={e => setLanding({...landing, aboutText: e.target.value})} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Facebook URL</label>
            <input className="w-full border p-2 rounded" value={landing.socialMedia?.facebook || ''} onChange={e => setLanding({...landing, socialMedia: {...landing.socialMedia, facebook: e.target.value}})} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Twitter URL</label>
            <input className="w-full border p-2 rounded" value={landing.socialMedia?.twitter || ''} onChange={e => setLanding({...landing, socialMedia: {...landing.socialMedia, twitter: e.target.value}})} />
          </div>
          <div className="mb-3">
            <label className="block text-sm font-medium mb-1">Instagram URL</label>
            <input className="w-full border p-2 rounded" value={landing.socialMedia?.instagram || ''} onChange={e => setLanding({...landing, socialMedia: {...landing.socialMedia, instagram: e.target.value}})} />
          </div>
        </div>

        <Button onClick={handleSave}>Save All Settings & Sync Computers</Button>
      </div>
    </div>
  );
};