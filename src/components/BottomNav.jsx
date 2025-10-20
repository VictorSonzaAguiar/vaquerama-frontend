import React from "react";
import { NavLink } from "react-router-dom";
import { House, Compass, ChatCircleText, PlusCircle, User } from "phosphor-react";
import useAuth from "../hooks/useAuth";
import "../styles/global.css";

const BottomNav = () => {
  const { user, isAuthenticated } = useAuth();
  const profileRoute =
    isAuthenticated && user && user.id ? `/profile/${user.id}` : "/login";

  const navLinks = [
    { to: "/feed", icon: House },
    { to: "/explore", icon: Compass },
    { to: "/postar", icon: PlusCircle },
    { to: "/messages", icon: ChatCircleText },
    { to: profileRoute, icon: User },
  ];

  return (
    <nav className="bottom-nav-bold fixed-bottom d-block d-lg-none">
      <div className="d-flex justify-content-around align-items-center h-100">
        {navLinks.map(({ to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `nav-link-bold d-flex flex-column align-items-center ${
                isActive ? "active-bold" : ""
              }`
            }
          >
            <Icon size={30} weight="bold" />
          </NavLink>
        ))}
      </div>
    </nav>
  );
};

export default BottomNav;
