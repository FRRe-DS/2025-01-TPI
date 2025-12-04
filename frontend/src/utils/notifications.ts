/**
 * Utilidades para mostrar notificaciones al usuario
 */

export type NotificationType = 'success' | 'error' | 'info' | 'warning';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  duration?: number; // en milisegundos, 0 = no se cierra automáticamente
}

class NotificationManager {
  private notifications: Notification[] = [];
  private listeners: Array<(notifications: Notification[]) => void> = [];

  subscribe(listener: (notifications: Notification[]) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach(listener => listener([...this.notifications]));
  }

  add(notification: Omit<Notification, 'id'>) {
    const id = `notification-${Date.now()}-${Math.random()}`;
    const newNotification: Notification = {
      ...notification,
      id,
      duration: notification.duration ?? 5000
    };

    this.notifications.push(newNotification);
    this.notify();

    // Auto-remover después de la duración especificada
    if (newNotification.duration > 0) {
      setTimeout(() => {
        this.remove(id);
      }, newNotification.duration);
    }

    return id;
  }

  remove(id: string) {
    this.notifications = this.notifications.filter(n => n.id !== id);
    this.notify();
  }

  clear() {
    this.notifications = [];
    this.notify();
  }

  // Métodos de conveniencia
  success(title: string, message: string, duration?: number) {
    return this.add({ type: 'success', title, message, duration });
  }

  error(title: string, message: string, duration?: number) {
    return this.add({ type: 'error', title, message, duration });
  }

  info(title: string, message: string, duration?: number) {
    return this.add({ type: 'info', title, message, duration });
  }

  warning(title: string, message: string, duration?: number) {
    return this.add({ type: 'warning', title, message, duration });
  }
}

export const notificationManager = new NotificationManager();

