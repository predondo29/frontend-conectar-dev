import { useState, useEffect, useContext } from 'react';
import { Outlet, useSearchParams } from 'react-router';
import { Menu } from 'lucide-react';
import Sidebar from '../components/Dashboard/Sidebar';
import { useNotification } from '../context/NotificationContext';
import { AuthContext } from '../context/AuthContext';
import axios from 'axios';

const DashboardLayout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [searchParams, setSearchParams] = useSearchParams();
  const { showSuccess, showErrorModal } = useNotification();
  const { token, setUser, BASE_URL } = useContext(AuthContext);

  useEffect(() => {
    const checkPaymentStatus = async () => {
      const status = searchParams.get('status');

      if (!status) return;

      if (status === 'approved') {
        try {
          // Intentamos actualizar el estado del usuario en el backend
          const config = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            }
          };

          const { data } = await axios.put(`${BASE_URL}/api/users/hacerse-premium`, { plan: 'premium' }, config);

          if (data) {
            setUser(data);
            showSuccess('¡Pago exitoso! Ahora eres usuario Premium.');
          }
        } catch (error) {
          console.error('Error actualizando a premium:', error);
          showErrorModal('El pago fue aprobado, pero hubo un error actualizando tu perfil. Por favor contáctanos.');
        }
      } else if (status === 'failure') {
        showErrorModal('El pago ha fallado o fue rechazado. Intenta nuevamente.');
      }

      // Limpiamos los parámetros de la URL en ambos casos
      setSearchParams(params => {
        const newParams = new URLSearchParams(params);
        newParams.delete('status');
        newParams.delete('payment_id');
        newParams.delete('merchant_order_id');
        newParams.delete('external_reference');
        newParams.delete('preference_id');
        newParams.delete('collection_id');
        newParams.delete('collection_status');
        newParams.delete('payment_type');
        newParams.delete('site_id');
        newParams.delete('processing_mode');
        newParams.delete('merchant_account_id');
        return newParams;
      });
    };

    checkPaymentStatus();
  }, [searchParams, showSuccess, showErrorModal, setSearchParams, token, BASE_URL, setUser]);

  return (
    <div className="flex min-h-screen bg-slate-100 font-sans">

      {/* Pasamos el estado y la función de cerrar al Sidebar */}
      <Sidebar
        isOpen={isMobileSidebarOpen}
        onClose={() => setIsMobileSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col md:ml-64 transition-all duration-300">

        {/* HEADER MÓVIL: Solo visible en pantallas pequeñas (md:hidden) */}
        <header className="bg-white border-b border-slate-200 p-4 flex items-center justify-between md:hidden sticky top-0 z-30">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileSidebarOpen(true)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu size={24} />
            </button>
            <span className="font-bold text-lg text-slate-800">Dashboard</span>
          </div>
          {/* Aquí podrías poner el avatar pequeño si quisieras */}
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center text-xs font-bold">
            JD
          </div>
        </header>

        {/* CONTENIDO PRINCIPAL */}
        <main className="p-4 md:p-8 overflow-y-auto flex-1">
          <div className="max-w-5xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default DashboardLayout;