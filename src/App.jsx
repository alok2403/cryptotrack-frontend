import React from "react";
import {
    BrowserRouter,
    Routes,
    Route,
    Navigate
} from "react-router-dom";

import LoginPage from "./pages/LoginPage.jsx";
import Register from "./pages/Register.jsx";

import Dashboard from "./pages/Dashboard.jsx";
import Markets from "./pages/Markets.jsx";
import Portfolio from "./pages/Portfolio.jsx";
import Alerts from "./pages/Alerts.jsx";
import AIAnalysis from "./pages/AiAnalysis.jsx";
import HelpCenter from "./pages/HelpCenter.jsx";
import Contact from "./pages/Contact.jsx";


function App() {

    return (
        <BrowserRouter>

            <Routes>

                {/* ==============================
                    AUTHENTICATION
                ============================== */}

                <Route
                    path="/login"
                    element={<LoginPage />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* ==============================
                    MAIN APPLICATION
                ============================== */}

                <Route
                    path="/dashboard"
                    element={<Dashboard />}
                />

                <Route
                    path="/markets"
                    element={<Markets />}
                />

                <Route
                    path="/portfolio"
                    element={<Portfolio />}
                />

                <Route
                    path="/alerts"
                    element={<Alerts />}
                />

                <Route
                    path="/ai-analysis"
                    element={<AIAnalysis />}
                />

                <Route
                    path="/help"
                    element={<HelpCenter />}
                />

                <Route
                    path="/contact"
                    element={<Contact />}
                />


                {/* ==============================
                    DEFAULT
                ============================== */}

                <Route
                    path="/"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

                <Route
                    path="*"
                    element={
                        <Navigate
                            to="/dashboard"
                            replace
                        />
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}


export default App;