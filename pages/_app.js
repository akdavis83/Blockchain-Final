import "../styles/globals.css";
import Layout from "../Components/Layout";
import { RecoilRoot } from "recoil";

function MyApp({ Component, pageProps }) {
  return (
    <>
      <RecoilRoot>
        <Layout style={{ minWidth: "700px" }}>
          <Component {...pageProps} />
        </Layout>
      </RecoilRoot>
    </>
  );
}

export default MyApp;
