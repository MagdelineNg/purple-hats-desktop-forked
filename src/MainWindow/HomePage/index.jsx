import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router";
import a11yLogo from "../../assets/a11y-logo.svg";
import appIllustration from "../../assets/app-illustration.svg";
import InitScanForm from "./InitScanForm";
import "./HomePage.scss";
import services from "../../services";
import { urlErrorCodes, urlErrorTypes } from "../../common/constants";
import Modal from "../../common/components/Modal";
import { BasicAuthForm, BasicAuthFormFooter } from "./BasicAuthForm";

const HomePage = ({ appVersion, setCompletedScanId }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [prevUrlErrorMessage, setPrevUrlErrorMessage] = useState(
    location.state
  );
  // const [email, setEmail] = useState("");
  // const [name, setName] = useState("");
  // const [autoSubmit, setAutoSubmit] = useState(false);
  const [browser, setBrowser] = useState(null);
  const [showBasicAuthModal, setShowBasicAuthModal] = useState(false);

  useEffect(() => {
    if (
      prevUrlErrorMessage !== null &&
      prevUrlErrorMessage.includes("Unauthorised Basic Authentication")
    ) {
      setShowBasicAuthModal(true);
    }
  }, [prevUrlErrorMessage]);

  useEffect(() => {
    const getUserData = async () => {
      const userData = await services.getUserData();
      setBrowser(userData['browser'])
      // const isEvent = userData["event"];
      // if (!isEvent) {
      //   setEmail(userData['email']); 
      //   setName(userData['name']); 
      //   setAutoSubmit(userData['autoSubmit']);   
      // }
    };

    getUserData();
  });

  const isValidHttpUrl = (input) => {
    const regexForUrl = new RegExp("^(http|https):/{2}.+$", "gmi");
    return regexForUrl.test(input);
  };

  const startScan = async (scanDetails) => {
    scanDetails.browser = browser;

    if (scanDetails.scanUrl.length === 0) {
      setPrevUrlErrorMessage("URL cannot be empty.");
      return;
    }
    if (!isValidHttpUrl(scanDetails.scanUrl)) {
      setPrevUrlErrorMessage("Invalid URL.");
      return;
    }
    if (!navigator.onLine) {
      setPrevUrlErrorMessage("No internet connection.");
      return;
    }

    window.localStorage.setItem("scanDetails", JSON.stringify(scanDetails));

    navigate("/scanning");
    console.log(scanDetails); 
    const response = await services.startScan(scanDetails);
    console.log(response.success);

    if (response.success) {
      setCompletedScanId(response.scanId);
      navigate("/result");
      return;
    }

    if (urlErrorCodes.has(response.statusCode)) {
      let errorMessageToShow;
      switch (response.statusCode) {
        /* technically urlErrorTypes.invalidUrl is not needed since this case
        was handled above, but just for completeness */
        case urlErrorTypes.unauthorisedBasicAuth:
          errorMessageToShow = "Unauthorised Basic Authentication.";
          break;
        case urlErrorTypes.invalidUrl:
        case urlErrorTypes.cannotBeResolved:
        case urlErrorTypes.errorStatusReceived:
          errorMessageToShow = "Invalid URL.";
          break;
        case urlErrorTypes.notASitemap:
          errorMessageToShow = "Invalid sitemap.";
          break;
        case urlErrorTypes.systemError:
        default:
          errorMessageToShow = "Something went wrong. Please try again later.";
      }
      console.log(`status error: ${response.statusCode}`);
      navigate("/", { state: errorMessageToShow });
      return;
    }
    /* When no pages were scanned (e.g. out of domain upon redirects when valid URL was entered),
    redirects user to error page to going to result page with empty result
    */
    navigate("/error");
    return;
  };

  const handleBasicAuthSubmit = (e) => {
    e.preventDefault();
    const username = e.target.username.value;
    const password = e.target.password.value;
    const scanDetails = JSON.parse(window.localStorage.getItem("scanDetails"));
    const splitUrl = scanDetails.scanUrl.split("://");
    scanDetails.scanUrl = `${splitUrl[0]}://${username}:${password}@${splitUrl[1]}`;
    startScan(scanDetails);
    setShowBasicAuthModal(false);
    return;
  };

  return (
    <div id="home-page">
      <div id="home-page-main">
        <img
          id="a11y-logo"
          src={a11yLogo}
          alt="Logo of the GovTech Accessibility Enabling Team"
        />
        <h1 id="app-title">Accessibility Site Scanner</h1>
        <InitScanForm
          startScan={startScan}
          prevUrlErrorMessage={prevUrlErrorMessage}
        />
        {/* {autoSubmit && (
          <div id="user-details">
            <div>{name}</div>
            <div>{email}</div>
          </div>
        )} */}
      </div>
      <Modal
        id="basic-auth-modal"
        isTopTitle={true}
        modalTitle={"Basic Authentication Required"}
        modalDesc={`The site you are trying to scan requires basic authentication. 
        Please enter your credentials. Purple-HATS will not collect the information and only use it for this scan instance.`}
        show={showBasicAuthModal}
        showCloseButton={true}
        setShowModal={setShowBasicAuthModal}
        modalBody={
          <BasicAuthForm handleBasicAuthSubmit={handleBasicAuthSubmit} />
        }
        modalFooter={
          <BasicAuthFormFooter setShowBasicAuthModal={setShowBasicAuthModal} />
        }
      />
      <div id="home-page-footer">
        <img
          id="app-illustration"
          src={appIllustration}
          alt="Illustration showing people with sight, hearing, motor and cognitive disabilities"
        />
        <span id="footer-text">
          Version {appVersion} | Built by GovTech Accessibility Enabling Team
        </span>
      </div>
    </div>
  );
};

export default HomePage;
