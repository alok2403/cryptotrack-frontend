import React, { useEffect, useState } from "react";
import Navbar from "../components/Navbar";


const API =
    "https://cryptotrack-backend-mgou.onrender.com/api/alerts";


const emptyForm = {
    cryptoId: "",
    cryptoName: "",
    symbol: "",
    targetPrice: "",
    condition: "ABOVE"
};


export default function Alerts() {

    const [alerts, setAlerts] =
        useState([]);

    const [loading, setLoading] =
        useState(true);

    const [error, setError] =
        useState("");

    const [showCreateForm, setShowCreateForm] =
        useState(false);

    const [creating, setCreating] =
        useState(false);

    const [form, setForm] =
        useState(emptyForm);


    // =========================================================
    // LOAD ALERTS
    // =========================================================

    const loadAlerts = async () => {

        try {

            setLoading(true);
            setError("");


            const token =
                localStorage.getItem("token");


            if (!token) {

                setError(
                    "Please login again."
                );

                return;
            }


            const response =
                await fetch(API, {

                    method: "GET",

                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    }
                });


            // -------------------------------------------------
            // UNAUTHORIZED
            // -------------------------------------------------

            if (response.status === 401) {

                setError(
                    "Session expired. Please login again."
                );

                return;
            }


            // -------------------------------------------------
            // ERROR
            // -------------------------------------------------

            if (!response.ok) {

                const text =
                    await response.text();

                console.error(
                    "Load alerts:",
                    text
                );

                throw new Error(
                    "Unable to load alerts"
                );
            }


            // -------------------------------------------------
            // DATA
            // -------------------------------------------------

            const data =
                await response.json();


            setAlerts(
                Array.isArray(data)
                    ? data
                    : []
            );


        } catch (err) {

            console.error(
                "Load alerts error:",
                err
            );


            setError(
                "Unable to load alerts."
            );


        } finally {

            setLoading(false);
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        loadAlerts();

    }, []);


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleChange = (e) => {

        const {
            name,
            value
        } = e.target;


        setForm((previous) => ({

            ...previous,

            [name]: value

        }));
    };


    // =========================================================
    // CREATE ALERT
    // =========================================================

    const handleCreateAlert = async (e) => {

        e.preventDefault();


        const token =
            localStorage.getItem("token");


        if (!token) {

            window.alert(
                "Please login again."
            );

            return;
        }


        // -----------------------------------------------------
        // VALIDATE CRYPTO ID
        // -----------------------------------------------------

        if (!form.cryptoId.trim()) {

            window.alert(
                "Crypto ID is required."
            );

            return;
        }


        // -----------------------------------------------------
        // VALIDATE TARGET PRICE
        // -----------------------------------------------------

        if (
            !form.targetPrice ||
            Number(form.targetPrice) <= 0
        ) {

            window.alert(
                "Enter a valid target price."
            );

            return;
        }


        try {

            setCreating(true);


            // -------------------------------------------------
            // REQUEST
            // -------------------------------------------------

            const response =
                await fetch(API, {

                    method: "POST",

                    headers: {

                        Authorization:
                            `Bearer ${token}`,

                        "Content-Type":
                            "application/json"
                    },

                    body: JSON.stringify({

                        cryptoId:
                            form.cryptoId
                                .trim()
                                .toLowerCase(),

                        cryptoName:
                            form.cryptoName
                                .trim(),

                        symbol:
                            form.symbol
                                .trim()
                                .toUpperCase(),

                        targetPrice:
                            Number(
                                form.targetPrice
                            ),

                        condition:
                            form.condition
                    })
                });


            // -------------------------------------------------
            // UNAUTHORIZED
            // -------------------------------------------------

            if (response.status === 401) {

                window.alert(
                    "Session expired. Please login again."
                );

                return;
            }


            // -------------------------------------------------
            // ERROR
            // -------------------------------------------------

            if (!response.ok) {

                const text =
                    await response.text();

                console.error(
                    "Create alert error:",
                    text
                );


                throw new Error(
                    text ||
                    "Unable to create alert"
                );
            }


            // -------------------------------------------------
            // NEW ALERT
            // -------------------------------------------------

            const newAlert =
                await response.json();


            setAlerts((previous) => [

                ...previous,

                newAlert

            ]);


            // -------------------------------------------------
            // RESET FORM
            // -------------------------------------------------

            setForm({
                ...emptyForm
            });


            setShowCreateForm(false);


        } catch (err) {

            console.error(
                "Create alert error:",
                err
            );


            window.alert(
                err.message ||
                "Unable to create alert."
            );


        } finally {

            setCreating(false);
        }
    };


    // =========================================================
    // DELETE ALERT
    // =========================================================

    const handleDelete = async (id) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to delete this alert?"
            );


        if (!confirmed) {
            return;
        }


        const token =
            localStorage.getItem("token");


        if (!token) {

            window.alert(
                "Please login again."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/${id}`,
                    {

                        method: "DELETE",

                        headers: {

                            Authorization:
                                `Bearer ${token}`
                        }
                    }
                );


            // -------------------------------------------------
            // UNAUTHORIZED
            // -------------------------------------------------

            if (response.status === 401) {

                window.alert(
                    "Session expired. Please login again."
                );

                return;
            }


            // -------------------------------------------------
            // ERROR
            // -------------------------------------------------

            if (!response.ok) {

                const text =
                    await response.text();

                throw new Error(
                    text ||
                    "Unable to delete alert"
                );
            }


            // -------------------------------------------------
            // REMOVE FROM UI
            // -------------------------------------------------

            setAlerts((previous) =>

                previous.filter(
                    (item) =>
                        item.id !== id
                )

            );


        } catch (err) {

            console.error(
                "Delete alert error:",
                err
            );


            window.alert(
                err.message ||
                "Unable to delete alert."
            );
        }
    };


    // =========================================================
    // TOGGLE ALERT
    // =========================================================

    const handleToggle = async (id) => {

        const token =
            localStorage.getItem("token");


        if (!token) {

            window.alert(
                "Please login again."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/${id}/toggle`,
                    {

                        method: "PUT",

                        headers: {

                            Authorization:
                                `Bearer ${token}`,

                            "Content-Type":
                                "application/json"
                        }
                    }
                );


            // -------------------------------------------------
            // UNAUTHORIZED
            // -------------------------------------------------

            if (response.status === 401) {

                window.alert(
                    "Session expired. Please login again."
                );

                return;
            }


            // -------------------------------------------------
            // ERROR
            // -------------------------------------------------

            if (!response.ok) {

                const text =
                    await response.text();

                throw new Error(
                    text ||
                    "Unable to update alert"
                );
            }


            // -------------------------------------------------
            // UPDATED ALERT
            // -------------------------------------------------

            const updatedAlert =
                await response.json();


            setAlerts((previous) =>

                previous.map((item) =>

                    item.id === id
                        ? updatedAlert
                        : item

                )

            );


        } catch (err) {

            console.error(
                "Toggle alert error:",
                err
            );


            window.alert(
                err.message ||
                "Unable to update alert."
            );
        }
    };


    // =========================================================
    // LOADING
    // =========================================================

    if (loading) {

        return (

            <div style={styles.page}>

                <Navbar />

                <main style={styles.container}>

                    <div
                        style={
                            styles.centerMessage
                        }
                    >
                        Loading alerts...
                    </div>

                </main>

            </div>
        );
    }


    // =========================================================
    // PAGE
    // =========================================================

    return (

        <div style={styles.page}>

            <Navbar />


            <main style={styles.container}>


                {/* =================================================
                    HEADER
                ================================================= */}

                <div style={styles.header}>

                    <div>

                        <h1 style={styles.title}>
                            Price Alerts
                        </h1>


                        <p style={styles.subtitle}>
                            Get notified when a cryptocurrency
                            reaches your target price.
                        </p>

                    </div>


                    <button
                        type="button"
                        style={styles.createButton}
                        onClick={() =>
                            setShowCreateForm(
                                (previous) =>
                                    !previous
                            )
                        }
                    >

                        {showCreateForm
                            ? "Close"
                            : "+ Create Alert"}

                    </button>

                </div>


                {/* =================================================
                    ERROR
                ================================================= */}

                {error && (

                    <div
                        style={
                            styles.errorBox
                        }
                    >

                        <span>
                            {error}
                        </span>


                        <button
                            type="button"
                            style={
                                styles.retryButton
                            }
                            onClick={loadAlerts}
                        >
                            Try Again
                        </button>

                    </div>
                )}


                {/* =================================================
                    CREATE FORM
                ================================================= */}

                {showCreateForm && (

                    <form
                        onSubmit={
                            handleCreateAlert
                        }
                        style={
                            styles.formCard
                        }
                    >

                        <h2
                            style={
                                styles.formTitle
                            }
                        >
                            Create Price Alert
                        </h2>


                        <div
                            style={
                                styles.formGrid
                            }
                        >


                            {/* CRYPTO ID */}

                            <div
                                style={
                                    styles.field
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Crypto ID
                                </label>


                                <input
                                    name="cryptoId"
                                    value={
                                        form.cryptoId
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="bitcoin"
                                    style={
                                        styles.input
                                    }
                                />

                            </div>


                            {/* CRYPTO NAME */}

                            <div
                                style={
                                    styles.field
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Crypto Name
                                </label>


                                <input
                                    name="cryptoName"
                                    value={
                                        form.cryptoName
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="Bitcoin"
                                    style={
                                        styles.input
                                    }
                                />

                            </div>


                            {/* SYMBOL */}

                            <div
                                style={
                                    styles.field
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Symbol
                                </label>


                                <input
                                    name="symbol"
                                    value={
                                        form.symbol
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="BTC"
                                    style={
                                        styles.input
                                    }
                                />

                            </div>


                            {/* TARGET PRICE */}

                            <div
                                style={
                                    styles.field
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Target Price
                                </label>


                                <input
                                    name="targetPrice"
                                    type="number"
                                    step="any"
                                    value={
                                        form.targetPrice
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    placeholder="100000"
                                    style={
                                        styles.input
                                    }
                                />

                            </div>


                            {/* CONDITION */}

                            <div
                                style={
                                    styles.field
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Condition
                                </label>


                                <select
                                    name="condition"
                                    value={
                                        form.condition
                                    }
                                    onChange={
                                        handleChange
                                    }
                                    style={
                                        styles.input
                                    }
                                >

                                    <option value="ABOVE">
                                        Price goes above
                                    </option>


                                    <option value="BELOW">
                                        Price goes below
                                    </option>

                                </select>

                            </div>

                        </div>


                        {/* FORM ACTIONS */}

                        <div
                            style={
                                styles.formActions
                            }
                        >

                            <button
                                type="button"
                                style={
                                    styles.cancelButton
                                }
                                onClick={() => {

                                    setShowCreateForm(
                                        false
                                    );

                                    setForm({
                                        ...emptyForm
                                    });

                                }}
                            >
                                Cancel
                            </button>


                            <button
                                type="submit"
                                disabled={creating}
                                style={{
                                    ...styles.saveButton,

                                    opacity:
                                        creating
                                            ? 0.6
                                            : 1,

                                    cursor:
                                        creating
                                            ? "not-allowed"
                                            : "pointer"
                                }}
                            >

                                {creating
                                    ? "Creating..."
                                    : "Create Alert"}

                            </button>

                        </div>

                    </form>
                )}


                {/* =================================================
                    EMPTY STATE
                ================================================= */}

                {alerts.length === 0 &&
                    !showCreateForm &&
                    !error && (

                        <div
                            style={
                                styles.emptyCard
                            }
                        >

                            <div
                                style={
                                    styles.emptyIcon
                                }
                            >
                                🔔
                            </div>


                            <h2
                                style={
                                    styles.emptyTitle
                                }
                            >
                                No alerts yet
                            </h2>


                            <p
                                style={
                                    styles.emptyText
                                }
                            >
                                Create your first cryptocurrency
                                price alert.
                            </p>


                            <button
                                type="button"
                                style={
                                    styles.createButton
                                }
                                onClick={() =>
                                    setShowCreateForm(
                                        true
                                    )
                                }
                            >
                                + Create Alert
                            </button>

                        </div>
                    )}


                {/* =================================================
                    ALERT LIST
                ================================================= */}

                {alerts.length > 0 && (

                    <div
                        style={
                            styles.alertList
                        }
                    >

                        {alerts.map((item) => {

                            const active =
                                item.active === true;


                            return (

                                <div
                                    key={item.id}
                                    style={
                                        styles.alertCard
                                    }
                                >


                                    {/* COIN */}

                                    <div
                                        style={
                                            styles.alertMain
                                        }
                                    >

                                        <div
                                            style={
                                                styles.coinIcon
                                            }
                                        >

                                            {item.symbol
                                                ? item.symbol
                                                    .charAt(0)
                                                    .toUpperCase()
                                                : "₿"}

                                        </div>


                                        <div
                                            style={
                                                styles.coinInfo
                                            }
                                        >

                                            <h3
                                                style={
                                                    styles.coinName
                                                }
                                            >
                                                {
                                                    item.cryptoName ||
                                                    item.cryptoId
                                                }
                                            </h3>


                                            <span
                                                style={
                                                    styles.symbol
                                                }
                                            >
                                                {item.symbol
                                                    ? item.symbol
                                                        .toUpperCase()
                                                    : item.cryptoId}
                                            </span>

                                        </div>

                                    </div>


                                    {/* CONDITION */}

                                    <div
                                        style={
                                            styles.conditionBox
                                        }
                                    >

                                        <span
                                            style={
                                                styles.conditionLabel
                                            }
                                        >

                                            {item.condition ===
                                            "ABOVE"
                                                ? "Price above"
                                                : "Price below"}

                                        </span>


                                        <strong
                                            style={
                                                styles.targetPrice
                                            }
                                        >

                                            $
                                            {Number(
                                                item.targetPrice
                                            ).toLocaleString()}

                                        </strong>

                                    </div>


                                    {/* STATUS */}

                                    <div
                                        style={
                                            styles.statusBox
                                        }
                                    >

                                        <span
                                            style={{
                                                ...styles.status,

                                                ...(active
                                                    ? styles.activeStatus
                                                    : styles.inactiveStatus)
                                            }}
                                        >

                                            <span
                                                style={{
                                                    ...styles.statusDot,

                                                    background:
                                                        active
                                                            ? "#22c55e"
                                                            : "#64748b"
                                                }}
                                            />

                                            {active
                                                ? "Active"
                                                : "Disabled"}

                                        </span>

                                    </div>


                                    {/* ACTIONS */}

                                    <div
                                        style={
                                            styles.actions
                                        }
                                    >

                                        <button
                                            type="button"
                                            style={
                                                styles.toggleButton
                                            }
                                            onClick={() =>
                                                handleToggle(
                                                    item.id
                                                )
                                            }
                                        >

                                            {active
                                                ? "Disable"
                                                : "Enable"}

                                        </button>


                                        <button
                                            type="button"
                                            style={
                                                styles.deleteButton
                                            }
                                            onClick={() =>
                                                handleDelete(
                                                    item.id
                                                )
                                            }
                                        >
                                            Delete
                                        </button>

                                    </div>

                                </div>
                            );
                        })}

                    </div>
                )}

            </main>

        </div>
    );
}


// =============================================================
// STYLES
// =============================================================

const styles = {

    page: {
        minHeight: "100vh",
        width: "100%",
        background:
            "linear-gradient(135deg,#07111f 0%,#0b1220 50%,#101827 100%)",
        color: "#e5e7eb",
        fontFamily:
            "Inter,system-ui,-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif",
        textAlign: "left",
        boxSizing: "border-box"
    },


    container: {
        width: "100%",
        maxWidth: "1200px",
        margin: "0 auto",
        padding: "45px 30px",
        boxSizing: "border-box"
    },


    header: {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "20px",
        marginBottom: "30px"
    },


    title: {
        margin: 0,
        color: "#ffffff",
        fontSize: "32px",
        fontWeight: "750"
    },


    subtitle: {
        color: "#718096",
        fontSize: "14px",
        marginTop: "8px",
        marginBottom: 0
    },


    createButton: {
        border: "none",
        background:
            "linear-gradient(135deg,#6d5dfc,#5145cd)",
        color: "#ffffff",
        padding: "11px 20px",
        borderRadius: "10px",
        cursor: "pointer",
        fontWeight: "650",
        boxShadow:
            "0 8px 25px rgba(109,93,252,0.2)",
        whiteSpace: "nowrap",
        position: "relative",
        zIndex: 2
    },


    errorBox: {
        background:
            "rgba(239,68,68,0.1)",
        border:
            "1px solid rgba(239,68,68,0.2)",
        color: "#fca5a5",
        padding: "13px 15px",
        borderRadius: "10px",
        marginBottom: "20px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        gap: "15px"
    },


    retryButton: {
        border: "none",
        background:
            "rgba(239,68,68,0.15)",
        color: "#fca5a5",
        padding: "7px 12px",
        borderRadius: "7px",
        cursor: "pointer"
    },


    formCard: {
        background:
            "rgba(255,255,255,0.04)",
        border:
            "1px solid rgba(255,255,255,0.08)",
        borderRadius: "16px",
        padding: "25px",
        marginBottom: "25px",
        boxSizing: "border-box"
    },


    formTitle: {
        marginTop: 0,
        marginBottom: "22px",
        color: "#ffffff",
        fontSize: "20px"
    },


    formGrid: {
        display: "grid",
        gridTemplateColumns:
            "repeat(auto-fit,minmax(190px,1fr))",
        gap: "18px"
    },


    field: {
        display: "flex",
        flexDirection: "column",
        gap: "7px"
    },


    label: {
        color: "#94a3b8",
        fontSize: "12px",
        fontWeight: "600"
    },


    input: {
        width: "100%",
        boxSizing: "border-box",
        background: "#101827",
        border:
            "1px solid rgba(255,255,255,0.1)",
        color: "#ffffff",
        padding: "11px 12px",
        borderRadius: "8px",
        outline: "none"
    },


    formActions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "10px",
        marginTop: "25px"
    },


    cancelButton: {
        background:
            "rgba(255,255,255,0.05)",
        color: "#cbd5e1",
        border:
            "1px solid rgba(255,255,255,0.1)",
        padding: "10px 18px",
        borderRadius: "9px",
        cursor: "pointer"
    },


    saveButton: {
        border: "none",
        background:
            "linear-gradient(135deg,#6d5dfc,#5145cd)",
        color: "#ffffff",
        padding: "10px 18px",
        borderRadius: "9px",
        fontWeight: "600"
    },


    emptyCard: {
        textAlign: "center",
        padding: "80px 20px",
        background:
            "rgba(255,255,255,0.03)",
        border:
            "1px solid rgba(255,255,255,0.07)",
        borderRadius: "16px"
    },


    emptyIcon: {
        fontSize: "42px",
        marginBottom: "15px"
    },


    emptyTitle: {
        color: "#ffffff",
        marginBottom: "8px"
    },


    emptyText: {
        color: "#718096",
        marginBottom: "22px"
    },


    alertList: {
        display: "flex",
        flexDirection: "column",
        gap: "12px"
    },


    alertCard: {
        display: "grid",
        gridTemplateColumns:
            "minmax(180px,2fr) minmax(130px,1.2fr) minmax(90px,0.8fr) minmax(160px,1.4fr)",
        alignItems: "center",
        gap: "20px",
        padding: "18px 20px",
        background:
            "rgba(255,255,255,0.035)",
        border:
            "1px solid rgba(255,255,255,0.07)",
        borderRadius: "14px",
        boxSizing: "border-box"
    },


    alertMain: {
        display: "flex",
        alignItems: "center",
        gap: "12px",
        minWidth: 0
    },


    coinIcon: {
        width: "42px",
        height: "42px",
        borderRadius: "12px",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background:
            "rgba(109,93,252,0.15)",
        color: "#a5b4fc",
        fontWeight: "800",
        flexShrink: 0
    },


    coinInfo: {
        minWidth: 0
    },


    coinName: {
        margin: 0,
        color: "#ffffff",
        fontSize: "15px",
        fontWeight: "700",
        overflow: "hidden",
        textOverflow: "ellipsis",
        whiteSpace: "nowrap"
    },


    symbol: {
        display: "block",
        marginTop: "3px",
        color: "#718096",
        fontSize: "12px"
    },


    conditionBox: {
        display: "flex",
        flexDirection: "column",
        gap: "4px"
    },


    conditionLabel: {
        color: "#718096",
        fontSize: "11px"
    },


    targetPrice: {
        color: "#ffffff",
        fontSize: "14px"
    },


    statusBox: {
        display: "flex",
        justifyContent: "center"
    },


    status: {
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        padding: "6px 10px",
        borderRadius: "20px",
        fontSize: "11px",
        fontWeight: "600",
        whiteSpace: "nowrap"
    },


    statusDot: {
        width: "7px",
        height: "7px",
        borderRadius: "50%",
        display: "inline-block"
    },


    activeStatus: {
        background:
            "rgba(34,197,94,0.12)",
        color: "#4ade80"
    },


    inactiveStatus: {
        background:
            "rgba(148,163,184,0.12)",
        color: "#94a3b8"
    },


    actions: {
        display: "flex",
        justifyContent: "flex-end",
        gap: "8px"
    },


    toggleButton: {
        background:
            "rgba(109,93,252,0.12)",
        color: "#a5b4fc",
        border:
            "1px solid rgba(109,93,252,0.2)",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px"
    },


    deleteButton: {
        background:
            "rgba(239,68,68,0.1)",
        color: "#f87171",
        border:
            "1px solid rgba(239,68,68,0.18)",
        padding: "8px 12px",
        borderRadius: "8px",
        cursor: "pointer",
        fontSize: "12px"
    },


    centerMessage: {
        minHeight: "70vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        color: "#94a3b8"
    }
};