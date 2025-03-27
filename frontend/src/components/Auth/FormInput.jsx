import React from 'react';

const FormInput = ({ label, type, name, value, onChange, error, placeholder }) => {
    return (
        <div className="input-group">
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                className="account-field"
                id={name}
            />
            {error && <p
                className="error">{error}</p>}
        </div>
    );
};

export default FormInput;