import React from "react";

const Modal = ({
    id,
    modalTitle,
    show,
    setShowModal,
    modalBody,
    modalFooter,
    isTopTitle,
    showCloseButton,
    modalDesc,
    pageIndicator,
    key,
    // userInputErrorMessage
}) => {
  const showHideClassName = show ? "modal display-flex" : "modal display-none";
  return (
    <div className={`${showHideClassName}`} id={id}>
      <div className="modal-container">
        {showCloseButton && (
          <div className="modal-header-button">
            <button
              id="close-button"
              className="close button transparent"
              onClick={() => setShowModal(false)}
              aria-label="Close"
              aria-controls={id}
            >
              Close
            </button>
          </div>
        )}
        <div key={key} className="modal-content in">
          {isTopTitle && <h3 className="modal-title">{modalTitle}</h3>}
          {modalBody}
          {!isTopTitle && <h3 className="modal-title">{modalTitle}</h3>}
          {/* {userInputErrorMessage && (<p className="error-text">{userInputErrorMessage}</p>)} */}
          {modalDesc && <p className="modal-desc">{modalDesc}</p>}
        </div>
            {pageIndicator && <div className="page-indicator">{pageIndicator}</div>}
        <div className="modal-footer-button">{modalFooter}</div>
      </div>
    </div>
  );
};

export default Modal;