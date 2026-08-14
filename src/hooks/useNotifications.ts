import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../contexts/AuthContext';

export interface Notification {
  id: string;
  client_name: string;
  equipment_type: string;
  brand: string;
  next_maintenance_date: string;
  days_remaining: number;
}

export function useNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchNotifications() {
      if (!user) {
        setNotifications([]);
        setUnreadCount(0);
        setLoading(false);
        return;
      }

      try {
        // Obtenemos facturas con fecha de mantenimiento
        const { data, error } = await supabase
          .from('invoices')
          .select('id, client_name, equipment_type, brand, next_maintenance_date')
          .eq('technician_id', user.id)
          .not('next_maintenance_date', 'is', null);

        if (error) throw error;

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const alerts: Notification[] = [];

        data?.forEach((invoice) => {
          if (!invoice.next_maintenance_date) return;
          
          const maintenanceDate = new Date(invoice.next_maintenance_date);
          maintenanceDate.setHours(0, 0, 0, 0);
          
          // Calcular diferencia en milisegundos y luego en días
          const diffTime = maintenanceDate.getTime() - today.getTime();
          const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

          // Notificamos si faltan 5 días o menos (incluso si está vencido/negativo)
          if (diffDays <= 5) {
            alerts.push({
              id: invoice.id,
              client_name: invoice.client_name || 'Cliente sin nombre',
              equipment_type: invoice.equipment_type || 'Equipo no especificado',
              brand: invoice.brand || '',
              next_maintenance_date: invoice.next_maintenance_date,
              days_remaining: diffDays
            });
          }
        });

        // Ordenamos: los más vencidos (números negativos) primero, o los más cercanos.
        alerts.sort((a, b) => a.days_remaining - b.days_remaining);

        setNotifications(alerts);
        setUnreadCount(alerts.length);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchNotifications();
  }, [user]);

  return { notifications, unreadCount, loading };
}
