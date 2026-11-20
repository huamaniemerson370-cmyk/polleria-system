import { useState } from 'react';
import { db } from './firebaseConfig';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface Producto {
  id: string;
  nombre: string;
  precio: number;
  categoria: string;
  imagen: string;
}

interface ItemPedido extends Producto {
  cantidad: number;
  observacion?: string;
}

interface NuevoPedidoProps {
  mesa: string;
  onVolver: () => void;
}

export default function NuevoPedido({ mesa, onVolver }: NuevoPedidoProps) {
  // Imágenes distintas y directas para cada producto
  const [productosDisponibles] = useState<Producto[]>([
    {
      id: '1',
      nombre: '1/4 de Pollo a la Brasa',
      precio: 22.0,
      categoria: 'Pollos',
      imagen:
        'https://images.unsplash.com/photo-1598515214211-89d3c73ae83b?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '2',
      nombre: 'Mostrito',
      precio: 19.0,
      categoria: 'Promos',
      imagen:
        'https://images.unsplash.com/photo-1626082927389-6cd097cdc6ec?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '3',
      nombre: 'Salchipapa',
      precio: 13.0,
      categoria: 'Fast Food',
      imagen:
        'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=80',
    },
    {
      id: '4',
      nombre: 'Gaseosa 1 Litro',
      precio: 10.0,
      categoria: 'Bebidas',
      imagen:
        'https://images.unsplash.com/photo-1581006852262-e4307cf6283a?auto=format&fit=crop&w=500&q=80',
    },
  ]);

  const [itemsPedido, setItemsPedido] = useState<ItemPedido[]>([]);
  const [comensales, setComensales] = useState<string>('1');
  const [enviando, setEnviando] = useState<boolean>(false);

  const agregarAlPedido = (producto: Producto) => {
    const existe = itemsPedido.find((item) => item.id === producto.id);
    if (existe) {
      setItemsPedido(
        itemsPedido.map((item) =>
          item.id === producto.id ? { ...item, cantidad: item.cantidad + 1 } : item
        )
      );
    } else {
      setItemsPedido([
        ...itemsPedido,
        { ...producto, cantidad: 1, observacion: '' },
      ]);
    }
  };

  const cambiarCantidad = (id: string, delta: number) => {
    setItemsPedido(
      itemsPedido
        .map((item) => {
          if (item.id === id) {
            const nuevaCantidad = item.cantidad + delta;
            return nuevaCantidad > 0 ? { ...item, cantidad: nuevaCantidad } : item;
          }
          return item;
        })
        .filter((item) => item.cantidad > 0)
    );
  };

  const cambiarObservacion = (id: string, obs: string) => {
    setItemsPedido(
      itemsPedido.map((item) =>
        item.id === id ? { ...item, observacion: obs } : item
      )
    );
  };

  const calcularTotal = () => {
    return itemsPedido
      .reduce((acc, item) => acc + item.precio * item.cantidad, 0)
      .toFixed(2);
  };

  const enviarPedidoACocina = async () => {
    if (enviando) return;

    try {
      if (itemsPedido.length === 0) {
        alert('Agrega al menos un producto al pedido.');
        return;
      }

      setEnviando(true);

      const cantidadComensales = Math.max(1, parseInt(comensales || '1', 10) || 1);

      await addDoc(collection(db, 'pedidos'), {
        mesa: mesa || 'Mesa general',
        comensales: String(cantidadComensales),
        items: itemsPedido.map((item) => ({
          id: item.id,
          nombre: item.nombre || 'Sin nombre',
          precio: item.precio || 0,
          cantidad: item.cantidad || 1,
          observacion: item.observacion || '',
        })),
        total: parseFloat(calcularTotal()),
        estado: 'pendiente',
        fecha: serverTimestamp(),
      });

      alert('¡Pedido enviado a cocina con éxito!');
      onVolver();
    } catch (error) {
      console.error('Error detallado al enviar pedido:', error);
      alert('Hubo un error al enviar el pedido.');
    } finally {
      setEnviando(false);
    }
  };

  return (
    <div
      style={{
        width: '100%',
        maxWidth: '1280px',
        margin: '0 auto',
        boxSizing: 'border-box',
        background: 'rgba(24, 16, 12, 0.94)',
        color: '#fff8ee',
        padding: '20px',
        borderRadius: '16px',
        boxShadow: '0 10px 28px rgba(0, 0, 0, 0.45)',
        border: '1px solid rgba(251, 133, 0, 0.35)',
      }}
    >
      {/* Encabezado */}
      <div
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '12px',
          marginBottom: '18px',
          paddingBottom: '12px',
          borderBottom: '1px solid rgba(255, 183, 3, 0.25)',
        }}
      >
        <div>
          <span
            style={{
              display: 'inline-block',
              background: 'rgba(251, 133, 0, 0.2)',
              color: '#ffb703',
              padding: '4px 10px',
              borderRadius: '999px',
              fontSize: '0.8rem',
              fontWeight: 'bold',
              marginBottom: '6px',
            }}
          >
            🍗 Pollería • Nuevo Pedido
          </span>
          <h2 style={{ margin: 0, color: '#ffb703', fontSize: '1.5rem' }}>
            Pedido para: {mesa || 'Mesa general'}
          </h2>
        </div>

        <button
          type="button"
          onClick={onVolver}
          style={{
            padding: '8px 14px',
            background: '#3a281e',
            color: '#fff8ee',
            border: '1px solid #6b4c3b',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: 'bold',
          }}
        >
          ← Volver a mesas
        </button>
      </div>

      {/* Comensales */}
      <div
        style={{
          marginBottom: '20px',
          background: 'rgba(255, 255, 255, 0.05)',
          padding: '10px 14px',
          borderRadius: '10px',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '10px',
        }}
      >
        <label htmlFor="input-comensales" style={{ fontWeight: 'bold' }}>
          Cantidad de Comensales:
        </label>
        <input
          id="input-comensales"
          type="number"
          min={1}
          value={comensales}
          onChange={(e) => setComensales(e.target.value)}
          style={{
            padding: '6px 10px',
            width: '68px',
            borderRadius: '6px',
            border: '1px solid #fb8500',
            background: '#140d0a',
            color: '#fff',
            fontWeight: 'bold',
          }}
        />
      </div>

      {/* Layout flexible: Menú y Detalle no se cortan */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
          gap: '20px',
          alignItems: 'start',
        }}
      >
        {/* Menú */}
        <div style={{ minWidth: 0 }}>
          <h3 style={{ marginTop: 0, color: '#ffb703' }}>Menú Disponible</h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(175px, 1fr))',
              gap: '14px',
            }}
          >
            {productosDisponibles.map((prod) => (
              <div
                key={prod.id}
                style={{
                  background: '#2b1d16',
                  border: '1px solid rgba(251, 133, 0, 0.3)',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'space-between',
                  minWidth: 0,
                }}
              >
                <div>
                  <img
                    src={prod.imagen}
                    alt={prod.nombre}
                    style={{
                      width: '100%',
                      height: '125px',
                      objectFit: 'cover',
                      display: 'block',
                    }}
                  />
                  <div style={{ padding: '12px' }}>
                    <span
                      style={{
                        fontSize: '0.72rem',
                        color: '#ffb703',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px',
                      }}
                    >
                      {prod.categoria}
                    </span>
                    <div
                      style={{
                        fontWeight: 'bold',
                        fontSize: '0.98rem',
                        marginTop: '4px',
                      }}
                    >
                      {prod.nombre}
                    </div>
                    <div
                      style={{
                        color: '#fb8500',
                        fontWeight: 'bold',
                        marginTop: '6px',
                        fontSize: '1rem',
                      }}
                    >
                      S/ {prod.precio.toFixed(2)}
                    </div>
                  </div>
                </div>

                <div style={{ padding: '0 12px 12px' }}>
                  <button
                    type="button"
                    onClick={() => agregarAlPedido(prod)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      background: 'linear-gradient(135deg, #fb8500, #d65a00)',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: 'bold',
                    }}
                  >
                    + Agregar
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Detalle del Pedido */}
        <div
          style={{
            background: '#241812',
            border: '1px solid rgba(255, 183, 3, 0.25)',
            borderRadius: '12px',
            padding: '18px',
            minWidth: 0,
            boxSizing: 'border-box',
          }}
        >
          <h3 style={{ marginTop: 0, color: '#ffb703' }}>Detalle del Pedido</h3>

          {itemsPedido.length === 0 ? (
            <p style={{ color: '#cbb8a8', margin: 0 }}>
              No hay productos seleccionados aún.
            </p>
          ) : (
            <div>
              {itemsPedido.map((item) => (
                <div
                  key={item.id}
                  style={{
                    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
                    paddingBottom: '12px',
                    marginBottom: '12px',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <strong>{item.nombre}</strong>
                    <span style={{ color: '#ffb703', fontWeight: 'bold' }}>
                      S/ {(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '10px',
                      marginTop: '8px',
                    }}
                  >
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, -1)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        border: '1px solid #6b4c3b',
                        background: '#3a281e',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      -
                    </button>
                    <span style={{ fontWeight: 'bold' }}>{item.cantidad}</span>
                    <button
                      type="button"
                      onClick={() => cambiarCantidad(item.id, 1)}
                      style={{
                        padding: '3px 10px',
                        borderRadius: '6px',
                        border: '1px solid #6b4c3b',
                        background: '#3a281e',
                        color: '#fff',
                        cursor: 'pointer',
                        fontWeight: 'bold',
                      }}
                    >
                      +
                    </button>
                  </div>

                  <input
                    type="text"
                    placeholder="Observación (ej: sin ensalada)"
                    value={item.observacion || ''}
                    onChange={(e) => cambiarObservacion(item.id, e.target.value)}
                    style={{
                      marginTop: '8px',
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '6px',
                      border: '1px solid #5c4033',
                      background: '#140d0a',
                      color: '#fff',
                      boxSizing: 'border-box',
                    }}
                  />
                </div>
              ))}

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginTop: '12px',
                  fontSize: '1.15rem',
                }}
              >
                <strong>Total:</strong>
                <strong style={{ color: '#ffb703' }}>S/ {calcularTotal()}</strong>
              </div>

              <button
                type="button"
                disabled={enviando}
                onClick={enviarPedidoACocina}
                style={{
                  width: '100%',
                  padding: '12px',
                  background: enviando ? '#5c6f6d' : '#2a9d8f',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  cursor: enviando ? 'not-allowed' : 'pointer',
                  marginTop: '14px',
                  fontSize: '1rem',
                }}
              >
                {enviando ? 'Enviando...' : 'Enviar a cocina 🚀'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}