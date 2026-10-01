
import React, {
    useEffect,
    useState,
    useRef,
} from "react";

import {
    useNavigate,
} from "react-router-dom";

import Navbar from "../components/Navbar";


const API = "https://cryptotrack-backend-mgou.onrender.com";


const EMPTY_FORM = {
    cryptoId: "",
    quantity: "",
};


export default function Portfolio() {

    const navigate =
        useNavigate();


    // =========================================================
    // PORTFOLIO STATE
    // =========================================================

    const [
        portfolio,
        setPortfolio
    ] = useState(null);


    const [
        loading,
        setLoading
    ] = useState(true);


    const [
        refreshing,
        setRefreshing
    ] = useState(false);


    const [
        error,
        setError
    ] = useState("");


    // =========================================================
    // ADD MODAL STATE
    // =========================================================

    const [
        showAddModal,
        setShowAddModal
    ] = useState(false);


    const [
        adding,
        setAdding
    ] = useState(false);


    const [
        addError,
        setAddError
    ] = useState("");


    const [
        form,
        setForm
    ] = useState(
        EMPTY_FORM
    );


    // =========================================================
    // COIN SEARCH STATE
    // =========================================================

    const [
        searchText,
        setSearchText
    ] = useState("");


    const [
        searchResults,
        setSearchResults
    ] = useState([]);


    const [
        searching,
        setSearching
    ] = useState(false);


    const [
        searchError,
        setSearchError
    ] = useState("");


    const [
        selectedCoin,
        setSelectedCoin
    ] = useState(null);


    const [
        selectedCoinPrice,
        setSelectedCoinPrice
    ] = useState(null);


    const [
        loadingCoinPrice,
        setLoadingCoinPrice
    ] = useState(false);


    const searchAbortRef =
        useRef(null);


    // =========================================================
    // TOKEN
    // =========================================================

    const getToken = () =>
        localStorage.getItem("token");


    // =========================================================
    // FETCH PORTFOLIO
    // =========================================================

    const fetchPortfolio = async (
        showFullLoader = true
    ) => {

        try {

            if (showFullLoader) {
                setLoading(true);
            } else {
                setRefreshing(true);
            }


            setError("");


            const token =
                getToken();


            if (!token) {

                setError(
                    "Your session has expired. Please login again."
                );

                return;
            }


            const response =
                await fetch(
                    `${API}/api/portfolio/analytics`,
                    {
                        method: "GET",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            const responseText =
                await response.text();


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                throw new Error(
                    "Your session has expired. Please login again."
                );
            }


            if (!response.ok) {

                let message =
                    `Unable to load portfolio (${response.status})`;


                try {

                    const errorData =
                        JSON.parse(
                            responseText
                        );


                    message =
                        errorData?.message ||
                        errorData?.error ||
                        message;

                } catch {
                    if (responseText) {
                        message =
                            responseText;
                    }
                }


                throw new Error(
                    message
                );
            }


            let data;


            try {

                data =
                    JSON.parse(
                        responseText
                    );

            } catch {

                throw new Error(
                    "Invalid portfolio response received."
                );
            }


            setPortfolio(data);


        } catch (err) {

            console.error(
                "Portfolio loading error:",
                err
            );


            setError(
                err.message ||
                "Unable to load portfolio."
            );


        } finally {

            setLoading(false);
            setRefreshing(false);
        }
    };


    // =========================================================
    // INITIAL LOAD
    // =========================================================

    useEffect(() => {

        fetchPortfolio(true);

    }, []);


    // =========================================================
    // SEARCH CRYPTOCURRENCIES
    // =========================================================

    useEffect(() => {

        if (!showAddModal) {
            return;
        }


        const query =
            searchText.trim();


        setSearchError("");


        if (query.length < 2) {

            setSearchResults([]);

            setSearching(false);

            return;
        }


        if (searchAbortRef.current) {

            searchAbortRef.current.abort();
        }


        const controller =
            new AbortController();


        searchAbortRef.current =
            controller;


        const timer =
            setTimeout(
                async () => {

                    try {

                        setSearching(true);


                        const response =
                            await fetch(
                                `${API}/api/crypto/search?query=${encodeURIComponent(
                                    query
                                )}`,
                                {
                                    method: "GET",

                                    signal:
                                        controller.signal,
                                }
                            );


                        if (!response.ok) {

                            throw new Error(
                                "Unable to search cryptocurrencies."
                            );
                        }


                        const data =
                            await response.json();


                        if (
                            !Array.isArray(
                                data
                            )
                        ) {

                            setSearchResults(
                                []
                            );

                            return;
                        }


                        setSearchResults(
                            data.slice(
                                0,
                                8
                            )
                        );


                    } catch (err) {

                        if (
                            err.name ===
                            "AbortError"
                        ) {
                            return;
                        }


                        console.error(
                            "Crypto search error:",
                            err
                        );


                        setSearchResults(
                            []
                        );


                        setSearchError(
                            "Unable to search cryptocurrencies right now."
                        );


                    } finally {

                        if (
                            !controller.signal.aborted
                        ) {

                            setSearching(
                                false
                            );
                        }
                    }

                },
                350
            );


        return () => {

            clearTimeout(
                timer
            );

            controller.abort();
        };

    }, [
        searchText,
        showAddModal
    ]);


    // =========================================================
    // SELECT COIN
    // =========================================================

    const selectCoin = async (
        coin
    ) => {

        if (!coin?.id) {
            return;
        }


        setSelectedCoin(
            coin
        );


        setForm((previous) => ({
            ...previous,

            cryptoId:
                coin.id,
        }));


        setSearchText(
            ""
        );


        setSearchResults(
            []
        );


        setSearchError(
            ""
        );


        // -----------------------------------------------------
        // GET CURRENT PRICE FOR PREVIEW
        // -----------------------------------------------------

        try {

            setLoadingCoinPrice(
                true
            );


            setSelectedCoinPrice(
                null
            );


            const response =
                await fetch(
                    `${API}/api/crypto/${encodeURIComponent(
                        coin.id
                    )}`
                );


            if (!response.ok) {
                throw new Error(
                    "Unable to fetch current price."
                );
            }


            const data =
                await response.json();


            if (
                data?.price !== null &&
                data?.price !== undefined
            ) {

                setSelectedCoinPrice(
                    Number(
                        data.price
                    )
                );

            }

        } catch (err) {

            console.error(
                "Selected coin price error:",
                err
            );


            /*
             * This is only a preview.
             *
             * The backend will independently fetch
             * the current price when the holding is
             * actually saved.
             */

            setSelectedCoinPrice(
                null
            );

        } finally {

            setLoadingCoinPrice(
                false
            );
        }
    };


    // =========================================================
    // OPEN ADD MODAL
    // =========================================================

    const openAddModal = () => {

        setShowAddModal(
            true
        );


        setAdding(false);

        setAddError("");


        setForm(
            EMPTY_FORM
        );


        setSearchText("");

        setSearchResults([]);

        setSearchError("");

        setSelectedCoin(null);

        setSelectedCoinPrice(null);

        setLoadingCoinPrice(false);
    };


    // =========================================================
    // CLOSE ADD MODAL
    // =========================================================

    const closeAddModal = () => {

        if (adding) {
            return;
        }


        setShowAddModal(
            false
        );


        setAddError("");

        setSearchText("");

        setSearchResults([]);

        setSearchError("");

        setSelectedCoin(null);

        setSelectedCoinPrice(null);

        setForm(
            EMPTY_FORM
        );


        if (searchAbortRef.current) {

            searchAbortRef.current.abort();
        }
    };


    // =========================================================
    // FORM CHANGE
    // =========================================================

    const handleFormChange = (
        event
    ) => {

        const {
            name,
            value
        } = event.target;


        setForm((previous) => ({
            ...previous,

            [name]:
                value,
        }));


        setAddError("");
    };


    // =========================================================
    // ADD TO PORTFOLIO
    // =========================================================

    const handleAddCrypto = async (
        event
    ) => {

        event.preventDefault();


        setAddError("");


        const token =
            getToken();


        if (!token) {

            setAddError(
                "Your session has expired. Please login again."
            );

            return;
        }


        if (!form.cryptoId) {

            setAddError(
                "Please select a cryptocurrency."
            );

            return;
        }


        const quantity =
            Number(
                form.quantity
            );


        if (
            !Number.isFinite(
                quantity
            ) ||
            quantity <= 0
        ) {

            setAddError(
                "Quantity must be greater than zero."
            );

            return;
        }


        try {

            setAdding(true);


            /*
             * IMPORTANT:
             *
             * Only cryptoId and quantity are sent.
             *
             * The backend automatically determines:
             *
             * - crypto name
             * - symbol
             * - current buy price
             *
             * This prevents manual/inconsistent data.
             */

            const response =
                await fetch(
                    `${API}/api/portfolio`,
                    {
                        method: "POST",

                        headers: {
                            "Content-Type":
                                "application/json",

                            Authorization:
                                `Bearer ${token}`,
                        },

                        body:
                            JSON.stringify({
                                cryptoId:
                                    form.cryptoId,

                                quantity:
                                    quantity,
                            }),
                    }
                );


            const responseText =
                await response.text();


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                throw new Error(
                    "Your session has expired. Please login again."
                );
            }


            if (!response.ok) {

                let message =
                    "Unable to add cryptocurrency.";


                try {

                    const errorData =
                        JSON.parse(
                            responseText
                        );


                    message =
                        errorData?.message ||
                        errorData?.error ||
                        message;

                } catch {

                    if (responseText) {
                        message =
                            responseText;
                    }
                }


                throw new Error(
                    message
                );
            }


            // -------------------------------------------------
            // SUCCESS
            // -------------------------------------------------

            setShowAddModal(
                false
            );


            setForm(
                EMPTY_FORM
            );


            setSelectedCoin(
                null
            );


            setSelectedCoinPrice(
                null
            );


            setSearchText("");

            setSearchResults([]);


            await fetchPortfolio(
                false
            );


        } catch (err) {

            console.error(
                "Add crypto error:",
                err
            );


            setAddError(
                err.message ||
                "Unable to add cryptocurrency."
            );


        } finally {

            setAdding(false);
        }
    };


    // =========================================================
    // REMOVE HOLDING
    // =========================================================

    const removeHolding = async (
        id
    ) => {

        const confirmed =
            window.confirm(
                "Are you sure you want to remove this holding?"
            );


        if (!confirmed) {
            return;
        }


        const token =
            getToken();


        if (!token) {

            window.alert(
                "Your session has expired. Please login again."
            );

            return;
        }


        try {

            const response =
                await fetch(
                    `${API}/api/portfolio/${id}`,
                    {
                        method: "DELETE",

                        headers: {
                            Authorization:
                                `Bearer ${token}`,
                        },
                    }
                );


            const responseText =
                await response.text();


            if (response.status === 401) {

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                navigate("/login");

                throw new Error(
                    "Your session has expired. Please login again."
                );
            }


            if (!response.ok) {

                throw new Error(
                    responseText ||
                    "Unable to remove holding."
                );
            }


            await fetchPortfolio(
                false
            );


        } catch (err) {

            console.error(
                "Remove holding error:",
                err
            );


            window.alert(
                err.message ||
                "Unable to remove holding."
            );
        }
    };


    // =========================================================
    // FORMAT CURRENCY
    // =========================================================

    const formatCurrency = (
        value
    ) => {

        const number =
            Number(
                value || 0
            );


        return new Intl.NumberFormat(
            "en-US",
            {
                style:
                    "currency",

                currency:
                    "USD",

                maximumFractionDigits:
                    2,
            }
        ).format(
            number
        );
    };


    // =========================================================
    // FORMAT CRYPTO NUMBER
    // =========================================================

    const formatNumber = (
        value
    ) => {

        const number =
            Number(
                value || 0
            );


        return number.toLocaleString(
            "en-US",
            {
                maximumFractionDigits:
                    8,
            }
        );
    };


    // =========================================================
    // FORMAT PERCENT
    // =========================================================

    const formatPercent = (
        value
    ) => {

        const number =
            Number(
                value || 0
            );


        return `${
            number >= 0
                ? "+"
                : ""
        }${number.toFixed(2)}%`;
    };


    // =========================================================
    // COIN INITIAL
    // =========================================================

    const getInitial = (
        name,
        symbol
    ) => {

        if (
            symbol &&
            symbol.length > 0
        ) {

            return symbol
                .substring(
                    0,
                    1
                )
                .toUpperCase();
        }


        if (
            name &&
            name.length > 0
        ) {

            return name
                .substring(
                    0,
                    1
                )
                .toUpperCase();
        }


        return "?";
    };


    // =========================================================
    // LOADING SCREEN
    // =========================================================

    if (loading) {

        return (
            <div
                style={
                    styles.page
                }
            >

                <style>
                    {`
                        @keyframes portfolioSpin {
                            from {
                                transform: rotate(0deg);
                            }
                            to {
                                transform: rotate(360deg);
                            }
                        }

                        @keyframes modalFade {
                            from {
                                opacity: 0;
                                transform: translateY(8px) scale(0.98);
                            }
                            to {
                                opacity: 1;
                                transform: translateY(0) scale(1);
                            }
                        }
                    `}
                </style>


                <Navbar />


                <div
                    style={
                        styles.loadingContainer
                    }
                >

                    <div
                        style={
                            styles.spinner
                        }
                    />


                    <h2
                        style={
                            styles.loadingTitle
                        }
                    >
                        Loading your portfolio
                    </h2>


                    <p
                        style={
                            styles.loadingText
                        }
                    >
                        Fetching your latest
                        portfolio data...
                    </p>

                </div>

            </div>
        );
    }


    // =========================================================
    // ERROR SCREEN
    // =========================================================

    if (error) {

        return (
            <div
                style={
                    styles.page
                }
            >

                <style>
                    {`
                        @keyframes portfolioSpin {
                            from {
                                transform: rotate(0deg);
                            }
                            to {
                                transform: rotate(360deg);
                            }
                        }
                    `}
                </style>


                <Navbar />


                <div
                    style={
                        styles.errorContainer
                    }
                >

                    <div
                        style={
                            styles.errorIcon
                        }
                    >
                        !
                    </div>


                    <h2
                        style={
                            styles.errorTitle
                        }
                    >
                        Unable to load portfolio
                    </h2>


                    <p
                        style={
                            styles.errorText
                        }
                    >
                        {error}
                    </p>


                    <button
                        type="button"
                        style={
                            styles.primaryButton
                        }
                        onClick={() =>
                            fetchPortfolio(
                                true
                            )
                        }
                    >
                        Try Again
                    </button>

                </div>

            </div>
        );
    }


    // =========================================================
    // PORTFOLIO DATA
    // =========================================================

    const holdings =
        portfolio?.holdings ||
        [];


    const totalInvested =
        Number(
            portfolio?.totalInvested ||
            0
        );


    const currentValue =
        Number(
            portfolio?.currentValue ||
            0
        );


    const totalProfitLoss =
        Number(
            portfolio?.totalProfitLoss ||
            0
        );


    const totalProfitLossPercent =
        Number(
            portfolio?.totalProfitLossPercent ||
            0
        );


    const totalHoldings =
        Number(
            portfolio?.totalHoldings ||
            holdings.length ||
            0
        );


    const isProfit =
        totalProfitLoss >= 0;


    // =========================================================
    // RENDER
    // =========================================================

    return (
        <div
            style={
                styles.page
            }
        >

            <style>
                {`
                    @keyframes portfolioSpin {
                        from {
                            transform: rotate(0deg);
                        }
                        to {
                            transform: rotate(360deg);
                        }
                    }

                    @keyframes modalFade {
                        from {
                            opacity: 0;
                            transform: translateY(8px) scale(0.98);
                        }
                        to {
                            opacity: 1;
                            transform: translateY(0) scale(1);
                        }
                    }
                `}
            </style>


            {/* =================================================
                NAVBAR
            ================================================= */}

            <Navbar />


            {/* =================================================
                PAGE CONTENT
            ================================================= */}

            <main
                style={
                    styles.container
                }
            >

                {/* =================================================
                    HEADER
                ================================================= */}

                <header
                    style={
                        styles.header
                    }
                >

                    <div>

                        <button
                            type="button"
                            style={
                                styles.backButton
                            }
                            onClick={() =>
                                navigate(
                                    "/dashboard"
                                )
                            }
                        >
                            ← Dashboard
                        </button>


                        <h1
                            style={
                                styles.title
                            }
                        >
                            My Portfolio
                        </h1>


                        <p
                            style={
                                styles.subtitle
                            }
                        >
                            Track your cryptocurrency
                            holdings and performance.
                        </p>

                    </div>


                    <div
                        style={
                            styles.headerActions
                        }
                    >

                        <button
                            type="button"
                            style={{
                                ...styles.refreshButton,

                                opacity:
                                    refreshing
                                        ? 0.6
                                        : 1,

                                cursor:
                                    refreshing
                                        ? "not-allowed"
                                        : "pointer",
                            }}
                            onClick={() =>
                                fetchPortfolio(
                                    false
                                )
                            }
                            disabled={
                                refreshing
                            }
                        >
                            {refreshing
                                ? "Refreshing..."
                                : "↻ Refresh"}
                        </button>


                        <button
                            type="button"
                            style={
                                styles.addButton
                            }
                            onClick={
                                openAddModal
                            }
                        >
                            + Add Crypto
                        </button>

                    </div>

                </header>


                {/* =================================================
                    SUMMARY
                ================================================= */}

                <section
                    style={
                        styles.summaryGrid
                    }
                >

                    {/* TOTAL INVESTED */}

                    <div
                        style={
                            styles.summaryCard
                        }
                    >

                        <div
                            style={
                                styles.cardTop
                            }
                        >

                            <span
                                style={
                                    styles.cardLabel
                                }
                            >
                                Total Invested
                            </span>


                            <span
                                style={
                                    styles.cardIcon
                                }
                            >
                                $
                            </span>

                        </div>


                        <div
                            style={
                                styles.cardValue
                            }
                        >
                            {
                                formatCurrency(
                                    totalInvested
                                )
                            }
                        </div>


                        <div
                            style={
                                styles.cardDescription
                            }
                        >
                            Capital invested
                        </div>

                    </div>


                    {/* CURRENT VALUE */}

                    <div
                        style={
                            styles.summaryCard
                        }
                    >

                        <div
                            style={
                                styles.cardTop
                            }
                        >

                            <span
                                style={
                                    styles.cardLabel
                                }
                            >
                                Current Value
                            </span>


                            <span
                                style={
                                    styles.cardIcon
                                }
                            >
                                ◈
                            </span>

                        </div>


                        <div
                            style={
                                styles.cardValue
                            }
                        >
                            {
                                formatCurrency(
                                    currentValue
                                )
                            }
                        </div>


                        <div
                            style={
                                styles.cardDescription
                            }
                        >
                            Current market value
                        </div>

                    </div>


                    {/* P/L */}

                    <div
                        style={
                            styles.summaryCard
                        }
                    >

                        <div
                            style={
                                styles.cardTop
                            }
                        >

                            <span
                                style={
                                    styles.cardLabel
                                }
                            >
                                Total P/L
                            </span>


                            <span
                                style={{
                                    ...styles.cardIcon,

                                    color:
                                        isProfit
                                            ? "#34d399"
                                            : "#fb7185",
                                }}
                            >
                                {
                                    isProfit
                                        ? "↗"
                                        : "↘"
                                }
                            </span>

                        </div>


                        <div
                            style={{
                                ...styles.cardValue,

                                color:
                                    isProfit
                                        ? "#34d399"
                                        : "#fb7185",
                            }}
                        >
                            {
                                formatCurrency(
                                    totalProfitLoss
                                )
                            }
                        </div>


                        <div
                            style={{
                                ...styles.cardDescription,

                                color:
                                    isProfit
                                        ? "#34d399"
                                        : "#fb7185",
                            }}
                        >
                            {
                                formatPercent(
                                    totalProfitLossPercent
                                )
                            }
                        </div>

                    </div>


                    {/* HOLDINGS */}

                    <div
                        style={
                            styles.summaryCard
                        }
                    >

                        <div
                            style={
                                styles.cardTop
                            }
                        >

                            <span
                                style={
                                    styles.cardLabel
                                }
                            >
                                Holdings
                            </span>


                            <span
                                style={
                                    styles.cardIcon
                                }
                            >
                                ◫
                            </span>

                        </div>


                        <div
                            style={
                                styles.cardValue
                            }
                        >
                            {
                                totalHoldings
                            }
                        </div>


                        <div
                            style={
                                styles.cardDescription
                            }
                        >
                            Assets in portfolio
                        </div>

                    </div>

                </section>


                {/* =================================================
                    MAIN CARD
                ================================================= */}

                <section
                    style={
                        styles.mainCard
                    }
                >

                    <div
                        style={
                            styles.sectionHeader
                        }
                    >

                        <div>

                            <h2
                                style={
                                    styles.sectionTitle
                                }
                            >
                                Your Holdings
                            </h2>


                            <p
                                style={
                                    styles.sectionSubtitle
                                }
                            >
                                Detailed breakdown of
                                your cryptocurrency investments.
                            </p>

                        </div>


                        <button
                            type="button"
                            style={
                                styles.smallAddButton
                            }
                            onClick={
                                openAddModal
                            }
                        >
                            + Add Crypto
                        </button>

                    </div>


                    {/* =================================================
                        EMPTY STATE
                    ================================================= */}

                    {holdings.length === 0 ? (

                        <div
                            style={
                                styles.emptyState
                            }
                        >

                            <div
                                style={
                                    styles.emptyIcon
                                }
                            >
                                ◈
                            </div>


                            <h3
                                style={
                                    styles.emptyTitle
                                }
                            >
                                Your portfolio is empty
                            </h3>


                            <p
                                style={
                                    styles.emptyText
                                }
                            >
                                Add a cryptocurrency
                                to start tracking
                                your investment.
                            </p>


                            <button
                                type="button"
                                style={
                                    styles.primaryButton
                                }
                                onClick={
                                    openAddModal
                                }
                            >
                                + Add Crypto
                            </button>

                        </div>

                    ) : (

                        /* =================================================
                           TABLE
                        ================================================= */

                        <div
                            style={
                                styles.tableWrapper
                            }
                        >

                            <table
                                style={
                                    styles.table
                                }
                            >

                                <thead>

                                    <tr>

                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Asset
                                        </th>


                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Quantity
                                        </th>


                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Avg. Buy Price
                                        </th>


                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Current Price
                                        </th>


                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Invested
                                        </th>


                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Current Value
                                        </th>


                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            P/L
                                        </th>


                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Allocation
                                        </th>


                                        <th
                                            style={
                                                styles.th
                                            }
                                        >
                                            Action
                                        </th>

                                    </tr>

                                </thead>


                                <tbody>

                                    {holdings.map(
                                        (
                                            holding
                                        ) => {

                                            const profit =
                                                Number(
                                                    holding.profitLoss ||
                                                    0
                                                );


                                            const profitPercent =
                                                Number(
                                                    holding.profitLossPercent ||
                                                    0
                                                );


                                            const allocation =
                                                Number(
                                                    holding.allocationPercent ||
                                                    0
                                                );


                                            const profitable =
                                                profit >=
                                                0;


                                            return (

                                                <tr
                                                    key={
                                                        holding.id
                                                    }
                                                    style={
                                                        styles.tr
                                                    }
                                                >

                                                    {/* ASSET */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <div
                                                            style={
                                                                styles.asset
                                                            }
                                                        >

                                                            <div
                                                                style={
                                                                    styles.coinIcon
                                                                }
                                                            >
                                                                {
                                                                    getInitial(
                                                                        holding.cryptoName,
                                                                        holding.symbol
                                                                    )
                                                                }
                                                            </div>


                                                            <div>

                                                                <div
                                                                    style={
                                                                        styles.coinName
                                                                    }
                                                                >
                                                                    {
                                                                        holding.cryptoName ||
                                                                        holding.cryptoId
                                                                    }
                                                                </div>


                                                                <div
                                                                    style={
                                                                        styles.coinSymbol
                                                                    }
                                                                >
                                                                    {
                                                                        (
                                                                            holding.symbol ||
                                                                            ""
                                                                        ).toUpperCase()
                                                                    }
                                                                </div>

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* QUANTITY */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <span
                                                            style={
                                                                styles.primaryText
                                                            }
                                                        >
                                                            {
                                                                formatNumber(
                                                                    holding.quantity
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* AVG BUY PRICE */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >
                                                        {
                                                            formatCurrency(
                                                                holding.averageBuyPrice
                                                            )
                                                        }
                                                    </td>


                                                    {/* CURRENT PRICE */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >
                                                        {
                                                            holding.currentPrice !==
                                                            null &&
                                                            holding.currentPrice !==
                                                            undefined
                                                                ? formatCurrency(
                                                                    holding.currentPrice
                                                                )
                                                                : "—"
                                                        }
                                                    </td>


                                                    {/* INVESTED */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >
                                                        {
                                                            formatCurrency(
                                                                holding.investedValue
                                                            )
                                                        }
                                                    </td>


                                                    {/* CURRENT VALUE */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <span
                                                            style={
                                                                styles.primaryText
                                                            }
                                                        >
                                                            {
                                                                formatCurrency(
                                                                    holding.currentValue
                                                                )
                                                            }
                                                        </span>

                                                    </td>


                                                    {/* PROFIT / LOSS */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <div
                                                            style={{
                                                                color:
                                                                    profitable
                                                                        ? "#34d399"
                                                                        : "#fb7185",

                                                                fontWeight:
                                                                    "700",
                                                            }}
                                                        >
                                                            {
                                                                profitable
                                                                    ? "+"
                                                                    : ""
                                                            }

                                                            {
                                                                formatCurrency(
                                                                    profit
                                                                )
                                                            }
                                                        </div>


                                                        <div
                                                            style={{
                                                                color:
                                                                    profitable
                                                                        ? "#34d399"
                                                                        : "#fb7185",

                                                                fontSize:
                                                                    "12px",

                                                                marginTop:
                                                                    "3px",
                                                            }}
                                                        >
                                                            {
                                                                formatPercent(
                                                                    profitPercent
                                                                )
                                                            }
                                                        </div>

                                                    </td>


                                                    {/* ALLOCATION */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <div
                                                            style={
                                                                styles.allocationContainer
                                                            }
                                                        >

                                                            <div
                                                                style={
                                                                    styles.allocationText
                                                                }
                                                            >
                                                                {
                                                                    allocation.toFixed(
                                                                        1
                                                                    )
                                                                }%
                                                            </div>


                                                            <div
                                                                style={
                                                                    styles.progressBackground
                                                                }
                                                            >

                                                                <div
                                                                    style={{
                                                                        ...styles.progressFill,

                                                                        width:
                                                                            `${Math.min(
                                                                                100,
                                                                                Math.max(
                                                                                    0,
                                                                                    allocation
                                                                                )
                                                                            )}%`,
                                                                    }}
                                                                />

                                                            </div>

                                                        </div>

                                                    </td>


                                                    {/* REMOVE */}

                                                    <td
                                                        style={
                                                            styles.td
                                                        }
                                                    >

                                                        <button
                                                            type="button"
                                                            style={
                                                                styles.deleteButton
                                                            }
                                                            onClick={() =>
                                                                removeHolding(
                                                                    holding.id
                                                                )
                                                            }
                                                        >
                                                            Remove
                                                        </button>

                                                    </td>

                                                </tr>
                                            );
                                        }
                                    )}

                                </tbody>

                            </table>

                        </div>
                    )}

                </section>


                {/* =================================================
                    FOOTER NOTE
                ================================================= */}

                <div
                    style={
                        styles.footerNote
                    }
                >

                    <span>
                        ⓘ
                    </span>


                    <span>
                        Portfolio values use the
                        latest available market prices.
                    </span>

                </div>

            </main>


            {/* =================================================
                ADD CRYPTO MODAL
            ================================================= */}

            {showAddModal && (

                <div
                    style={
                        styles.modalOverlay
                    }
                    onMouseDown={closeAddModal}
                >

                    <div
                        style={
                            styles.modal
                        }
                        onMouseDown={(
                            event
                        ) =>
                            event.stopPropagation()
                        }
                    >

                        {/* =================================================
                            MODAL HEADER
                        ================================================= */}

                        <div
                            style={
                                styles.modalHeader
                            }
                        >

                            <div>

                                <div
                                    style={
                                        styles.modalEyebrow
                                    }
                                >
                                    PORTFOLIO
                                </div>


                                <h2
                                    style={
                                        styles.modalTitle
                                    }
                                >
                                    Add Cryptocurrency
                                </h2>


                                <p
                                    style={
                                        styles.modalSubtitle
                                    }
                                >
                                    Select a coin and
                                    enter the quantity.
                                </p>

                            </div>


                            <button
                                type="button"
                                style={
                                    styles.closeButton
                                }
                                onClick={
                                    closeAddModal
                                }
                                disabled={
                                    adding
                                }
                            >
                                ×
                            </button>

                        </div>


                        {/* =================================================
                            FORM ERROR
                        ================================================= */}

                        {addError && (

                            <div
                                style={
                                    styles.formError
                                }
                            >
                                {addError}
                            </div>
                        )}


                        {/* =================================================
                            SEARCH COIN
                        ================================================= */}

                        {!selectedCoin && (

                            <div
                                style={
                                    styles.formGroup
                                }
                            >

                                <label
                                    style={
                                        styles.label
                                    }
                                >
                                    Search Cryptocurrency
                                </label>


                                <div
                                    style={
                                        styles.searchWrapper
                                    }
                                >

                                    <span
                                        style={
                                            styles.searchIcon
                                        }
                                    >
                                        ⌕
                                    </span>


                                    <input
                                        type="text"
                                        value={
                                            searchText
                                        }
                                        onChange={(
                                            event
                                        ) =>
                                            setSearchText(
                                                event.target.value
                                            )
                                        }
                                        placeholder="Search Bitcoin, Ethereum, Solana..."
                                        style={
                                            styles.searchInput
                                        }
                                        autoFocus
                                        disabled={
                                            adding
                                        }
                                    />


                                    {searching && (

                                        <div
                                            style={
                                                styles.searchSpinner
                                            }
                                        />
                                    )}

                                </div>


                                {/* SEARCH ERROR */}

                                {searchError && (

                                    <div
                                        style={
                                            styles.searchError
                                        }
                                    >
                                        {searchError}
                                    </div>
                                )}


                                {/* SEARCH HINT */}

                                {!searching &&
                                    !searchError &&
                                    searchText.trim()
                                        .length < 2 && (

                                        <div
                                            style={
                                                styles.inputHint
                                            }
                                        >
                                            Type at least
                                            2 characters
                                            to search.
                                        </div>
                                    )}


                                {/* SEARCH RESULTS */}

                                {searchResults.length >
                                    0 && (

                                    <div
                                        style={
                                            styles.resultsList
                                        }
                                    >

                                        {searchResults.map(
                                            (
                                                coin
                                            ) => (

                                                <button
                                                    key={
                                                        coin.id
                                                    }
                                                    type="button"
                                                    style={
                                                        styles.resultItem
                                                    }
                                                    onClick={() =>
                                                        selectCoin(
                                                            coin
                                                        )
                                                    }
                                                    disabled={
                                                        adding
                                                    }
                                                >

                                                    <div
                                                        style={
                                                            styles.resultImageWrapper
                                                        }
                                                    >

                                                        {coin.thumb ? (

                                                            <img
                                                                src={
                                                                    coin.thumb
                                                                }
                                                                alt=""
                                                                style={
                                                                    styles.resultImage
                                                                }
                                                            />

                                                        ) : (

                                                            <div
                                                                style={
                                                                    styles.resultFallback
                                                                }
                                                            >
                                                                {
                                                                    getInitial(
                                                                        coin.name,
                                                                        coin.symbol
                                                                    )
                                                                }
                                                            </div>
                                                        )}

                                                    </div>


                                                    <div
                                                        style={
                                                            styles.resultInfo
                                                        }
                                                    >

                                                        <div
                                                            style={
                                                                styles.resultName
                                                            }
                                                        >
                                                            {
                                                                coin.name
                                                            }
                                                        </div>


                                                        <div
                                                            style={
                                                                styles.resultSymbol
                                                            }
                                                        >
                                                            {
                                                                (
                                                                    coin.symbol ||
                                                                    ""
                                                                ).toUpperCase()
                                                            }

                                                            {coin.id &&
                                                                ` • ${coin.id}`}
                                                        </div>

                                                    </div>


                                                    <span
                                                        style={
                                                            styles.resultArrow
                                                        }
                                                    >
                                                        →
                                                    </span>

                                                </button>
                                            )
                                        )}

                                    </div>
                                )}


                                {/* NO RESULT */}

                                {!searching &&
                                    searchText.trim()
                                        .length >= 2 &&
                                    searchResults.length ===
                                        0 &&
                                    !searchError && (

                                    <div
                                        style={
                                            styles.noResults
                                        }
                                    >
                                        No matching
                                        cryptocurrency
                                        found.
                                    </div>
                                )}

                            </div>
                        )}


                        {/* =================================================
                            SELECTED COIN
                        ================================================= */}

                        {selectedCoin && (

                            <form
                                onSubmit={
                                    handleAddCrypto
                                }
                            >

                                {/* SELECTED COIN */}

                                <div
                                    style={
                                        styles.selectedCoinCard
                                    }
                                >

                                    <div
                                        style={
                                            styles.selectedCoinLeft
                                        }
                                    >

                                        <div
                                            style={
                                                styles.selectedCoinIcon
                                            }
                                        >

                                            {selectedCoin.thumb ? (

                                                <img
                                                    src={
                                                        selectedCoin.thumb
                                                    }
                                                    alt=""
                                                    style={
                                                        styles.selectedCoinImage
                                                    }
                                                />

                                            ) : (

                                                <span>
                                                    {
                                                        getInitial(
                                                            selectedCoin.name,
                                                            selectedCoin.symbol
                                                        )
                                                    }
                                                </span>
                                            )}

                                        </div>


                                        <div>

                                            <div
                                                style={
                                                    styles.selectedCoinName
                                                }
                                            >
                                                {
                                                    selectedCoin.name
                                                }
                                            </div>


                                            <div
                                                style={
                                                    styles.selectedCoinSymbol
                                                }
                                            >
                                                {
                                                    (
                                                        selectedCoin.symbol ||
                                                        ""
                                                    ).toUpperCase()
                                                }
                                            </div>

                                        </div>

                                    </div>


                                    <button
                                        type="button"
                                        style={
                                            styles.changeCoinButton
                                        }
                                        onClick={() => {

                                            if (
                                                adding
                                            ) {
                                                return;
                                            }


                                            setSelectedCoin(
                                                null
                                            );


                                            setSelectedCoinPrice(
                                                null
                                            );


                                            setForm(
                                                EMPTY_FORM
                                            );


                                            setSearchText("");

                                            setSearchResults([]);

                                            setAddError("");
                                        }}
                                        disabled={
                                            adding
                                        }
                                    >
                                        Change
                                    </button>

                                </div>


                                {/* =================================================
                                    CURRENT PRICE PREVIEW
                                ================================================= */}

                                <div
                                    style={
                                        styles.pricePreview
                                    }
                                >

                                    <div>

                                        <div
                                            style={
                                                styles.previewLabel
                                            }
                                        >
                                            Current Market Price
                                        </div>


                                        <div
                                            style={
                                                styles.previewDescription
                                            }
                                        >
                                            Reference price
                                            from the market API
                                        </div>

                                    </div>


                                    <div
                                        style={
                                            styles.previewValue
                                        }
                                    >

                                        {loadingCoinPrice ? (

                                            <span
                                                style={
                                                    styles.priceLoading
                                                }
                                            >
                                                Loading...
                                            </span>

                                        ) : selectedCoinPrice !==
                                            null ? (

                                            formatCurrency(
                                                selectedCoinPrice
                                            )

                                        ) : (

                                            <span
                                                style={
                                                    styles.priceUnavailable
                                                }
                                            >
                                                Will be fetched
                                                on save
                                            </span>
                                        )}

                                    </div>

                                </div>


                                {/* =================================================
                                    QUANTITY
                                ================================================= */}

                                <div
                                    style={
                                        styles.formGroup
                                    }
                                >

                                    <label
                                        style={
                                            styles.label
                                        }
                                    >
                                        Quantity
                                    </label>


                                    <input
                                        type="number"
                                        name="quantity"
                                        value={
                                            form.quantity
                                        }
                                        onChange={
                                            handleFormChange
                                        }
                                        placeholder="e.g. 0.25"
                                        min="0"
                                        step="any"
                                        style={
                                            styles.quantityInput
                                        }
                                        disabled={
                                            adding
                                        }
                                        autoFocus
                                    />


                                    <div
                                        style={
                                            styles.inputHint
                                        }
                                    >
                                        Enter the amount of
                                        {` `}
                                        {
                                            (
                                                selectedCoin.symbol ||
                                                selectedCoin.name ||
                                                "crypto"
                                            ).toUpperCase()
                                        }
                                        {` `}
                                        you own.
                                    </div>

                                </div>


                                {/* =================================================
                                    INVESTMENT PREVIEW
                                ================================================= */}

                                {form.quantity &&
                                    selectedCoinPrice !==
                                        null && (

                                    <div
                                        style={
                                            styles.investmentPreview
                                        }
                                    >

                                        <span>
                                            Estimated Investment
                                        </span>


                                        <strong>
                                            {
                                                formatCurrency(
                                                    Number(
                                                        form.quantity
                                                    ) *
                                                        Number(
                                                            selectedCoinPrice
                                                        )
                                                )
                                            }
                                        </strong>

                                    </div>
                                )}


                                {/* =================================================
                                    BACKEND EXPLANATION
                                ================================================= */}

                                <div
                                    style={
                                        styles.autoInfo
                                    }
                                >

                                    <span
                                        style={
                                            styles.autoInfoIcon
                                        }
                                    >
                                        ✓
                                    </span>


                                    <span>
                                        Crypto name, symbol,
                                        and buy price are
                                        determined automatically
                                        by the backend.
                                    </span>

                                </div>


                                {/* =================================================
                                    MODAL ACTIONS
                                ================================================= */}

                                <div
                                    style={
                                        styles.modalActions
                                    }
                                >

                                    <button
                                        type="button"
                                        style={
                                            styles.cancelButton
                                        }
                                        onClick={
                                            closeAddModal
                                        }
                                        disabled={
                                            adding
                                        }
                                    >
                                        Cancel
                                    </button>


                                    <button
                                        type="submit"
                                        style={{
                                            ...styles.submitButton,

                                            opacity:
                                                adding ||
                                                !form.quantity
                                                    ? 0.55
                                                    : 1,

                                            cursor:
                                                adding ||
                                                !form.quantity
                                                    ? "not-allowed"
                                                    : "pointer",
                                        }}
                                        disabled={
                                            adding ||
                                            !form.quantity
                                        }
                                    >

                                        {adding
                                            ? "Adding..."
                                            : "Add to Portfolio"}

                                    </button>

                                </div>

                            </form>
                        )}

                    </div>

                </div>
            )}

        </div>
    );
}


/* ================================================================
   STYLES
================================================================ */

const styles = {

    page: {
        minHeight:
            "100vh",

        width:
            "100%",

        background:
            "linear-gradient(135deg, #07111f 0%, #0b1220 50%, #101827 100%)",

        color:
            "#e5e7eb",

        fontFamily:
            "Inter, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",

        boxSizing:
            "border-box",
    },


    container: {
        width:
            "100%",

        maxWidth:
            "1400px",

        margin:
            "0 auto",

        padding:
            "45px 30px 60px",

        boxSizing:
            "border-box",
    },


    header: {
        display:
            "flex",

        justifyContent:
            "space-between",

        alignItems:
            "flex-end",

        gap:
            "20px",

        marginBottom:
            "32px",
    },


    headerActions: {
        display:
            "flex",

        alignItems:
            "center",

        gap:
            "12px",
    },


    backButton: {
        background:
            "transparent",

        border:
            "none",

        color:
            "#8b9bb4",

        cursor:
            "pointer",

        padding:
            "0",

        marginBottom:
            "15px",

        fontSize:
            "13px",
    },


    title: {
        margin:
            0,

        fontSize:
            "34px",

        fontWeight:
            "750",

        letterSpacing:
            "-1px",

        color:
            "#ffffff",
    },


    subtitle: {
        margin:
            "8px 0 0",

        color:
            "#8491a7",

        fontSize:
            "14px",
    },


    refreshButton: {
        background:
            "rgba(109,93,252,0.14)",

        border:
            "1px solid rgba(109,93,252,0.35)",

        color:
            "#b9b0ff",

        padding:
            "11px 18px",

        borderRadius:
            "10px",

        fontWeight:
            "600",
    },


    addButton: {
        border:
            "none",

        background:
            "linear-gradient(135deg,#6d5dfc,#5145cd)",

        color:
            "#ffffff",

        padding:
            "11px 18px",

        borderRadius:
            "10px",

        cursor:
            "pointer",

        fontWeight:
            "700",

        boxShadow:
            "0 8px 25px rgba(109,93,252,0.22)",
    },


    summaryGrid: {
        display:
            "grid",

        gridTemplateColumns:
            "repeat(4,minmax(0,1fr))",

        gap:
            "18px",

        marginBottom:
            "28px",
    },


    summaryCard: {
        background:
            "rgba(17,27,43,0.82)",

        border:
            "1px solid rgba(255,255,255,0.07)",

        borderRadius:
            "18px",

        padding:
            "22px",

        boxShadow:
            "0 12px 35px rgba(0,0,0,0.16)",
    },


    cardTop: {
        display:
            "flex",

        justifyContent:
            "space-between",

        alignItems:
            "center",
    },


    cardLabel: {
        color:
            "#8491a7",

        fontSize:
            "13px",

        fontWeight:
            "600",
    },


    cardIcon: {
        width:
            "32px",

        height:
            "32px",

        borderRadius:
            "9px",

        background:
            "rgba(109,93,252,0.13)",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        color:
            "#a79cff",

        fontWeight:
            "700",
    },


    cardValue: {
        marginTop:
            "17px",

        color:
            "#ffffff",

        fontSize:
            "25px",

        fontWeight:
            "750",

        letterSpacing:
            "-0.5px",
    },


    cardDescription: {
        marginTop:
            "7px",

        color:
            "#718096",

        fontSize:
            "12px",
    },


    mainCard: {
        background:
            "rgba(17,27,43,0.82)",

        border:
            "1px solid rgba(255,255,255,0.07)",

        borderRadius:
            "20px",

        overflow:
            "hidden",

        boxShadow:
            "0 16px 45px rgba(0,0,0,0.18)",
    },


    sectionHeader: {
        padding:
            "25px 26px",

        borderBottom:
            "1px solid rgba(255,255,255,0.06)",

        display:
            "flex",

        justifyContent:
            "space-between",

        alignItems:
            "center",

        gap:
            "20px",
    },


    sectionTitle: {
        margin:
            0,

        fontSize:
            "19px",

        color:
            "#ffffff",
    },


    sectionSubtitle: {
        margin:
            "6px 0 0",

        color:
            "#718096",

        fontSize:
            "13px",
    },


    smallAddButton: {
        background:
            "rgba(109,93,252,0.14)",

        border:
            "1px solid rgba(109,93,252,0.35)",

        color:
            "#b9b0ff",

        padding:
            "9px 14px",

        borderRadius:
            "9px",

        cursor:
            "pointer",

        fontWeight:
            "600",
    },


    tableWrapper: {
        width:
            "100%",

        overflowX:
            "auto",
    },


    table: {
        width:
            "100%",

        borderCollapse:
            "collapse",

        minWidth:
            "1100px",
    },


    th: {
        textAlign:
            "left",

        padding:
            "15px 18px",

        color:
            "#718096",

        fontSize:
            "11px",

        textTransform:
            "uppercase",

        letterSpacing:
            "0.7px",

        fontWeight:
            "700",

        background:
            "rgba(255,255,255,0.015)",

        whiteSpace:
            "nowrap",
    },


    tr: {
        borderTop:
            "1px solid rgba(255,255,255,0.055)",
    },


    td: {
        padding:
            "17px 18px",

        color:
            "#aab4c5",

        fontSize:
            "13px",

        whiteSpace:
            "nowrap",
    },


    asset: {
        display:
            "flex",

        alignItems:
            "center",

        gap:
            "11px",
    },


    coinIcon: {
        width:
            "38px",

        height:
            "38px",

        borderRadius:
            "12px",

        background:
            "linear-gradient(135deg,#6d5dfc,#4338ca)",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        color:
            "#ffffff",

        fontWeight:
            "800",

        fontSize:
            "14px",

        flexShrink:
            0,
    },


    coinName: {
        color:
            "#f8fafc",

        fontWeight:
            "650",

        fontSize:
            "13px",
    },


    coinSymbol: {
        color:
            "#68758a",

        fontSize:
            "11px",

        marginTop:
            "3px",
    },


    primaryText: {
        color:
            "#f8fafc",

        fontWeight:
            "600",
    },


    allocationContainer: {
        minWidth:
            "85px",
    },


    allocationText: {
        color:
            "#d5dbea",

        fontSize:
            "12px",

        marginBottom:
            "6px",
    },


    progressBackground: {
        height:
            "5px",

        width:
            "80px",

        borderRadius:
            "99px",

        background:
            "rgba(255,255,255,0.08)",

        overflow:
            "hidden",
    },


    progressFill: {
        height:
            "100%",

        borderRadius:
            "99px",

        background:
            "linear-gradient(90deg,#6d5dfc,#8b7fff)",
    },


    deleteButton: {
        border:
            "1px solid rgba(251,113,133,0.22)",

        background:
            "rgba(251,113,133,0.07)",

        color:
            "#fb7185",

        padding:
            "7px 11px",

        borderRadius:
            "8px",

        cursor:
            "pointer",

        fontSize:
            "11px",

        fontWeight:
            "600",
    },


    emptyState: {
        padding:
            "80px 20px",

        textAlign:
            "center",
    },


    emptyIcon: {
        width:
            "65px",

        height:
            "65px",

        margin:
            "0 auto 18px",

        borderRadius:
            "20px",

        background:
            "rgba(109,93,252,0.12)",

        color:
            "#9b8fff",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        fontSize:
            "28px",
    },


    emptyTitle: {
        margin:
            0,

        color:
            "#ffffff",

        fontSize:
            "20px",
    },


    emptyText: {
        color:
            "#718096",

        fontSize:
            "13px",

        margin:
            "8px auto 22px",
    },


    primaryButton: {
        border:
            "none",

        background:
            "linear-gradient(135deg,#6d5dfc,#5145cd)",

        color:
            "#ffffff",

        padding:
            "11px 20px",

        borderRadius:
            "10px",

        cursor:
            "pointer",

        fontWeight:
            "650",

        boxShadow:
            "0 8px 25px rgba(109,93,252,0.2)",
    },


    footerNote: {
        margin:
            "17px 0 0",

        display:
            "flex",

        alignItems:
            "center",

        gap:
            "7px",

        color:
            "#59667a",

        fontSize:
            "11px",
    },


    loadingContainer: {
        minHeight:
            "75vh",

        display:
            "flex",

        flexDirection:
            "column",

        alignItems:
            "center",

        justifyContent:
            "center",
    },


    spinner: {
        width:
            "38px",

        height:
            "38px",

        borderRadius:
            "50%",

        border:
            "3px solid rgba(255,255,255,0.1)",

        borderTop:
            "3px solid #7c6cff",

        animation:
            "portfolioSpin 0.8s linear infinite",
    },


    loadingTitle: {
        color:
            "#ffffff",

        margin:
            "20px 0 5px",

        fontSize:
            "18px",
    },


    loadingText: {
        color:
            "#718096",

        margin:
            0,

        fontSize:
            "13px",
    },


    errorContainer: {
        minHeight:
            "75vh",

        display:
            "flex",

        flexDirection:
            "column",

        alignItems:
            "center",

        justifyContent:
            "center",

        textAlign:
            "center",

        padding:
            "30px",
    },


    errorIcon: {
        width:
            "55px",

        height:
            "55px",

        borderRadius:
            "50%",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        background:
            "rgba(251,113,133,0.12)",

        color:
            "#fb7185",

        fontSize:
            "25px",

        fontWeight:
            "800",
    },


    errorTitle: {
        color:
            "#ffffff",

        margin:
            "17px 0 7px",
    },


    errorText: {
        color:
            "#718096",

        fontSize:
            "13px",

        maxWidth:
            "500px",

        lineHeight:
            "1.6",

        marginBottom:
            "20px",
    },


    // =========================================================
    // MODAL
    // =========================================================

    modalOverlay: {
        position:
            "fixed",

        inset:
            0,

        background:
            "rgba(0,0,0,0.72)",

        backdropFilter:
            "blur(8px)",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        padding:
            "20px",

        zIndex:
            9999,
    },


    modal: {
        width:
            "100%",

        maxWidth:
            "540px",

        maxHeight:
            "90vh",

        overflowY:
            "auto",

        background:
            "#111b2b",

        border:
            "1px solid rgba(255,255,255,0.09)",

        borderRadius:
            "20px",

        padding:
            "26px",

        boxSizing:
            "border-box",

        boxShadow:
            "0 25px 80px rgba(0,0,0,0.45)",

        animation:
            "modalFade 0.18s ease-out",
    },


    modalHeader: {
        display:
            "flex",

        justifyContent:
            "space-between",

        alignItems:
            "flex-start",

        gap:
            "20px",

        marginBottom:
            "22px",
    },


    modalEyebrow: {
        color:
            "#8e82ff",

        fontSize:
            "10px",

        fontWeight:
            "800",

        letterSpacing:
            "1.2px",

        marginBottom:
            "6px",
    },


    modalTitle: {
        margin:
            0,

        color:
            "#ffffff",

        fontSize:
            "22px",
    },


    modalSubtitle: {
        margin:
            "6px 0 0",

        color:
            "#718096",

        fontSize:
            "13px",

        lineHeight:
            "1.5",
    },


    closeButton: {
        width:
            "34px",

        height:
            "34px",

        borderRadius:
            "9px",

        border:
            "1px solid rgba(255,255,255,0.08)",

        background:
            "rgba(255,255,255,0.04)",

        color:
            "#9aa7ba",

        fontSize:
            "22px",

        cursor:
            "pointer",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        flexShrink:
            0,
    },


    formError: {
        background:
            "rgba(251,113,133,0.09)",

        border:
            "1px solid rgba(251,113,133,0.22)",

        color:
            "#fb7185",

        padding:
            "11px 13px",

        borderRadius:
            "9px",

        fontSize:
            "13px",

        marginBottom:
            "18px",

        lineHeight:
            "1.5",
    },


    formGroup: {
        marginBottom:
            "18px",
    },


    label: {
        display:
            "block",

        color:
            "#cbd5e1",

        fontSize:
            "12px",

        fontWeight:
            "650",

        marginBottom:
            "8px",
    },


    // =========================================================
    // SEARCH
    // =========================================================

    searchWrapper: {
        position:
            "relative",

        display:
            "flex",

        alignItems:
            "center",
    },


    searchIcon: {
        position:
            "absolute",

        left:
            "13px",

        zIndex:
            1,

        color:
            "#64748b",

        fontSize:
            "18px",

        pointerEvents:
            "none",
    },


    searchInput: {
        width:
            "100%",

        boxSizing:
            "border-box",

        background:
            "rgba(255,255,255,0.045)",

        border:
            "1px solid rgba(255,255,255,0.10)",

        color:
            "#ffffff",

        padding:
            "12px 42px",

        borderRadius:
            "10px",

        outline:
            "none",

        fontSize:
            "13px",
    },


    searchSpinner: {
        position:
            "absolute",

        right:
            "13px",

        width:
            "15px",

        height:
            "15px",

        borderRadius:
            "50%",

        border:
            "2px solid rgba(255,255,255,0.12)",

        borderTop:
            "2px solid #8b7fff",

        animation:
            "portfolioSpin 0.7s linear infinite",
    },


    searchError: {
        marginTop:
            "8px",

        color:
            "#fb7185",

        fontSize:
            "11px",
    },


    inputHint: {
        display:
            "block",

        color:
            "#5f6d82",

        fontSize:
            "10px",

        marginTop:
            "6px",

        lineHeight:
            "1.4",
    },


    resultsList: {
        marginTop:
            "10px",

        display:
            "flex",

        flexDirection:
            "column",

        gap:
            "7px",

        maxHeight:
            "290px",

        overflowY:
            "auto",
    },


    resultItem: {
        width:
            "100%",

        border:
            "1px solid rgba(255,255,255,0.07)",

        background:
            "rgba(255,255,255,0.035)",

        color:
            "#ffffff",

        borderRadius:
            "11px",

        padding:
            "10px 12px",

        display:
            "flex",

        alignItems:
            "center",

        gap:
            "11px",

        cursor:
            "pointer",

        textAlign:
            "left",

        boxSizing:
            "border-box",
    },


    resultImageWrapper: {
        width:
            "36px",

        height:
            "36px",

        borderRadius:
            "10px",

        flexShrink:
            0,

        overflow:
            "hidden",

        background:
            "rgba(109,93,252,0.12)",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",
    },


    resultImage: {
        width:
            "100%",

        height:
            "100%",

        objectFit:
            "cover",
    },


    resultFallback: {
        width:
            "100%",

        height:
            "100%",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        color:
            "#a79cff",

        fontWeight:
            "800",

        fontSize:
            "13px",
    },


    resultInfo: {
        flex:
            1,

        minWidth:
            0,
    },


    resultName: {
        color:
            "#ffffff",

        fontSize:
            "13px",

        fontWeight:
            "650",

        overflow:
            "hidden",

        textOverflow:
            "ellipsis",

        whiteSpace:
            "nowrap",
    },


    resultSymbol: {
        color:
            "#718096",

        fontSize:
            "10px",

        marginTop:
            "3px",

        overflow:
            "hidden",

        textOverflow:
            "ellipsis",

        whiteSpace:
            "nowrap",
    },


    resultArrow: {
        color:
            "#7c6cff",

        fontSize:
            "16px",

        paddingLeft:
            "5px",
    },


    noResults: {
        marginTop:
            "10px",

        padding:
            "16px",

        textAlign:
            "center",

        border:
            "1px dashed rgba(255,255,255,0.08)",

        borderRadius:
            "10px",

        color:
            "#64748b",

        fontSize:
            "12px",
    },


    // =========================================================
    // SELECTED COIN
    // =========================================================

    selectedCoinCard: {
        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "space-between",

        gap:
            "15px",

        padding:
            "14px",

        marginBottom:
            "14px",

        border:
            "1px solid rgba(109,93,252,0.23)",

        background:
            "rgba(109,93,252,0.07)",

        borderRadius:
            "12px",
    },


    selectedCoinLeft: {
        display:
            "flex",

        alignItems:
            "center",

        gap:
            "11px",

        minWidth:
            0,
    },


    selectedCoinIcon: {
        width:
            "42px",

        height:
            "42px",

        borderRadius:
            "12px",

        background:
            "linear-gradient(135deg,#6d5dfc,#4338ca)",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        color:
            "#ffffff",

        fontWeight:
            "800",

        overflow:
            "hidden",

        flexShrink:
            0,
    },


    selectedCoinImage: {
        width:
            "100%",

        height:
            "100%",

        objectFit:
            "cover",
    },


    selectedCoinName: {
        color:
            "#ffffff",

        fontSize:
            "14px",

        fontWeight:
            "700",
    },


    selectedCoinSymbol: {
        color:
            "#718096",

        fontSize:
            "11px",

        marginTop:
            "3px",
    },


    changeCoinButton: {
        border:
            "1px solid rgba(255,255,255,0.09)",

        background:
            "rgba(255,255,255,0.04)",

        color:
            "#b8c1cf",

        padding:
            "7px 10px",

        borderRadius:
            "8px",

        cursor:
            "pointer",

        fontSize:
            "11px",

        fontWeight:
            "600",

        flexShrink:
            0,
    },


    // =========================================================
    // PRICE PREVIEW
    // =========================================================

    pricePreview: {
        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "space-between",

        gap:
            "15px",

        padding:
            "14px",

        marginBottom:
            "17px",

        background:
            "rgba(255,255,255,0.035)",

        border:
            "1px solid rgba(255,255,255,0.07)",

        borderRadius:
            "10px",
    },


    previewLabel: {
        color:
            "#d9e0ea",

        fontSize:
            "12px",

        fontWeight:
            "650",
    },


    previewDescription: {
        marginTop:
            "4px",

        color:
            "#64748b",

        fontSize:
            "10px",
    },


    previewValue: {
        color:
            "#ffffff",

        fontSize:
            "16px",

        fontWeight:
            "750",

        textAlign:
            "right",
    },


    priceLoading: {
        color:
            "#818cf8",

        fontSize:
            "11px",
    },


    priceUnavailable: {
        color:
            "#718096",

        fontSize:
            "10px",

        fontWeight:
            "500",
    },


    quantityInput: {
        width:
            "100%",

        boxSizing:
            "border-box",

        background:
            "rgba(255,255,255,0.045)",

        border:
            "1px solid rgba(255,255,255,0.10)",

        color:
            "#ffffff",

        padding:
            "12px",

        borderRadius:
            "9px",

        outline:
            "none",

        fontSize:
            "14px",
    },


    // =========================================================
    // INVESTMENT PREVIEW
    // =========================================================

    investmentPreview: {
        display:
            "flex",

        justifyContent:
            "space-between",

        alignItems:
            "center",

        padding:
            "13px 14px",

        marginBottom:
            "14px",

        background:
            "rgba(34,197,94,0.06)",

        border:
            "1px solid rgba(34,197,94,0.14)",

        borderRadius:
            "10px",

        color:
            "#8795a9",

        fontSize:
            "12px",
    },


    autoInfo: {
        display:
            "flex",

        alignItems:
            "flex-start",

        gap:
            "9px",

        padding:
            "12px",

        marginBottom:
            "5px",

        background:
            "rgba(109,93,252,0.06)",

        border:
            "1px solid rgba(109,93,252,0.12)",

        borderRadius:
            "9px",

        color:
            "#818da1",

        fontSize:
            "10px",

        lineHeight:
            "1.5",
    },


    autoInfoIcon: {
        width:
            "18px",

        height:
            "18px",

        borderRadius:
            "50%",

        background:
            "rgba(34,197,94,0.13)",

        color:
            "#4ade80",

        display:
            "flex",

        alignItems:
            "center",

        justifyContent:
            "center",

        fontSize:
            "10px",

        fontWeight:
            "800",

        flexShrink:
            0,
    },


    // =========================================================
    // MODAL ACTIONS
    // =========================================================

    modalActions: {
        display:
            "flex",

        justifyContent:
            "flex-end",

        gap:
            "10px",

        marginTop:
            "20px",
    },


    cancelButton: {
        border:
            "1px solid rgba(255,255,255,0.10)",

        background:
            "rgba(255,255,255,0.04)",

        color:
            "#aab4c5",

        padding:
            "10px 17px",

        borderRadius:
            "9px",

        cursor:
            "pointer",

        fontWeight:
            "600",
    },


    submitButton: {
        border:
            "none",

        background:
            "linear-gradient(135deg,#6d5dfc,#5145cd)",

        color:
            "#ffffff",

        padding:
            "10px 18px",

        borderRadius:
            "9px",

        fontWeight:
            "700",

        boxShadow:
            "0 8px 25px rgba(109,93,252,0.22)",
    },
};

