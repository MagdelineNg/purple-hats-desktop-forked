const UserDetailsForm = ({
    formID, 
    setName, 
    setEmail,
    handleSetUserData
}) => {
    return (
        <div className="user-form">
            <form id={formID} onSubmit={(e) => handleSetUserData(e)}>
                <div className="user-form-field">
                    <label className="user-form-label" for="name">Name</label>
                    <input className="user-form-input" type="text" id="name" onChange={(e) => setName(e.target.value)}></input><br/>
                </div>
                <div className="user-form-field">
                    <label className="user-form-label" for="email">Work Email</label>
                    <input className="user-form-input" type="text" id="email" onChange={(e) => setEmail(e.target.value)}></input>
                </div>
              </form>
        </div>
    );
}

export default UserDetailsForm;