import { RiStethoscopeLine } from "react-icons/ri";
import './header.css'
import { Link } from "react-router-dom";

export default function Header() {

    return (

        <header>
            <ul>
                <li className="brand">
                    <RiStethoscopeLine className="brand-icon" />
                    <span className="brand-text">HealthConnect</span>
                </li>

                <li className="nav-items">
                    <span><Link to="/login">Login </Link></span>
                    <span><Link to="/register">Register</Link></span>
                </li>
            </ul>
        </header>
    )
}