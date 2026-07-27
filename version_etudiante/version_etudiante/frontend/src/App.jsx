import { useEffect, useState } from "react";
import { clientsApi, equipmentApi, reservationsApi, notificationsApi } from "./api";

const emptyClient = { name: "", email: "", phone: "" };
const emptyEquipment = { name: "", category: "", dailyPrice: 0, availableQuantity: 1 };
const emptyReservation = { clientId: "", equipmentId: "", quantity: 1, startDate: "", endDate: "" };

function Panel({ title, children }) { return <section className="panel"><h2>{title}</h2>{children}</section>; }
function ErrorBox({ message }) { return message ? <p className="error">{message}</p> : null; }

export default function App() {
  const [tab, setTab] = useState("clients");
  const [clients, setClients] = useState([]);
  const [equipments, setEquipments] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [clientForm, setClientForm] = useState(emptyClient);
  const [equipmentForm, setEquipmentForm] = useState(emptyEquipment);
  const [reservationForm, setReservationForm] = useState(emptyReservation);
  const [editingClientId, setEditingClientId] = useState(null);
  const [editingEquipmentId, setEditingEquipmentId] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setError("");
    try {
      const [c, e, r, n] = await Promise.all([
        clientsApi.get("/"), equipmentApi.get("/"), reservationsApi.get("/"), notificationsApi.get("/")
      ]);
      setClients(c.data); setEquipments(e.data); setReservations(r.data); setNotifications(n.data);
    } catch (err) { setError(err.response?.data?.message || "Impossible de charger les données. Vérifiez les services backend."); }
  };
  useEffect(() => { load(); }, []);

  async function saveClient(e) {
    e.preventDefault();
    try {
      if (editingClientId) await clientsApi.put(`/${editingClientId}`, clientForm);
      else await clientsApi.post("/", clientForm);
      cancelClientEdit();
      await load();
    } catch (err) { setError(err.response?.data?.message || "Erreur client"); }
  }
  function editClient(client) {
    setEditingClientId(client._id);
    setClientForm({ name: client.name, email: client.email, phone: client.phone });
    setError("");
  }
  function cancelClientEdit() {
    setEditingClientId(null);
    setClientForm(emptyClient);
  }
  async function saveEquipment(e) {
    e.preventDefault();
    const payload = {
      ...equipmentForm,
      dailyPrice: Number(equipmentForm.dailyPrice),
      availableQuantity: Number(equipmentForm.availableQuantity)
    };
    try {
      if (editingEquipmentId) await equipmentApi.put(`/${editingEquipmentId}`, payload);
      else await equipmentApi.post("/", payload);
      cancelEquipmentEdit();
      await load();
    } catch (err) { setError(err.response?.data?.message || "Erreur matériel"); }
  }
  function editEquipment(equipment) {
    setEditingEquipmentId(equipment._id);
    setEquipmentForm({
      name: equipment.name,
      category: equipment.category,
      dailyPrice: equipment.dailyPrice,
      availableQuantity: equipment.availableQuantity
    });
    setError("");
  }
  function cancelEquipmentEdit() {
    setEditingEquipmentId(null);
    setEquipmentForm(emptyEquipment);
  }
  async function addReservation(e) { e.preventDefault(); try { await reservationsApi.post("/", {...reservationForm, quantity:Number(reservationForm.quantity)}); setReservationForm(emptyReservation); load(); } catch (err) { setError(err.response?.data?.message || "Erreur réservation"); } }
  async function remove(api, id) { if (!confirm("Confirmer la suppression?")) return; try { await api.delete(`/${id}`); load(); } catch (err) { setError(err.response?.data?.message || "Suppression impossible"); } }
  async function cancelReservation(id) { try { await reservationsApi.patch(`/${id}/cancel`); load(); } catch (err) { setError(err.response?.data?.message || "Annulation impossible"); } }

  return <main>
    <header><h1>Eventia Location</h1><p>Gestion des clients, du matériel et des réservations</p></header>
    <nav>{["clients","materiel","reservations","notifications"].map(x => <button key={x} className={tab===x?"active":""} onClick={()=>setTab(x)}>{x}</button>)}</nav>
    <ErrorBox message={error}/>

    {tab === "clients" && <Panel title="Clients">
      <form onSubmit={saveClient}><input placeholder="Nom" value={clientForm.name} onChange={e=>setClientForm({...clientForm,name:e.target.value})} required/><input type="email" placeholder="Courriel" value={clientForm.email} onChange={e=>setClientForm({...clientForm,email:e.target.value})} required/><input placeholder="Téléphone" value={clientForm.phone} onChange={e=>setClientForm({...clientForm,phone:e.target.value})} required/><button>{editingClientId ? "Enregistrer" : "Ajouter"}</button>{editingClientId && <button type="button" className="secondary" onClick={cancelClientEdit}>Annuler</button>}</form>
      <table><thead><tr><th>Nom</th><th>Courriel</th><th>Téléphone</th><th></th></tr></thead><tbody>{clients.map(c=><tr key={c._id}><td>{c.name}</td><td>{c.email}</td><td>{c.phone}</td><td className="actions"><button onClick={()=>editClient(c)}>Modifier</button><button className="danger" onClick={()=>remove(clientsApi,c._id)}>Supprimer</button></td></tr>)}</tbody></table>
    </Panel>}

    {tab === "materiel" && <Panel title="Matériel">
      <form onSubmit={saveEquipment}><input placeholder="Nom" value={equipmentForm.name} onChange={e=>setEquipmentForm({...equipmentForm,name:e.target.value})} required/><input placeholder="Catégorie" value={equipmentForm.category} onChange={e=>setEquipmentForm({...equipmentForm,category:e.target.value})} required/><input type="number" min="0" placeholder="Prix/jour" value={equipmentForm.dailyPrice} onChange={e=>setEquipmentForm({...equipmentForm,dailyPrice:e.target.value})} required/><input type="number" min="0" placeholder="Quantité" value={equipmentForm.availableQuantity} onChange={e=>setEquipmentForm({...equipmentForm,availableQuantity:e.target.value})} required/><button>{editingEquipmentId ? "Enregistrer" : "Ajouter"}</button>{editingEquipmentId && <button type="button" className="secondary" onClick={cancelEquipmentEdit}>Annuler</button>}</form>
      <table><thead><tr><th>Nom</th><th>Catégorie</th><th>Prix/jour</th><th>Disponible</th><th></th></tr></thead><tbody>{equipments.map(x=><tr key={x._id}><td>{x.name}</td><td>{x.category}</td><td>{x.dailyPrice} $</td><td>{x.availableQuantity}</td><td className="actions"><button onClick={()=>editEquipment(x)}>Modifier</button><button className="danger" onClick={()=>remove(equipmentApi,x._id)}>Supprimer</button></td></tr>)}</tbody></table>
    </Panel>}

    {tab === "reservations" && <Panel title="Réservations">
      <form onSubmit={addReservation}>
        <select value={reservationForm.clientId} onChange={e=>setReservationForm({...reservationForm,clientId:e.target.value})} required>
          <option value="">Client</option>
          {clients.map(c=><option key={c._id} value={c._id}>{c.name}</option>)}
        </select>
        <select value={reservationForm.equipmentId} onChange={e=>setReservationForm({...reservationForm,equipmentId:e.target.value})} required>
          <option value="">Matériel</option>
          {equipments.length === 0
            ? <option value="" disabled>Aucun matériel disponible</option>
            : equipments.map(x=><option key={x._id} value={x._id}>{x.name}</option>)}
        </select>
        <input type="number" min="1" value={reservationForm.quantity} onChange={e=>setReservationForm({...reservationForm,quantity:e.target.value})}/>
        <input type="date" value={reservationForm.startDate} onChange={e=>setReservationForm({...reservationForm,startDate:e.target.value})} required/>
        <input type="date" value={reservationForm.endDate} onChange={e=>setReservationForm({...reservationForm,endDate:e.target.value})} required/>
        <button>Réserver</button>
      </form>
      <table><thead><tr><th>Client</th><th>Matériel</th><th>Dates</th><th>Total</th><th>Statut</th><th></th></tr></thead><tbody>{reservations.map(r=><tr key={r._id}><td>{r.clientName}</td><td>{r.equipmentName} × {r.quantity}</td><td>{String(r.startDate).slice(0,10)} → {String(r.endDate).slice(0,10)}</td><td>{r.totalPrice} $</td><td>{r.status}</td><td>{r.status === "CONFIRMED" && <button onClick={()=>cancelReservation(r._id)}>Annuler</button>}</td></tr>)}</tbody></table>
    </Panel>}

    {tab === "notifications" && <Panel title="Notifications">
      <button onClick={load}>Actualiser</button><table><thead><tr><th>Destinataire</th><th>Message</th><th>Date</th></tr></thead><tbody>{notifications.map(n=><tr key={n._id}><td>{n.recipient}</td><td>{n.message}</td><td>{new Date(n.createdAt).toLocaleString()}</td></tr>)}</tbody></table>
    </Panel>}
  </main>;
}
