import { FaHeartbeat } from "react-icons/fa";
import axios from 'axios';
import { useNavigate } from "react-router-dom";
import "./profile.css"

export default function Dashboard_header(){
    const navigate = useNavigate();
    const handlelogout = async () => {
        const access = localStorage.getItem("access_token");
        const refresh = localStorage.getItem("refresh_token");
        if (!refresh) {
            // nothing to revoke — just clear and redirect
            localStorage.removeItem("access_token");
            navigate("/login");
            return;
        }

        try {
            const res = await axios.post("http://127.0.0.1:8000/api/user/logout/",
                { refresh },
                { headers: { "Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}), }, });

            if (res.status === 205 || res.status === 200) {
                localStorage.removeItem("access_token");
                localStorage.removeItem("refresh_token");
                delete axios.defaults.headers.common["Authorization"];
                navigate("/login");
                return;
            }
        }
        catch (e) {

            console.error("Logout failed:");
        }
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        delete axios.defaults.headers.common["Authorization"];
        navigate("/login");
    };


    return (
        <>
            <header className='header'>
                <div className="icons"><FaHeartbeat /><h1>HealthConnect</h1></div>
                <div className="header-actions">
                    <button onClick={handlelogout} className="logout">
                        Logout
                    </button>
                </div>
            </header>
        </>
    );
}