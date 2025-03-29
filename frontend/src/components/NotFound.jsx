import React from 'react';
import PropTypes from 'prop-types';

export const NotFound = ({ errorCode = 404 }) => { // 404 -> default error code
    const message = "Oops! Seems you got lost backstage."

    return (
        <div className='not-found'>
            <h1>{errorCode}: {message}</h1>
        </div>
    )
}

NotFound.propTypes = {
    errorCode: PropTypes.number // validation for error code
};