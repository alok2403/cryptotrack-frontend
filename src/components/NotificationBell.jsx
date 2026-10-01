import React, { useEffect, useState } from "react";

const API = "https://cryptotrack-backend-mgou.onrender.com/api/notifications";

export default function NotificationBell() {

    const [notifications, setNotifications] = useState([]);
    const [showDropdown, setShowDropdown] = useState(false);
    const [loading, setLoading] = useState(false);

    const getToken = () => localStorage.getItem("token");

    const authHeaders = (token) => ({
        "Authorization": `Bearer ${token}`,
        "Content-Type": "application/json"
    });


    // =====================================================
    // FETCH NOTIFICATIONS
    // =====================================================

    const fetchNotifications = async () => {

        const token = getToken();

        if (!token) {
            return;
        }

        try {

            setLoading(true);

            const response = await fetch(API, {
                method: "GET",
                headers: authHeaders(token)
            });

            if (!response.ok) {
                console.error(
                    "Failed to fetch notifications:",
                    response.status
                );
                return;
            }

            const data = await response.json();

            setNotifications(Array.isArray(data) ? data : []);

        } catch (error) {

            console.error("Notification fetch error:", error);

        } finally {

            setLoading(false);
        }
    };


    // =====================================================
    // LOAD + AUTO REFRESH
    // =====================================================

    useEffect(() => {

        fetchNotifications();

        const interval = setInterval(fetchNotifications, 10000);

        return () => clearInterval(interval);

    }, []);


    // =====================================================
    // UNREAD COUNT
    // =====================================================

    const unreadCount = notifications.filter(
        notification => notification.read === false
    ).length;


    // =====================================================
    // MARK ONE AS READ
    // =====================================================

    const markAsRead = async (id) => {

        const token = getToken();

        if (!token) {
            return;
        }

        try {

            const response = await fetch(`${API}/${id}/read`, {
                method: "PUT",
                headers: authHeaders(token)
            });

            if (!response.ok) {
                console.error("Failed to mark notification as read");
                return;
            }

            setNotifications(prev =>
                prev.map(notification =>
                    notification.id === id
                        ? { ...notification, read: true }
                        : notification
                )
            );

        } catch (error) {

            console.error("Mark notification read error:", error);
        }
    };


    // =====================================================
    // MARK ALL AS READ
    // =====================================================

    const markAllAsRead = async () => {

        const token = getToken();

        if (!token) {
            return;
        }

        try {

            const response = await fetch(`${API}/read-all`, {
                method: "PUT",
                headers: authHeaders(token)
            });

            if (!response.ok) {
                console.error("Failed to mark all notifications as read");
                return;
            }

            setNotifications(prev =>
                prev.map(notification => ({
                    ...notification,
                    read: true
                }))
            );

        } catch (error) {

            console.error("Mark all notifications read error:", error);
        }
    };


    // =====================================================
    // DELETE NOTIFICATION
    // =====================================================

    const deleteNotification = async (id) => {

        const token = getToken();

        if (!token) {
            return;
        }

        try {

            const response = await fetch(`${API}/${id}`, {
                method: "DELETE",
                headers: authHeaders(token)
            });

            if (!response.ok) {
                console.error("Failed to delete notification");
                return;
            }

            setNotifications(prev =>
                prev.filter(notification => notification.id !== id)
            );

        } catch (error) {

            console.error("Delete notification error:", error);
        }
    };


    // =====================================================
    // FORMAT DATE
    // =====================================================

    const formatDate = (date) => {

        if (!date) {
            return "";
        }

        try {

            return new Date(date).toLocaleString("en-IN", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit"
            });

        } catch (error) {

            return "";
        }
    };


    return (

        <div style={styles.container}>

            {/* BELL BUTTON */}

            <button
                type="button"
                onClick={() => setShowDropdown(previous => !previous)}
                style={styles.bellButton}
                aria-label="Notifications"
            >

                <span style={styles.bellIcon}>
                    🔔
                </span>

                {unreadCount > 0 && (
                    <span style={styles.badge}>
                        {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                )}

            </button>


            {/* DROPDOWN */}

            {showDropdown && (

                <div style={styles.dropdown}>

                    <div style={styles.header}>

                        <div>

                            <div style={styles.title}>
                                Notifications
                            </div>

                            <div style={styles.subtitle}>
                                {unreadCount > 0
                                    ? `${unreadCount} unread`
                                    : "You're all caught up"}
                            </div>

                        </div>

                        {unreadCount > 0 && (
                            <button
                                type="button"
                                style={styles.markAllButton}
                                onClick={markAllAsRead}
                            >
                                Mark all read
                            </button>
                        )}

                    </div>


                    <div style={styles.notificationList}>

                        {loading && notifications.length === 0 ? (

                            <div style={styles.emptyState}>
                                Loading notifications...
                            </div>

                        ) : notifications.length === 0 ? (

                            <div style={styles.emptyState}>

                                <div style={styles.emptyIcon}>
                                    🔔
                                </div>

                                <div style={styles.emptyTitle}>
                                    No notifications
                                </div>

                                <div style={styles.emptyText}>
                                    Your price alerts will appear here.
                                </div>

                            </div>

                        ) : (

                            notifications.map(notification => (

                                <div
                                    key={notification.id}
                                    style={{
                                        ...styles.notificationItem,
                                        ...(notification.read
                                            ? styles.readNotification
                                            : styles.unreadNotification)
                                    }}
                                    onClick={() => {
                                        if (!notification.read) {
                                            markAsRead(notification.id);
                                        }
                                    }}
                                >

                                    <div style={styles.notificationIcon}>
                                        🔔
                                    </div>

                                    <div style={styles.notificationContent}>

                                        <div style={styles.notificationMessage}>
                                            {notification.message}
                                        </div>

                                        <div style={styles.notificationTime}>
                                            {formatDate(notification.createdAt)}
                                        </div>

                                    </div>

                                    {!notification.read && (
                                        <div style={styles.unreadDot} />
                                    )}

                                    <button
                                        type="button"
                                        style={styles.deleteButton}
                                        aria-label="Delete notification"
                                        onClick={(event) => {
                                            event.stopPropagation();
                                            deleteNotification(notification.id);
                                        }}
                                    >
                                        ×
                                    </button>

                                </div>

                            ))

                        )}

                    </div>

                </div>

            )}

        </div>
    );
}


// =====================================================
// STYLES (light theme)
// =====================================================

const styles = {

    container: {
        position: "relative",
        display: "flex",
        alignItems: "center"
    },

    bellButton: {
        position: "relative",
        width: "40px",
        height: "40px",
        borderRadius: "10px",
        border: "1px solid #e2e8f0",
        background: "#ffffff",
        color: "#0f172a",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 1px 2px rgba(15, 23, 42, 0.05)"
    },

    bellIcon: {
        fontSize: "18px",
        lineHeight: 1
    },

    badge: {
        position: "absolute",
        top: "-5px",
        right: "-5px",
        minWidth: "18px",
        height: "18px",
        padding: "0 4px",
        borderRadius: "10px",
        background: "#ef4444",
        color: "#ffffff",
        fontSize: "10px",
        fontWeight: "700",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "2px solid #ffffff"
    },

    dropdown: {
        position: "absolute",
        top: "52px",
        right: "0",
        width: "390px",
        maxHeight: "520px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: "14px",
        boxShadow: "0 20px 45px rgba(15, 23, 42, 0.14)",
        overflow: "hidden",
        zIndex: 2000
    },

    header: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "16px 18px",
        borderBottom: "1px solid #e2e8f0",
        background: "#f8fafc"
    },

    title: {
        color: "#0f172a",
        fontSize: "15px",
        fontWeight: "700"
    },

    subtitle: {
        marginTop: "3px",
        color: "#64748b",
        fontSize: "11px"
    },

    markAllButton: {
        border: "none",
        background: "transparent",
        color: "#4f46e5",
        cursor: "pointer",
        fontSize: "11px",
        fontWeight: "600"
    },

    notificationList: {
        maxHeight: "440px",
        overflowY: "auto"
    },

    notificationItem: {
        position: "relative",
        display: "flex",
        alignItems: "flex-start",
        gap: "12px",
        padding: "15px 16px",
        borderBottom: "1px solid #f1f5f9",
        cursor: "pointer",
        transition: "background 0.2s ease"
    },

    unreadNotification: {
        background: "#eef2ff"
    },

    readNotification: {
        background: "#ffffff"
    },

    notificationIcon: {
        width: "32px",
        height: "32px",
        minWidth: "32px",
        borderRadius: "9px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(79, 70, 229, 0.1)",
        fontSize: "14px"
    },

    notificationContent: {
        flex: 1,
        minWidth: 0
    },

    notificationMessage: {
        color: "#1e293b",
        fontSize: "12px",
        lineHeight: "1.5",
        paddingRight: "18px"
    },

    notificationTime: {
        marginTop: "5px",
        color: "#64748b",
        fontSize: "10px"
    },

    unreadDot: {
        position: "absolute",
        top: "18px",
        right: "39px",
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#4f46e5"
    },

    deleteButton: {
        position: "absolute",
        top: "11px",
        right: "10px",
        border: "none",
        background: "transparent",
        color: "#94a3b8",
        cursor: "pointer",
        fontSize: "18px",
        lineHeight: 1,
        padding: "2px"
    },

    emptyState: {
        padding: "45px 20px",
        textAlign: "center",
        color: "#64748b"
    },

    emptyIcon: {
        fontSize: "30px",
        marginBottom: "10px",
        opacity: 0.7
    },

    emptyTitle: {
        color: "#334155",
        fontSize: "13px",
        fontWeight: "600",
        marginBottom: "5px"
    },

    emptyText: {
        color: "#64748b",
        fontSize: "11px"
    }
};