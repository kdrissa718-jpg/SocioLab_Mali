import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck } from "lucide-react";
import { useAppContext } from "../context/AppContext";

function NotificationBell({ audience = "Tous" }) {
  const { notifications } = useAppContext();
  const [isOpen, setIsOpen] = useState(false);
  const [readIds, setReadIds] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem(`sociolab_read_notifications_${audience}`)) || [];
    } catch {
      return [];
    }
  });
  const containerRef = useRef(null);
  const visibleNotifications = notifications.filter((item) => item.status !== "Inactive" && (item.audience === "Tous" || item.audience === audience || (audience === "Etudiants" && item.audience === "Étudiants") || (audience === "Enseignants" && item.audience === "Enseignants")));
  const unreadCount = visibleNotifications.filter((item) => !readIds.includes(item.id)).length;

  useEffect(() => {
    localStorage.setItem(`sociolab_read_notifications_${audience}`, JSON.stringify(readIds));
  }, [audience, readIds]);

  useEffect(() => {
    const handleOutsideClick = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  const markAllAsRead = () => setReadIds((current) => [...new Set([...current, ...visibleNotifications.map((item) => item.id)])]);

  return <div className="notification-bell" ref={containerRef}>
    <button className="admin-icon-button notification-bell-trigger" type="button" onClick={() => setIsOpen((current) => !current)} aria-label="Ouvrir les notifications" aria-expanded={isOpen}>
      <Bell size={19} aria-hidden="true" />
      {unreadCount > 0 && <span className="notification-count">{unreadCount > 9 ? "9+" : unreadCount}</span>}
    </button>
    {isOpen && <div className="notification-popover" role="dialog" aria-label="Notifications">
      <div className="notification-popover-header"><div><strong>Notifications</strong><small>{unreadCount ? `${unreadCount} non lue(s)` : "Toutes les notifications sont lues"}</small></div><button type="button" onClick={markAllAsRead} title="Tout marquer comme lu" aria-label="Tout marquer comme lu"><CheckCheck size={17} /></button></div>
      {visibleNotifications.length ? <div className="notification-list">{visibleNotifications.map((item) => <article className={!readIds.includes(item.id) ? "is-unread" : ""} key={item.id} onClick={() => setReadIds((current) => [...new Set([...current, item.id])])}><span className="notification-status-dot" /><div><strong>{item.title}</strong><p>{item.content}</p><small>{item.date}</small></div></article>)}</div> : <p className="notification-empty">Aucune notification.</p>}
    </div>}
  </div>;
}

export default NotificationBell;
