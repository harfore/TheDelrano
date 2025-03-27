// multi-step login form with email/username and password validation

import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import * as yup from 'yup';
import axios from 'axios';
import FormInput from "../../components/Auth/FormInput";
import { AuthContext } from '../../contexts/AuthContext';
import '../../styles/JoinLogin.css';

const Login = () => {
    const navigate = useNavigate();
    const authContext = useContext(AuthContext);

    const [loading, setLoading] = useState(false);
    const [submitError, setSubmitError] = useState(''); // submission error messages
    const [touched, setTouched] = useState({ // track field interaction
        'email-username': false,
        'password': false
    });

    const steps = [
        {
            label: '1',
            description: 'Please enter your email or username.',
            field: 'email-username',
        },
        {
            label: '2',
            description: 'Enter your password.',
            field: 'password'
        }
    ];

    // form validation schema using Yup
    const schema = yup.object().shape({
        'email-username': yup
            .string()
            .required('Email or username is required')
            .test(
                'is-email-or-username',
                'Please enter a valid email or username',
                (value) => {
                    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                    const usernameRegex = /^[a-zA-Z0-9_]{3,20}$/;
                    return emailRegex.test(value) || usernameRegex.test(value);
                }
            ),
        password: yup
            .string()
            .required('Password is required')
    });

    const [activeStep, setActiveStep] = useState(0);
    const [formData, setFormData] = useState({
        'email-username': '',
        'password': ''
    });
    const [errors, setErrors] = useState({});

    // handles input field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
        setTouched(prev => ({ ...prev, [name]: true }));

        // clear error when user types
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const handleNext = async () => {
        const currentField = steps[activeStep].field;

        setTouched(prev => ({ ...prev, [currentField]: true }));

        try {
            await schema.validateAt(currentField, formData);
            setErrors(prev => ({ ...prev, [currentField]: '' }));
            setActiveStep(prev => prev + 1);
        } catch (error) {
            // display validation error if present
            setErrors(prev => ({ ...prev, [currentField]: error.message }));
        }
    };

    // navigation to the previous step
    const handleBack = () => {
        setActiveStep(prev => prev - 1);
    };

    // validates all fields and authenticates user
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setSubmitError('');

        try {
            // validate all form fields
            await schema.validate(formData, { abortEarly: false });

            // authenticate user
            const response = await axios.post('http://localhost:3000/api/auth/login', {
                email: formData['email-username'],
                password: formData.password
            });

            // handle successful authentication
            const { token, user } = response.data;
            localStorage.setItem('authToken', token);
            await authContext.login(token, user);
            navigate('/');

        } catch (error) {
            // handle API errors
            if (error.response) {
                setSubmitError(error.response.data.message || 'Login failed');
            }
            // handle validation errors
            else if (error.name === 'ValidationError') {
                const newErrors = {};
                error.inner.forEach(err => {
                    newErrors[err.path] = err.message;
                });
                setErrors(newErrors);
                const firstErrorField = error.inner[0].path;
                const errorStep = steps.findIndex(step => step.field === firstErrorField);
                setActiveStep(Math.max(0, errorStep));
            }
            // handle unexpected errors
            else {
                setSubmitError('An error occurred. Please try again.');
                console.error('Login error:', error);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className='page'>
            <h1 className='page-headline'>Welcome back!</h1>
            <div className='stepper-container'>
                {submitError && (
                    <div className="error-message">
                        {submitError}
                    </div>
                )}

                <div className="stepper-header">
                    {steps.map((step, index) => (
                        <div key={step.label} className={`step ${index === activeStep ? 'active' : ''}`}>
                            {step.label}
                        </div>
                    ))}
                </div>

                <form onSubmit={handleSubmit}>
                    <div>
                        <div className="step-description">
                            <p>{steps[activeStep].description}</p>
                        </div>

                        {activeStep === 0 && (
                            <FormInput
                                label="Email or username"
                                type="text"
                                name="email-username"
                                value={formData['email-username']}
                                onChange={handleChange}
                                error={touched['email-username'] && errors['email-username']}
                                placeholder="Email or username"
                                autoFocus
                            />
                        )}

                        {activeStep === 1 && (
                            <FormInput
                                label="Password"
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                error={touched.password && errors.password}
                                placeholder="Password"
                                autoFocus
                            />
                        )}

                        <h4><i>Forgot password?</i></h4>

                        <div className="stepper-actions">
                            {activeStep !== 0 && (
                                <button
                                    type="button"
                                    onClick={handleBack}
                                    disabled={loading}
                                >
                                    Back
                                </button>
                            )}

                            {activeStep < steps.length - 1 ? (
                                <button
                                    type="button"
                                    onClick={handleNext}
                                    disabled={loading}
                                >
                                    Next
                                </button>
                            ) : (
                                <button
                                    type="submit"
                                    disabled={loading}
                                >
                                    {loading ? 'Logging in...' : 'Login'}
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Login;