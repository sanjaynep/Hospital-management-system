import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";
import './index.css'
import App from './App.jsx'
import Signup from './components/signup.jsx'
import Login from './components/login.jsx'
import ActivateAccount from './components/activate_html.jsx'
import DAshboard from './components/profile.jsx';
import ProtectedRoute from "./protectedroute.jsx";
import Emailbox from './components/email_form.jsx';
import New_password from './components/new_password.jsx';
import DoctorProfile from './components/doctor_profile.jsx';
import BookAppointment from './components/appointment.jsx';
import DoctorsList from './components/doctors_list.jsx';

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/register",
    element: <Signup />,
  },
  {
    path: "/login",
    element: <Login />,
  },
  {
    path: "/activate/:uid/:token",
    element: <ActivateAccount />,
  },
  {
    path:"/profile",
    element:(
      <ProtectedRoute requiredRole="user">
       <DAshboard />
      </ProtectedRoute>
    ),
  },
  {
    path: "/reset/:uid/:token",
    element: <New_password />,
  },
  {
    path: "/resetpassword",
    element: <Emailbox/>,
  },
  {
    path:"/Doctor-profile",
    element:(
      <ProtectedRoute requiredRole="doctor">
       <DoctorProfile />
      </ProtectedRoute>
    ),
  },
{
    path:"/book_appointment",
    element:(
      <ProtectedRoute requiredRole="user">
       <BookAppointment />
      </ProtectedRoute>
    ),
  },
  {
    path:"/doctors",
    element:(
      <ProtectedRoute requiredRole="user">
       <DoctorsList />
      </ProtectedRoute>
    ),
  },
]);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>,
)
