import Modal from "../../common/components/Modal";
import Button from "../../common/components/Button";
import UserDetailsForm from "../../common/components/UserDetailsForm";
import PageIndicator from "./components/PageIndicator";
import { policyUrlElem } from "../../common/constants";
import firstTimer1 from "../../assets/first-timer-1.svg";
import firstTimer2 from "../../assets/first-timer-2.svg";
import firstTimer3 from "../../assets/first-timer-3.svg";
import arrowRight from "../../assets/arrow-right.png";
import { useEffect, useState } from "react";

const OnboardingComponent = ({
  handleSetUserData,
  setName,
  setEmail,
  userInputErrorMessage,
  setUserInputErrorMessage,
  name,
  email,
}) => {
  const [step, setStep] = useState(1);

  useEffect(() => {
    setFocus();
  }, [step]);

  const handleOnBackClick = () => {
    setStep(step - 1);
  };

  const handleOnNextClick = () => {
    setStep(step + 1);
    resetFormInputs();
  };

  const resetFormInputs = () => {
    if (userInputErrorMessage) {
      setUserInputErrorMessage(null);
    }

    if (name) {
      setName("");
    }

    if (email) {
      setEmail("");
    }
  };

  const setFocus = () => {
    const modalBody = document.querySelector(".modal-body");
    modalBody.focus();
  };

  const backButton = (
    <Button
      type="secondary"
      className="secondary modal-button modal-half-button modal-left-button"
      onClick={handleOnBackClick}
    >
      Back
    </Button>
  );
  const nextButton = (
    <Button
      type="primary"
      className="modal-button modal-half-button modal-right-button"
      onClick={handleOnNextClick}
    >
      Next
    </Button>
  );

  const formID = "first-timer-form";
  const isSubmitDisabled =
    name.trim() === "" || email.trim() === "" || userInputErrorMessage;

  const renderOnboardingBody = () => {
    switch (step) {
      case 1: {
        return (
          <>
            <div className="visually-hidden" aria-live="polite" role="status">
              Item 1 of 4
            </div>
            <div className="modal-img-container fade-in" aria-hidden="true">
              <img
                className="modal-img"
                src={firstTimer1}
                alt="person saying hello"
              ></img>
            </div>
            <h3 className="modal-title fade-in">Hi There!</h3>
            <p className="modal-desc fade-in">
              Making your website accessible is within reach. Let’s get started
              by taking a quick look at how Purple HATS works.
            </p>
            <PageIndicator page={1}></PageIndicator>
          </>
        );
      }
      case 2: {
        return (
          <>
            <div className="visually-hidden" aria-live="polite" role="status">
              Item 2 of 4
            </div>
            <div className="modal-img-container fade-in" aria-hidden="true">
              <div id="first-timer-2-container">
                <div className="typewriter">https://www.</div>
                <img
                  className="modal-img"
                  src={firstTimer2}
                  alt="search bar"
                ></img>
              </div>
            </div>
            <h3 className="modal-title fade-in">Get started</h3>
            <p className="modal-desc fade-in">
              Enter your website or sitemap URL and Purple HATS will crawl through them to analyse and identify accessibility issues.
            </p>
            <PageIndicator page={2}></PageIndicator>
          </>
        );
      }
      case 3: {
        return (
          <>
            <div className="visually-hidden" aria-live="polite" role="status">
              Item 3 of 4
            </div>
            <div className="modal-img-container fade-in" aria-hidden="true">
              <img
                className="modal-img"
                src={firstTimer3}
                alt="custom flow step-by-step animation illustration"
              ></img>
            </div>
            <h3 className="modal-title fade-in">Custom Flow Scan</h3>
            <p className="modal-desc fade-in">
              This scan type allows you to specify a user journey of choice by recording a series of actions on the browser and replaying them.
            </p>
            <PageIndicator page={3}></PageIndicator>
          </>
        );
      }
      case 4: {
        return (
          <>
            <div className="visually-hidden" aria-live="polite" role="status">
              Item 4 of 4
            </div>
            <h3 className="modal-title fade-in">Get to know you</h3>
            <UserDetailsForm
              formID={formID}
              setName={setName}
              setEmail={setEmail}
              handleOnSubmit={handleSetUserData}
              userInputErrorMessage={userInputErrorMessage}
              setUserInputErrorMessage={setUserInputErrorMessage}
              isOnboarding={true}
            />
            <p className="modal-desc fade-in">
              To personalise your experience, we will be collecting your name, email address and app usage data. The collection and usage of your data will fully comply with {policyUrlElem}
            </p>
            <PageIndicator page={4}></PageIndicator>
          </>
        );
      }
      default: {
        return <></>;
      }
    }
  };

  const renderOnboardingFooter = () => {
    switch (step) {
      case 1: {
        return (
          <Button
            type="primary"
            className="modal-button modal-full-button"
            onClick={handleOnNextClick}
          >
            Let's go &nbsp;
            <img src={arrowRight} alt="right arrow"></img>
          </Button>
        );
      }
      case 2: {
        return (
          <>
            {backButton}
            {nextButton}
          </>
        );
      }
      case 3: {
        return (
          <>
            {backButton}
            {nextButton}
          </>
        );
      }
      case 4: {
        return (
          <>
            {backButton}
            <button
              type="submit"
              form={formID}
              className="primary modal-button modal-half-button modal-right-button"
              disabled={isSubmitDisabled}
            >
              I consent
            </button>
          </>
        );
      }
      default: {
        return <></>;
      }
    }
  };

  return (
    <Modal
      id="onboarding-modal"
      showModal={true}
      showHeader={false}
      isOnboarding={true}
      keyboardTrap={false}
      modalBody={renderOnboardingBody()}
      modalFooter={renderOnboardingFooter()}
      key={step}
    />
  );
};

export default OnboardingComponent;
