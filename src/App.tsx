import { BrowserRouter, Routes, Route } from "react-router-dom";
import AppLayout from "./components/layout/AppLayout";
import Dashboard from "./pages/Dashboard";
import Servers from "./pages/Servers";
import Settings from "./pages/Settings";
import Account from "./pages/Account";
import Routing from "./pages/Routing";

export default function App() {
  return (
    <BrowserRouter>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/servers" element={<Servers />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/routing" element={<Routing />} />
          <Route path="/account" element={<Account />} />
        </Routes>
      </AppLayout>
    </BrowserRouter>
  );
}
