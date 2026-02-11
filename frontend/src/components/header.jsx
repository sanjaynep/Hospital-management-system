import { RiStethoscopeLine } from "react-icons/ri";
import './header.css'

export default function Header() {

    return (

        <header>
            <ul>
                <li className="brand">
                    <RiStethoscopeLine className="brand-icon" />
                    <span className="brand-text">HealthConnect</span>
                </li>

                <li className="nav-items">
                    <span>Privacy Policy</span>
                    <span>Help</span>
                </li>
            </ul>

        </header>
    )
}