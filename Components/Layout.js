import "bootstrap/dist/css/bootstrap.css";
import "bootstrap-icons/font/bootstrap-icons.json";
import Navbar from "./Navbar";
import UserDetails from "../Components/UserDetails";
import Footer from "./Footer";

const Layout = ({ children }) => {
  return (
    <>
      <div
        style={{
          overflow: "hidden",
          display: "block",
          position: "relative",
          paddingBottom: "100px",
        }}
      >
        <Navbar />

        <div>{children}</div>
      </div>
      <UserDetails placement={"bottom"} />
      <Footer />
    </>
  );
};

export default Layout;
