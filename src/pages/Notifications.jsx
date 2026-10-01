
import { useCallback, useEffect, useState } from "react";

const API_BASE = "https://cryptotrack-backend-mgou.onrender.com/api/notifications";

export default function Notifications() {
    const [notifications, setNotifications] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // =====================================================
    // LOAD NOTIFICATIONS
    // =====================================================

    const loadNotifications = useCallback(async () => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Not authenticated. Please log in again.");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const response = await fetch(API_BASE, {
                method: "GET",
                headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                },
            });

            if (response.status === 401) {
                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setNotifications([]);
                setError("Session expired. Please log in again.");
                return;
            }

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data.message || "Failed to load notifications"
                );
            }

            setNotifications(
                Array.isArray(data) ? data : []
            );

        } catch (err) {
            console.error("Notification loading error:", err);

            setError(
                err.message || "Failed to load notifications"
            );
        } finally {
            setLoading(false);
        }
    }, []);


    // =====================================================
    // INITIAL LOAD + AUTO REFRESH
    // =====================================================

    useEffect(() => {
        loadNotifications();

        /*
         * PriceAlertService checks prices every 60 seconds.
         *
         * Refresh notifications every 60 seconds too,
         * so triggered alerts appear automatically.
         */
        const interval = setInterval(() => {
            loadNotifications();
        }, 60000);

        return () => clearInterval(interval);
    }, [loadNotifications]);


    // =====================================================
    // MARK AS READ
    // =====================================================

    const markAsRead = async (id) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Not authenticated. Please log in again.");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/${id}/read`,
                {
                    method: "PUT",
                    headers: {
                        Authorization: `Bearer ${token}`,
                        "Content-Type": "application/json",
                    },
                }
            );

            if (response.status === 401) {
                setError("Session expired. Please log in again.");
                return;
            }

            if (!response.ok) {
                const data =
                    await response.json().catch(() => ({}));

                throw new Error(
                    data.message ||
                    "Failed to mark notification as read"
                );
            }

            // Update UI immediately
            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id === id
                        ? {
                              ...notification,
                              read: true,
                              isRead: true,
                          }
                        : notification
                )
            );

        } catch (err) {
            console.error(
                "Mark notification error:",
                err
            );

            setError(
                err.message ||
                "Failed to mark notification as read"
            );
        }
    };


    // =====================================================
    // DELETE NOTIFICATION
    // =====================================================

    const deleteNotification = async (id) => {
        const token = localStorage.getItem("token");

        if (!token) {
            setError("Not authenticated. Please log in again.");
            return;
        }

        try {
            const response = await fetch(
                `${API_BASE}/${id}`,
                {
                    method: "DELETE",
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                }
            );

            if (response.status === 401) {
                setError("Session expired. Please log in again.");
                return;
            }

            if (!response.ok) {
                const data =
                    await response.json().catch(() => ({}));

                throw new Error(
                    data.message ||
                    "Failed to delete notification"
                );
            }

            setNotifications((previous) =>
                previous.filter(
                    (notification) =>
                        notification.id !== id
                )
            );

        } catch (err) {
            console.error(
                "Delete notification error:",
                err
            );

            setError(
                err.message ||
                "Failed to delete notification"
            );
        }
    };


    // =====================================================
    // DATE FORMAT
    // =====================================================

    const formatDate = (dateValue) => {
        if (!dateValue) {
            return "";
        }

        try {
            return new Date(dateValue).toLocaleString(
                "en-IN",
                {
                    dateStyle: "medium",
                    timeStyle: "short",
                }
            );
        } catch {
            return dateValue;
        }
    };


    // =====================================================
    // UNREAD COUNT
    // =====================================================

    const unreadCount = notifications.filter(
        (notification) =>
            !(notification.read ?? notification.isRead ?? false)
    ).length;


    // =====================================================
    // RENDER
    // =====================================================

    return (
        <section style={styles.container}>

            {/* HEADER */}

            <div style={styles.header}>

                <div>
                    <div style={styles.titleRow}>
                        <h2 style={styles.title}>
                            🔔 Notifications
                        </h2>

                        {unreadCount > 0 && (
                            <span style={styles.countBadge}>
                                {unreadCount} new
                            </span>
                        )}
                    </div>

                    <p style={styles.subtitle}>
                        Price alerts and account notifications.
                    </p>
                </div>

                <button
                    onClick={loadNotifications}
                    disabled={loading}
                    style={styles.refreshButton}
                >
                    {loading ? "Refreshing..." : "↻ Refresh"}
                </button>

            </div>


            {/* ERROR */}

            {error && (
                <div style={styles.error}>
                    <span>⚠</span>
                    <span>{error}</span>
                </div>
            )}


            {/* LOADING */}

            {loading && notifications.length === 0 && (
                <div style={styles.loading}>
                    <div style={styles.spinner} />
                    <span>Loading notifications...</span>
                </div>
            )}


            {/* EMPTY */}

            {!loading &&
                notifications.length === 0 &&
                !error && (
                    <div style={styles.empty}>

                        <div style={styles.emptyIcon}>
                            🔕
                        </div>

                        <h3 style={styles.emptyTitle}>
                            No notifications
                        </h3>

                        <p style={styles.emptyText}>
                            When a price alert is triggered,
                            it will appear here.
                        </p>

                    </div>
                )}


            {/* NOTIFICATION LIST */}

            {notifications.length > 0 && (
                <div style={styles.list}>

                    {notifications.map((notification) => {

                        const isRead =
                            notification.read ??
                            notification.isRead ??
                            false;

                        return (
                            <div
                                key={notification.id}
                                style={{
                                    ...styles.notification,

                                    ...(isRead
                                        ? styles.readNotification
                                        : styles.unreadNotification),
                                }}
                            >

                                {/* LEFT ICON */}

                                <div
                                    style={{
                                        ...styles.icon,

                                        ...(isRead
                                            ? styles.readIcon
                                            : styles.unreadIcon),
                                    }}
                                >
                                    🔔
                                </div>


                                {/* CONTENT */}

                                <div style={styles.content}>

                                    <div style={styles.notificationHeader}>

                                        <div style={styles.typeRow}>
                                            <strong style={styles.type}>
                                                Price Alert
                                            </strong>

                                            {!isRead && (
                                                <span style={styles.newBadge}>
                                                    NEW
                                                </span>
                                            )}
                                        </div>

                                        {!isRead && (
                                            <span style={styles.unreadDot} />
                                        )}

                                    </div>


                                    <p style={styles.message}>
                                        {notification.message}
                                    </p>


                                    <p style={styles.date}>
                                        {formatDate(
                                            notification.createdAt
                                        )}
                                    </p>

                                </div>


                                {/* ACTIONS */}

                                <div style={styles.actions}>

                                    {!isRead && (
                                        <button
                                            onClick={() =>
                                                markAsRead(
                                                    notification.id
                                                )
                                            }
                                            style={styles.readButton}
                                        >
                                            ✓ Mark read
                                        </button>
                                    )}

                                    <button
                                        onClick={() =>
                                            deleteNotification(
                                                notification.id
                                            )
                                        }
                                        style={styles.deleteButton}
                                    >
                                        Delete
                                    </button>

                                </div>

                            </div>
                        );
                    })}

                </div>
            )}

        </section>
    );
}


// =========================================================
// STYLES
// =========================================================

const styles = {

    container: {
        marginTop: "25px",
        padding: "25px",
        background:
            "linear-gradient(145deg, rgba(19,27,45,0.96), rgba(12,17,29,0.96))",
        border:
            "1px solid rgba(255,255,255,0.08)",
        borderRadius: "20px",
        color: "#ffffff",
        boxShadow:
            "0 18px 60px rgba(0,0,0,0.18)",
    },


    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        flexWrap: "wrap",
    },


    titleRow: {
        display: "flex",
        alignItems: "center",
        gap: "10px",
    },


    title: {
        margin: 0,
        fontSize: "21px",
        letterSpacing: "-0.3px",
    },


    countBadge: {
        padding: "4px 8px",
        borderRadius: "20px",
        background:
            "rgba(101,87,232,0.18)",
        color: "#9b91ff",
        fontSize: "10px",
        fontWeight: "700",
    },


    subtitle: {
        margin: "6px 0 0",
        color: "#7e899d",
        fontSize: "12px",
    },


    refreshButton: {
        border:
            "1px solid rgba(255,255,255,0.10)",
        borderRadius: "9px",
        background:
            "rgba(255,255,255,0.04)",
        color: "#c5ccda",
        padding: "9px 14px",
        cursor: "pointer",
        fontSize: "12px",
    },


    error: {
        marginTop: "18px",
        padding: "12px 15px",
        display: "flex",
        gap: "9px",
        alignItems: "center",
        borderRadius: "10px",
        background:
            "rgba(255,101,119,0.08)",
        border:
            "1px solid rgba(255,101,119,0.20)",
        color: "#ff8c99",
        fontSize: "12px",
    },


    loading: {
        minHeight: "150px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        color: "#7e899d",
        fontSize: "12px",
    },


    spinner: {
        width: "15px",
        height: "15px",
        border:
            "2px solid rgba(255,255,255,0.15)",
        borderTop:
            "2px solid #6557e8",
        borderRadius: "50%",
    },


    empty: {
        textAlign: "center",
        padding: "45px 20px",
    },


    emptyIcon: {
        width: "55px",
        height: "55px",
        margin: "0 auto 14px",
        borderRadius: "16px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(255,255,255,0.04)",
        fontSize: "24px",
    },


    emptyTitle: {
        margin: "0 0 7px",
        fontSize: "16px",
    },


    emptyText: {
        margin: 0,
        color: "#68748a",
        fontSize: "12px",
    },


    list: {
        marginTop: "22px",
        display: "flex",
        flexDirection: "column",
        gap: "10px",
    },


    notification: {
        display: "flex",
        alignItems: "center",
        gap: "14px",
        padding: "15px",
        borderRadius: "13px",
        transition: "all 0.2s ease",
    },


    unreadNotification: {
        background:
            "rgba(101,87,232,0.08)",
        border:
            "1px solid rgba(101,87,232,0.20)",
    },


    readNotification: {
        background:
            "rgba(255,255,255,0.025)",
        border:
            "1px solid rgba(255,255,255,0.06)",
        opacity: 0.75,
    },


    icon: {
        width: "40px",
        height: "40px",
        flexShrink: 0,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        borderRadius: "11px",
        fontSize: "17px",
    },


    unreadIcon: {
        background:
            "rgba(101,87,232,0.18)",
    },


    readIcon: {
        background:
            "rgba(255,255,255,0.05)",
    },


    content: {
        flex: 1,
        minWidth: 0,
    },


    notificationHeader: {
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "10px",
    },


    typeRow: {
        display: "flex",
        alignItems: "center",
        gap: "8px",
    },


    type: {
        fontSize: "12px",
        color: "#d8dcea",
    },


    newBadge: {
        padding: "3px 6px",
        borderRadius: "6px",
        background: "#6557e8",
        color: "#ffffff",
        fontSize: "8px",
        fontWeight: "800",
        letterSpacing: "0.5px",
    },


    unreadDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        background: "#6557e8",
        flexShrink: 0,
    },


    message: {
        margin: "7px 0 5px",
        color: "#c1c7d5",
        fontSize: "13px",
        lineHeight: "1.5",
    },


    date: {
        margin: 0,
        color: "#68748a",
        fontSize: "10px",
    },


    actions: {
        display: "flex",
        alignItems: "center",
        gap: "7px",
        flexShrink: 0,
    },


    readButton: {
        padding: "7px 10px",
        border:
            "1px solid rgba(101,87,232,0.35)",
        borderRadius: "7px",
        background:
            "rgba(101,87,232,0.10)",
        color: "#9b91ff",
        cursor: "pointer",
        fontSize: "10px",
    },


    deleteButton: {
        padding: "7px 10px",
        border:
            "1px solid rgba(255,255,255,0.08)",
        borderRadius: "7px",
        background:
            "rgba(255,255,255,0.03)",
        color: "#7e899d",
        cursor: "pointer",
        fontSize: "10px",
    },
};
