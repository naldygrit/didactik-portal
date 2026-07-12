import { Outlet, Routes, Route, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import OurWork from "./pages/OurWork";
import Impact from "./pages/Impact";
import Team from "./pages/Team";
import About from "./pages/About";
import Contact from "./pages/Contact";
import PortalApp from "./portal/PortalApp";
import { activePortal } from "./portal/shared/portalHost";

function MarketingLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <main className="flex-grow">
        <Outlet />
      </main>
      <Footer />
    </div>
  );
}

function App() {
  // A dedicated audience subdomain (broadcaster./producer./admin.) IS its portal,
  // served at the root — no marketing, no /portal prefix. The unified host
  // (app./previews/localhost) keeps the marketing pages and mounts the portals
  // under /portal/*, with `/` going straight to the login.
  if (activePortal()) {
    return <PortalApp />;
  }
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/portal/login" replace />} />
      <Route element={<MarketingLayout />}>
        <Route path="/our-work" element={<OurWork />} />
        <Route path="/impact" element={<Impact />} />
        <Route path="/team" element={<Team />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
      </Route>
      <Route path="/portal/*" element={<PortalApp />} />
    </Routes>
  );
}

export default App;
