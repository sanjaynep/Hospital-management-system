import { Link } from "react-router-dom";
import { useState,useEffect } from "react";
import 'bootstrap/dist/css/bootstrap.min.css';
import Container from 'react-bootstrap/Container';
import Nav from 'react-bootstrap/Nav';
import Navbar from 'react-bootstrap/Navbar';
import axios from 'axios';
import { useNavigate } from "react-router-dom";


export default function DAshboard() {
let[data,setdata]=useState({email:"",username:"",id:""})
const token = localStorage.getItem("access_token");
const navigate=useNavigate()
useEffect(() =>{
  if (!token) return;

  axios.get("http://localhost:8000/api/user/welcome/", {
  headers: {
    Authorization: `Bearer ${token}`
  }
})
.then(response => { 
  setdata({email: response.data.email, username: response.data.full_name, id: response.data.id});
});

},[token])



const handlelogout = async () =>{
  const access = localStorage.getItem("access_token");
  const refresh = localStorage.getItem("refresh_token");
  if (!refresh) {
    // nothing to revoke — just clear and redirect
    localStorage.removeItem("access_token");
    navigate("/login");
    return;
  }

  try{
     await axios.post("http://127.0.0.1:8000/api/user/logout/",
       { refresh },
       {headers:{"Content-Type": "application/json", ...(access ? { Authorization: `Bearer ${access}` } : {}),},});

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

    return(
        <>
          <Navbar bg="dark" data-bs-theme="dark">
        <Container >
          <Navbar.Brand >{data.username}</Navbar.Brand>
          <Nav className=" d-flex justify-content-end">
            <Nav.Link className='text-primary me-3 ' as={Link} to="/change-password" >change password</Nav.Link>
            <Nav.Link className='text-primary me-3' onClick={handlelogout} >Logout</Nav.Link>
          </Nav>
        </Container>
      </Navbar>
        </>
    )
}