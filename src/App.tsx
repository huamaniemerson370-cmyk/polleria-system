import { useEffect, useState } from 'react';
import { db } from './firebaseConfig';
import { collection, onSnapshot, doc, updateDoc } from 'firebase/firestore';
import NuevoPedido from './nuevopedido';

interface Pedido {
  id: string;
  mesa: string;
  items: { nombre: string; cantidad: number; observacion?: string }[];
  estado: string; // 'pendiente' | 'listo'
}

export default function App() {
  const [pedidosCocina, setPedidosCocina] = useState<Pedido[]>([]);
  const [mesaSeleccionada, setMesaSeleccionada] = useState<string | null>(null);

  // Cargar pedidos desde Firestore en tiempo real para la cocina (colección "pedidos")
  useEffect(() => {
    const unsubscribe = onSnapshot(collection(db, "pedidos"), (snapshot) => {
      const listaPedidos: Pedido[] = snapshot.docs.map(documento => ({
        id: documento.id,
        ...documento.data()
      })) as Pedido[];
      
      // Filtrar solo los pedidos que estén pendientes para la cocina
      setPedidosCocina(listaPedidos.filter(p => p.estado !== 'listo'));
    });

    return () => unsubscribe();
  }, []);

  // Marcar pedido como listo en cocina
  const marcarListo = async (id: string) => {
    try {
      await updateDoc(doc(db, "pedidos", id), { estado: 'listo' });
    } catch (error) {
      console.error("Error al actualizar el estado del pedido:", error);
    }
  };

  const mesas = [
    { numero: 'Mesa 1', estado: 'Libre' },
    { numero: 'Mesa 2', estado: 'Ocupada' },
    { numero: 'Mesa 3', estado: 'Ocupada' },
    { numero: 'Mesa 4', estado: 'Libre' },
  ];

  // Si hay una mesa seleccionada, mostramos el componente de NuevoPedido
  if (mesaSeleccionada) {
    return (
      <div className="container" style={{ padding: '20px' }}>
        <button 
          onClick={() => setMesaSeleccionada(null)}
          style={{
            backgroundColor: '#d62828',
            color: 'white',
            border: 'none',
            padding: '8px 15px',
            borderRadius: '6px',
            cursor: 'pointer',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}
        >
          ← Volver a Mesas
        </button>
        <NuevoPedido mesa={mesaSeleccionada} onVolver={() => setMesaSeleccionada(null)} />
      </div>
    );
  }

  // Vista principal: Mesas + Panel de Cocina en tiempo real
  return (
    <div className="container">
      <header className="header">
        <h1>Pollería El Buen Sabor</h1>
        <p>Sistema de gestión de pedidos y cocina</p>
      </header>

      <h2 style={{ color: '#fff' }}>Mesas del establecimiento</h2>
      <div className="mesas-grid">
        {mesas.map((m, index) => (
          <div key={index} className="mesa-card">
            <div className="mesa-title">{m.numero}</div>
            <span className={`estado-badge ${m.estado === 'Libre' ? 'estado-libre' : 'estado-ocupada'}`}>
              {m.estado}
            </span>
            <button 
              className="btn-seleccionar"
              onClick={() => setMesaSeleccionada(m.numero)}
            >
              Seleccionar mesa
            </button>
          </div>
        ))}
      </div>

      <div className="cocina-section">
        <h2>🔥 Pedidos Enviados a Cocina</h2>
        {pedidosCocina.length === 0 ? (
          <p>No hay pedidos pendientes en cocina.</p>
        ) : (
          <div className="pedidos-grid">
            {pedidosCocina.map((pedido) => (
              <div key={pedido.id} className="ticket-cocina">
                <div className="ticket-header">
                  <span>{pedido.mesa}</span>
                  <span style={{ color: '#d62828' }}>PENDIENTE</span>
                </div>
                <ul className="ticket-items">
                  {pedido.items?.map((item, i) => (
                    <li key={i}>
                      <span><strong>{item.cantidad}x</strong> {item.nombre}</span>
                      {item.observacion && <small>({item.observacion})</small>}
                    </li>
                  ))}
                </ul>
                <button className="btn-atendido" onClick={() => marcarListo(pedido.id)}>
                  ✓ Marcar como Servido
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}