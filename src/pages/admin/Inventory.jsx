import { useEffect, useState } from 'react';
import api from '../../services/api';
import { formatCurrency } from '../../utils/formatters';
import { Button } from '../../components/Button';
import { Modal } from '../../components/Modal';
import { PrintButton } from '../../components/PrintButton';
import { printContent } from '../../utils/print';

export const Inventory = () => {
  const [items, setItems] = useState([]);
  const [totalValue, setTotalValue] = useState(0);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState({ name: '', type: '', value: '', status: 'Available', purchaseDate: '', serialNumber: '', notes: '' });
  const [editing, setEditing] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchItems = async () => {
    try {
      const { data } = await api.get('/inventory');
      setItems(data);
      const total = data.reduce((sum, i) => sum + i.value, 0);
      setTotalValue(total);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api.put(`/inventory/${editing._id}`, form);
      } else {
        await api.post('/inventory', form);
      }
      setModalOpen(false);
      setEditing(null);
      setForm({ name: '', type: '', value: '', status: 'Available', purchaseDate: '', serialNumber: '', notes: '' });
      fetchItems();
    } catch (err) {
      alert(err.response?.data?.message);
    }
  };

  const handleDelete = async (id) => {
    if (confirm('Delete this item?')) {
      try {
        await api.delete(`/inventory/${id}`);
        fetchItems();
      } catch (err) {
        alert(err.response?.data?.message);
      }
    }
  };

  const openEdit = (item) => {
    setEditing(item);
    setForm({
      name: item.name,
      type: item.type,
      value: item.value,
      status: item.status,
      purchaseDate: item.purchaseDate?.slice(0,10) || '',
      serialNumber: item.serialNumber || '',
      notes: item.notes || '',
    });
    setModalOpen(true);
  };

  const printList = () => {
    const rows = items.map(i => `<tr><td>${i.name}</td><td>${i.type}</td><td>${formatCurrency(i.value)}</td><td>${i.status}</td></tr>`).join('');
    const html = `<h1>Inventory List</h1><p>Total Value: ${formatCurrency(totalValue)}</p><table><thead><tr><th>Name</th><th>Type</th><th>Value</th><th>Status</th></tr></thead><tbody>${rows}</tbody></table>`;
    printContent(html, 'Inventory_List');
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Inventory</h1>
        <div className="flex gap-2"><Button onClick={() => { setEditing(null); setForm({ name: '', type: '', value: '', status: 'Available', purchaseDate: '', serialNumber: '', notes: '' }); setModalOpen(true); }}>➕ Add Item</Button><PrintButton onClick={printList}>Print List</PrintButton></div>
      </div>
      <div className="card mb-6"><p className="font-semibold">Total Inventory Value: {formatCurrency(totalValue)}</p></div>
      <div className="card">
        <table className="min-w-full"><thead><tr><th>Name</th><th>Type</th><th>Value</th><th>Status</th><th>Actions</th></tr></thead><tbody>
          {items.map(i => (
            <tr key={i._id} className="border-t"><td>{i.name}</td><td>{i.type}</td><td>{formatCurrency(i.value)}</td><td>{i.status}</td>
              <td><button onClick={() => openEdit(i)} className="text-blue-600 mr-2">Edit</button><button onClick={() => handleDelete(i._id)} className="text-red-600">Delete</button></td>
            </tr>
          ))}
        </tbody></table>
      </div>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title={editing ? 'Edit Item' : 'Add Item'}>
        <form onSubmit={handleSubmit}>
          <div className="mb-2"><label>Name *</label><input type="text" className="w-full border p-2 rounded" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required /></div>
          <div className="mb-2"><label>Type *</label><input type="text" className="w-full border p-2 rounded" value={form.type} onChange={e => setForm({...form, type: e.target.value})} required /></div>
          <div className="mb-2"><label>Value (KES) *</label><input type="number" className="w-full border p-2 rounded" value={form.value} onChange={e => setForm({...form, value: e.target.value})} required /></div>
          <div className="mb-2"><label>Status</label><select className="w-full border p-2 rounded" value={form.status} onChange={e => setForm({...form, status: e.target.value})}><option>Available</option><option>Assigned</option><option>Under Maintenance</option><option>Retired</option></select></div>
          <div className="mb-2"><label>Purchase Date</label><input type="date" className="w-full border p-2 rounded" value={form.purchaseDate} onChange={e => setForm({...form, purchaseDate: e.target.value})} /></div>
          <div className="mb-2"><label>Serial Number</label><input type="text" className="w-full border p-2 rounded" value={form.serialNumber} onChange={e => setForm({...form, serialNumber: e.target.value})} /></div>
          <div className="mb-4"><label>Notes</label><textarea className="w-full border p-2 rounded" rows="2" value={form.notes} onChange={e => setForm({...form, notes: e.target.value})} /></div>
          <Button type="submit" className="w-full">{editing ? 'Update' : 'Add'}</Button>
        </form>
      </Modal>
    </div>
  );
};