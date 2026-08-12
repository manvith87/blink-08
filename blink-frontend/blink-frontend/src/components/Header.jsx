import Bulb from "./Bulb.jsx";
import { useAuth } from "../context/AuthContext.jsx";

export default function Header({ onOpenAuth }) {
  const { user } = useAuth();

  return (
    <header>
      <div className="wrap nav">
        <a href="#top" className="logo">
          <Bulb />
          BLINK
        </a>
        <nav className="links">
          <a href="#browse">Browse</a>
          <a href="#platforms">Platforms</a>
          <a href="#how">How it works</a>
        </nav>
        <div className="nav-right">
          <a className="nav-cta" href="#browse">Find a course</a>
          <div id="accountArea">
            {user ? (
              <button type="button" className="user-pill" onClick={onOpenAuth}>
                <Bulb />
                <span className="name">{user.name}</span>
              </button>
            ) : (
              <button type="button" className="account-btn" onClick={onOpenAuth}>
                Sign in
              </button>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
